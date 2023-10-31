import dbService from '~/services/dbServices'
import { getFiles, getNameFromFullName } from './file'
import { encodeHLSWithMultipleVideoStreams } from './video'
import fsPromise from 'fs/promises'
import { rimrafSync } from 'rimraf'
import VideoStatus from '~/models/schemas/VideoStatusSchema'
import { VideoEncodingStatus } from '~/types'
import path from 'path'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { uploadFileToS3 } from './s3'
import mime from 'mime'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  enqueue = async (item: string) => {
    this.items.push(item)
    const idName = getNameFromFullName(item.split('\\').pop() as string)
    await dbService.videoStatus().insertOne(new VideoStatus({ name: idName, status: VideoEncodingStatus.Pending }))
    this.processEncode()
  }
  processEncode = async () => {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('\\').pop() as string)
      await dbService.videoStatus().updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: VideoEncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all(
          files.map((filePath) => {
            const fileName = 'videos-hls' + filePath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').replace('\\', '/')
            return uploadFileToS3({
              filePath,
              fileName,
              contentType: mime.getType(filePath) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await dbService.videoStatus().updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: VideoEncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await dbService
          .videoStatus()
          .updateOne(
            {
              name: idName
            },
            {
              $set: {
                status: VideoEncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch(() => {
            console.log(`Update video error`)
          })
        console.log(`Encode video ${videoPath} error`)
        console.log(error)
      }
      this.encoding = false
      this.processEncode()
    }
  }
}

const queue = new Queue()
export default queue
