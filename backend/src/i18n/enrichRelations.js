const { attachTranslations } = require('./mapLocalized');
const { getLocale } = require('./localeContext');
const { TRANSLATABLE_ENTITIES } = require('./translatableEntities');

const ENTITY_FIELDS = Object.fromEntries(
  Object.entries(TRANSLATABLE_ENTITIES).map(([key, meta]) => [key, meta.fields]),
);

function resolveLocale(locale) {
  return locale || getLocale() || 'en';
}

function uniqueById(entities) {
  return [...new Map((entities || []).filter(Boolean).map((e) => [e.id, e])).values()];
}

async function localizedMap(entities, entityType, locale) {
  const fields = ENTITY_FIELDS[entityType];
  if (!fields) {
    throw new Error(`Unknown translatable entity: ${entityType}`);
  }
  const unique = uniqueById(entities);
  if (!unique.length) return new Map();
  const localized = await attachTranslations(unique, entityType, fields, resolveLocale(locale));
  return new Map(localized.map((e) => [e.id, e]));
}

function pick(map, entity) {
  return entity && map.has(entity.id) ? map.get(entity.id) : entity;
}

async function enrichInsuranceProvidersOnRecords(records, locale, providerKey = 'provider') {
  const list = Array.isArray(records) ? records : [records];
  if (!list.length) return records;

  const map = await localizedMap(
    list.map((r) => r[providerKey]).filter(Boolean),
    'insurance_provider',
    locale,
  );
  const enriched = list.map((r) => ({
    ...r,
    [providerKey]: pick(map, r[providerKey]),
  }));
  return Array.isArray(records) ? enriched : enriched[0];
}

async function enrichAppointments(appointments, locale) {
  const list = Array.isArray(appointments) ? appointments : [appointments];
  if (!list.length) return appointments;

  const subSpecialities = list.flatMap((a) => a.doctor?.subSpecialities || []);
  const [specMap, svcMap, subMap] = await Promise.all([
    localizedMap(list.map((a) => a.doctor?.speciality).filter(Boolean), 'speciality', locale),
    localizedMap(list.map((a) => a.service).filter(Boolean), 'service', locale),
    subSpecialities.length
      ? localizedMap(subSpecialities, 'sub_speciality', locale)
      : Promise.resolve(new Map()),
  ]);

  const enriched = list.map((a) => ({
    ...a,
    service: pick(svcMap, a.service),
    doctor: a.doctor
      ? {
          ...a.doctor,
          speciality: pick(specMap, a.doctor.speciality),
          subSpecialities: (a.doctor.subSpecialities || []).map((s) => pick(subMap, s)),
        }
      : a.doctor,
  }));

  return Array.isArray(appointments) ? enriched : enriched[0];
}

async function enrichHomeServiceRequests(requests, locale) {
  const list = Array.isArray(requests) ? requests : [requests];
  if (!list.length) return requests;

  const map = await localizedMap(list.map((r) => r.service).filter(Boolean), 'service', locale);
  const enriched = list.map((r) => ({
    ...r,
    service: pick(map, r.service),
  }));
  return Array.isArray(requests) ? enriched : enriched[0];
}

async function enrichInsuranceCases(cases, locale) {
  const list = Array.isArray(cases) ? [...cases] : [{ ...cases }];
  if (!list.length) return cases;

  const providerMap = await localizedMap(
    list.flatMap((c) => [c.provider, c.patientInsurance?.provider].filter(Boolean)),
    'insurance_provider',
    locale,
  );
  const serviceMap = await localizedMap(
    list.map((c) => c.homeServiceRequest?.service).filter(Boolean),
    'service',
    locale,
  );

  let enriched = list.map((c) => ({
    ...c,
    provider: pick(providerMap, c.provider),
    patientInsurance: c.patientInsurance
      ? { ...c.patientInsurance, provider: pick(providerMap, c.patientInsurance.provider) }
      : c.patientInsurance,
    homeServiceRequest: c.homeServiceRequest
      ? { ...c.homeServiceRequest, service: pick(serviceMap, c.homeServiceRequest.service) }
      : c.homeServiceRequest,
    patient: c.patient
      ? {
          ...c.patient,
          insurances: (c.patient.insurances || []).map((ins) => ({
            ...ins,
            provider: pick(providerMap, ins.provider),
          })),
        }
      : c.patient,
  }));

  const nestedAppointments = enriched.map((c) => c.appointment).filter(Boolean);
  if (nestedAppointments.length) {
    const localizedAppts = await enrichAppointments(nestedAppointments, locale);
    const apptById = new Map(localizedAppts.map((a) => [a.id, a]));
    enriched = enriched.map((c) =>
      c.appointment ? { ...c, appointment: apptById.get(c.appointment.id) || c.appointment } : c,
    );
  }

  return Array.isArray(cases) ? enriched : enriched[0];
}

async function enrichDoctorsForPatient(doctors, locale) {
  const list = Array.isArray(doctors) ? doctors : [doctors];
  if (!list.length) return doctors;

  const [specMap, subMap, svcMap, bioMap] = await Promise.all([
    localizedMap(list.map((d) => d.speciality).filter(Boolean), 'speciality', locale),
    localizedMap(list.flatMap((d) => d.subSpecialities || []), 'sub_speciality', locale),
    localizedMap(
      list.flatMap((d) => (d.doctorServices || []).map((ds) => ds.service).filter(Boolean)),
      'service',
      locale,
    ),
    localizedMap(list, 'doctor_profile', locale),
  ]);

  const enriched = list.map((d) => {
    const localized = pick(bioMap, d);
    return {
      ...d,
      bio: localized?.bio ?? d.bio ?? null,
      speciality: pick(specMap, d.speciality),
      subSpecialities: (d.subSpecialities || []).map((s) => pick(subMap, s)),
      doctorServices: (d.doctorServices || []).map((ds) => ({
        ...ds,
        service: pick(svcMap, ds.service),
      })),
    };
  });

  return Array.isArray(doctors) ? enriched : enriched[0];
}

async function enrichRecordsWithDoctorSpeciality(records, locale) {
  const list = Array.isArray(records) ? records : [records];
  if (!list.length) return records;

  const specMap = await localizedMap(
    list.map((r) => r.doctor?.speciality).filter(Boolean),
    'speciality',
    locale,
  );
  const enriched = list.map((r) => ({
    ...r,
    doctor: r.doctor
      ? { ...r.doctor, speciality: pick(specMap, r.doctor.speciality) }
      : r.doctor,
  }));
  return Array.isArray(records) ? enriched : enriched[0];
}

async function enrichMedicalProfile(profile, locale) {
  if (!profile) return profile;

  const [disMap, medMap, allergyMap] = await Promise.all([
    localizedMap(profile.chronicDiseases || [], 'chronic_disease', locale),
    localizedMap(profile.medications || [], 'medication', locale),
    localizedMap(profile.allergies || [], 'allergy', locale),
  ]);

  return {
    ...profile,
    chronicDiseases: (profile.chronicDiseases || []).map((d) => pick(disMap, d)),
    medications: (profile.medications || []).map((m) => pick(medMap, m)),
    allergies: (profile.allergies || []).map((a) => pick(allergyMap, a)),
  };
}

module.exports = {
  localizedMap,
  enrichInsuranceProvidersOnRecords,
  enrichAppointments,
  enrichHomeServiceRequests,
  enrichInsuranceCases,
  enrichDoctorsForPatient,
  enrichRecordsWithDoctorSpeciality,
  enrichMedicalProfile,
};
