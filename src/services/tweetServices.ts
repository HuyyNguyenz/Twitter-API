import { TweetRequestBody } from '~/requestTypes'
import dbService from './dbServices'
import Tweet from '~/models/schemas/TweetSchema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/HashtagSchema'

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
        parent_id: null,
        user_id: new ObjectId(user_id)
      })
    )
    const result = await dbService.tweets().findOne({ _id: insertedId })
    return result
  }
  getTweet = async (tweet_id: string) => {
    const result = await dbService.tweets().findOne({
      _id: new ObjectId(tweet_id)
    })
    return result
  }
}
const tweetService = new TweetService()
export default tweetService
