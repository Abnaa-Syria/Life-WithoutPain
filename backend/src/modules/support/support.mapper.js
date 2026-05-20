const ADMIN_ROLES = ['SUPER_ADMIN', 'SUPPORT_STAFF', 'MEDICAL_ADMIN'];

function mapAttachment(a) {
  if (!a) return null;
  return {
    id: a.id,
    fileUrl: a.fileUrl,
    fileName: a.fileName,
    mimeType: a.mimeType,
    createdAt: a.createdAt,
  };
}

function mapMessage(msg) {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderRole: msg.sender?.role,
    senderName: msg.sender?.fullName,
    message: msg.content,
    messageType: msg.messageType,
    attachments: (msg.attachments || []).map(mapAttachment),
    attachmentUrl: msg.attachmentUrl,
    createdAt: msg.sentAt,
    readAt: msg.readAt,
  };
}

function mapSupportInfo(info, lang = 'ar') {
  const isEn = lang === 'en';
  return {
    supportPhones: info.supportPhones,
    supportEmail: info.supportEmail,
    whatsappNumber: info.whatsappNumber,
    whatsappLink: info.whatsappLink,
    socialLinks: info.socialLinks,
    workingHours: info.workingHours,
    description: isEn ? (info.descriptionEn || info.descriptionAr) : (info.descriptionAr || info.descriptionEn),
    descriptionAr: info.descriptionAr,
    descriptionEn: info.descriptionEn,
    updatedAt: info.updatedAt,
  };
}

function mapTicketListItem(ticket, unreadCount = 0) {
  const lastMsg = ticket.messages?.[0];
  return {
    id: ticket.id,
    category: ticket.category,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    creatorRole: ticket.creatorRole,
    unreadCount,
    lastMessagePreview: lastMsg ? lastMsg.content?.slice(0, 120) : ticket.description?.slice(0, 120) || null,
    assigneeName: ticket.assignee?.fullName || null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    lastActivityAt: ticket.lastActivityAt,
  };
}

function mapTicketDetail(ticket, unreadCount = 0) {
  return {
    ...mapTicketListItem(ticket, unreadCount),
    description: ticket.description,
    resolutionNotes: ticket.resolutionNotes,
    assignedAdminId: ticket.assignedTo,
    assignee: ticket.assignee ? { id: ticket.assignee.id, fullName: ticket.assignee.fullName } : null,
    creator: ticket.creator
      ? { id: ticket.creator.id, fullName: ticket.creator.fullName, role: ticket.creatorRole }
      : null,
    patient: ticket.patient
      ? { id: ticket.patient.id, fullName: ticket.patient.user?.fullName, phone: ticket.patient.user?.phone }
      : null,
    doctor: ticket.doctor
      ? { id: ticket.doctor.id, fullName: ticket.doctor.user?.fullName, phone: ticket.doctor.user?.phone }
      : null,
    attachments: (ticket.attachments || []).filter((a) => !a.messageId).map(mapAttachment),
    messages: (ticket.messages || []).map(mapMessage),
  };
}

function mapTicketAdminListItem(ticket, unreadCount = 0) {
  const creatorName =
    ticket.patient?.user?.fullName ||
    ticket.doctor?.user?.fullName ||
    ticket.creator?.fullName ||
    'Unknown';
  return {
    ...mapTicketListItem(ticket, unreadCount),
    creatorName,
    creatorRole: ticket.creatorRole,
    category: ticket.category,
    patientId: ticket.patientId,
    doctorId: ticket.doctorId,
    assignedAdminId: ticket.assignedTo,
  };
}

function isStaffRole(role) {
  return ADMIN_ROLES.includes(role) || role === 'INSURANCE_STAFF' || role === 'ACCOUNTANT';
}

module.exports = {
  mapSupportInfo,
  mapMessage,
  mapTicketListItem,
  mapTicketDetail,
  mapTicketAdminListItem,
  mapAttachment,
  isStaffRole,
};
