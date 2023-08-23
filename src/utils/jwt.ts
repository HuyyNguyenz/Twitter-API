import jwt from 'jsonwebtoken'
import { JwtType } from '~/types'

const signToken = ({
  payload,
  privateKey = process.env.SECRET_JWT as string,
  options = { algorithm: 'HS256' }
}: JwtType) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        reject(error)
      }
      resolve(token as string)
    })
  })
}

export default signToken
