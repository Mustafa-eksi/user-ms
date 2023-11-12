import * as dotenv from 'dotenv'

dotenv.config()

type config = {
    PORT: number
    MONGO_CONNECTION: string
    JWT_SECRET: string,
    TOKEN_TIMEOUT: string
}

const env = process.env as any

const variables: config = {
    PORT: env.PORT,
    MONGO_CONNECTION: env.MONGO_CONNECTION,
    JWT_SECRET: env.JWT_SECRET,
    TOKEN_TIMEOUT: env.TOKEN_TIMEOUT
}

export default variables