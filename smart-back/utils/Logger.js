
class Logger {
    constructor() {
        if (!Logger.instance) {
            Logger.instance = this;
        }
        return Logger.instance;
    }

    log(message) {
        console.log(`[LOG]: ${message}`);
    }

    error(message) {
        console.error(`[ERROR]: ${message}`);
    }
}

const logger = new Logger();
Object.freeze(logger);
module.exports = logger;
