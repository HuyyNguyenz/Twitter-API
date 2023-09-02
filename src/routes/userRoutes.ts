import { Router } from 'express'
import {
  verifyEmailController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unFollowController,
  changePasswordController
} from '~/controllers/userControllers'
import { filterMiddleware } from '~/middlewares/commonMiddlewares'
import {
  accessTokenValidator,
  verifyEmailTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  followValidator,
  unFollowValidator,
  changePasswordValidator
} from '~/middlewares/userMiddlewares'
import { UpdateMeReqBody } from '~/requestTypes'
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
 * Description: Register account for a new user
 * Path: /user/register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
userRouter.post('/user/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Description: Logout a user
 * Path: /user/logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
userRouter.post('/user/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description: Verify email when user client click on the link in email
 * Path: /user/verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
userRouter.post('/user/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Description: Resend email when user sign in and click button resend email
 * Path: /user/resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
userRouter.post('/user/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Submit email to reset password, send email to user
 * Path: /user/forgot-password
 * Method: POST
 * Body: { email: string }
 */
userRouter.post('/user/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify link in email to reset password
 * Path: /user/verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token:string }
 */
userRouter.post(
  '/user/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

/**
 * Description: Reset password
 * Path: /user/reset-password
 * Method: POST
 * Body: { forgot_password_token:string, password:string, confirm_password:string }
 */
userRouter.post('/user/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

/**
 * Description: Get my profile
 * Path: /user/me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
userRouter.get('/user/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description: Update my profile
 * Path: /user/me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
userRouter.patch(
  '/user/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar',
    'bio',
    'cover_photo',
    'date_of_birth',
    'location',
    'name',
    'username',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)

/**
 * Description: Get user profile
 * Path: /user/:username
 * Method: GET
 */
userRouter.get('/user/:username', wrapRequestHandler(getProfileController))

/**
 * Description: Follow user
 * Path: /user/follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 */
userRouter.post(
  '/user/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description: Unfollow user
 * Path: /user/follow/:user_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
userRouter.delete(
  '/user/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unFollowValidator,
  wrapRequestHandler(unFollowController)
)

/**
 * Description: Change password
 * Path: /user/change-password
 * Method: PUT
 * Header: { Authorization: Bearer <access_token> }
 * Body: { old_password:string, password:string, confirm_password:string }
 */
userRouter.put(
  '/user/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default userRouter
