import app from "./app.js";
import { env } from "./env.js";
import { prisma } from "./lib/prisma.js";

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on ${env.PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
