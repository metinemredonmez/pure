module.exports = {
  apps: [
    {
      name: 'olentia-api',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 4000,
      },
      max_memory_restart: '512M',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'olentia-admin',
      cwd: './admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '256M',
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
