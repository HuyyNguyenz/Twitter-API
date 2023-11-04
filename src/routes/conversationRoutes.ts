import { Router } from 'express'
import { getConversationController } from '~/controllers/conversationControllers'
import { paginationValidator } from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const conversationRouter = Router()

conversationRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getConversationController)
)

export default conversationRouter
