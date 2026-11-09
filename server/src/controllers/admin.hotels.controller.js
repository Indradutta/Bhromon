import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

// 1. Get all hotels with optional destination/status/search filters
export async function getAdminHotels(req, res, next) {
  try {
    const { search, destinationId, status, minStars } = req.query;

    const where = {};

    if (destinationId && destinationId !== 'ALL') {
      where.destinationId = destinationId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (minStars && minStars !== 'ALL' && !isNaN(parseInt(minStars, 10))) {
      where.starRating = { gte: parseInt(minStars, 10) };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { city: { contains: q } },
        { address: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        destination: {
          select: { id: true, name: true, state: true },
        },
        packageHotels: {
          include: {
            package: {
              select: { id: true, title: true, durationDays: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allDestinations = await prisma.destination.findMany({
      select: { id: true, name: true, state: true },
      orderBy: { name: 'asc' },
    });

    const allPackages = await prisma.tourPackage.findMany({
      select: { id: true, title: true, durationDays: true },
      orderBy: { title: 'asc' },
    });

    // Compute stats
    const allHotels = await prisma.hotel.findMany({ select: { status: true, starRating: true } });
    const stats = {
      totalHotels: allHotels.length,
      activeHotels: allHotels.filter((h) => h.status === 'ACTIVE').length,
      underRenovation: allHotels.filter((h) => h.status === 'UNDER_RENOVATION').length,
      fiveStarCount: allHotels.filter((h) => h.starRating === 5).length,
    };

    return successResponse(
      res,
      { hotels, destinations: allDestinations, packages: allPackages, stats },
      'Hotels retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

// 2. Create new hotel
export async function createAdminHotel(req, res, next) {
  try {
    const {
      name,
      destinationId,
      city,
      starRating,
      address,
      contactPhone,
      contactEmail,
      standardPricePerNight,
      roomType,
      status,
      amenities,
      images,
      notes,
      linkedPackageIds,
    } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'Hotel name is required', 400);
    }

    if (!city || !city.trim()) {
      return errorResponse(res, 'City or destination location is required', 400);
    }

    const parsedStars = parseInt(starRating || 4, 10);
    const parsedPrice = parseFloat(standardPricePerNight || 0);

    const newHotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        destinationId: destinationId || null,
        city: city.trim(),
        starRating: parsedStars >= 1 && parsedStars <= 5 ? parsedStars : 4,
        address: address ? address.trim() : null,
        contactPhone: contactPhone ? contactPhone.trim() : null,
        contactEmail: contactEmail ? contactEmail.trim() : null,
        standardPricePerNight: parsedPrice,
        roomType: roomType ? roomType.trim() : 'Deluxe Heritage Room',
        status: status || 'ACTIVE',
        amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []),
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        notes: notes ? notes.trim() : null,
      },
    });

    // Link packages if specified
    if (Array.isArray(linkedPackageIds) && linkedPackageIds.length > 0) {
      for (const pkgId of linkedPackageIds) {
        await prisma.packageHotel.create({
          data: {
            packageId: pkgId,
            hotelId: newHotel.id,
            roomType: newHotel.roomType,
            mealPlan: 'CP (Breakfast Included)',
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'CREATE_HOTEL',
        entityType: 'HOTEL',
        entityId: newHotel.id,
        details: JSON.stringify({ name: newHotel.name, city: newHotel.city, rating: newHotel.starRating }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, { hotel: newHotel }, 'Hotel registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

// 3. Update existing hotel
export async function updateAdminHotel(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      destinationId,
      city,
      starRating,
      address,
      contactPhone,
      contactEmail,
      standardPricePerNight,
      roomType,
      status,
      amenities,
      images,
      notes,
      linkedPackageIds,
    } = req.body;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Hotel not found', 404);
    }

    const updated = await prisma.hotel.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(destinationId !== undefined && { destinationId: destinationId || null }),
        ...(city && { city: city.trim() }),
        ...(starRating !== undefined && { starRating: parseInt(starRating, 10) }),
        ...(address !== undefined && { address: address ? address.trim() : null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone ? contactPhone.trim() : null }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail ? contactEmail.trim() : null }),
        ...(standardPricePerNight !== undefined && { standardPricePerNight: parseFloat(standardPricePerNight) }),
        ...(roomType !== undefined && { roomType: roomType.trim() }),
        ...(status && { status }),
        ...(amenities !== undefined && {
          amenities: typeof amenities === 'string' ? amenities : JSON.stringify(amenities),
        }),
        ...(images !== undefined && {
          images: typeof images === 'string' ? images : JSON.stringify(images),
        }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
    });

    // Update package links if provided
    if (Array.isArray(linkedPackageIds)) {
      await prisma.packageHotel.deleteMany({ where: { hotelId: id } });
      for (const pkgId of linkedPackageIds) {
        await prisma.packageHotel.create({
          data: {
            packageId: pkgId,
            hotelId: id,
            roomType: updated.roomType,
            mealPlan: 'CP (Breakfast Included)',
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'UPDATE_HOTEL',
        entityType: 'HOTEL',
        entityId: id,
        details: JSON.stringify({ name: updated.name, status: updated.status }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, { hotel: updated }, 'Hotel updated successfully');
  } catch (err) {
    next(err);
  }
}

// 4. Delete hotel
export async function deleteAdminHotel(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'Hotel not found', 404);
    }

    // Delete associated package hotel links
    await prisma.packageHotel.deleteMany({ where: { hotelId: id } });

    await prisma.hotel.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'DELETE_HOTEL',
        entityType: 'HOTEL',
        entityId: id,
        details: JSON.stringify({ name: existing.name }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, null, 'Hotel removed successfully');
  } catch (err) {
    next(err);
  }
}

// 5. Seed default curated luxury & heritage hotels
export async function seedDemoHotels(req, res, next) {
  try {
    const destinations = await prisma.destination.findMany({ take: 6 });
    const packages = await prisma.tourPackage.findMany({ take: 6 });

    const demoHotels = [
      {
        name: 'The Oberoi Udaivilas',
        city: 'Udaipur, Rajasthan',
        starRating: 5,
        address: 'Haridas Ji Ki Magri, Mulla Talai, Udaipur, Rajasthan 313001',
        contactPhone: '+91 294 243 3300',
        contactEmail: 'reservations.udaivilas@oberoihotels.com',
        standardPricePerNight: 38500,
        roomType: 'Premier Kohinoor Lake View Suite',
        status: 'ACTIVE',
        amenities: JSON.stringify([
          'Private Pool',
          'Spa & Wellness Sanctuary',
          'Lake Pichola Private Boat',
          'Fine Dining',
          'Free Wi-Fi',
          'Concierge Service',
          'Valet Parking',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'Positioned on the banks of Lake Pichola, The Oberoi Udaivilas stands on the 200-year-old hunting grounds of the Maharana of Mewar.',
      },
      {
        name: 'Wildflower Hall, An Oberoi Resort',
        city: 'Shimla, Himachal Pradesh',
        starRating: 5,
        address: 'Charabra, Shimla, Himachal Pradesh 171012',
        contactPhone: '+91 177 264 8585',
        contactEmail: 'wildflower.shimla@oberoihotels.com',
        standardPricePerNight: 29000,
        roomType: 'Mountain View Deluxe Pavilion',
        status: 'ACTIVE',
        amenities: JSON.stringify([
          'Heated Infinity Whirlpool',
          'Himalayan Pine Forest Trails',
          'Open-Air Dining',
          'Ayurvedic Spa',
          'Billiards & Library',
          'High-Speed Wi-Fi',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'Located at 8,250 feet amidst 22 acres of virgin cedar forest, offering panoramic views of snow-capped Himalayan peaks.',
      },
      {
        name: 'Taj Falaknuma Palace',
        city: 'Hyderabad, Telangana',
        starRating: 5,
        address: 'Engine Bowli, Fatima Nagar, Falaknuma, Hyderabad 500053',
        contactPhone: '+91 40 6629 8585',
        contactEmail: 'falaknuma.palace@tajhotels.com',
        standardPricePerNight: 42000,
        roomType: 'Nizam Historical Palace Suite',
        status: 'ACTIVE',
        amenities: JSON.stringify([
          'Horse-Drawn Carriage Arrival',
          'Jiva Grande Spa',
          'Royal Dining Hall',
          'Heritage Tour by Historian',
          'Swimming Pool',
          'Butler Service',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'Perched 2,000 feet above Hyderabad, Falaknuma Palace was the former residence of the Nizam, once the richest man in the world.',
      },
      {
        name: 'Kumarakom Lake Resort',
        city: 'Kumarakom, Kerala',
        starRating: 5,
        address: 'Vembanad Lake, Kumarakom, Kottayam, Kerala 686566',
        contactPhone: '+91 481 252 4900',
        contactEmail: 'klr@pauljohnhotels.com',
        standardPricePerNight: 24500,
        roomType: 'Heritage Lake Villa with Private Plunge Pool',
        status: 'ACTIVE',
        amenities: JSON.stringify([
          'Vembanad Backwaters Cruising',
          'Ayurmana Ayurvedic Centre',
          'Meandering Pool',
          'Traditional Kerala Seafood',
          'Sunset Cruise',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'Reconstructed from 16th-century traditional Kerala homesteads (Illams), offering secluded luxury along India’s largest freshwater lake.',
      },
      {
        name: 'Glenburn Tea Estate & Boutique Lodge',
        city: 'Darjeeling, West Bengal',
        starRating: 4,
        address: 'Near Singritan, Darjeeling, West Bengal 734101',
        contactPhone: '+91 33 2288 5630',
        contactEmail: 'info@glenburnteaestate.com',
        standardPricePerNight: 32000,
        roomType: 'Kanchenjunga Suite with Private Verandah',
        status: 'ACTIVE',
        amenities: JSON.stringify([
          'Kanchenjunga Mountain Panorama',
          'Private Tea Tasting & Factory Tour',
          'River Camping & Hiking',
          'All-Inclusive Planter Cuisine',
          'Fireplace Lounges',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'A heavenly plantation retreat started by Scottish tea planters in 1859, overlooking the Rungeet River and Mount Kanchenjunga.',
      },
      {
        name: 'The Tamara Coorg Eco Resort',
        city: 'Coorg, Karnataka',
        starRating: 4,
        address: 'Kabbinakad Estate, Yavakapadi Village, Madikeri 571212',
        contactPhone: '+91 80 7107 7700',
        contactEmail: 'reservations@thetamara.com',
        standardPricePerNight: 18500,
        roomType: 'Luxury Plantation Wooden Cottage',
        status: 'UNDER_RENOVATION',
        amenities: JSON.stringify([
          'Coffee & Cardamom Plantation Walks',
          'Waterfall Yoga Deck',
          'Temperature-Controlled Pool',
          'Elevation Lounge Bar',
          'Guided Birdwatching',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
        ]),
        notes:
          'Nestled 3,500 feet high in the Western Ghats among 180 acres of organic coffee, cardamom, and pepper plantations.',
      },
    ];

    const createdHotels = [];
    for (let i = 0; i < demoHotels.length; i++) {
      const hData = demoHotels[i];
      const dest = destinations[i % destinations.length] || null;

      const h = await prisma.hotel.create({
        data: {
          name: hData.name,
          destinationId: dest ? dest.id : null,
          city: hData.city,
          starRating: hData.starRating,
          address: hData.address,
          contactPhone: hData.contactPhone,
          contactEmail: hData.contactEmail,
          standardPricePerNight: hData.standardPricePerNight,
          roomType: hData.roomType,
          status: hData.status,
          amenities: hData.amenities,
          images: hData.images,
          notes: hData.notes,
        },
      });

      // Link to tour package
      if (packages.length > 0) {
        const pkg = packages[i % packages.length];
        await prisma.packageHotel.create({
          data: {
            packageId: pkg.id,
            hotelId: h.id,
            roomType: hData.roomType,
            mealPlan: 'CP (Breakfast Included)',
          },
        });
      }

      createdHotels.push(h);
    }

    return successResponse(res, { count: createdHotels.length }, 'Curated hotels seeded successfully');
  } catch (err) {
    next(err);
  }
}
