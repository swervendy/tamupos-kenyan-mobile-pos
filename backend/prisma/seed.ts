import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create a Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Tamu Grill',
      address: '123 Chai Lane, Nairobi',
      phone: '254712345678',
      kraPin: 'A123456789Z',
      mpesaPaybill: '555222',
    },
  });
  console.log(`Created restaurant: ${restaurant.name}`);

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // 3. Create Users
  const owner = await prisma.user.create({
    data: {
      email: 'owner@tamugrill.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'OWNER',
      restaurantId: restaurant.id,
    },
  });
  console.log(`Created owner: ${owner.name}`);

  const staff = await prisma.user.create({
    data: {
      email: 'staff@tamugrill.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'STAFF',
      restaurantId: restaurant.id,
    },
  });
  console.log(`Created staff member: ${staff.name}`);

  // 4. Create Categories
  const beverages = await prisma.category.create({
    data: { name: 'Beverages', restaurantId: restaurant.id },
  });
  const snacks = await prisma.category.create({
    data: { name: 'Snacks', restaurantId: restaurant.id },
  });
  const mainCourses = await prisma.category.create({
    data: { name: 'Main Courses', restaurantId: restaurant.id },
  });
  console.log('Created categories: Beverages, Snacks, Main Courses');

  // 5. Create Food Items
  await prisma.foodItem.createMany({
    data: [
      // Beverages
      { name: 'Coca-Cola', price: 100, categoryId: beverages.id, restaurantId: restaurant.id },
      { name: 'Fanta Orange', price: 100, categoryId: beverages.id, restaurantId: restaurant.id },
      { name: 'Stoney Tangawizi', price: 120, categoryId: beverages.id, restaurantId: restaurant.id },
      // Snacks
      { name: 'Samosa', price: 80, categoryId: snacks.id, restaurantId: restaurant.id },
      { name: 'Beef Sausage', price: 150, categoryId: snacks.id, restaurantId: restaurant.id },
      // Main Courses
      { name: 'Nyama Choma (1/2 kg)', price: 750, categoryId: mainCourses.id, restaurantId: restaurant.id },
      { name: 'Grilled Chicken', price: 900, categoryId: mainCourses.id, restaurantId: restaurant.id },
      { name: 'Tilapia Fry', price: 850, categoryId: mainCourses.id, restaurantId: restaurant.id },
    ],
  });
  console.log('Created food items.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 