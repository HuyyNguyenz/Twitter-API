import { Request, Response } from 'express'
import userService from '~/services/userServices'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/requestTypes'

export const loginController = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Login successfully 🐧' })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(201).json({ message: 'Register Successfully', result })
}
