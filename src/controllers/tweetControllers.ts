import { Request, Response } from 'express'
import { TWEET_MESSAGES } from '~/constants/messages'
import { TokenPayload, TweetRequestParams } from '~/requestTypes'
import tweetService from '~/services/tweetServices'

export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create tweet successfully',
    result
  })
}

export const getTweetController = async (req: Request<TweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetService.getTweet(tweet_id)
  return res.json({
    result
  })
}
