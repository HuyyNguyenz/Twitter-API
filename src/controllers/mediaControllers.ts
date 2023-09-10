import { Request, Response } from 'express'
import path from 'path'
import { USER_MESSAGES } from '~/constants/messages'
import mediaService from '~/services/mediaServices'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediaService.handleUploadSingleImage(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}
