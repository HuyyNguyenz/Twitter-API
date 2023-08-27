import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/requestTypes'
import { JwtType } from '~/types'

config()
export const signToken = ({ payload, privateKey, options = { algorithm: 'HS256' } }: JwtType) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        reject(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        reject(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
