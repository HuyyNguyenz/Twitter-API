import User from '~/models/schemas/UserSchema'
import dbService from './dbServices'
import { RegisterReqBody, UpdateMeReqBody } from '~/requestTypes'
import hashPassword from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/types'
import RefreshToken from '~/models/schemas/RefreshTokenSchema'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import Follower from '~/models/schemas/FollowerSchema'
import axios from 'axios'
import { sendForgotPasswordEmail, sendRegisterVerifyEmail } from '~/utils/email'
import { ENV_CONFIG } from '~/constants/config'
class UserService {
  private signAccessToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.AccessToken
      },
      privateKey: ENV_CONFIG.SECRET_JWT_ACCESS_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRE_IN
      }
    })
  }
  private signRefreshToken = ({
    user_id,
    verify,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    exp?: number
  }) => {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          verify,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: ENV_CONFIG.SECRET_JWT_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.RefreshToken
      },
      privateKey: ENV_CONFIG.SECRET_JWT_REFRESH_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRE_IN
      }
    })
  }
  private signAccessAndRefreshToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  private decodeRefreshToken = (token: string) => {
    return verifyToken({
      secretOrPublicKey: ENV_CONFIG.SECRET_JWT_REFRESH_TOKEN as string,
      token
    })
  }
  private signEmailVerifyToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: ENV_CONFIG.SECRET_JWT_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.EMAIL_VERIFY_TOKEN_EXPIRE_IN
      }
    })
  }
  private signForgotPasswordToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: {
        user_id,
        verify,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: ENV_CONFIG.SECRET_JWT_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: ENV_CONFIG.FORGOT_PASSWORD_EXPIRE_IN
      }
    })
  }
  private getOauthGoogleToken = async (code: string) => {
    const body = {
      code,
      client_id: ENV_CONFIG.GOOGLE_CLIENT_ID,
      client_secret: ENV_CONFIG.GOOGLE_CLIENT_SECRET,
      redirect_uri: ENV_CONFIG.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }
  private getGoogleUserInfo = async (access_token: string, id_token: string) => {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }
  register = async (data: RegisterReqBody) => {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const user = new User({
      ...data,
      _id: user_id,
      username: `user${user_id.toString()}`,
      email_verify_token,
      date_of_birth: new Date(data.date_of_birth),
      password: hashPassword(data.password + ENV_CONFIG.SECRET_PASSWORD)
    })
    await dbService.users().insertOne(user)
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await dbService.refreshTokens().insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: user_id,
        iat,
        exp
      })
    )
    console.log('email_verify_token:', email_verify_token)
    await sendRegisterVerifyEmail(data.email, email_verify_token)
    return { access_token, refresh_token }
  }
  checkEmailExist = async (email: string) => {
    const result = await dbService.users().findOne({ email })
    return result
  }
  login = async ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await dbService.refreshTokens().insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )
    return { access_token, refresh_token }
  }
  logout = async (refresh_token: string) => {
    const result = await dbService.refreshTokens().deleteOne({ token: refresh_token })
    return result
  }
  refreshToken = async ({
    refresh_token,
    user_id,
    verify,
    exp
  }: {
    refresh_token: string
    user_id: string
    verify: UserVerifyStatus
    exp: number
  }) => {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      dbService.refreshTokens().deleteOne({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)
    await dbService.refreshTokens().insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )
    return {
      message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
  verifyEmail = async ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({
        user_id,
        verify
      }),
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
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    await dbService.refreshTokens().insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }
  resendVerifyEmail = async ({
    user_id,
    verify,
    email
  }: {
    user_id: string
    verify: UserVerifyStatus
    email: string
  }) => {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify
    })
    console.log('Resend verify email: ', email_verify_token)
    await sendRegisterVerifyEmail(email, email_verify_token)
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
  forgotPassword = async ({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) => {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await dbService.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    console.log('forgot_password_token: ', forgot_password_token)
    await sendForgotPasswordEmail(email, forgot_password_token)
    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }
  resetPassword = async (user_id: string, password: string) => {
    await dbService.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password + ENV_CONFIG.SECRET_PASSWORD),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
  getMe = async (user_id: string) => {
    const result = await dbService.users().findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return result
  }
  updateMe = async (user_id: string, payload: UpdateMeReqBody) => {
    const _payload = payload.date_of_birth
      ? {
          ...payload,
          date_of_birth: new Date(payload.date_of_birth)
        }
      : payload
    const user = (
      await dbService.users().findOneAndUpdate(
        {
          _id: new ObjectId(user_id)
        },
        {
          $set: {
            ...(_payload as UpdateMeReqBody & {
              date_of_birth?: Date
            })
          },
          $currentDate: {
            updated_at: true
          }
        },
        {
          returnDocument: 'after',
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0
          }
        }
      )
    ).value
    return {
      message: USER_MESSAGES.UPDATE_ME_SUCCESS,
      user
    }
  }
  getProfile = async (username: string) => {
    const user = await dbService.users().findOne(
      {
        username
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (user === null) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return {
      message: USER_MESSAGES.GET_PROFILE_SUCCESS,
      user
    }
  }
  follow = async (user_id: string, followed_user_id: string) => {
    const follower = await dbService.followers().findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower) {
      return {
        message: USER_MESSAGES.FOLLOWED
      }
    }
    await dbService.followers().insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    return {
      message: USER_MESSAGES.FOLLOW_SUCCESS
    }
  }
  unFollow = async (user_id: string, followed_user_id: string) => {
    const follower = await dbService.followers().findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOWED
      }
    }
    await dbService.followers().deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_SUCCESS
    }
  }
  changePassword = async (user_id: string, password: string) => {
    await dbService.users().updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password + ENV_CONFIG.SECRET_PASSWORD)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
  oauth = async (code: string) => {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const user = await dbService.users().findOne({
      email: userInfo.email
    })
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refresh_token)
      await dbService.refreshTokens().insertOne(new RefreshToken({ user_id: user._id, token: refresh_token, iat, exp }))
      return {
        access_token,
        refresh_token,
        new_user: 0,
        verify: user.verify
      }
    } else {
      const password = Math.random().toString(36).substring(2, 15)
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return {
        ...data,
        new_user: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }
}

const userService = new UserService()
export default userService
