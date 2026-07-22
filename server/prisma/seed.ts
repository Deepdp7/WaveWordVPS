import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { type: 'static', name: 'Starter', priceMonthly: 125, storageGb: 5, websiteLimit: 2 },
    { type: 'static', name: 'Professional', priceMonthly: 249, price1Year: 199, storageGb: 15, websiteLimit: 5 },
    { type: 'static', name: 'Business', priceMonthly: 449, price1Year: 359, storageGb: 50, websiteLimit: null },
    
    { type: 'vps', name: 'KVM 1', priceMonthly: 899, price1Year: 599, price2Year: 549, price3Year: 499, vcpu: 1, ramGb: 4, storageGb: 50, bandwidthTb: 1 },
    { type: 'vps', name: 'KVM 2', priceMonthly: 1299, price1Year: 849, price2Year: 749, price3Year: 699, vcpu: 2, ramGb: 8, storageGb: 100, bandwidthTb: 2 },
    { type: 'vps', name: 'KVM 4', priceMonthly: 2499, price1Year: 1699, price2Year: 1499, price3Year: 1099, vcpu: 4, ramGb: 16, storageGb: 200, bandwidthTb: 4 },
  ];

  for (const plan of plans) {
    await prisma.hostingPlan.create({ data: plan });
  }

  // Also create a default admin user
  const bcrypt = require('bcrypt');
  const passwordHash = await bcrypt.hash('987498', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'dp918121@gmail.com',
      passwordHash,
      role: 'admin'
    }
  });

  console.log('Seeded database with plans and admin user (dp918121@gmail.com / 987498)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
