const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const config = require('../../config');
const { generateOTP, generateRefreshToken } = require('../../utils/helpers');
const otpProvider = require('../../shared/otp');
const { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');

class AuthService {
  static async registerPatient({ fullName, email, phone, password, preferredLanguage }) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }], deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictError('A user with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: 'PATIENT',
        preferredLanguage: preferredLanguage || 'ar',
        patientProfile: { create: {} },
      },
      include: { patientProfile: true },
    });

    const otpCode = generateOTP(config.otp.length);
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'verification',
        expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
      },
    });

    await otpProvider.send(phone, otpCode);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  static async registerDoctor({ fullName, email, phone, password, specialityId, licenseNumber, preferredLanguage }) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }], deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictError('A user with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: 'DOCTOR',
        preferredLanguage: preferredLanguage || 'ar',
        doctorProfile: {
          create: {
            specialityId: specialityId || null,
            licenseNumber: licenseNumber || null,
            verificationStatus: 'PENDING',
            isPubliclyBookable: false,
          },
        },
      },
      include: { doctorProfile: true },
    });

    const otpCode = generateOTP(config.otp.length);
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'verification',
        expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
      },
    });

    await otpProvider.send(phone, otpCode);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  static async login({ identifier, password }, req) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { phone: identifier }],
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    createAuditLog({
      actorId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'LOGIN',
      req,
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage,
        darkModeEnabled: user.darkModeEnabled,
      },
      accessToken,
      refreshToken,
    };
  }

  static async verifyOtp({ userId, code, purpose }) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    if (purpose === 'verification') {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
      accessToken,
      refreshToken,
    };
  }

  static async resendOtp({ userId, purpose }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        userId,
        purpose,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      throw new BadRequestError('Please wait before requesting a new OTP');
    }

    const otpCode = generateOTP(config.otp.length);
    await prisma.otpCode.create({
      data: {
        userId,
        code: otpCode,
        purpose,
        expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
      },
    });

    await otpProvider.send(user.phone, otpCode);

    return { message: 'OTP sent successfully' };
  }

  static async refreshToken({ refreshToken }) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (tokenRecord.user.deletedAt || tokenRecord.user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = jwt.sign(
      { userId: tokenRecord.user.id, role: tokenRecord.user.role },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );

    const newRefreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: tokenRecord.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async forgotPassword({ email }) {
    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    if (!user) {
      return { message: 'If the email exists, an OTP will be sent' };
    }

    const otpCode = generateOTP(config.otp.length);
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'password_reset',
        expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
      },
    });

    await otpProvider.send(user.phone, otpCode);

    return { userId: user.id, message: 'OTP sent for password reset' };
  }

  static async resetPassword({ userId, code, newPassword }) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        purpose: 'password_reset',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } }),
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestError('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: 'Password changed successfully' };
  }

  static async logout(userId, refreshToken) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out successfully' };
  }

  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        preferredLanguage: true,
        darkModeEnabled: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

module.exports = AuthService;
