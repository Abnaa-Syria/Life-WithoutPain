export function getNotificationLink(notification) {
  const id = notification?.relatedEntityId;
  if (!id) return null;

  switch (notification?.relatedEntityType) {
    case 'SupportTicket':
      return `/support/tickets/${id}`;
    case 'InsuranceCase':
      return `/insurance-cases/${id}`;
    case 'Appointment':
      return `/appointments/${id}`;
    case 'Payment':
      return `/payments`;
    case 'Claim':
      return `/claims`;
    case 'DoctorProfile':
      return `/doctors/${id}`;
    default:
      return null;
  }
}
