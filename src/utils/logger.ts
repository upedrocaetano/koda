// Logger estruturado do Koda
// Cada log é JSON com level, timestamp e mensagem para facilitar debug

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  timestamp: string
  message: string
  [key: string]: unknown
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...data,
  }

  const output = JSON.stringify(entry)

  if (level === 'error') {
    console.error(output)
  } else if (level === 'warn') {
    console.warn(output)
  } else {
    console.log(output)
  }
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => log('info', message, data),
  warn: (message: string, data?: Record<string, unknown>) => log('warn', message, data),
  error: (message: string, data?: Record<string, unknown>) => log('error', message, data),
}
