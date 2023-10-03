import { JwtPayload } from 'jsonwebtoken'
import { Media, TokenType, TweetAudience, TweetType, UserVerifyStatus } from '~/types'
import { ParamsDictionary, Query } from 'express-serve-static-core'

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
  iat: number
  exp: number
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

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc, không thì là tweet_id cha dạng string
  hashtags: string[] // tên của hashtag dạng ['javascript', 'reactjs']
  mentions: string[] // user_id[]
  medias: Media[]
}

export interface BookmarkRequestBody {
  tweet_id: string
}

export interface TweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface Pagination {
  limit: string
  page: string
}

export interface TweetQuery extends Pagination, Query {
  tweet_type: string
}

export interface SearchQuery extends Pagination {
  content: string
}
