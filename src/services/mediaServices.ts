import { config } from 'dotenv'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { Media, MediaType } from '~/types'
import queue from '~/utils/queue'

config()
class MediaService {
  uploadImage = async (req: Request) => {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/api/static/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/api/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  uploadVideo = async (req: Request) => {
    const files = await handleUploadVideo(req)
    const result: Media[] = files.map((file) => {
      return {
        url: isProduction
          ? `${process.env.HOST}/api/static/video/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/api/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })
    return result
  }
  uploadVideoHLS = async (req: Request) => {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/api/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/api/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
}

const mediaService = new MediaService()
export default mediaService
