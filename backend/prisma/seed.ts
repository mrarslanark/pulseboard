import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.upsert({
    where: { apiKey: "test-api-key-001" },
    update: {},
    create: {
      name: "My Mobile App",
      apiKey: "test-api-key-001",
    },
  });

  console.log("✅ Seeded project:", project);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
