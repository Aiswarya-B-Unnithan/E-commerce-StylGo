
module.exports = {
    apps: [
      {
        name: 'project name',
        script: 'build/server.js',
        env: {
          NODE_ENV: 'production', 
        },
        env_file: '.env', 
      },
    ],
  };
  