import { Router } from 'express'
import { searchController } from '~/controllers/searchControllers'
import { searchValidator } from '~/middlewares/searchMiddlewares'
import { paginationValidator } from '~/middlewares/tweetMiddlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/userMiddlewares'

const searchRouter = Router()

searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  searchValidator,
  searchController
)

export default searchRouter
