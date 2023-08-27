import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController
} from '~/controllers/userControllers'
import {
  accessTokenValidator,
  verifyEmailTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/userMiddlewares'
import wrapRequestHandler from '~/utils/handlers'

const userRouter = Router()
/**
 * Description: Login user
 * Path: /user/login
 * Method: POST
 * Body: { email: string, password:string }
 */
userRouter.post('/user/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. Register account for a new user
 * Path: /user/register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
userRouter.post('/user/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description. Logout a user
 * Path: /user/logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
userRouter.post('/user/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description. Verify email when user client click on the link in email
 * Path: /user/verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
userRouter.post('/user/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description. Resend email when user sign in and click button resend email
 * Path: /user/resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
userRouter.post('/user/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
export default userRouter
