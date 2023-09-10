import express, { Request, Response, NextFunction } from 'express'
import userRouter from './routes/userRoutes'
import dbService from './services/dbServices'
import { defaultErrorHandler } from './middlewares/errorMiddlewares'
import mediaRouter from './routes/mediaRoutes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/staticRoutes'

config()
initFolder()

const app = express()
const port = process.env.PORT || 4000
dbService.connect()

app.get('/', (req: Request, res: Response) => {
  res.json('ExpressJS Server On')
})

app.use(express.json())

app.use('/api/user', userRouter)
app.use('/api/media', mediaRouter)
app.use('/static', staticRouter)
// app.use('/static', express.static(UPLOAD_DIR))

app.use(defaultErrorHandler)

app.listen(port, () => console.log(`Server is running at http://localhost:${port}/`))
