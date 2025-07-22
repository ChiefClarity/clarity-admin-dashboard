import pino from 'pino';

const isServer = typeof window === 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development';

// Browser-safe logger
const logger = isServer
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'HH:MM:ss',
            },
          }
        : undefined,
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      serializers: {
        error: pino.stdSerializers.err,
        request: (req) => ({
          method: req.method,
          url: req.url,
          headers: req.headers,
          query: req.query,
        }),
        response: (res) => ({
          statusCode: res.statusCode,
        }),
      },
    })
  : {
      // Browser implementation
      info: (msg: string, data?: any) => {
        if (isDevelopment) console.log(`[INFO] ${msg}`, data);
      },
      warn: (msg: string, data?: any) => {
        console.warn(`[WARN] ${msg}`, data);
      },
      error: (msg: string, data?: any) => {
        console.error(`[ERROR] ${msg}`, data);
      },
      debug: (msg: string, data?: any) => {
        if (isDevelopment) console.debug(`[DEBUG] ${msg}`, data);
      },
    };

export { logger };