'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BC_URL: '"https://127.0.0.1:10443/api/v1/"'
})
