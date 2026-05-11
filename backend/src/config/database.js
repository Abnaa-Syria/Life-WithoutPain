const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error({ msg: 'Prisma Error', error: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn({ msg: 'Prisma Warning', warning: e.message });
});

module.exports = prisma;
