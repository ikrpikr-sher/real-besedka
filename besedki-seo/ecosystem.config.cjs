/** PM2: ограничение памяти Node на VPS 2 GB (без OOM-kill для всех пользователей). */
module.exports = {
  apps: [
    {
      name: 'besedki',
      cwd: '/var/www/besedki',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        NODE_OPTIONS: '--max-old-space-size=768',
      },
      max_memory_restart: '900M',
      exp_backoff_restart_delay: 2000,
      kill_timeout: 8000,
    },
  ],
};
