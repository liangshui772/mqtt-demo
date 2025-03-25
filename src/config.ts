export default {
    mqtt: {
      host: "broker.emqx.io",
      port: 1883,
      topic: "sensor/data/points",
      clientId: `client_${Math.random().toString(36).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000
    },
    redis: {
      host: "127.0.0.1",
      port: 6379,
      windowKey: "mqtt:flight:window",
      maxSize: 500
    },
    generator: {
      pointCount: 10,
      intervalMs: 100 // 100ms = 10次/秒
    },
    nano: {
      logFile: "./mqtt_logs.txt" // Nano日志文件路径
    }
  };