export const remoteComponentLogger = {
  info(message: string, ...args: unknown[]) {
    console.log(message, ...args);
  },
  warn(message: string, ...args: unknown[]) {
    console.warn(message, ...args);
  },
  error(message: string, ...args: unknown[]) {
    console.error(message, ...args);
  },
  group(label: string) {
    console.group(label);
  },
  groupEnd() {
    console.groupEnd();
  },
};
