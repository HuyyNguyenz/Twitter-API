import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/types'
import { ParamsDictionary } from 'express-serve-static-core'

export interface LoginReqBody {
  email: string
  password: string
}

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  verify: UserVerifyStatus
  token_type: TokenType
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string
}

export interface ResetPasswordReqBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}

export interface FollowReqBody {
  followed_user_id: string
}

export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface StaticReqParams extends ParamsDictionary {
  name: string
}

export interface StaticM3u8ReqParams extends ParamsDictionary {
  id: string
}

export interface StaticSegmentReqParams extends ParamsDictionary {
  id: string
  v: string
  segment: string
}
