import { Request, Response, Router } from 'express'
import { loginController, registerController } from '~/controllers/userControllers'
import { loginValidator, registerValidator } from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const userRouter = Router()

userRouter.post('/user/login', loginValidator, loginController)
userRouter.post('/user/register', registerValidator, wrapRequestHandler(registerController))

export default userRouter
