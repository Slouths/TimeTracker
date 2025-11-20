/**
 * Professional logging utility for the TradeTimer mobile app
 * Provides structured logging with appropriate log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, category: string, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') {
      return; // Skip debug logs in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;

    if (data !== undefined) {
      console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, data);
    } else {
      console[level === 'debug' ? 'log' : level](`${prefix} ${message}`);
    }
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, error?: any) {
    this.log('error', category, message, error);
  }
}

export const logger = new Logger();
