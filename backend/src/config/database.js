const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const basePrisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

basePrisma.$on('error', (e) => {
  logger.error({ msg: 'Prisma Error', error: e.message });
});

basePrisma.$on('warn', (e) => {
  logger.warn({ msg: 'Prisma Warning', warning: e.message });
});

const checkAndUpdateExpiry = async (record) => {
  if (!record || !record.id || !record.verificationStatus) return record;
  if (record.expiryDate && new Date(record.expiryDate) < new Date() && record.verificationStatus !== 'EXPIRED') {
    try {
      await basePrisma.patientInsurance.update({
        where: { id: record.id },
        data: { verificationStatus: 'EXPIRED' }
      });
      return { ...record, verificationStatus: 'EXPIRED' };
    } catch (err) {
      logger.error({ msg: 'Failed to update expired insurance', error: err.message });
      return { ...record, verificationStatus: 'EXPIRED' };
    }
  }
  return record;
};

const prisma = basePrisma.$extends({
  query: {
    patientInsurance: {
      async $allOperations({ operation, args, query }) {
        const result = await query(args);
        
        if (['findUnique', 'findFirst', 'findMany'].includes(operation) && result) {
          if (Array.isArray(result)) {
            return Promise.all(result.map(checkAndUpdateExpiry));
          } else {
            return checkAndUpdateExpiry(result);
          }
        }
        
        return result;
      }
    }
  }
});

module.exports = prisma;
