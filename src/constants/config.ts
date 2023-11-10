import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'

const env = process.env.NODE_ENV
const envFileName = `.env.${env}`

if (!env) {
  console.log(`Bạn chưa cung cấp biến môi trường NODE_ENV (ví dụ: development, production)`)
  console.log(`Phát hiện NODE_ENV = ${env}`)
  process.exit(1)
}
console.log(`Phát hiện NODE_ENV = ${env}, vì thế app sẽ dùng file môi trường là ${envFileName}`)
if (!fs.existsSync(path.resolve(envFileName))) {
  console.log(`Không tìm thấy file môi trường ${envFileName}`)
  console.log(`Lưu ý: App không dùng file .env, ví dụ môi trường là development thì app sẽ dùng file .env.development`)
  console.log(`Vui lòng tạo file ${envFileName} và tham khảo nội dung ở file .env.example`)
  process.exit(1)
}
config({
  path: envFileName
})
export const isProduction = Boolean(process.env.NODE_ENV === 'production')

export const ENV_CONFIG = {
  DB_NAME: process.env.DB_NAME as string,
  DB_USER: process.env.DB_USER as string,
  DB_PASSWORD: process.env.DB_PASSWORD as string,
  PORT: process.env.PORT || 4000,
  HOST: process.env.HOST as string,

  SECRET_PASSWORD: process.env.SECRET_PASSWORD as string,
  SECRET_JWT_ACCESS_TOKEN: process.env.SECRET_JWT_ACCESS_TOKEN as string,
  SECRET_JWT_REFRESH_TOKEN: process.env.SECRET_JWT_REFRESH_TOKEN as string,
  SECRET_JWT_EMAIL_VERIFY_TOKEN: process.env.SECRET_JWT_EMAIL_VERIFY_TOKEN as string,
  SECRET_JWT_FORGOT_PASSWORD_TOKEN: process.env.SECRET_JWT_FORGOT_PASSWORD_TOKEN as string,

  ACCESS_TOKEN_EXPIRE_IN: process.env.ACCESS_TOKEN_EXPIRE_IN as string,
  REFRESH_TOKEN_EXPIRE_IN: process.env.REFRESH_TOKEN_EXPIRE_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRE_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN as string,
  FORGOT_PASSWORD_EXPIRE_IN: process.env.FORGOT_PASSWORD_EXPIRE_IN as string,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
  CLIENT_REDIRECT_URI: process.env.CLIENT_REDIRECT_URI as string,
  CLIENT_URL: process.env.CLIENT_URL as string,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
  AWS_S3_NAME: process.env.AWS_S3_NAME as string
} as const
