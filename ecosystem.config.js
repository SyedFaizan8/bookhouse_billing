module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./client",
      script: "npm",
      args: "start",
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 100,
    },
    {
      name: "backend",
      cwd: "./server",
      script: "npm",
      args: "start",
      autorestart: true,
      restart_delay: 3000,
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 100,
    },
  ],
};
