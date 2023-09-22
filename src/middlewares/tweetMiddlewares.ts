import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { TWEET_MESSAGES } from '~/constants/messages'
import { MediaType, TweetAudience, TweetType } from '~/types'
import { numberEnumToArray } from '~/utils/commons'
import validate from '~/utils/validation'

const tweetType = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
const mediaType = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema({
    type: {
      isIn: {
        options: [tweetType],
        errorMessage: TWEET_MESSAGES.INVALID_TYPE
      }
    },
    audience: {
      isIn: {
        options: [tweetAudience],
        errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
          }
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
          }
          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]
          if (
            [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
          }
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
          }
          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(TWEET_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(TWEET_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          if (value.some((item: any) => typeof item.url !== 'string' || !mediaType.includes(item.type))) {
            throw new Error(TWEET_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)
