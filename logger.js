const logLevel = process.env.LOG_LEVEL || 'info';

const levels = {
  'error': 0,
  'warn': 1,
  'info': 2,
  'debug': 3
};

function log(level, message) {
  if (levels[level] <= levels[logLevel]) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

module.exports = {
  error: (message) => log('error', message),
  warn: (message) => log('warn', message),
  info: (message) => log('info', message),
  debug: (message) => log('debug', message)
};
