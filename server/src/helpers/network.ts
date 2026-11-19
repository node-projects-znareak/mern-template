import os from "node:os";

export function getLocalIP(): string {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaces of Object.values(networkInterfaces)) {
    for (const config of interfaces ?? []) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "0.0.0.0";
}
