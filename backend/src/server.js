const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const prisma = require('./config/database');
const { initSocket } = require('./socket');

const { initI18n } = require('./i18n');
const { configureZodErrorMap } = require('./i18n/zodErrorMap');

const startServer = async () => {
  try {
    await initI18n();
    configureZodErrorMap();

    await prisma.$connect();
    logger.info({ msg: 'Database connected successfully' });

    require('./shared/events')();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(config.port, () => {
      logger.info({ msg: `Server running on port ${config.port}` });
      logger.info({ msg: `API: http://localhost:${config.port}${config.apiPrefix}` });
      logger.info({ msg: `WebSocket: http://localhost:${config.port}/socket.io` });
      logger.info({ msg: `Swagger: http://localhost:${config.port}/api-docs` });
      logger.info({ msg: `Swagger: http://localhost:${config.port}/api-docs/doctor` });
      logger.info({ msg: `Patient App docs: http://localhost:${config.port}/api-docs/patient` });
      logger.info({ msg: `Environment: ${config.env}` });
    });
  } catch (error) {
    logger.error({ msg: 'Failed to start server', error: error.message });
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logger.error({ msg: 'Unhandled Rejection', reason });
});

process.on('uncaughtException', (error) => {
  logger.error({ msg: 'Uncaught Exception', error: error.message });
  process.exit(1);
});

const gracefulShutdown = async () => {
  logger.info({ msg: 'Shutting down gracefully...' });
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
