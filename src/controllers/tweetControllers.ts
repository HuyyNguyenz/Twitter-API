import { Request, Response } from 'express'
import { TokenPayload } from '~/requestTypes'
import tweetService from '~/services/tweetServices'

export const createTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(user_id, req.body)
  return res.json(result)
}
