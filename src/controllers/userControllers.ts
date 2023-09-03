import { Request, Response } from 'express'
import userService from '~/services/userServices'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/requestTypes'
import { USER_MESSAGES } from '~/constants/messages'
import User from '~/models/schemas/UserSchema'
import { ObjectId } from 'mongodb'
import dbService from '~/services/dbServices'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/types'
import { config } from 'dotenv'

config()

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify
  const result = await userService.login({ user_id: user_id.toString(), verify })
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  const redirectUri = `${process.env.CLIENT_REDIRECT_URI}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}&verify=${result.verify}`
  return res.redirect(redirectUri)
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  return res.status(201).json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json({ message: USER_MESSAGES.LOGOUT_SUCCESS, result })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await dbService.users().findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND })
  }
  if (user.email_verify_token === '') {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.verifyEmail({ user_id, verify: user.verify })
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await dbService.users().findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await userService.resendVerifyEmail({ user_id, verify: user.verify })
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordController = (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  return res.json({ message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: USER_MESSAGES.GET_ME_SUCCESS,
    user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)
  return res.json(result)
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params
  const result = await userService.getProfile(username)
  return res.json(result)
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await userService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unFollowController = async (req: Request<UnFollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await userService.unFollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userService.changePassword(user_id, password)
  return res.json(result)
}
