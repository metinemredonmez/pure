// pm2 yapılandırması (yeni sunucu). Uygulamalar `pure` kullanıcısıyla çalışır, root ile değil.
// Site ve admin yalnızca 127.0.0.1'de dinler; dışarıya sadece nginx açılır.
const APP_DIR = process.env.APP_DIR || '/var/www/pureolentia'
const LOG_DIR = process.env.LOG_DIR || '/var/log/pure'

const common = {
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  watch: false,
  merge_logs: true,
  log_date_format: 'YYYY-MM-DD HH:mm:ss',
}

module.exports = {
  apps: [
    {
      ...common,
      name: 'pureolentia-api',
      // cwd önemli: yüklemeler process.cwd()/uploads altına yazılır
      cwd: `${APP_DIR}/backend`,
      script: 'dist/src/main.js',
      env: { NODE_ENV: 'production', PORT: 4000 },
      max_memory_restart: '768M',
      error_file: `${LOG_DIR}/api-error.log`,
      out_file: `${LOG_DIR}/api-out.log`,
    },
    {
      ...common,
      name: 'pureolentia-web',
      cwd: `${APP_DIR}/web`,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3001',
      env: { NODE_ENV: 'production', PORT: 3001 },
      max_memory_restart: '1G',
      error_file: `${LOG_DIR}/web-error.log`,
      out_file: `${LOG_DIR}/web-out.log`,
    },
    {
      ...common,
      name: 'pureolentia-admin',
      cwd: `${APP_DIR}/admin`,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      env: { NODE_ENV: 'production', PORT: 3000 },
      max_memory_restart: '512M',
      error_file: `${LOG_DIR}/admin-error.log`,
      out_file: `${LOG_DIR}/admin-out.log`,
    },
  ],
}
