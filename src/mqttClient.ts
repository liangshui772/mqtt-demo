import * as mqtt from "mqtt";
import type { MqttClient } from "mqtt";
import config from "./config";
import { NanoLogger } from "./nanoLogger";
import { PointData } from "./dataGenerator";

export class MQTTClient {
  private client: MqttClient;
  private nanoLogger = new NanoLogger();
  public connected = false;

  constructor() {
    this.client = mqtt.connect({
      host: config.mqtt.host,
      port: config.mqtt.port,
      clientId: config.mqtt.clientId
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on("connect", () => {
      this.connected = true;
      console.log("🟢 Connected to MQTT broker");
      this.client.subscribe(config.mqtt.topic);
    });

    this.client.on("message", (topic, payload) => {
      const data = payload.toString();
      console.log(`📥 Received from ${topic}:`, data);
      
      // 写入Nano日志文件
      this.nanoLogger.appendData(data);
      
      try {
        const parsed: PointData = JSON.parse(data);
        console.table({
          ID: parsed.id,
          Timestamp: new Date(parsed.timestamp).toISOString(),
          "Data Points": parsed.points.length,
          "First Value": parsed.points[0]
        });
      } catch (err) {
        console.log("Raw Data:", data);
      }
    });

    this.client.on("error", (err) => {
      console.error("❌ MQTT error:", err);
      this.connected = false;
    });
  }

  public async publish(data: PointData): Promise<boolean> {
    const payload = JSON.stringify(data);
    return new Promise((resolve) => {
      this.client.publish(config.mqtt.topic, payload, { qos: 1 }, (err) => {
        if (err) {
          console.error("Publish failed:", data.id);
          resolve(false);
        } else {
          console.log("📤 Published:", data.id);
          resolve(true);
        }
      });
    });
  }

  public openLogs() {
    this.nanoLogger.openInNano();
  }
}