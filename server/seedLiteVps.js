const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Wave Lite VPS Saver',
      type: 'lite_vps',
      vcpu: 1,
      ramGb: 1,
      storageGb: 10,
      priceMonthly: 249,
      price1Year: 199,
      price2Year: 100,
      isActive: true
    },
    {
      name: 'Wave Lite VPS 1',
      type: 'lite_vps',
      vcpu: 1,
      ramGb: 2,
      storageGb: 25,
      priceMonthly: 392,
      price1Year: 250,
      price2Year: 198,
      isActive: true
    },
    {
      name: 'Wave Lite VPS 2',
      type: 'lite_vps',
      vcpu: 2,
      ramGb: 4,
      storageGb: 50,
      priceMonthly: 782,
      price1Year: 501,
      price2Year: 396,
      isActive: true
    }
  ];

  for (const plan of plans) {
    await prisma.hostingPlan.create({ data: plan });
    console.log(`Created ${plan.name}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
