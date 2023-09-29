import { TweetRequestBody } from '~/requestTypes'
import dbService from './dbServices'
import Tweet from '~/models/schemas/TweetSchema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/HashtagSchema'
import { TweetType } from '~/types'

class TweetService {
  checkAndCreateHashtags = async (hashtags: string[]) => {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return dbService.hashtags().findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocuments.map((hashtag) => (hashtag.value as WithId<Hashtag>)._id)
  }
  createTweet = async (user_id: string, body: TweetRequestBody) => {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    const { insertedId } = await dbService.tweets().insertOne(
      new Tweet({
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: [],
        medias: [],
        parent_id: body.parent_id,
        user_id: new ObjectId(user_id)
      })
    )
    const result = await dbService.tweets().findOne({ _id: insertedId })
    return result
  }
  increaseView = async (tweet_id: string, user_id: string) => {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await dbService.tweets().findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1,
          updated_at: 1
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }
  getTweetChildren = async ({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id?: string
  }) => {
    const tweets = await dbService
      .tweets()
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            }
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        },
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const [, total] = await Promise.all([
      await dbService.tweets().updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      await dbService.tweets().countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])
    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })
    return { tweets, total }
  }
}
const tweetService = new TweetService()
export default tweetService
