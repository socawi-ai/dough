module.exports = {
  apps: [
    {
      name: 'project_2_dough',
      script: './server.js',
      cwd: '/opt/project_2_dough',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'project_2_dough_dev',
      script: './server.js',
      cwd: '/opt/project_2_dough',
      watch: ['server.js', 'public'],
      ignore_watch: ['node_modules', '.git', '*.log'],
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
    },
  ],
};
