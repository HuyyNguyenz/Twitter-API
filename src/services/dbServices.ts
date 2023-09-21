import { MongoClient, Db, Collection } from 'mongodb'
import User from '~/models/schemas/UserSchema'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshTokenSchema'
import Follower from '~/models/schemas/FollowerSchema'
import VideoStatus from '~/models/schemas/VideoStatusSchema'

config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@twitter.hx0adbn.mongodb.net/?retryWrites=true&w=majority`

class DbService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  connect = async () => {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Connected failed', error)
    }
  }
  indexUsers = async () => {
    const indexExists = await this.users().indexExists(['email_1_password_1', 'email_1', 'username_1'])
    if (!indexExists) {
      this.users().createIndex({ email: 1, password: 1 })
      this.users().createIndex({ email: 1 }, { unique: true })
      this.users().createIndex({ username: 1 }, { unique: true })
    }
  }
  indexRefreshTokens = async () => {
    const indexExists = await this.refreshTokens().indexExists(['exp_1', 'token_1'])
    if (!indexExists) {
      this.refreshTokens().createIndex({ token: 1 })
      this.refreshTokens().createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }
  indexVideoStatus = async () => {
    const indexExists = await this.videoStatus().indexExists(['name_1'])
    if (!indexExists) {
      this.videoStatus().createIndex({ name: 1 })
    }
  }
  indexFollowers = async () => {
    const indexExists = await this.followers().indexExists(['user_id_1_followed_user_id_1'])
    if (!indexExists) {
      this.followers().createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
  users = (): Collection<User> => {
    return this.db.collection('users')
  }
  refreshTokens = (): Collection<RefreshToken> => {
    return this.db.collection('refresh_tokens')
  }
  followers = (): Collection<Follower> => {
    return this.db.collection('followers')
  }
  videoStatus = (): Collection<VideoStatus> => {
    return this.db.collection('video_status')
  }
}
const dbService = new DbService()
export default dbService
