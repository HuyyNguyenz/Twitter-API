/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'twitter-api',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
