import { Router } from 'express'
import { createTweetController } from '~/controllers/tweetControllers'
import { createTweetValidator } from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const tweetRouter = Router()

/**
 * Description: Create tweet
 * Path: /tweet
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: TweetRequestBody
 */
tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

export default tweetRouter
