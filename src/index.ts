import express from 'express'
import userRouter from './routes/userRoutes'
import dbService from './services/dbServices'
import { defaultErrorHandler } from './middlewares/errorMiddlewares'
import mediaRouter from './routes/mediaRoutes'
import { initFolder } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/staticRoutes'
import cors, { CorsOptions } from 'cors'
import tweetRouter from './routes/tweetRoutes'
import bookmarkRouter from './routes/bookmarkRoutes'
import searchRouter from './routes/searchRoutes'
import conversationRouter from './routes/conversationRoutes'
import { createServer } from 'http'
import initialSocket from './utils/socket'
import swaggerUi from 'swagger-ui-express'
// import YAML from 'yaml'
// import fs from 'fs'
// import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import { ENV_CONFIG, isProduction } from './constants/config'
import helmet from 'helmet'

initFolder()

// const file = fs.readFileSync(path.resolve('./twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter Clone API',
      version: '1.0.0'
    }
  },
  apis: ['openapi/*.yaml'] // files containing annotations as above
}

const openapiSpecification = swaggerJsdoc(options)

const corsOptions: CorsOptions = {
  origin: isProduction ? ENV_CONFIG.CLIENT_URL : '*'
}

const app = express()
const httpServer = createServer(app)
const port = ENV_CONFIG.PORT
dbService.connect().then(() => {
  dbService.indexUsers()
  dbService.indexRefreshTokens()
  dbService.indexVideoStatus()
  dbService.indexFollowers()
  dbService.indexTweets()
})

app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/api/user', userRouter)
app.use('/api/media', mediaRouter)
app.use('/api/tweet', tweetRouter)
app.use('/api/bookmark', bookmarkRouter)
app.use('/api/search', searchRouter)
app.use('/api/conversation', conversationRouter)
app.use('/api/static', staticRouter)
app.use('/api/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

initialSocket(httpServer)

httpServer.listen(port, () => console.log(`Server is running at http://localhost:${port}/`))
