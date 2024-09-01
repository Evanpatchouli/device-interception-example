const appConfig = {
  name: "device-interception",
  host: "127.0.0.1",
  port: 30016,
  protocol: "http",
  serverPath() {
    return `${this.protocol}://${this.host}:${this.port}`
  },
  apiPath() {
    return `${this.serverPath()}/api`
  },
  monitor: {
    path: "monitor"
  },
  monitorPath() {
    return `${this.serverPath()}/${this.monitor.path}`
  },
  socketioPath() {
    return `${this.serverPath()}/socket.io/`
  },
  client: {
    monitor: {
      name: "web-monitor",
      id: "1"
    }
  }
}

export default appConfig;