import { ObjectId } from 'mongodb'
import dbService from './dbServices'
import Bookmark from '~/models/schemas/BookmarkSchema'

class BookmarkService {
  bookmarkTweet = async (user_id: string, tweet_id: string) => {
    const result = await dbService.bookmarks().findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value
  }
  unBookmarkTweet = async (user_id: string, tweet_id: string) => {
    const result = await dbService.bookmarks().findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result.ok
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
