import { Request } from 'express'
import User from './models/schemas/UserSchema'
import { TokenPayload } from './requestTypes'
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
  }
}
