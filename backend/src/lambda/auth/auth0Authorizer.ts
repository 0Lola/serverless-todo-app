import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
// import { verify, decode } from 'jsonwebtoken'
// import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

// const logger = createLogger('auth')

// Auth0 JSON Web Key Set
// const jwksUrl = 'https://udacity-serverless-zxa011023.us.auth0.com/.well-known/jwks.json'
const secret = 'o0kvHInIfOxAxK7nMkGIfBJ739FV6_2hCOWKudEcw-oT399uGGfzA0wCyHPYCOEN'

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    console.log('Authorizing a user', event.authorizationToken)

    try {
        const jwtToken = await verifyToken(event.authorizationToken)
        console.log('User was authorized', jwtToken)

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
        console.log('User not authorized', { error: e.message })

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
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]
    // const jwt: Jwt = decode(token, { comxplete: true }) as Jwt
    console.log('verifyToken: ', token)

    return verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload
}