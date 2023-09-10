import { config } from 'dotenv'
import argv from 'minimist'

config()
export const isProduction = Boolean(argv(process.argv.slice(2)).production)
