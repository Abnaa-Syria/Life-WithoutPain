const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const prisma = require('../../../config/database');
const logger = require('../../../config/logger');

function formatAmount(amount) {
  if (amount == null) return '';
  const n = typeof amount === 'object' && amount.toNumber ? amount.toNumber() : Number(amount);
  if (Number.isNaN(n)) return '';
  return `${n.toFixed(2)} SAR`;
}

async function loadPayment(paymentId) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { patient: { select: { userId: true } } },
  });
}

function initPaymentListeners() {
  const notifyPayment = async (paymentId, isSuccess) => {
    try {
      const payment = await loadPayment(paymentId);
      if (!payment) return;

      const amountStr = formatAmount(payment.amount);
      const patientUserId = payment.patient?.userId;

      if (patientUserId) {
        await NotificationService.create({
          userId: patientUserId,
          titleAr: isSuccess ? 'تم الدفع بنجاح' : 'فشل الدفع',
          titleEn: isSuccess ? 'Payment successful' : 'Payment failed',
          bodyAr: isSuccess
            ? `تم استلام دفعتك بمبلغ ${amountStr}`
            : `تعذر إتمام الدفع بمبلغ ${amountStr}`,
          bodyEn: isSuccess
            ? `Your payment of ${amountStr} was received`
            : `Your payment of ${amountStr} could not be completed`,
          type: 'PAYMENT',
          relatedEntityType: 'Payment',
          relatedEntityId: payment.id,
        });
      }

      const staffIds = await getStaffUserIdsForNotificationType('PAYMENT');
      if (staffIds.length) {
        await NotificationService.createBulk(
          staffIds.map((userId) => ({
            userId,
            titleAr: isSuccess ? 'دفعة جديدة' : 'فشل دفعة',
            titleEn: isSuccess ? 'New payment' : 'Payment failed',
            bodyAr: `دفعة #${payment.id} — ${amountStr} — ${isSuccess ? 'مدفوعة' : 'فاشلة'}`,
            bodyEn: `Payment #${payment.id} — ${amountStr} — ${isSuccess ? 'paid' : 'failed'}`,
            type: 'PAYMENT',
            relatedEntityType: 'Payment',
            relatedEntityId: payment.id,
          })),
        );
      }

      logger.info(`Payment notifications for payment ${payment.id}`);
    } catch (error) {
      logger.error(`Payment notification failed: ${error.message}`);
    }
  };

  eventEmitter.on(EVENTS.PAYMENT.COMPLETED, async ({ paymentId }) => {
    await notifyPayment(paymentId, true);
  });

  eventEmitter.on(EVENTS.PAYMENT.FAILED, async ({ paymentId }) => {
    await notifyPayment(paymentId, false);
  });

  logger.info('Payment notification listeners initialized');
}

module.exports = initPaymentListeners;
