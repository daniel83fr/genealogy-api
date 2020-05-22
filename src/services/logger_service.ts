
const dateFormat = () => {
  return new Date(Date.now()).toUTCString()
}

export class LoggerService {
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

  debug(message: string, obj: any) {
    this.logToConsole(message, 'debug');
  }

  error(message: string, obj: any) {
    this.logToConsole(message, 'error');
  }
}
