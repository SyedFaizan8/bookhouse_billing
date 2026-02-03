module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./client",
      script: "npm",
      args: "start",
    },
    {
      name: "backend",
      cwd: "./server",
      script: "npm",
      args: "start",
    },
  ],
};

