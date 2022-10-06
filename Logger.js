import winston from "winston";
import path from "path";
import url from "url";
import util from "util";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enumerateErrorFormat = winston.format(info => {
  if (info.message instanceof Error) {
    info.message = Object.assign({
      message: info.message.message,
      stack: info.message.stack
    }, info.message);
  }

  if (info instanceof Error) {
    return Object.assign({
      message: info.message,
      stack: info.stack
    }, info);
  }

  return info;
});

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.combine(
    enumerateErrorFormat(),
    {
      transform: (info) => {
        const args = [info.message, ...(info[Symbol.for('splat')] || [])];
        info.message = args;

        const msg = args.map(arg => {
          if (typeof arg == 'object')
            return util.inspect(arg, { compact: true, depth: Infinity });
          return arg;
        }).join(' ');

        info[Symbol.for('message')] = `${info[Symbol.for('level')]}: ${msg}${info.stack ? ' ' + info.stack : ''}`;

        return info;
      }
    }
  )
});

logger.add(new winston.transports.Console());
logger.add(new winston.transports.File({ filename: "./logs.txt" }));

export default logger;