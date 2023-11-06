import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversationControllers'
import { getConversationsValidator } from '~/middlewares/conversationMiddlewares'
import { paginationValidator } from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const conversationRouter = Router()

/**
 * Description: Get conversation list
 * Path: /receiver/:receiver_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationRouter
