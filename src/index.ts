import express, { Request, Response, NextFunction } from 'express'
import userRouter from './routes/userRoutes'
import dbService from './services/dbServices'
import { defaultErrorHandler } from './middlewares/errorMiddlewares'

const app = express()
const port = 4000
dbService.connect()

app.get('/', (req: Request, res: Response) => {
  res.json('ExpressJS Server On')
})

app.use(express.json())

app.use('/api', userRouter)

app.use(defaultErrorHandler)

app.listen(port, () => console.log(`Server is running at http://localhost:${port}/`))
