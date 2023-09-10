import { Router } from 'express'
import { serveImageController } from '~/controllers/staticControllers'

const staticRouter = Router()

staticRouter.use('/image/:name', serveImageController)

export default staticRouter
