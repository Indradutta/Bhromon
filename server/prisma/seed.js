import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { TOURS_DATA } from '../../src/data/tours.js';

dotenv.config();

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function main() {
  console.log('🌱 Starting BHROMON database seeding...');

  // 1. Seed Single Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bhromon.com';
  const adminName = process.env.ADMIN_NAME || 'Bhromon Super Administrator';
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin@Bhromon2026!';
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin account seeded: ${admin.email}`);

  // 2. Seed Admin Settings
  await prisma.adminSettings.upsert({
    where: { id: 'default-settings' },
    update: {
      companyName: 'BHROMON',
      companyEmail: 'contact@bhromon.com',
      companyPhone: '+91 98765 43210',
      taxGstPercentage: 5.0,
      defaultCommissionPercentage: 10.0,
      currency: 'INR',
    },
    create: {
      id: 'default-settings',
      companyName: 'BHROMON',
      companyEmail: 'contact@bhromon.com',
      companyPhone: '+91 98765 43210',
      taxGstPercentage: 5.0,
      defaultCommissionPercentage: 10.0,
      currency: 'INR',
    },
  });
  console.log('✅ Admin settings seeded');

  // 3. Seed Destinations
  const destinationMap = new Map();
  for (const tour of TOURS_DATA) {
    const destName = tour.region || tour.destination.split(',')[0].trim();
    if (!destinationMap.has(destName)) {
      const slug = slugify(destName);
      const dest = await prisma.destination.upsert({
        where: { name: destName },
        update: {
          region: tour.region || 'India',
          heroImage: tour.image,
          isPopular: tour.featured || false,
        },
        create: {
          name: destName,
          slug,
          region: tour.region || 'India',
          heroImage: tour.image,
          isPopular: tour.featured || false,
          description: `Discover captivating journeys across ${destName} with BHROMON's curated expeditions.`,
        },
      });
      destinationMap.set(destName, dest);
    }
  }
  console.log(`✅ Seeded ${destinationMap.size} unique destinations`);

  // 4. Seed Tour Packages & Itineraries
  let packageCount = 0;
  for (const tour of TOURS_DATA) {
    const slug = slugify(tour.title);
    const destName = tour.region || tour.destination.split(',')[0].trim();
    const destination = destinationMap.get(destName);

    // Delete existing itinerary days if updating to prevent duplicate day rows
    const existingPackage = await prisma.tourPackage.findFirst({
      where: { legacyId: tour.id },
    });

    if (existingPackage) {
      await prisma.itineraryDay.deleteMany({
        where: { packageId: existingPackage.id },
      });
    }

    const createdPackage = await prisma.tourPackage.upsert({
      where: { slug },
      update: {
        legacyId: tour.id,
        title: tour.title,
        destinationId: destination?.id || null,
        destinationText: tour.destination,
        region: tour.region || 'India',
        type: tour.type || 'Cultural',
        category: tour.category || 'Cultural',
        durationDays: tour.durationDays,
        durationText: tour.durationText,
        price: tour.price,
        rating: tour.rating,
        reviewsCount: tour.reviewsCount,
        availability: tour.availability || 'Available',
        description: tour.description,
        image: tour.image,
        tags: JSON.stringify(tour.tags || []),
        featured: Boolean(tour.featured),
        inclusions: JSON.stringify(tour.inclusions || []),
        exclusions: JSON.stringify(tour.exclusions || []),
        isActive: true,
      },
      create: {
        legacyId: tour.id,
        title: tour.title,
        slug,
        destinationId: destination?.id || null,
        destinationText: tour.destination,
        region: tour.region || 'India',
        type: tour.type || 'Cultural',
        category: tour.category || 'Cultural',
        durationDays: tour.durationDays,
        durationText: tour.durationText,
        price: tour.price,
        rating: tour.rating,
        reviewsCount: tour.reviewsCount,
        availability: tour.availability || 'Available',
        description: tour.description,
        image: tour.image,
        tags: JSON.stringify(tour.tags || []),
        featured: Boolean(tour.featured),
        inclusions: JSON.stringify(tour.inclusions || []),
        exclusions: JSON.stringify(tour.exclusions || []),
        isActive: true,
      },
    });

    // Create Itinerary Days
    if (Array.isArray(tour.itinerary)) {
      for (const day of tour.itinerary) {
        await prisma.itineraryDay.create({
          data: {
            packageId: createdPackage.id,
            dayNumber: day.day,
            title: day.title,
            description: day.desc || day.description || '',
          },
        });
      }
    }

    packageCount++;
  }
  console.log(`✅ Seeded ${packageCount} tour packages with complete itineraries`);

  // 5. Seed a Sample Customer & Enquiry for initial testing
  const sampleCustomer = await prisma.customer.upsert({
    where: { id: 'cust-demo-1' },
    update: {},
    create: {
      id: 'cust-demo-1',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 98200 12345',
      city: 'Mumbai',
      leadStatus: 'QUALIFIED',
      tags: JSON.stringify(['Luxury', 'Heritage']),
      notes: 'Interested in Varanasi dawn boat tour and Rajasthan palace stay.',
    },
  });

  const samplePackage = await prisma.tourPackage.findFirst({
    where: { legacyId: 1 },
  });

  await prisma.enquiry.upsert({
    where: { enquiryNumber: 'ENQ-2026-0001' },
    update: {},
    create: {
      enquiryNumber: 'ENQ-2026-0001',
      customerId: sampleCustomer.id,
      customerName: sampleCustomer.fullName,
      email: sampleCustomer.email,
      phone: sampleCustomer.phone,
      packageId: samplePackage?.id,
      destination: 'Varanasi',
      travelDate: '2026-11-15',
      travellersCount: 2,
      adultsCount: 2,
      childrenCount: 0,
      budget: '₹50,000 - ₹1,00,000',
      category: 'tours',
      message: 'Looking for a premium private riverfront haveli stay and private priest for Ganga Aarti.',
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'HIGH',
    },
  });
  console.log('✅ Seeded demo customer and enquiry ENQ-2026-0001');

  // 6. Record Audit Log for initialization
  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SYSTEM',
      entityId: 'init',
      details: JSON.stringify({ packagesCount: packageCount, destinationsCount: destinationMap.size }),
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
