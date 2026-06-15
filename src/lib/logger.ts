type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  meta?: unknown;
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  // pretty dev output
  const colorMap: Record<LogLevel, string> = {
    debug: '\x1b[90m', // gray
    info: '\x1b[32m', // green
    warn: '\x1b[33m', // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';
  const { level, timestamp, message, meta } = entry;
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `${colorMap[level]}[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${reset}`;
}

function log(level: LogLevel, message: string, meta?: unknown) {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    meta,
  };
  console.log(formatLog(entry));
}

export const logger = {
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
};
