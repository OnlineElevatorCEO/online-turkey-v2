module.exports = {
  apps: [
    {
      name: "online-turkey",
      script: "./server.js",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 5000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      }
    }
  ]
};
