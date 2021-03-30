import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { verify } from 'jsonwebtoken'
import { secretsManager } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('auth')

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
    try {
      const jwtToken = await verifyToken(event.authorizationToken,context.AUTH0_SECRET[secretField])
        logger.info('User was authorized', jwtToken)

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', { error: e.message })

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
})

async function verifyToken(authHeader: string, secret: string): Promise<JwtPayload> {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]
    const userId = parseUserId(token)
    logger.info('verifyToken userId: ', userId)

    return verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload
}

handler.use(
    secretsManager({
      awsSdkOptions: { region: 'us-east-1' },
      cache: true,
      cacheExpiryInMillis: 60000,
      throwOnFailedCall: true,
      secrets: {
        AUTH0_SECRET: secretId
      }
    })
  )