const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const config = require('../../config');
const { generateOTP, generateRefreshToken } = require('../../utils/helpers');
const otpProvider = require('../../shared/otp');
const { ConflictError, UnauthorizedError, BadRequestError, NotFoundError, ValidationError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const { normalizePhone } = require('../../shared/utils/phone');

class AuthService {
  static async registerPatient({ fullName, identityNumber, dateOfBirth, email, phone, password, preferredLanguage }) {
    const normalizedPhone = normalizePhone(phone);
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: normalizedPhone }], deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictError('A user with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: normalizedPhone,
        passwordHash,
        role: 'PATIENT',
        preferredLanguage: preferredLanguage || 'ar',
        patientProfile: {
          create: {
            identityNumber,
            dateOfBirth: new Date(dateOfBirth),
          },
        },
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

    await otpProvider.send(normalizedPhone, otpCode);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  static async registerDoctor({ fullName, email, phone, password, specialityId, licenceNumber, licenseNumber, licenseUrl, title, workplace, city, preferredLanguage }) {
    const normalizedPhone = normalizePhone(phone);
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: normalizedPhone }], deletedAt: null },
    });
    if (existingUser) {
      throw new ConflictError('A user with this email or phone already exists');
    }

    const finalLicenseNumber = licenceNumber || licenseNumber;
    if (!finalLicenseNumber) {
      throw new ValidationError('Medical license number is required');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const profileCreate = {
      licenseNumber: finalLicenseNumber,
      title: title || null,
      workplace: workplace || null,
      city: city || null,
      verificationStatus: 'PENDING',
      isPubliclyBookable: false,
    };

    if (specialityId) {
      profileCreate.speciality = { connect: { id: parseInt(specialityId, 10) } };
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: normalizedPhone,
        passwordHash,
        role: 'DOCTOR',
        preferredLanguage: preferredLanguage || 'ar',
        doctorProfile: { create: profileCreate },
      },
      include: { doctorProfile: true },
    });

    if (licenseUrl && user.doctorProfile) {
      await prisma.doctorVerificationDocument.create({
        data: {
          doctorId: user.doctorProfile.id,
          fileUrl: licenseUrl,
          fileType: 'LICENSE',
        },
      });
    }

    const otpCode = generateOTP(config.otp.length);
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otpCode,
        purpose: 'verification',
        expiresAt: new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000),
      },
    });

    await otpProvider.send(normalizedPhone, otpCode);

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
    const trimmed = String(identifier).trim();
    const isEmail = trimmed.includes('@');
    const user = await prisma.user.findFirst({
      where: {
        ...(isEmail ? { email: trimmed.toLowerCase() } : { phone: normalizePhone(trimmed) }),
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    if (user.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
      if (doctorProfile && doctorProfile.verificationStatus !== 'APPROVED') {
        throw new UnauthorizedError('Your account is pending admin approval');
      }
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

  static async loginMobile({ phone, password }, req) {
    const user = await prisma.user.findFirst({
      where: { phone: normalizePhone(phone), deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    if (user.role === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
      if (doctorProfile && doctorProfile.verificationStatus !== 'APPROVED') {
        throw new UnauthorizedError('Your account is pending admin approval');
      }
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

    const doctorProfile = user.role === 'DOCTOR' 
      ? await prisma.doctorProfile.findUnique({ where: { userId: user.id } })
      : null;

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage,
        doctorProfile: doctorProfile ? {
          id: doctorProfile.id,
          specialityId: doctorProfile.specialityId,
          verificationStatus: doctorProfile.verificationStatus,
        } : null,
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

  static async registerDoctorMobile({ name, mobileNumber, password, specializationId, medicalLicenseNumber, workPlace, city, licenseUrl }) {
    const phone = normalizePhone(mobileNumber);
    const email = `${phone.replace(/\D/g, '')}@doctor.app`;

    await this.registerDoctor({
      fullName: name,
      email,
      phone,
      password,
      specialityId: specializationId,
      licenseNumber: medicalLicenseNumber,
      licenseUrl,
      workplace: workPlace,
      city,
    });

    return { message: 'Signup submitted for approval', status: 'pending' };
  }

  static async loginByMobile({ mobileNumber, password }, req) {
    const result = await this.login({ identifier: mobileNumber, password }, req);
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: result.user.id },
      include: { speciality: true, user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } } },
    });

    return {
      token: result.accessToken,
      refreshToken: result.refreshToken,
      doctor: doctorProfile,
    };
  }

  static async verifyOtpByMobile({ mobileNumber, otp }) {
    const user = await prisma.user.findFirst({
      where: { phone: normalizePhone(mobileNumber), role: 'DOCTOR', deletedAt: null },
    });
    if (!user) throw new NotFoundError('User not found');

    return this.verifyOtp({ userId: user.id, code: otp, purpose: 'verification' });
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
