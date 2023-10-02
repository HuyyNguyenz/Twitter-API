import express, { Request, Response } from 'express'
import userRouter from './routes/userRoutes'
import dbService from './services/dbServices'
import { defaultErrorHandler } from './middlewares/errorMiddlewares'
import mediaRouter from './routes/mediaRoutes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/staticRoutes'
import cors from 'cors'
import tweetRouter from './routes/tweetRoutes'
import bookmarkRouter from './routes/bookmarkRoutes'

config()
initFolder()

const app = express()
const port = process.env.PORT || 4000
dbService.connect().then(() => {
  dbService.indexUsers()
  dbService.indexRefreshTokens()
  dbService.indexVideoStatus()
  dbService.indexFollowers()
})

app.get('/', (req: Request, res: Response) => {
  res.json('ExpressJS Server On')
})

app.use(cors())
app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/media', mediaRouter)
app.use('/api/tweet', tweetRouter)
app.use('/api/bookmark', bookmarkRouter)
app.use('/api/static', staticRouter)
app.use('/api/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => console.log(`Server is running at http://localhost:${port}/`))
