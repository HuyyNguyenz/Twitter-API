import { Request, Response } from 'express'
import { ConversationsReqParam, TokenPayload } from '~/requestTypes'
import conversationService from '~/services/conversationServices'
import { CONVERSATION_MESSAGES } from '~/constants/messages'

export const getConversationsController = async (req: Request<ConversationsReqParam>, res: Response) => {
  const sender_id = (req.decoded_authorization as TokenPayload).user_id
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await conversationService.getConversations({ sender_id, receiver_id, limit, page })
  return res.json({
    message: CONVERSATION_MESSAGES.GET_CONVERSATIONS_SUCCESSFULLY,
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total / limit),
      conversations: result.conversations
    }
  })
}
