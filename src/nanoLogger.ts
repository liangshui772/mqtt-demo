import * as fs from 'fs';
import * as path from 'path';
import config from './config';

export class NanoLogger {
  private logPath: string;

  constructor() {
    this.logPath = path.resolve(__dirname, '../', config.nano.logFile);
    this.ensureFileExists();
  }

  private ensureFileExists() {
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, "MQTT Data Logs\n================\n");
    }
  }

  public appendData(data: string) {
    fs.appendFileSync(this.logPath, `${new Date().toISOString()} - ${data}\n`);
  }

  public openInNano() {
    const { spawn } = require('child_process');
    spawn('nano', [this.logPath], { 
      stdio: 'inherit',
      shell: true
    });
  }
}