const TRANSLATABLE_ENTITIES = {
  speciality: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  sub_speciality: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  service: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  insurance_provider: {
    fields: ['name'],
    requiredLocales: ['en', 'ar'],
  },
  chronic_disease: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  medication: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  allergy: {
    fields: ['name', 'description'],
    requiredLocales: ['en', 'ar'],
  },
  medical_test: {
    fields: ['name', 'description', 'category'],
    requiredLocales: ['en', 'ar'],
  },
  notification: {
    fields: ['title', 'body'],
    requiredLocales: ['en', 'ar'],
  },
  support_contact_info: {
    fields: ['description'],
    requiredLocales: ['en', 'ar'],
  },
  doctor_profile: {
    fields: ['bio'],
    requiredLocales: ['en', 'ar'],
  },
};

module.exports = { TRANSLATABLE_ENTITIES };
