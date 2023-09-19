import dbService from '~/services/dbServices'
import { getNameFromFullName } from './file'
import { encodeHLSWithMultipleVideoStreams } from './video'
import fsPromise from 'fs/promises'
import VideoStatus from '~/models/schemas/VideoStatusSchema'
import { VideoEncodingStatus } from '~/types'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  enqueue = async (item: string) => {
    this.items.push(item)
    const idName = getNameFromFullName(item.split('/').pop() as string)
    await dbService.videoStatus().insertOne(new VideoStatus({ name: idName, status: VideoEncodingStatus.Pending }))
    this.processEncode()
  }
  processEncode = async () => {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('/').pop() as string)
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
        await fsPromise.unlink(videoPath)
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
