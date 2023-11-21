
module.exports = {
    apps: [
      {
        name: 'stylgo',
        script: 'server.js',
        env: {
          NODE_ENV: 'production', 
        },
        env_file: '.env', 
      },
    ],
  };
  