import { createHash } from 'crypto'

const hashPassword = (content: string) => {
  return createHash('sha256').update(content).digest('hex')
}

export default hashPassword
