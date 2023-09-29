import { Router } from 'express'
import { createTweetController, getTweetChildrenController, getTweetController } from '~/controllers/tweetControllers'
import {
  audienceValidator,
  createTweetValidator,
  tweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const tweetRouter = Router()

/**
 * Description: Create tweet
 * Path: /
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

/**
 * Description: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 */
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

/**
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token> }
 * Query : { limit:number, page:number }
 */
tweetRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  tweetChildrenValidator,
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetRouter
