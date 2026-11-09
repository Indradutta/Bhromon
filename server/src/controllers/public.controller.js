import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const enquirySchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid contact phone number'),
  packageId: z.union([z.string(), z.number()]).optional().nullable(),
  destination: z.string().optional().nullable(),
  travelDate: z.string().optional().nullable(),
  travellersCount: z.number().int().min(1).optional().default(2),
  adultsCount: z.number().int().min(1).optional().default(2),
  childrenCount: z.number().int().min(0).optional().default(0),
  budget: z.string().optional().nullable(),
  category: z.string().optional().default('tours'),
  message: z.string().optional().nullable(),
  source: z.string().optional().default('WEBSITE'),
});

function parsePackageJsonFields(pkg) {
  if (!pkg) return null;
  return {
    ...pkg,
    tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
    inclusions: typeof pkg.inclusions === 'string' ? JSON.parse(pkg.inclusions || '[]') : pkg.inclusions,
    exclusions: typeof pkg.exclusions === 'string' ? JSON.parse(pkg.exclusions || '[]') : pkg.exclusions,
    gallery: typeof pkg.gallery === 'string' ? JSON.parse(pkg.gallery || '[]') : pkg.gallery || [],
  };
}

export async function getPackages(req, res, next) {
  try {
    const { category, destination, search, featured, limit } = req.query;

    const where = {
      isActive: true,
    };

    if (category && category !== 'All' && category !== 'all') {
      where.category = { equals: category };
    }

    if (featured === 'true' || featured === true) {
      where.featured = true;
    }

    if (destination) {
      where.OR = [
        { destinationText: { contains: destination } },
        { region: { contains: destination } },
      ];
    }

    if (search) {
      const searchTerms = {
        OR: [
          { title: { contains: search } },
          { destinationText: { contains: search } },
          { description: { contains: search } },
          { region: { contains: search } },
        ],
      };
      if (where.OR) {
        where.AND = [searchTerms];
      } else {
        where.OR = searchTerms.OR;
      }
    }

    const packages = await prisma.tourPackage.findMany({
      where,
      include: {
        itinerary: {
          orderBy: { dayNumber: 'asc' },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
      ],
      ...(limit ? { take: parseInt(limit, 10) } : {}),
    });

    const formatted = packages.map(parsePackageJsonFields);

    return successResponse(res, formatted, 'Tour packages retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getPackageBySlugOrId(req, res, next) {
  try {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);

    let pkg = null;
    if (isNumeric) {
      pkg = await prisma.tourPackage.findFirst({
        where: {
          isActive: true,
          OR: [
            { legacyId: parseInt(identifier, 10) },
            { id: identifier },
          ],
        },
        include: {
          itinerary: { orderBy: { dayNumber: 'asc' } },
          destinationRel: true,
          packageHotels: {
            include: { hotel: true },
          },
        },
      });
    }

    if (!pkg) {
      pkg = await prisma.tourPackage.findFirst({
        where: {
          isActive: true,
          slug: identifier,
        },
        include: {
          itinerary: { orderBy: { dayNumber: 'asc' } },
          destinationRel: true,
          packageHotels: {
            include: { hotel: true },
          },
        },
      });
    }

    if (!pkg) {
      return errorResponse(res, 'Tour package not found or inactive', 404);
    }

    return successResponse(res, parsePackageJsonFields(pkg), 'Package retrieved');
  } catch (err) {
    next(err);
  }
}

export async function getDestinations(req, res, next) {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { packages: { where: { isActive: true } } },
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' },
      ],
    });

    return successResponse(res, destinations, 'Destinations retrieved');
  } catch (err) {
    next(err);
  }
}

export async function createEnquiry(req, res, next) {
  try {
    const body = req.body;

    // Check if customer exists by email or phone
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { email: body.email.toLowerCase().trim() },
          { phone: body.phone.trim() },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: body.customerName.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone.trim(),
          leadStatus: 'NEW',
          source: body.source || 'WEBSITE',
        },
      });
    }

    // Resolve package if packageId provided (can be legacyId or cuid)
    let packageRecord = null;
    if (body.packageId) {
      const isNum = /^\d+$/.test(String(body.packageId));
      if (isNum) {
        packageRecord = await prisma.tourPackage.findFirst({
          where: { legacyId: parseInt(body.packageId, 10) },
        });
      }
      if (!packageRecord && typeof body.packageId === 'string') {
        packageRecord = await prisma.tourPackage.findUnique({
          where: { id: body.packageId },
        });
      }
    }

    // Generate unique sequential enquiry number
    const count = await prisma.enquiry.count();
    const currentYear = new Date().getFullYear();
    const padNum = String(count + 1).padStart(4, '0');
    const enquiryNumber = `ENQ-${currentYear}-${padNum}`;

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerId: customer.id,
        customerName: body.customerName.trim(),
        email: body.email.toLowerCase().trim(),
        phone: body.phone.trim(),
        packageId: packageRecord ? packageRecord.id : null,
        destination: body.destination || (packageRecord ? packageRecord.destinationText : null),
        travelDate: body.travelDate || null,
        travellersCount: body.travellersCount || 2,
        adultsCount: body.adultsCount || 2,
        childrenCount: body.childrenCount || 0,
        budget: body.budget || null,
        category: body.category || 'tours',
        message: body.message || null,
        source: body.source || 'WEBSITE',
        status: 'NEW',
        priority: 'MEDIUM',
      },
    });

    // Record system audit log
    await prisma.auditLog.create({
      data: {
        action: 'PUBLIC_ENQUIRY_CREATED',
        entityType: 'ENQUIRY',
        entityId: enquiry.id,
        details: JSON.stringify({
          enquiryNumber,
          customerName: body.customerName,
          email: body.email,
          packageTitle: packageRecord?.title,
        }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(
      res,
      {
        enquiryNumber: enquiry.enquiryNumber,
        id: enquiry.id,
        customerName: enquiry.customerName,
        status: enquiry.status,
      },
      'Your inquiry has been successfully received. A Bhromon travel specialist will contact you shortly.',
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function getSiteSettings(req, res, next) {
  try {
    const settings = await prisma.adminSettings.findFirst();
    return successResponse(
      res,
      {
        companyName: settings?.companyName || 'BHROMON',
        companyEmail: settings?.companyEmail || 'contact@bhromon.com',
        companyPhone: settings?.companyPhone || '+91 98765 43210',
        currency: settings?.currency || 'INR',
      },
      'Site settings retrieved'
    );
  } catch (err) {
    next(err);
  }
}
