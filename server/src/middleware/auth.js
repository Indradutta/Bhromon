import prisma from '../db/prisma.js';
import config from '../config/index.js';
import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';

export async function requireAdminAuth(req, res, next) {
  try {
    let token = req.cookies?.[config.cookieName];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return errorResponse(res, 'Invalid or expired session token. Please log in again.', 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
        phone: true,
        lastLoginAt: true,
      },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      return errorResponse(res, 'Admin account not found or deactivated.', 401);
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}
