/** PM2 для VPS 4 GB+ RAM — после апгрейда в панели Beget. */
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
        NODE_OPTIONS: '--max-old-space-size=2048',
      },
      max_memory_restart: '2800M',
      exp_backoff_restart_delay: 2000,
      kill_timeout: 8000,
    },
  ],
};
