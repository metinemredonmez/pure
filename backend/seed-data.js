const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // 1. Customers
  const customerData = [
    { email: 'ahmet.yilmaz@test.com', firstName: 'Ahmet', lastName: 'Yilmaz', phone: '+905551234567' },
    { email: 'elif.demir@test.com', firstName: 'Elif', lastName: 'Demir', phone: '+905559876543' },
    { email: 'can.kaya@test.com', firstName: 'Can', lastName: 'Kaya', phone: '+905553456789' },
    { email: 'zeynep.arslan@test.com', firstName: 'Zeynep', lastName: 'Arslan', phone: '+905557654321' },
    { email: 'murat.celik@test.com', firstName: 'Murat', lastName: 'Celik', phone: '+905552345678' },
    { email: 'selin.ozturk@test.com', firstName: 'Selin', lastName: 'Ozturk', phone: '+905558765432' },
    { email: 'emre.sahin@test.com', firstName: 'Emre', lastName: 'Sahin', phone: '+905554567890' },
    { email: 'ayse.korkmaz@test.com', firstName: 'Ayse', lastName: 'Korkmaz', phone: '+905556789012' },
  ];

  const customers = [];
  for (const c of customerData) {
    let user = await prisma.user.findUnique({ where: { email: c.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { ...c, passwordHash: '$2b$10$dummyhashforseeding1234567890abcdefghij', role: 'CUSTOMER', isActive: true, emailVerified: true }
      });
    }
    customers.push(user);
  }
  console.log('Customers:', customers.length);

  // 2. Addresses for each customer
  for (const c of customers) {
    const existing = await prisma.address.findFirst({ where: { userId: c.id } });
    if (!existing) {
      await prisma.address.create({
        data: {
          userId: c.id,
          title: 'Ev',
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone || '+905550000000',
          line1: 'Test Mah. Kahve Sok. No:' + (Math.floor(Math.random()*50)+1),
          city: 'Istanbul',
          district: 'Kadikoy',
          postalCode: '34700',
          isDefault: true,
        }
      });
    }
  }
  console.log('Addresses created');

  // 3. SubPlans
  let plans = await prisma.subPlan.findMany();
  if (plans.length === 0) {
    plans = await Promise.all([
      prisma.subPlan.create({ data: { name: 'Baslangic Paketi', slug: 'baslangic', description: 'Ayda 250g ozel kahve', monthlyWeight: 250, priceMonthly: 149.90, discountPercent: 5, freeShipping: true, isActive: true, sortOrder: 1 } }),
      prisma.subPlan.create({ data: { name: 'Premium Paket', slug: 'premium', description: 'Ayda 500g premium kahve', monthlyWeight: 500, priceMonthly: 249.90, discountPercent: 10, freeShipping: true, isActive: true, sortOrder: 2 } }),
      prisma.subPlan.create({ data: { name: 'Gold Paket', slug: 'gold', description: 'Ayda 1kg gold kahve', monthlyWeight: 1000, priceMonthly: 449.90, discountPercent: 15, freeShipping: true, isActive: true, sortOrder: 3 } }),
    ]);
  }
  console.log('Plans:', plans.length);

  // 4. Subscriptions
  const statuses = ['ACTIVE','ACTIVE','ACTIVE','ACTIVE','PAUSED','ACTIVE','CANCELLED','ACTIVE'];
  const now = new Date();
  for (let i = 0; i < customers.length; i++) {
    const existing = await prisma.subscription.findFirst({ where: { userId: customers[i].id } });
    if (existing) continue;
    const plan = plans[i % plans.length];
    const nextBilling = new Date(now.getTime() + (Math.random() * 30 + 1) * 86400000);
    await prisma.subscription.create({
      data: {
        userId: customers[i].id,
        planId: plan.id,
        status: statuses[i],
        nextBillingDate: nextBilling,
        cancelledAt: statuses[i]==='CANCELLED' ? new Date() : null,
        pausedAt: statuses[i]==='PAUSED' ? new Date() : null,
      }
    });
  }
  console.log('Subscriptions:', await prisma.subscription.count());

  // 5. Orders
  const products = await prisma.product.findMany({ take: 5 });
  if (products.length > 0) {
    const oStatuses = ['DELIVERED','SHIPPED','PREPARING','PENDING','DELIVERED','CONFIRMED','DELIVERED','IN_TRANSIT'];
    for (let i = 0; i < customers.length; i++) {
      const oc = await prisma.order.count({ where: { userId: customers[i].id } });
      if (oc > 0) continue;

      const addr = await prisma.address.findFirst({ where: { userId: customers[i].id } });
      if (!addr) continue;

      const n = Math.floor(Math.random()*3)+1;
      for (let j = 0; j < n; j++) {
        const p = products[Math.floor(Math.random()*products.length)];
        const q = Math.floor(Math.random()*3)+1;
        const price = Number(p.price) || 99.9;
        const subtotal = Number((price*q).toFixed(2));
        const tax = Number((subtotal*0.18).toFixed(2));
        const shipping = subtotal > 200 ? 0 : 29.9;
        const total = Number((subtotal + tax + shipping).toFixed(2));

        await prisma.order.create({
          data: {
            userId: customers[i].id,
            addressId: addr.id,
            orderNumber: 'OLN-2026-'+String(100+i*10+j).padStart(3,'0'),
            status: oStatuses[(i+j)%oStatuses.length],
            subtotal: subtotal,
            tax: tax,
            shippingCost: shipping,
            total: total,
            items: { create: { productId: p.id, quantity: q, unitPrice: price, totalPrice: subtotal, productName: p.name } }
          }
        });
      }
    }
  }
  console.log('Orders:', await prisma.order.count());

  // 6. Payments
  const orders = await prisma.order.findMany({ take: 25 });
  for (const o of orders) {
    const ep = await prisma.payment.findFirst({ where: { orderId: o.id } });
    if (ep) continue;
    const methods = ['CREDIT_CARD','BANK_TRANSFER','CREDIT_CARD','CREDIT_CARD','CASH_ON_DELIVERY'];
    await prisma.payment.create({
      data: {
        orderId: o.id,
        amount: Number(o.total), currency: 'TRY',
        method: methods[Math.floor(Math.random()*methods.length)],
        status: (o.status==='DELIVERED'||o.status==='SHIPPED') ? 'COMPLETED' : o.status==='CANCELLED' ? 'FAILED' : 'PENDING',
        providerPaymentId: 'TXN-'+Math.random().toString(36).substring(2,10).toUpperCase()
      }
    });
  }
  console.log('Payments:', await prisma.payment.count());

  await prisma.$disconnect();
  console.log('SEED DONE!');
}
seed().catch(e => { console.error(e.message); process.exit(1); });
