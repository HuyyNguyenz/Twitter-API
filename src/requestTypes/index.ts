import { JwtPayload } from 'jsonwebtoken'
import { Media, TokenType, TweetAudience, TweetType, UserVerifyStatus } from '~/types'
import { ParamsDictionary, Query } from 'express-serve-static-core'

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: nguyenhuydz3@gmail.com
 *         password:
 *           type: string
 *           example: Aluhabaz3105@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRiZTBhZDJlNDNkMjQ2NDM5NGZlZWRiIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE2OTEzODMyMjYsImV4cCI6MTY5MTQ2OTYyNn0.HTLX20cB7_z0c9c8FDg3MIx6RJEELHHlmJNZa94ku-o
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRiZTBhZDJlNDNkMjQ2NDM5NGZlZWRiIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE2OTEzODMyMjYsImV4cCI6MTcwMDAyMzIyNn0.bFnaBfxWl-Q48HCwAeMpNzZwTO9LEjcBd7Zyipjqr64
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: 6517dbe5da80943516c60099
 *         name:
 *           type: string
 *           example: Huyy Nguyenz
 *         email:
 *           type: string
 *           example: nguyenhuydz3@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: 2023-08-21T07:16:53.062Z
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-09-30T08:27:17.267Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: 2023-09-30T08:27:17.267Z
 *         verify:
 *           $ref: '#/components/schemas/UserVerifyStatus'
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *           example: ['6517dbe5da80943516c60099', '6517dbe5da80943516c60081']
 *         bio:
 *           type: string
 *           example: 'This is my bio'
 *         location:
 *           type: string
 *           example: 'Binh Chanh district, Ho Chi Minh city'
 *         website:
 *           type: string
 *           example: 'www.example.com'
 *         username:
 *           type: string
 *           example: 'user6517dbe5da80943516c60099'
 *         avatar:
 *           type: string
 *           example: 'http:localhost:4000/images/avatars/huyz.jpg'
 *         cover_photo:
 *           type: string
 *           example: 'http:localhost:4000/images/avatars/huyz.jpg'
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

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

export interface SearchQuery extends Pagination, Query {
  content: string
  media_type: MediaTypeQuery
  people_follow: PeopleFollow
}

export enum MediaTypeQuery {
  Image = 'image',
  Video = 'video'
}

export enum PeopleFollow {
  Anyone = '0',
  Following = '1'
}

export interface ConversationsReqParam extends ParamsDictionary {
  receiver_id: string
}
