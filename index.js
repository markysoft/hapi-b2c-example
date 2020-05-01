'use strict'
require('dotenv').config()

const Bell = require('@hapi/bell')
Bell.providers['b2c-custom'] = require('./b2c-custom-provider')
const Boom = require('@hapi/boom')
const Hapi = require('@hapi/hapi')

// Build config
const b2cConfig = {
  uri: process.env.B2C_URI,
  clientId: process.env.B2C_CLIENT_ID,
  clientSecret: process.env.B2C_CLIENT_SECRET,
  policy: process.env.B2C_POLICY
}
const internals = {}

internals.start = async function () {
  const server = Hapi.server({ port: 3006 })
  await server.register([require('@hapi/cookie'), Bell])

  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'sid-demo',
      path: '/',
      password: 'cookie_encryption_password_secure',
      isSecure: false // Should be set to true (which is the default) in production
    },
    redirectTo: '/auth/b2c' // If there is no session, redirect here
  })

  server.auth.strategy('b2c', 'bell', {
    provider: 'b2c-custom',
    config: {
      uri: b2cConfig.uri,
      clientId: b2cConfig.clientId,
      policy: b2cConfig.policy
    },
    providerParams: {
      p: b2cConfig.policy,
      response_type: 'code',
      nonce: 'defaultNonce',
      prompt: 'login'
    },
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    location: 'http://localhost:3006',
    clientId: b2cConfig.clientId,
    clientSecret: b2cConfig.clientSecret
  })

  server.route({
    method: 'GET',
    path: '/auth/b2c',
    options: {
      auth: {
        strategy: 'b2c',
        mode: 'try'
      },
      handler: function (request, h) {
        console.log('/auth/b2c')
        if (!request.auth.isAuthenticated) {
          throw Boom.unauthorized('Authentication failed: ' + request.auth.error.message)
        }

        console.log('authenticated', request.auth.credentials.profile.username)
        // Just store the third party credentials in the session as an example. You could do something
        // more useful here - like loading or setting up an account (social signup).

        request.cookieAuth.set(request.auth.credentials)
        return h.redirect('/')
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    options: {
      auth: 'session',
      handler: function (request, h) {
        return `Hello ${request.auth.credentials.profile.givenName} ${request.auth.credentials.profile.surname}!`
      }
    }
  })

  await server.start()
  console.log('Server started at:', server.info.uri)
}

internals.start()
