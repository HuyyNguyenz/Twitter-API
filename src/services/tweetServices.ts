import { TweetRequestBody } from '~/requestTypes'
import dbService from './dbServices'
import Tweet from '~/models/schemas/TweetSchema'
import { ObjectId } from 'mongodb'

class TweetService {
  createTweet = async (user_id: string, body: TweetRequestBody) => {
    const { insertedId } = await dbService.tweets().insertOne(
      new Tweet({
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags: [],
        mentions: [],
        medias: [],
        parent_id: null,
        user_id: new ObjectId(user_id)
      })
    )
    const result = await dbService.tweets().findOne({ _id: insertedId })
    return result
  }
}
const tweetService = new TweetService()
export default tweetService
