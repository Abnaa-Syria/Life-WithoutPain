const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const prisma = require('../../../config/database');
const logger = require('../../../config/logger');

function formatAmount(amount) {
  if (amount == null) return '';
  const n = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount);
  if (Number.isNaN(n)) return '';
  return ` ${n.toFixed(2)} SAR`;
}

function latestApproval(caseRow) {
  return caseRow.approvals?.[0];
}

function initInsuranceListeners() {
  eventEmitter.on(EVENTS.INSURANCE.CASE_CREATED, async (insuranceCase) => {
    try {
      const patient = await prisma.patientProfile.findUnique({
        where: { id: insuranceCase.patientId },
        select: { userId: true },
      });

      if (patient?.userId) {
        await NotificationService.create({
          userId: patient.userId,
          titleAr: 'طلب موافقة تأمين جديد',
          titleEn: 'New insurance approval request',
          bodyAr: 'تم استلام طلب التأمين الخاص بك وهو قيد المراجعة.',
          bodyEn: 'Your insurance request has been received and is under review.',
          type: 'INSURANCE',
          relatedEntityType: 'InsuranceCase',
          relatedEntityId: insuranceCase.id,
        });
      }

      const staffIds = await getStaffUserIdsForNotificationType('INSURANCE');
      if (staffIds.length) {
        await NotificationService.createBulk(
          staffIds.map((userId) => ({
            userId,
            titleAr: 'طلب تأمين جديد للمراجعة',
            titleEn: 'New insurance request to review',
            bodyAr: `طلب تأمين #${insuranceCase.id} بانتظار المراجعة`,
            bodyEn: `Insurance request #${insuranceCase.id} awaiting review`,
            type: 'INSURANCE',
            relatedEntityType: 'InsuranceCase',
            relatedEntityId: insuranceCase.id,
          })),
        );
      }

      logger.info(`Insurance CASE_CREATED notifications for case ${insuranceCase.id}`);
    } catch (error) {
      logger.error(`Insurance CASE_CREATED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.INSURANCE.CASE_UPDATED, async (insuranceCase) => {
    try {
      const patient = await prisma.patientProfile.findUnique({
        where: { id: insuranceCase.patientId },
        select: { userId: true },
      });
      if (!patient?.userId) return;

      const approval = latestApproval(insuranceCase);
      const amountStr = formatAmount(approval?.approvedAmount);
      const status = insuranceCase.status;

      await NotificationService.create({
        userId: patient.userId,
        titleAr: 'تحديث طلب التأمين',
        titleEn: 'Insurance request updated',
        bodyAr: `الحالة: ${status}${amountStr ? ` — المبلغ المعتمد:${amountStr}` : ''}`,
        bodyEn: `Status: ${status}${amountStr ? ` — Approved amount:${amountStr}` : ''}`,
        type: 'INSURANCE',
        relatedEntityType: 'InsuranceCase',
        relatedEntityId: insuranceCase.id,
      });

      const staffIds = await getStaffUserIdsForNotificationType('INSURANCE');
      if (staffIds.length) {
        await NotificationService.createBulk(
          staffIds.map((userId) => ({
            userId,
            titleAr: 'تحديث طلب تأمين',
            titleEn: 'Insurance case updated',
            bodyAr: `طلب تأمين #${insuranceCase.id} — الحالة: ${status}`,
            bodyEn: `Insurance request #${insuranceCase.id} — status: ${status}`,
            type: 'INSURANCE',
            relatedEntityType: 'InsuranceCase',
            relatedEntityId: insuranceCase.id,
          })),
        );
      }

      logger.info(`Insurance CASE_UPDATED notification for case ${insuranceCase.id}`);
    } catch (error) {
      logger.error(`Insurance CASE_UPDATED listener failed: ${error.message}`);
    }
  });

  logger.info('Insurance notification listeners initialized');
}

module.exports = initInsuranceListeners;
