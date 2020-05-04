const jwtDecode = require('jwt-decode')

function b2cCustomProvider (options) {
  console.log(`openid+${options.clientId}`)
  return {
    protocol: 'oauth2',
    useParamsAuth: true,
    auth: `${options.uri}/oauth2/v2.0/authorize`,
    token: `${options.uri}/oauth2/v2.0/token?p=${options.policy}`,
    scope: [`openid ${options.clientId}`],
    profile: async function (credentials, params, get) {
      const { givenName, surname } = jwtDecode(credentials.token)
      credentials.profile = {
        givenName,
        surname
      }
    }
  }
}

module.exports = b2cCustomProvider
