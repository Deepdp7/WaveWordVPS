const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Wave Lite VPS Saver
  await prisma.hostingPlan.updateMany({
    where: { name: 'Wave Lite VPS Saver' },
    data: { price2Year: 149 }
  });
  console.log('Updated Wave Lite VPS Saver 24-month price to 149');

  // Update static plans
  const staticPlans = await prisma.hostingPlan.findMany({ where: { type: 'static' } });
  for (const plan of staticPlans) {
    if (plan.priceMonthly) {
      // Apply 20% discount for 1 year, 40% discount for 2 years
      const p1 = Math.round(plan.priceMonthly * 0.8);
      const p2 = Math.round(plan.priceMonthly * 0.6);
      await prisma.hostingPlan.update({
        where: { id: plan.id },
        data: { price1Year: p1, price2Year: p2 }
      });
      console.log(`Updated ${plan.name}: 1yr=${p1}/mo, 2yr=${p2}/mo`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
