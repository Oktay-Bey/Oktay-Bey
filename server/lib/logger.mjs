const LEVELS = ['debug', 'info', 'warn', 'error'];

function formatMeta(meta) {
  if (!meta) {
    return '';
  }
  try {
    return typeof meta === 'string' ? meta : JSON.stringify(meta);
  } catch (error) {
    return '[unserializable meta]';
  }
}

function log(level, message, meta) {
  const timestamp = new Date().toISOString();
  const formattedMeta = formatMeta(meta);
  const payload = formattedMeta ? `${message} | ${formattedMeta}` : message;
  switch (level) {
    case 'debug':
      console.debug(`[${timestamp}] [DEBUG] ${payload}`);
      break;
    case 'info':
      console.info(`[${timestamp}] [INFO ] ${payload}`);
      break;
    case 'warn':
      console.warn(`[${timestamp}] [WARN ] ${payload}`);
      break;
    case 'error':
      console.error(`[${timestamp}] [ERROR] ${payload}`);
      break;
    default:
      console.log(`[${timestamp}] [LOG  ] ${payload}`);
  }
}

export const logger = LEVELS.reduce((acc, level) => {
  acc[level] = (message, meta) => log(level, message, meta);
  return acc;
}, {});

export default logger;
