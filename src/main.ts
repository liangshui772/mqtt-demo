import { DataGenerator } from "./dataGenerator";
import { MQTTClient } from "./mqttClient";
import { RedisFlightWindow } from "./redisWindow";
import config from "./config";
import * as readline from "readline";

class Application {
  private generator = new DataGenerator(config.generator.pointCount);
  private mqtt = new MQTTClient();
  private flightWindow = new RedisFlightWindow();
  private isRunning = true;

  constructor() {
    this.startDataFlow();
    this.startWindowProcessing();
    this.setupUI();
  }

  private startDataFlow() {
    setInterval(async () => {
      const data = this.generator.generate();
      
      if (this.mqtt.connected) {
        const success = await this.mqtt.publish(data);
        if (!success) {
          await this.flightWindow.push(data);
          console.log("💾 Saved to flight window:", data.id);
        }
      } else {
        await this.flightWindow.push(data);
        console.log("🔌 Offline - saved to flight window:", data.id);
      }
    }, config.generator.intervalMs);
  }

  private startWindowProcessing() {
    setInterval(async () => {
      if (!this.mqtt.connected) return;

      const data = await this.flightWindow.pop();
      if (data) {
        const success = await this.mqtt.publish(data);
        if (!success) {
          await this.flightWindow.push(data);
        } else {
          console.log("🔄 Resent from window:", data.id);
        }
      }
    }, 1000);
  }

  private setupUI() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("\nCommands:");
    console.log("  logs - Open logs in nano");
    console.log("  exit - Stop the application\n");

    rl.on("line", (input: string) => {
      if (input === "logs") {
        this.mqtt.openLogs();
      } else if (input === "exit") {
        this.shutdown();
      }
    });
  }

  private shutdown() {
    this.isRunning = false;
    console.log("🛑 Shutting down...");
    process.exit(0);
  }
}

new Application();