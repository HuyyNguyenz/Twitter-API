import { Router } from 'express'
import { searchController } from '~/controllers/searchControllers'
import { paginationValidator } from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(searchController)
)

export default searchRouter
