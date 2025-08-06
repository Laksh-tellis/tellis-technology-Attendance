const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const teams = [
  'Design',
  'Development',
  'QA',
  'Project Management',
  'Marketing',
  'MERN Developer',
  'UI Developer',
  'Backend Developer',
  'Frontend Developer'
];

async function main() {
  for (const name of teams) {
    await prisma.team.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Teams seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
