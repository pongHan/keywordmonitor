module.exports = {
  apps: [
    {
      name: 'keywordmonitor',
      script: './bin/www',
      exec_mode: 'fork', 
      instances: 1, 
      env_development: {
        NODE_ENV: 'development',
        node_args: '-r dotenv/config dotenv_config_path=.env.dev'
      },
      env_production: {
        NODE_ENV: 'production',
        node_args: '-r dotenv/config dotenv_config_path=.env.prod'
      }
    }
  ]
};
