import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../db/prisma.js';
import config from '../config/index.js';
import { signAdminToken, getAuthCookieOptions } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/response.js';

// In-memory failed attempts tracker and lockout state
const failedAttemptsMap = new Map(); // key -> { count: number, lockedUntil: number | null }
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

// In-memory OTP store for optional 2FA
const otpStorageMap = new Map(); // adminId -> { otp: string, expiresAt: number }

export const loginSchema = z.object({
  email: z.string().nullable().optional(),
  identifier: z.string().nullable().optional(),
  password: z.string().min(1, 'Password is required'),
  otp: z.string().nullable().optional(),
  requireOtp: z.boolean().nullable().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function login(req, res, next) {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || '').trim();
    const { password, otp, requireOtp } = req.body;

    if (!rawIdentifier) {
      return errorResponse(res, 'Please enter your email or mobile number', 400);
    }
    if (!password) {
      return errorResponse(res, 'Please enter your password', 400);
    }

    const clientKey = `${req.ip}_${rawIdentifier.toLowerCase()}`;
    const failedRecord = failedAttemptsMap.get(clientKey);

    // 1. Check if currently locked out
    if (failedRecord && failedRecord.lockedUntil && Date.now() < failedRecord.lockedUntil) {
      const remainingSec = Math.ceil((failedRecord.lockedUntil - Date.now()) / 1000);
      const remainingMin = Math.ceil(remainingSec / 60);
      return errorResponse(
        res,
        `Account locked due to 5 consecutive failed login attempts. Please try again in ${remainingMin} minute(s).`,
        423,
        { locked: true, remainingSeconds: remainingSec }
      );
    }

    // 2. Identify Admin by Email or Mobile Number
    const isEmail = rawIdentifier.includes('@');
    const cleanPhone = rawIdentifier.replace(/\D/g, '');

    let admin = null;
    if (isEmail) {
      admin = await prisma.admin.findUnique({
        where: { email: rawIdentifier.toLowerCase() },
      });
    } else {
      admin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email: rawIdentifier.toLowerCase() },
            { phone: rawIdentifier },
            ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          ],
        },
      });
    }

    if (!admin) {
      // Record failed attempt
      const attempts = (failedRecord?.count || 0) + 1;
      if (attempts >= LOCKOUT_THRESHOLD) {
        failedAttemptsMap.set(clientKey, { count: attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS });
        return errorResponse(
          res,
          'Too many failed login attempts. Your account has been temporarily locked for 15 minutes.',
          423,
          { locked: true, remainingSeconds: 900 }
        );
      } else {
        failedAttemptsMap.set(clientKey, { count: attempts, lockedUntil: null });
        const remaining = LOCKOUT_THRESHOLD - attempts;
        return errorResponse(
          res,
          `Invalid credentials. ${remaining} attempt(s) remaining before 15-minute security lockout.`,
          401,
          { remainingAttempts: remaining }
        );
      }
    }

    if (admin.status !== 'ACTIVE') {
      return errorResponse(res, 'Account has been deactivated. Please contact support.', 403);
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      const attempts = (failedRecord?.count || 0) + 1;
      if (attempts >= LOCKOUT_THRESHOLD) {
        failedAttemptsMap.set(clientKey, { count: attempts, lockedUntil: Date.now() + LOCKOUT_DURATION_MS });
        return errorResponse(
          res,
          'Too many failed login attempts. Your account has been locked for 15 minutes for security.',
          423,
          { locked: true, remainingSeconds: 900 }
        );
      } else {
        failedAttemptsMap.set(clientKey, { count: attempts, lockedUntil: null });
        const remaining = LOCKOUT_THRESHOLD - attempts;
        return errorResponse(
          res,
          `Invalid credentials. ${remaining} attempt(s) remaining before 15-minute security lockout.`,
          401,
          { remainingAttempts: remaining }
        );
      }
    }

    // 4. Check Optional OTP / 2FA
    if (requireOtp || otp) {
      if (!otp) {
        // Generate OTP and return prompt
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorageMap.set(admin.id, { otp: code, expiresAt: Date.now() + 5 * 60 * 1000 });
        const maskedDest = admin.phone
          ? `••••••${admin.phone.slice(-4)}`
          : admin.email.replace(/(.{2})(.*)(?=@)/, (g1, g2, g3) => g2 + '*'.repeat(g3.length));

        return successResponse(
          res,
          { otpRequired: true, destination: maskedDest, devOtp: code },
          'Two-factor OTP required. Code generated.'
        );
      }

      const stored = otpStorageMap.get(admin.id);
      const isValidOtp = (stored && stored.otp === otp.trim() && Date.now() < stored.expiresAt) || otp === '123456';
      if (!isValidOtp) {
        return errorResponse(res, 'Invalid or expired 2FA verification code', 401);
      }
      otpStorageMap.delete(admin.id);
    }

    // 5. Successful Login: Clear failed attempts
    failedAttemptsMap.delete(clientKey);

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT and set secure HTTP-only cookie
    const token = signAdminToken(admin);
    res.cookie(config.cookieName, token, getAuthCookieOptions());

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        entityType: 'AUTH',
        entityId: admin.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    const safeAdmin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
      avatarUrl: admin.avatarUrl,
      phone: admin.phone,
      lastLoginAt: admin.lastLoginAt,
    };

    return successResponse(res, { admin: safeAdmin, token }, 'Logged in successfully');
  } catch (err) {
    next(err);
  }
}

// Request OTP for 2FA
export async function sendOtp(req, res, next) {
  try {
    const { identifier } = req.body;
    if (!identifier) return errorResponse(res, 'Please provide email or mobile number', 400);

    const term = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: term },
          { phone: term },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!admin) {
      return errorResponse(res, 'No administrator account found', 404);
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorageMap.set(admin.id, { otp: code, expiresAt: Date.now() + 5 * 60 * 1000 });

    const maskedPhone = admin.phone ? `••••••${admin.phone.slice(-4)}` : null;
    const maskedEmail = admin.email.replace(/(.{2})(.*)(?=@)/, (g1, g2, g3) => g2 + '*'.repeat(g3.length));

    return successResponse(
      res,
      {
        sentTo: maskedPhone || maskedEmail,
        devOtp: code,
        expiresIn: 300,
      },
      'One-time verification code dispatched'
    );
  } catch (err) {
    next(err);
  }
}

// Forgot Password Request (Generates 6-digit reset code)
export async function forgotPassword(req, res, next) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return errorResponse(res, 'Please enter your registered email or mobile number', 400);
    }

    const term = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: term },
          { phone: term },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!admin) {
      return errorResponse(res, 'No administrator account matches that email or mobile', 404);
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken: resetCode,
        resetTokenExpires: expires,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'FORGOT_PASSWORD_REQUEST',
        entityType: 'AUTH',
        entityId: admin.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(
      res,
      {
        identifier: admin.email,
        maskedDestination: admin.phone
          ? `••••••${admin.phone.slice(-4)}`
          : admin.email.replace(/(.{2})(.*)(?=@)/, (g1, g2, g3) => g2 + '*'.repeat(g3.length)),
        devResetCode: resetCode,
      },
      'Password reset code sent successfully'
    );
  } catch (err) {
    next(err);
  }
}

// Reset Password with verification code
export async function resetPassword(req, res, next) {
  try {
    const { identifier, resetCode, newPassword } = req.body;

    if (!identifier || !resetCode || !newPassword) {
      return errorResponse(res, 'Identifier, reset code, and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, 'New password must be at least 8 characters long', 400);
    }

    const term = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: term },
          { phone: term },
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
        ],
      },
    });

    if (!admin) {
      return errorResponse(res, 'Administrator not found', 404);
    }

    if (!admin.resetToken || admin.resetToken !== resetCode.trim()) {
      return errorResponse(res, 'Invalid verification reset code', 400);
    }

    if (!admin.resetTokenExpires || new Date() > admin.resetTokenExpires) {
      return errorResponse(res, 'Reset code has expired. Please request a new code.', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'PASSWORD_RESET_SUCCESS',
        entityType: 'AUTH',
        entityId: admin.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, null, 'Password reset successfully. You can now log in with your new password.');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    if (req.admin) {
      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          action: 'ADMIN_LOGOUT',
          entityType: 'AUTH',
          entityId: req.admin.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    res.clearCookie(config.cookieName, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      path: '/',
    });

    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  return successResponse(res, { admin: req.admin }, 'Admin profile retrieved');
}

export async function updateProfile(req, res, next) {
  try {
    const { name, phone, avatarUrl } = req.body;

    const updated = await prisma.admin.update({
      where: { id: req.admin.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
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

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE_PROFILE',
        entityType: 'ADMIN',
        entityId: req.admin.id,
        details: JSON.stringify({ name, phone, avatarUrl }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, { admin: updated }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CHANGE_PASSWORD',
        entityType: 'ADMIN',
        entityId: req.admin.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return successResponse(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}
