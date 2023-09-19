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
