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
import searchRouter from './routes/searchRoutes'
import { createServer } from 'http'
import { Server } from 'socket.io'

config()
initFolder()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000
dbService.connect().then(() => {
  dbService.indexUsers()
  dbService.indexRefreshTokens()
  dbService.indexVideoStatus()
  dbService.indexFollowers()
  dbService.indexTweets()
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
app.use('/api/search', searchRouter)
app.use('/api/static', staticRouter)
app.use('/api/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL as string
  }
})

const users: { [key: string]: { socket_id: string } } = {}

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  const user_id = socket.handshake.auth._id as string
  users[user_id] = { socket_id: socket.id }
  console.log(users)
  socket.on('private message', (data) => {
    const receive_socket_id = users[data.to].socket_id
    socket.to(receive_socket_id).emit('receive private message', data)
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
    console.log(users)
  })
})

httpServer.listen(port, () => console.log(`Server is running at http://localhost:${port}/`))
