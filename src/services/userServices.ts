import User from '~/models/schemas/userSchema'
import dbService from './dbServices'
import { RegisterReqBody } from '~/requestTypes'
import hashPassword from '~/utils/crypto'
import signToken from '~/utils/jwt'
import { TokenType } from '~/types'

class UserService {
  private signAccessToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_IN }
    })
  }
  private signRefreshToken = (user_id: string) => {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
    })
  }
  register = async (data: RegisterReqBody) => {
    const user = new User({
      ...data,
      date_of_birth: new Date(data.date_of_birth),
      password: hashPassword(data.password + process.env.PASSWORD_SECRET)
    })
    const result = await dbService.getUsers().insertOne(user)
    const { insertedId } = result
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(insertedId.toString()),
      this.signRefreshToken(insertedId.toString())
    ])
    return { access_token, refresh_token }
  }
  checkExistEmail = async (email: string) => {
    const result = await dbService.getUsers().findOne({ email })
    return Boolean(result)
  }
}

const userService = new UserService()
export default userService
