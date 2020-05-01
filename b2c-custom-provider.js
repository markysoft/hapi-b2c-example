function b2cCustomProvider (options) {
  console.log(`openid+${options.clientId}`)
  return {
    protocol: 'oauth2',
    useParamsAuth: true,
    auth: `${options.uri}/oauth2/v2.0/authorize`,
    token: `${options.uri}/oauth2/v2.0/token?p=${options.policy}`,
    scope: [`openid ${options.clientId}`],
    profile: async function (credentials, params, get) {
      // this should be replaced with a call to get user info
      const profile = await Promise.resolve({ email: 'test@mail', given_name: 'test', family_name: 'user' })

      credentials.profile = {
        id: profile.sub,
        username: profile.email,
        displayName: profile.nickname,
        firstName: profile.given_name,
        lastName: profile.family_name,
        email: profile.email,
        raw: profile
      }
    }
  }
}

module.exports = b2cCustomProvider
