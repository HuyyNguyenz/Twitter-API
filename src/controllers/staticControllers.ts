import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { StaticReqParams } from '~/requestTypes'

export const serveImageController = (req: Request<StaticReqParams>, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err: any) => {
    if (err) {
      return res.status(err.status).send('Not found')
    }
  })
}
