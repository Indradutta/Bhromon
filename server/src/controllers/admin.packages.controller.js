import { z } from 'zod';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const packageSchema = z.object({
  title: z.string().min(3, 'Package title must be at least 3 characters'),
  slug: z.string().optional().nullable(),
  destinationId: z.string().optional().nullable(),
  destinationText: z.string().min(2, 'Destination name is required'),
  region: z.string().default('North'),
  type: z.string().default('Cultural'),
  category: z.string().default('Cultural'),
  durationDays: z.coerce.number().int().min(1, 'Duration must be at least 1 day'),
  durationText: z.string().optional().default('5 Days / 4 Nights'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  rating: z.coerce.number().min(1).max(5).default(4.9),
  reviewsCount: z.coerce.number().int().min(0).default(50),
  availability: z.enum(['Available', 'Limited', 'Sold Out']).default('Available'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().min(2, 'Primary cover image URL is required'),
  gallery: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  inclusions: z.array(z.string()).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  itinerary: z.array(
    z.object({
      dayNumber: z.coerce.number().int().min(1),
      title: z.string().min(2, 'Day title required'),
      description: z.string().min(5, 'Day description required'),
      meals: z.string().optional().nullable(),
      activities: z.string().optional().nullable(),
    })
  ).optional().default([]),
});

export const updatePackageStatusSchema = z.object({
  isActive: z.boolean().optional(),
  availability: z.enum(['Available', 'Limited', 'Sold Out']).optional(),
  featured: z.boolean().optional(),
});

function parsePackageJson(pkg) {
  if (!pkg) return null;
  return {
    ...pkg,
    tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
    inclusions: typeof pkg.inclusions === 'string' ? JSON.parse(pkg.inclusions || '[]') : pkg.inclusions,
    exclusions: typeof pkg.exclusions === 'string' ? JSON.parse(pkg.exclusions || '[]') : pkg.exclusions,
    gallery: typeof pkg.gallery === 'string' ? JSON.parse(pkg.gallery || '[]') : pkg.gallery || [],
  };
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * List all packages with administrative search, status filters & counts
 */
export async function getAdminPackages(req, res, next) {
  try {
    const { search, category, region, availability, status, page = 1, limit = 50 } = req.query;

    const where = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (region && region !== 'ALL') {
      where.region = region;
    }
    if (availability && availability !== 'ALL') {
      where.availability = availability;
    }
    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { destinationText: { contains: search } },
        { region: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;

    const [total, rawPackages] = await Promise.all([
      prisma.tourPackage.count({ where }),
      prisma.tourPackage.findMany({
        where,
        skip,
        take,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        include: {
          destinationRel: { select: { id: true, name: true, region: true } },
          _count: { select: { itinerary: true, bookings: true, enquiries: true } },
        },
      }),
    ]);

    const packages = rawPackages.map(parsePackageJson);

    return successResponse(
      res,
      {
        packages,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      'Packages retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * Get package by ID with full day-by-day itinerary
 */
export async function getAdminPackageById(req, res, next) {
  try {
    const { id } = req.params;

    const rawPackage = await prisma.tourPackage.findUnique({
      where: { id },
      include: {
        destinationRel: true,
        itinerary: {
          orderBy: { dayNumber: 'asc' },
        },
        packageHotels: {
          include: { hotel: true },
        },
      },
    });

    if (!rawPackage) {
      return errorResponse(res, 'Tour package not found', 404);
    }

    return successResponse(res, parsePackageJson(rawPackage), 'Package details retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new Tour Package with day-by-day itinerary
 */
export async function createAdminPackage(req, res, next) {
  try {
    const body = req.body;
    let baseSlug = body.slug ? generateSlug(body.slug) : generateSlug(body.title);

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.tourPackage.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Auto-link destination if destinationId not explicitly provided
    let destId = body.destinationId || null;
    if (!destId && body.destinationText) {
      const matchedDest = await prisma.destination.findFirst({
        where: { name: { contains: body.destinationText.split(',')[0].trim() } },
      });
      if (matchedDest) destId = matchedDest.id;
    }

    const newPackage = await prisma.tourPackage.create({
      data: {
        title: body.title.trim(),
        slug: finalSlug,
        destinationId: destId,
        destinationText: body.destinationText.trim(),
        region: body.region || 'North',
        type: body.type || 'Cultural',
        category: body.category || 'Cultural',
        durationDays: parseInt(body.durationDays, 10) || 5,
        durationText: body.durationText.trim(),
        price: parseFloat(body.price),
        rating: body.rating ? parseFloat(body.rating) : 4.9,
        reviewsCount: body.reviewsCount ? parseInt(body.reviewsCount, 10) : 50,
        availability: body.availability || 'Available',
        description: body.description.trim(),
        image: body.image.trim(),
        gallery: JSON.stringify(body.gallery || []),
        tags: JSON.stringify(body.tags || []),
        inclusions: JSON.stringify(body.inclusions || []),
        exclusions: JSON.stringify(body.exclusions || []),
        featured: Boolean(body.featured),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        itinerary: {
          create: (body.itinerary || []).map((day, idx) => ({
            dayNumber: day.dayNumber || idx + 1,
            title: day.title.trim(),
            description: day.description.trim(),
            meals: day.meals || null,
            activities: day.activities || null,
          })),
        },
      },
      include: {
        itinerary: { orderBy: { dayNumber: 'asc' } },
        destinationRel: true,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_PACKAGE',
        entityType: 'PACKAGE',
        entityId: newPackage.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ title: newPackage.title, price: newPackage.price, slug: newPackage.slug }),
      },
    }).catch(() => {});

    return successResponse(res, parsePackageJson(newPackage), 'Tour package created successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing Tour Package with full itinerary sync
 */
export async function updateAdminPackage(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.tourPackage.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(res, 'Tour package not found', 404);
    }

    let finalSlug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      const proposedSlug = generateSlug(body.slug);
      const duplicate = await prisma.tourPackage.findFirst({
        where: { slug: proposedSlug, NOT: { id } },
      });
      if (!duplicate) finalSlug = proposedSlug;
    }

    // Execute atomic update
    const updated = await prisma.$transaction(async (tx) => {
      // 1. If itinerary is provided, replace existing days
      if (Array.isArray(body.itinerary)) {
        await tx.itineraryDay.deleteMany({ where: { packageId: id } });
        if (body.itinerary.length > 0) {
          await tx.itineraryDay.createMany({
            data: body.itinerary.map((day, idx) => ({
              packageId: id,
              dayNumber: day.dayNumber || idx + 1,
              title: (day.title || `Day ${idx + 1}`).trim(),
              description: (day.description || 'Day itinerary details').trim(),
              meals: day.meals || null,
              activities: day.activities || null,
            })),
          });
        }
      }

      // 2. Update package record
      return tx.tourPackage.update({
        where: { id },
        data: {
          title: body.title ? body.title.trim() : existing.title,
          slug: finalSlug,
          destinationId: body.destinationId ? body.destinationId : null,
          destinationText: body.destinationText ? body.destinationText.trim() : existing.destinationText,
          region: body.region || existing.region,
          type: body.type || existing.type,
          category: body.category || existing.category,
          durationDays: body.durationDays !== undefined ? parseInt(body.durationDays, 10) : existing.durationDays,
          durationText: body.durationText ? body.durationText.trim() : existing.durationText,
          price: body.price !== undefined ? parseFloat(body.price) : existing.price,
          rating: body.rating !== undefined ? parseFloat(body.rating) : existing.rating,
          availability: body.availability || existing.availability,
          description: body.description ? body.description.trim() : existing.description,
          image: body.image ? body.image.trim() : existing.image,
          gallery: body.gallery !== undefined ? JSON.stringify(body.gallery) : existing.gallery,
          tags: body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags,
          inclusions: body.inclusions !== undefined ? JSON.stringify(body.inclusions) : existing.inclusions,
          exclusions: body.exclusions !== undefined ? JSON.stringify(body.exclusions) : existing.exclusions,
          featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
          isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        },
        include: {
          itinerary: { orderBy: { dayNumber: 'asc' } },
          destinationRel: true,
          _count: { select: { itinerary: true, bookings: true, enquiries: true } },
        },
      });
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PACKAGE',
        entityType: 'PACKAGE',
        entityId: updated.id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ title: updated.title, price: updated.price, isActive: updated.isActive }),
      },
    }).catch(() => {});

    return successResponse(res, parsePackageJson(updated), 'Tour package updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Fast status toggle for isActive, availability, and featured
 */
export async function updateAdminPackageStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive, availability, featured } = req.body;

    const data = {};
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (availability !== undefined) data.availability = availability;
    if (featured !== undefined) data.featured = Boolean(featured);

    const updated = await prisma.tourPackage.update({
      where: { id },
      data,
    });

    return successResponse(res, updated, 'Package status updated successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a package (or soft-deactivate if linked to existing bookings)
 */
export async function deleteAdminPackage(req, res, next) {
  try {
    const { id } = req.params;

    const bookingCount = await prisma.booking.count({ where: { packageId: id } });
    if (bookingCount > 0) {
      // Soft-deactivate if bookings depend on this package
      const updated = await prisma.tourPackage.update({
        where: { id },
        data: { isActive: false, availability: 'Sold Out' },
      });
      return successResponse(
        res,
        updated,
        `Package archived and set to inactive as it has ${bookingCount} linked bookings.`
      );
    }

    await prisma.tourPackage.delete({ where: { id } });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_PACKAGE',
        entityType: 'PACKAGE',
        entityId: id,
        adminId: req.admin?.id || 'admin',
        details: JSON.stringify({ id }),
      },
    }).catch(() => {});

    return successResponse(res, { id }, 'Package deleted permanently');
  } catch (err) {
    next(err);
  }
}

/**
 * Get all destinations list for dropdown selection
 */
export async function getAdminDestinations(req, res, next) {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, region: true, heroImage: true },
    });
    return successResponse(res, destinations, 'Destinations retrieved');
  } catch (err) {
    next(err);
  }
}
