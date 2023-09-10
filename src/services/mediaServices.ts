import { config } from 'dotenv'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'

config()
class MediaService {
  handleUploadSingleImage = async (req: Request) => {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.HOST}/static/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/${newName}.jpg`
  }
}

const mediaService = new MediaService()
export default mediaService
