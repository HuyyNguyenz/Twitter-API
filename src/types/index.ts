import { SignOptions } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  twitter_circle?: ObjectId[]
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export interface JwtType {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}

export interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  iat: number
  exp: number
}

export interface FollowerType {
  _id?: ObjectId
  followed_user_id: ObjectId
  user_id: ObjectId
  created_at?: Date
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export interface Media {
  url: string
  type: MediaType
}

export interface VideoStatusType {
  _id?: ObjectId
  name: string
  status: VideoEncodingStatus
  message?: string
  created_at?: Date
  updated_at?: Date
}

export enum VideoEncodingStatus {
  Failed,
  Pending,
  Processing,
  Success
}

export interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone, // 0
  TwitterCircle // 1
}

export interface HashtagType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export interface BookmarkType {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}
