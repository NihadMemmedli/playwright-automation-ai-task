import { env } from '@config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const shouldLog = (level: Level): boolean =>
  LEVELS[level] >= LEVELS[env.LOG_LEVEL];

const stamp = (level: Level, scope: string, msg: string, meta?: unknown): string => {
  const time = new Date().toISOString();
  const tail = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${time}] [${level.toUpperCase()}] [${scope}] ${msg}${tail}`;
};

export const createLogger = (scope: string) => ({
  debug: (msg: string, meta?: unknown) => shouldLog('debug') && console.debug(stamp('debug', scope, msg, meta)),
  info:  (msg: string, meta?: unknown) => shouldLog('info')  && console.info(stamp('info',  scope, msg, meta)),
  warn:  (msg: string, meta?: unknown) => shouldLog('warn')  && console.warn(stamp('warn',  scope, msg, meta)),
  error: (msg: string, meta?: unknown) => shouldLog('error') && console.error(stamp('error', scope, msg, meta)),
});

export type Logger = ReturnType<typeof createLogger>;
