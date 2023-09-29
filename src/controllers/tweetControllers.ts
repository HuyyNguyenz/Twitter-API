import { Request, Response } from 'express'
import Tweet from '~/models/schemas/TweetSchema'
import { TokenPayload, TweetRequestParams } from '~/requestTypes'
import tweetService from '~/services/tweetServices'
import { TweetQuery, TweetType } from '~/types'

export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create tweet successfully',
    result
  })
}

export const getTweetController = async (req: Request<TweetRequestParams>, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id as string)
  const tweet = {
    ...(req.tweet as Tweet),
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  return res.json({
    result: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<TweetRequestParams, any, any, TweetQuery>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { tweets, total } = await tweetService.getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: 'Get tweet children successfully',
    tweets,
    tweet_type,
    limit,
    page,
    total_page: Math.ceil(total / limit)
  })
}
