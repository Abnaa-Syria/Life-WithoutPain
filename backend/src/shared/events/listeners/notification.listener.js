const { eventEmitter, EVENTS } = require('../eventEmitter');
const NotificationService = require('../../notifications/NotificationService');
const { getStaffUserIdsForNotificationType } = require('../../notifications/notificationRecipients');
const logger = require('../../../config/logger');

function appointmentDateLabel(appointment) {
  return appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleString()
    : '';
}

function statusLabelAr(status) {
  const labels = {
    PENDING: 'قيد الانتظار',
    CONFIRMED: 'مؤكد',
    IN_PROGRESS: 'جاري',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغى',
    RESCHEDULED: 'أعيد جدولته',
    NO_SHOW: 'لم يحضر',
  };
  return labels[status] || status;
}

function collectAppointmentTargets(appointment, staffIds) {
  const targets = new Set(staffIds);
  if (appointment?.doctor?.userId) targets.add(appointment.doctor.userId);
  if (appointment?.patient?.user?.id) targets.add(appointment.patient.user.id);
  else if (appointment?.patient?.userId) targets.add(appointment.patient.userId);
  return targets;
}

function initNotificationListeners() {
  eventEmitter.on(EVENTS.APPOINTMENT.CREATED, async (appointment) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('APPOINTMENT');
      const targets = collectAppointmentTargets(appointment, staffIds);
      if (!targets.size) return;

      const dateLabel = appointmentDateLabel(appointment);

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr: 'موعد جديد',
          titleEn: 'New Appointment',
          bodyAr: `موعد جديد${dateLabel ? ` في ${dateLabel}` : ''}`,
          bodyEn: `New appointment${dateLabel ? ` on ${dateLabel}` : ''}`,
          type: 'APPOINTMENT',
          relatedEntityType: 'Appointment',
          relatedEntityId: appointment.id,
        })),
      );
      logger.info(`Notifications sent for appointment ${appointment.id}`);
    } catch (error) {
      logger.error(`Failed to send notification for appointment ${appointment.id}: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.APPOINTMENT.STATUS_CHANGED, async ({ appointment, previousStatus }) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('APPOINTMENT');
      const targets = collectAppointmentTargets(appointment, staffIds);
      if (!targets.size) return;

      const dateLabel = appointmentDateLabel(appointment);
      const statusAr = statusLabelAr(appointment.status);
      const isConfirmed = appointment.status === 'CONFIRMED';

      const titleAr = isConfirmed ? 'تم تأكيد الموعد' : 'تحديث الموعد';
      const titleEn = isConfirmed ? 'Appointment confirmed' : 'Appointment updated';
      const bodyAr = isConfirmed
        ? `تم تأكيد موعدك${dateLabel ? ` في ${dateLabel}` : ''}`
        : `الحالة: ${statusAr}${dateLabel ? ` — ${dateLabel}` : ''}${previousStatus ? ` (كانت ${statusLabelAr(previousStatus)})` : ''}`;
      const bodyEn = isConfirmed
        ? `Your appointment has been confirmed${dateLabel ? ` on ${dateLabel}` : ''}`
        : `Status: ${appointment.status}${dateLabel ? ` — ${dateLabel}` : ''}`;

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr,
          titleEn,
          bodyAr,
          bodyEn,
          type: 'APPOINTMENT',
          relatedEntityType: 'Appointment',
          relatedEntityId: appointment.id,
        })),
      );
      logger.info(`Status change notifications for appointment ${appointment.id}`);
    } catch (error) {
      logger.error(`APPOINTMENT.STATUS_CHANGED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.CHAT.MESSAGE_SENT, async ({ conversation, message, recipientUserId }) => {
    try {
      if (!recipientUserId) return;
      const preview = message?.content?.slice(0, 200) || '';
      const senderName = message?.sender?.fullName || '';

      await NotificationService.create({
        userId: recipientUserId,
        titleAr: 'رسالة جديدة',
        titleEn: 'New message',
        bodyAr: senderName ? `${senderName}: ${preview}` : preview,
        bodyEn: senderName ? `${senderName}: ${preview}` : preview,
        type: 'CHAT',
        relatedEntityType: 'Conversation',
        relatedEntityId: conversation?.id,
      });
      logger.info(`Chat notification to user ${recipientUserId}`);
    } catch (error) {
      logger.error(`CHAT.MESSAGE_SENT listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.REVIEW.CREATED, async (review) => {
    try {
      const staffIds = await getStaffUserIdsForNotificationType('REVIEW');
      if (!staffIds.length) return;

      await NotificationService.createBulk(
        staffIds.map((userId) => ({
          userId,
          titleAr: 'تقييم جديد للمراجعة',
          titleEn: 'New review for moderation',
          bodyAr: `تقييم ${review.rating}/5 على الموعد #${review.appointmentId}`,
          bodyEn: `Rating ${review.rating}/5 on appointment #${review.appointmentId}`,
          type: 'REVIEW',
          relatedEntityType: 'Review',
          relatedEntityId: review.id,
        })),
      );
      logger.info(`Review notifications for review ${review.id}`);
    } catch (error) {
      logger.error(`REVIEW.CREATED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.LAB_RESULT.CREATED, async ({ labTest, result }) => {
    try {
      const patientUserId = labTest?.patient?.userId;
      const staffIds = await getStaffUserIdsForNotificationType('LAB_RESULT');
      const targets = new Set(staffIds);
      if (patientUserId) targets.add(patientUserId);
      if (!targets.size) return;

      const title = labTest?.title || 'فحص مخبري';

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr: 'نتيجة فحص جاهزة',
          titleEn: 'Lab result ready',
          bodyAr: `${title} — نتيجة #${result?.id || labTest?.id}`,
          bodyEn: `${title} — result ready`,
          type: 'LAB_RESULT',
          relatedEntityType: 'LabTestRequest',
          relatedEntityId: labTest?.id,
        })),
      );
      logger.info(`Lab result notifications for lab test ${labTest?.id}`);
    } catch (error) {
      logger.error(`LAB_RESULT.CREATED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.PRESCRIPTION.CREATED, async (prescription) => {
    try {
      const patientUserId = prescription?.patient?.userId;
      const staffIds = await getStaffUserIdsForNotificationType('PRESCRIPTION');
      const targets = new Set(staffIds);
      if (patientUserId) targets.add(patientUserId);
      if (!targets.size) return;

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr: 'وصفة طبية جديدة',
          titleEn: 'New prescription',
          bodyAr: `تم إصدار وصفة طبية #${prescription.id}`,
          bodyEn: `Prescription #${prescription.id} issued`,
          type: 'PRESCRIPTION',
          relatedEntityType: 'Prescription',
          relatedEntityId: prescription.id,
        })),
      );
      logger.info(`Prescription notifications for ${prescription.id}`);
    } catch (error) {
      logger.error(`PRESCRIPTION.CREATED listener failed: ${error.message}`);
    }
  });

  eventEmitter.on(EVENTS.REPORT.CREATED, async (report) => {
    try {
      const patientUserId = report?.patient?.userId;
      const staffIds = await getStaffUserIdsForNotificationType('REPORT');
      const targets = new Set(staffIds);
      if (patientUserId) targets.add(patientUserId);
      if (!targets.size) return;

      await NotificationService.createBulk(
        [...targets].map((userId) => ({
          userId,
          titleAr: 'تقرير طبي جديد',
          titleEn: 'New medical report',
          bodyAr: `تقرير طبي #${report.id}`,
          bodyEn: `Medical report #${report.id}`,
          type: 'REPORT',
          relatedEntityType: 'MedicalReport',
          relatedEntityId: report.id,
        })),
      );
      logger.info(`Report notifications for ${report.id}`);
    } catch (error) {
      logger.error(`REPORT.CREATED listener failed: ${error.message}`);
    }
  });

  logger.info('Notification listeners initialized');
}

module.exports = initNotificationListeners;
