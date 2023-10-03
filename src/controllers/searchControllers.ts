import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery, TokenPayload } from '~/requestTypes'
import searchService from '~/services/searchServices'

export const searchController = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const content = req.query.content
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await searchService.search({ content, limit, page, user_id })
  return res.json({
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
