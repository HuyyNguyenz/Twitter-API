import { ObjectId } from 'mongodb'
import dbService from './dbServices'

class ConversationService {
  getConversations = async ({
    sender_id,
    receiver_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) => {
    const match = {
      $or: [
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        }
      ]
    }
    const conversations = await dbService
      .conversations()
      .find(match)
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    const total = await dbService.conversations().countDocuments(match)
    return {
      conversations,
      total
    }
  }
}

const conversationService = new ConversationService()
export default conversationService
