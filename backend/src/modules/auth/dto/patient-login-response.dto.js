/**
 * Patient mobile login response — mirrors doctor login shape ({ token, refreshToken, patient }).
 */
function formatDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapPatientLoginResponseDto({ patientProfile, token, refreshToken }) {
  const user = patientProfile.user;
  return {
    token,
    refreshToken,
    patient: {
      id: patientProfile.id,
      userId: patientProfile.userId,
      fullName: user?.fullName ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
      avatarUrl: user?.avatarUrl ?? null,
      isVerified: user?.isVerified ?? false,
      preferredLanguage: user?.preferredLanguage ?? null,
      darkModeEnabled: user?.darkModeEnabled ?? false,
      identityNumber: patientProfile.identityNumber ?? null,
      dateOfBirth: formatDateOnly(patientProfile.dateOfBirth),
      gender: patientProfile.gender ?? null,
      city: patientProfile.city ?? null,
    },
  };
}

module.exports = { mapPatientLoginResponseDto };
