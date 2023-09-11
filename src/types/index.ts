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
}

export interface FollowerType {
  _id?: ObjectId
  followed_user_id: ObjectId
  user_id: ObjectId
  created_at?: Date
}

export enum MediaType {
  Image,
  Video
}

export interface Media {
  url: string
  type: MediaType
}
