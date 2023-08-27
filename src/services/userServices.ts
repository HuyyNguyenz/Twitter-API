import User from '~/models/schemas/UserSchema'
import dbService from './dbServices'
import { RegisterReqBody } from '~/requestTypes'
import hashPassword from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/types'
import RefreshToken from '~/models/schemas/RefreshTokenSchema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { USER_MESSAGES } from '~/constants/messages'

config()
class UserService {
  private signAccessToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.SECRET_JWT_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signRefreshToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.SECRET_JWT_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  private signAccessAndRefreshToken = (user_id: string) => {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  private signEmailVerifyToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken },
      privateKey: process.env.SECRET_JWT_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN }
    })
  }
  register = async (data: RegisterReqBody) => {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
    const user = new User({
      ...data,
      _id: user_id,
      email_verify_token,
      date_of_birth: new Date(data.date_of_birth),
      password: hashPassword(data.password + process.env.SECRET_PASSWORD)
    })
    await dbService.users().insertOne(user)
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await dbService.refreshTokens().insertOne(new RefreshToken({ token: refresh_token, user_id: user_id }))
    console.log('email_verify_token:', email_verify_token)

    return { access_token, refresh_token }
  }
  checkEmailExists = async (email: string) => {
    const result = await dbService.users().findOne({ email })
    return result
  }
  login = async (user_id: string) => {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
    await dbService
      .refreshTokens()
      .insertOne(new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) }))
    return { access_token, refresh_token }
  }
  logout = async (refresh_token: string) => {
    const result = await dbService.refreshTokens().deleteOne({ token: refresh_token })
    return result
  }
  verifyEmail = async (user_id: string) => {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id),
      dbService.users().updateOne(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: new Date()
          }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  resendVerifyEmail = async (user_id: string) => {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    console.log('Resend verify email: ', email_verify_token)
    await dbService.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }
}

const userService = new UserService()
export default userService
