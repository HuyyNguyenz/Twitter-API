import { Router } from 'express'
import { serveImageController, serveVideoController, serveVideoStreamController } from '~/controllers/mediaControllers'

const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)

staticRouter.get('/video-stream/:name', serveVideoStreamController)

export default staticRouter
