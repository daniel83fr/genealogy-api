
const dateFormat = () => new Date(Date.now()).toISOString();

export default class LoggerService {
  cls: string;

  constructor(cls: string) {
    this.cls = cls;
  }

  private logToConsole(message: string, level: string) {
    console.log(`${dateFormat()} - ${this.cls} - ${level} - ${message}`);
  }

  info(message: string) {
    this.logToConsole(message, 'info');
  }

  debug(message: string, obj: any = null) {
    this.logToConsole(`${message} ${JSON.stringify(obj)}`, 'debug');
  }

  error(message: string, obj: any = null) {
    this.logToConsole(`${message} ${JSON.stringify(obj)}`, 'error');
  }
}
