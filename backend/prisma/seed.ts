import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  /** Add seed data here
   * Example: Create a project with a known API key for testing
   * const project = await prisma.project.upsert({
   *   where: { apiKey: "test-api-key-001" },
   *   update: {},
   *   create: {
   *     name: "My Mobile App",
   *     apiKey: "test-api-key-001",
   *   },
   * });
   * console.log("✅ Seeded project:", project);
   * */
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
