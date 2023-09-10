import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/mediaControllers'
import wrapRequestHandler from '~/utils/handlers'

const mediaRouter = Router()

mediaRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediaRouter
