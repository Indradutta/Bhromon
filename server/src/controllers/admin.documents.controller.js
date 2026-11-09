import fs from 'fs';
import path from 'path';
import prisma from '../db/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';

const UPLOADS_DIR = path.resolve('server', 'uploads', 'documents');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const VALID_DOCUMENT_TYPES = [
  'PASSPORT',
  'AADHAAR',
  'VISA',
  'TICKETS',
  'HOTEL_VOUCHER',
  'INSURANCE',
  'RECEIPT',
  'INVOICE',
  'OTHER',
];

// 1. Get all documents with filtering
export async function getAdminDocuments(req, res, next) {
  try {
    const { search, type, customerId, bookingId } = req.query;

    const where = {};

    if (type && type !== 'ALL') {
      where.documentType = type;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { fileName: { contains: q } },
        { customer: { fullName: { contains: q } } },
        { customer: { email: { contains: q } } },
        { booking: { bookingNumber: { contains: q } } },
      ];
    }

    const documents = await prisma.customerDocument.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            city: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            startDate: true,
            endDate: true,
            package: {
              select: {
                id: true,
                title: true,
                destinationText: true,
              },
            },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    // Summary statistics
    const allDocs = await prisma.customerDocument.findMany({
      select: { documentType: true, fileSize: true },
    });

    const stats = {
      totalDocuments: allDocs.length,
      passportsAndIds: allDocs.filter((d) => ['PASSPORT', 'AADHAAR'].includes(d.documentType)).length,
      visasAndTickets: allDocs.filter((d) => ['VISA', 'TICKETS'].includes(d.documentType)).length,
      vouchersAndInsurance: allDocs.filter((d) => ['HOTEL_VOUCHER', 'INSURANCE'].includes(d.documentType)).length,
      receiptsAndInvoices: allDocs.filter((d) => ['RECEIPT', 'INVOICE'].includes(d.documentType)).length,
    };

    return successResponse(res, { documents, stats }, 'Documents fetched successfully');
  } catch (err) {
    next(err);
  }
}

// 2. Upload new document (supports base64 or raw file payload)
export async function uploadAdminDocument(req, res, next) {
  try {
    const { customerId, bookingId, documentType, fileName, fileData, mimeType, fileSize } = req.body;

    if (!customerId) {
      return errorResponse(res, 'Customer selection is required', 400);
    }

    if (!documentType || !VALID_DOCUMENT_TYPES.includes(documentType)) {
      return errorResponse(res, `Invalid document type. Allowed: ${VALID_DOCUMENT_TYPES.join(', ')}`, 400);
    }

    if (!fileName) {
      return errorResponse(res, 'File name is required', 400);
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      return errorResponse(res, 'Specified customer does not exist', 404);
    }

    // Write file to disk securely
    const sanitizedFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.join(UPLOADS_DIR, sanitizedFileName);

    let calculatedSize = fileSize || 1024;
    let finalMime = mimeType || 'application/pdf';

    if (fileData && fileData.includes('base64,')) {
      const parts = fileData.split('base64,');
      const base64Data = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) finalMime = mimeMatch[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(targetPath, buffer);
      calculatedSize = buffer.length;
    } else {
      // Create a dummy placeholder file if raw base64 wasn't attached
      fs.writeFileSync(targetPath, `BHROMON TRAVEL DOCUMENT: ${fileName}\nType: ${documentType}\nUploaded: ${new Date().toISOString()}`);
      calculatedSize = fs.statSync(targetPath).size;
    }

    const newDoc = await prisma.customerDocument.create({
      data: {
        customerId,
        bookingId: bookingId || null,
        documentType,
        fileName,
        filePath: sanitizedFileName,
        fileSize: calculatedSize,
        mimeType: finalMime,
      },
      include: {
        customer: true,
        booking: {
          include: {
            package: true,
          },
        },
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'UPLOAD_CUSTOMER_DOCUMENT',
        entityType: 'CUSTOMER_DOCUMENT',
        entityId: newDoc.id,
        details: JSON.stringify({
          fileName,
          documentType,
          customerId,
          bookingId,
          size: calculatedSize,
        }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, { document: newDoc }, 'Document uploaded successfully');
  } catch (err) {
    next(err);
  }
}

// 3. Download document
export async function downloadAdminDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await prisma.customerDocument.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!doc) {
      return errorResponse(res, 'Document not found', 404);
    }

    const fullPath = path.join(UPLOADS_DIR, doc.filePath);
    if (!fs.existsSync(fullPath)) {
      // Write placeholder if missing from disk
      fs.writeFileSync(fullPath, `BHROMON TRAVEL DOCUMENT: ${doc.fileName}\nCustomer: ${doc.customer.fullName}\nType: ${doc.documentType}`);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.fileName)}"`);
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

// 4. View document inline
export async function viewAdminDocument(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await prisma.customerDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return errorResponse(res, 'Document not found', 404);
    }

    const fullPath = path.join(UPLOADS_DIR, doc.filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, `BHROMON TRAVEL DOCUMENT: ${doc.fileName}\nDocument ID: ${doc.id}\nType: ${doc.documentType}`);
    }

    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.fileName)}"`);
    res.setHeader('Content-Type', doc.mimeType || 'application/pdf');
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    next(err);
  }
}

// 5. Replace existing document file
export async function replaceAdminDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { fileName, fileData, mimeType, fileSize } = req.body;

    const existingDoc = await prisma.customerDocument.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      return errorResponse(res, 'Document record not found', 404);
    }

    // Remove old file from disk if exists
    const oldPath = path.join(UPLOADS_DIR, existingDoc.filePath);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error('Failed to unlink old file:', err);
      }
    }

    const newSanitizedName = `${Date.now()}_${(fileName || existingDoc.fileName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const newPath = path.join(UPLOADS_DIR, newSanitizedName);

    let calculatedSize = fileSize || 1024;
    let finalMime = mimeType || existingDoc.mimeType;

    if (fileData && fileData.includes('base64,')) {
      const parts = fileData.split('base64,');
      const base64Data = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) finalMime = mimeMatch[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(newPath, buffer);
      calculatedSize = buffer.length;
    } else {
      fs.writeFileSync(newPath, `BHROMON REPLACED TRAVEL DOCUMENT: ${fileName || existingDoc.fileName}\nUpdated: ${new Date().toISOString()}`);
      calculatedSize = fs.statSync(newPath).size;
    }

    const updated = await prisma.customerDocument.update({
      where: { id },
      data: {
        fileName: fileName || existingDoc.fileName,
        filePath: newSanitizedName,
        fileSize: calculatedSize,
        mimeType: finalMime,
        uploadedAt: new Date(),
      },
      include: {
        customer: true,
        booking: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'REPLACE_CUSTOMER_DOCUMENT',
        entityType: 'CUSTOMER_DOCUMENT',
        entityId: id,
        details: JSON.stringify({
          oldFileName: existingDoc.fileName,
          newFileName: updated.fileName,
          newSize: calculatedSize,
        }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, { document: updated }, 'Document replaced successfully');
  } catch (err) {
    next(err);
  }
}

// 6. Delete document
export async function deleteAdminDocument(req, res, next) {
  try {
    const { id } = req.params;

    const doc = await prisma.customerDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return errorResponse(res, 'Document not found', 404);
    }

    // Remove file from disk
    const targetPath = path.join(UPLOADS_DIR, doc.filePath);
    if (fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
      } catch (err) {
        console.error('Failed to unlink file:', err);
      }
    }

    await prisma.customerDocument.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin?.id,
        action: 'DELETE_CUSTOMER_DOCUMENT',
        entityType: 'CUSTOMER_DOCUMENT',
        entityId: id,
        details: JSON.stringify({ fileName: doc.fileName, documentType: doc.documentType }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, null, 'Document deleted successfully');
  } catch (err) {
    next(err);
  }
}

// 7. Seed demo travel documents helper
export async function seedDemoDocuments(req, res, next) {
  try {
    const customers = await prisma.customer.findMany({
      take: 5,
      include: { bookings: true },
    });

    if (customers.length === 0) {
      return errorResponse(res, 'No customers found to attach documents to', 400);
    }

    const demoDocTemplates = [
      {
        documentType: 'PASSPORT',
        fileName: 'Passport_Front_Page.pdf',
        mimeType: 'application/pdf',
        fileSize: 1420500,
      },
      {
        documentType: 'AADHAAR',
        fileName: 'Aadhaar_National_ID.pdf',
        mimeType: 'application/pdf',
        fileSize: 845200,
      },
      {
        documentType: 'VISA',
        fileName: 'Tourist_Visa_Approval.pdf',
        mimeType: 'application/pdf',
        fileSize: 1120000,
      },
      {
        documentType: 'TICKETS',
        fileName: 'Indigo_Boarding_Pass_DEL_CCU.pdf',
        mimeType: 'application/pdf',
        fileSize: 620300,
      },
      {
        documentType: 'HOTEL_VOUCHER',
        fileName: 'Taj_Heritage_Palace_Voucher.pdf',
        mimeType: 'application/pdf',
        fileSize: 450100,
      },
      {
        documentType: 'INSURANCE',
        fileName: 'TataAIG_TravelGuard_Policy.pdf',
        mimeType: 'application/pdf',
        fileSize: 1950200,
      },
      {
        documentType: 'RECEIPT',
        fileName: 'Advance_Payment_Receipt_REC2026.pdf',
        mimeType: 'application/pdf',
        fileSize: 310500,
      },
      {
        documentType: 'INVOICE',
        fileName: 'Tax_Invoice_INV20260001.pdf',
        mimeType: 'application/pdf',
        fileSize: 395000,
      },
    ];

    const created = [];
    for (let i = 0; i < customers.length; i++) {
      const cust = customers[i];
      const booking = cust.bookings[0] || null;

      // Assign 2 distinct documents to each customer
      const tmpl1 = demoDocTemplates[i % demoDocTemplates.length];
      const tmpl2 = demoDocTemplates[(i + 3) % demoDocTemplates.length];

      for (const tmpl of [tmpl1, tmpl2]) {
        const diskName = `${Date.now()}_${cust.id}_${tmpl.fileName}`;
        const fullPath = path.join(UPLOADS_DIR, diskName);
        fs.writeFileSync(fullPath, `BHROMON TRAVEL DOCUMENT ARCHIVE\nCustomer: ${cust.fullName}\nType: ${tmpl.documentType}\nBooking: ${booking ? booking.bookingNumber : 'Direct Profile'}\nVerified: TRUE`);

        const d = await prisma.customerDocument.create({
          data: {
            customerId: cust.id,
            bookingId: booking ? booking.id : null,
            documentType: tmpl.documentType,
            fileName: tmpl.fileName,
            filePath: diskName,
            fileSize: tmpl.fileSize,
            mimeType: tmpl.mimeType,
          },
        });
        created.push(d);
      }
    }

    return successResponse(res, { count: created.length }, 'Demo documents seeded successfully');
  } catch (err) {
    next(err);
  }
}
