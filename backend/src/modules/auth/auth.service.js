const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const config = require('../../config');
const { generateOTP, generateRefreshToken } = require('../../utils/helpers');
const otpProvider = require('../../shared/otp');
const { ConflictError, UnauthorizedError, ForbiddenError, BadRequestError, NotFoundError, ValidationError } = require('../../shared/errors/AppError');
const { createAuditLog } = require('../../middlewares/auditLog');
const { normalizePhone } = require('../../shared/utils/phone');
const { ROLES, ADMIN_ROLES } = require('../../constants');
const { eventEmitter, EVENTS } = require('../../shared/events/eventEmitter');
const { mapPatientLoginResponseDto } = require('./dto/patient-login-response.dto');

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

    eventEmitter.emit(EVENTS.USER.REGISTERED, {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      source: 'SELF_REGISTER',
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  static async registerDoctor({ fullName, email, phone, password, specialityId, licenceNumber, licenseNumber, licenceExpiryDate, licenseExpiryDate, licenseUrl, title, workplace, city, preferredLanguage, subSpecializationIds }) {
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

    const expiryRaw = licenceExpiryDate || licenseExpiryDate;
    const parsedExpiry = expiryRaw ? new Date(`${expiryRaw}T00:00:00.000Z`) : null;
    if (parsedExpiry && Number.isNaN(parsedExpiry.getTime())) {
      throw new ValidationError('Invalid medical license expiry date');
    }

    const profileCreate = {
      licenseNumber: finalLicenseNumber,
      licenseExpiryDate: parsedExpiry,
      title: title || null,
      workplace: workplace || null,
      city: city || null,
      verificationStatus: 'PENDING',
      isPubliclyBookable: false,
    };

    const SubSpecialityService = require('../specialities/subSpeciality.service');
    const validatedSubIds = await SubSpecialityService.validateForDoctorRegistration(
      specialityId,
      subSpecializationIds,
    );

    if (specialityId) {
      profileCreate.speciality = { connect: { id: parseInt(specialityId, 10) } };
    }
    if (validatedSubIds.length) {
      profileCreate.subSpecialities = { connect: validatedSubIds.map((id) => ({ id })) };
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

    eventEmitter.emit(EVENTS.USER.REGISTERED, {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phone,
      source: 'SELF_REGISTER',
    });

    eventEmitter.emit(EVENTS.VERIFICATION.DOCTOR_SUBMITTED, {
      doctorProfile: user.doctorProfile,
      user: { id: user.id, fullName: user.fullName },
    });

    const profileWithSubs = await prisma.doctorProfile.findUnique({
      where: { id: user.doctorProfile.id },
      include: { subSpecialities: { where: { isActive: true } } },
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      subSpecializations: (profileWithSubs?.subSpecialities || []).map((s) => ({
        id: s.id,
        specialityId: s.specialityId,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
      })),
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

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        preferredLanguage: user.preferredLanguage,
      },
      accessToken,
      refreshToken,
    };
  }

  static assertPatientAppRole(user) {
    if (ADMIN_ROLES.includes(user.role)) {
      throw new ForbiddenError('This account must sign in through the admin portal.');
    }
    if (user.role !== ROLES.PATIENT) {
      throw new ForbiddenError('This account cannot sign in to the patient app. Use the doctor app or contact support.');
    }
  }

  static async completeVerification({ userId, purpose }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    if (purpose === 'verification') {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    }

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

  // Temporary stub until real OTP verification is implemented. Remove when SMS provider is wired.
  static async verifyOtpPatient({ userId, code, purpose }) {
    let result;
    if (config.otp.allowStub && code === config.otp.stubCode) {
      result = await this.completeVerification({ userId, purpose });
    } else {
      result = await this.verifyOtp({ userId, code, purpose });
    }

    if (purpose !== 'verification') {
      return result;
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isVerified: true,
            preferredLanguage: true,
            darkModeEnabled: true,
          },
        },
      },
    });

    if (!patientProfile) {
      throw new NotFoundError('Patient profile not found');
    }

    return mapPatientLoginResponseDto({
      patientProfile,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
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

    return this.completeVerification({ userId, purpose });
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

  static async registerDoctorMobile({
    name,
    mobileNumber,
    password,
    specializationId,
    subSpecializationIds,
    medicalLicenseNumber,
    medicalLicenseExpiryDate,
    workPlace,
    city,
    licenseUrl,
  }) {
    const phone = normalizePhone(mobileNumber);
    const email = `${phone.replace(/\D/g, '')}@doctor.app`;

    const result = await this.registerDoctor({
      fullName: name,
      email,
      phone,
      password,
      specialityId: specializationId,
      subSpecializationIds,
      licenseNumber: medicalLicenseNumber,
      licenseExpiryDate: medicalLicenseExpiryDate,
      licenseUrl,
      workplace: workPlace,
      city,
    });

    return {
      message: 'Signup submitted for approval',
      status: 'pending',
      subSpecializations: result.subSpecializations || [],
    };
  }

  static async loginPatientByMobile({ phone, password }, req) {
    const result = await this.login({ identifier: phone, password }, req);
    this.assertPatientAppRole(result.user);

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: result.user.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            isVerified: true,
            preferredLanguage: true,
            darkModeEnabled: true,
          },
        },
      },
    });

    if (!patientProfile) {
      throw new NotFoundError('Patient profile not found');
    }

    return mapPatientLoginResponseDto({
      patientProfile,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  static async loginByMobile({ mobileNumber, password }, req) {
    const result = await this.login({ identifier: mobileNumber, password }, req);
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: result.user.id },
      include: { speciality: true, user: { select: { id: true, fullName: true, phone: true, avatarUrl: true } } },
    });

    return {
      accessToken: result.accessToken,
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

    const { getEffectivePermissions } = require('../rbac/permission.service');
    const permissions = await getEffectivePermissions(userId, user.role);
    const profile = { ...user, permissions };

    if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId },
        select: { id: true, verificationStatus: true, specialityId: true },
      });
      if (doctor) {
        profile.profileId = doctor.id;
        profile.doctorProfileId = doctor.id;
        profile.verificationStatus = doctor.verificationStatus;
      }
    } else if (user.role === 'PATIENT') {
      const patient = await prisma.patientProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (patient) {
        profile.profileId = patient.id;
        profile.patientProfileId = patient.id;
      }
    }

    return profile;
  }

  static async deleteAccount(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: 'INACTIVE',
          deletedAt: new Date(),
        },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Account deleted successfully' };
  }
}

module.exports = AuthService;
