
const dateFormat = () => new Date(Date.now()).toISOString();

export default class LoggerService {
  cls: string;

  mode: string;

  constructor(cls: string, mode: string = '') {
    this.cls = cls;
    this.mode = mode;
  }

  private logToConsole(message: string, level: string) {
    console.log(`${dateFormat()} - ${this.cls} - ${level} - ${message}`);
  }

  info(message: string, obj: any = null) {
    this.logToConsole(`${message} ${obj == null ? '' : JSON.stringify(obj)}`, 'info');
  }

  debug(message: string, obj: any = null) {
    if (this.mode === 'debug') {
      this.logToConsole(`${message} ${obj == null ? '' : JSON.stringify(obj)}`, 'debug');
    }
  }

  error(message: string, obj: any = null) {
    this.logToConsole(`${message} ${obj == null ? '' : JSON.stringify(obj)}`, 'error');
  }
}
