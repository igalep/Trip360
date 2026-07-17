/**
 * A simple logger utility that includes the file name and line number of the caller.
 */
export const logger = {
  getCallerInfo() {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown';
      const lines = stack.split('\n');

      // Find the first line that is NOT this file and NOT the internal Error line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Skip the logger itself and internal stack frames
        if (line.includes('logger.ts') || line.includes('getCallerInfo') || line.includes('Error'))
          continue;

        // Match patterns like:
        // at Object.fetchData (usePortfolio.ts:117:15)
        // at http://localhost:3000/src/hooks/usePortfolio.ts?t=123:117:15
        // at /app/server.ts:40:13
        const match = line.match(/(?:at\s+)?(?:.*\s+)?\(?(.+?):(\d+):(\d+)\)?$/);
        if (match) {
          let file = match[1];
          const lineNumber = match[2];

          // Clean up file path (remove URL params, get only filename)
          if (file.includes('?')) file = file.split('?')[0];
          const fileName = file.split('/').pop() || file;
          return `${fileName}:${lineNumber}`;
        }
      }
    } catch (e) {
      // Fallback if stack parsing fails
    }
    return 'unknown';
  },

  log(message: string, ...args: any[]) {
    console.log(`[${this.getCallerInfo()}] ${message}`, ...args);
  },

  error(message: string, ...args: any[]) {
    console.error(`[${this.getCallerInfo()}] ERROR: ${message}`, ...args);
  },

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.getCallerInfo()}] WARN: ${message}`, ...args);
  },

  info(message: string, ...args: any[]) {
    console.info(`[${this.getCallerInfo()}] INFO: ${message}`, ...args);
  },

  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${this.getCallerInfo()}] DEBUG: ${message}`, ...args);
    }
  },

  animation(message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const blue = '\x1b[34m';
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';

    console.log(`\n${bold}${cyan}--------------------------------------------------${reset}`);
    console.log(`${bold}${blue}[${timestamp}]${reset} ${bold}${green}🚀 ${message}${reset}`);
    console.log(`${bold}${cyan}--------------------------------------------------${reset}\n`);
  },
};
