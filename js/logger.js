// js/logger.js

// Define log levels
export const LOG_LEVELS = {
    NONE: 0,    // No logs
    ERROR: 1,   // Only errors
    WARN: 2,    // Errors and warnings
    INFO: 3,    // Errors, warnings, and informational messages
    DEBUG: 4,   // Includes debug messages (more verbose)
    VERBOSE: 5, // Includes all messages, including very detailed ones
};

// Set the default log level. This can be changed by calling setLogLevel().
// For development, DEBUG or VERBOSE is good. For production, INFO or WARN.
let currentLogLevel = LOG_LEVELS.DEBUG; 
// To easily change during development without editing this file, you could do:
// In main.js: import { setLogLevel, LOG_LEVELS } from './logger.js'; setLogLevel(LOG_LEVELS.VERBOSE);
// Or even in the browser console: gameLogger.setLogLevel(gameLogger.LOG_LEVELS.VERBOSE) (if logger is exposed globally)

/**
 * Sets the current logging level for the application.
 * @param {string | number} levelNameOrValue - The name of the log level (e.g., "INFO", "DEBUG") or its numerical value.
 */
export function setLogLevel(levelNameOrValue) {
    const oldLevel = currentLogLevel;
    if (typeof levelNameOrValue === 'string') {
        const levelKey = levelNameOrValue.toUpperCase();
        if (LOG_LEVELS.hasOwnProperty(levelKey)) {
            currentLogLevel = LOG_LEVELS[levelKey];
        } else {
            console.warn(`[Logger] Unknown log level name: "${levelNameOrValue}". Level not changed.`);
            return;
        }
    } else if (typeof levelNameOrValue === 'number') {
        if (Object.values(LOG_LEVELS).includes(levelNameOrValue)) {
            currentLogLevel = levelNameOrValue;
        } else {
            console.warn(`[Logger] Unknown log level value: "${levelNameOrValue}". Level not changed.`);
            return;
        }
    } else {
        console.warn(`[Logger] Invalid type for log level: "${typeof levelNameOrValue}". Level not changed.`);
        return;
    }

    // Log the level change itself, but only if the new level allows for INFO or higher
    // and the old level wasn't NONE (to avoid logging if logging was off).
    if (currentLogLevel >= LOG_LEVELS.INFO && oldLevel !== LOG_LEVELS.NONE) {
        // Temporarily set to INFO to ensure this message gets logged if currentLogLevel is lower
        const tempOldLevel = currentLogLevel;
        currentLogLevel = LOG_LEVELS.INFO; 
        info('Logger', `Log level changed to ${Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === tempOldLevel)} (${tempOldLevel})`);
        currentLogLevel = tempOldLevel; // Restore actual new level
    }
}

/**
 * Gets the current logging level's numerical value.
 * @returns {number} The current log level.
 */
export function getCurrentLogLevel() {
    return currentLogLevel;
}

function getTimestamp() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
}

/**
 * Formats the log message with timestamp and module name.
 * @param {string} levelTag - e.g., "ERROR", "INFO"
 * @param {string} moduleName - The name of the module/source of the log.
 * @param {any[]} messages - The messages to log.
 * @returns {any[]} Array of arguments to pass to console functions.
 */
function formatMessage(levelTag, moduleName, messages) {
    const prefix = `[${getTimestamp()}] [${levelTag}]${moduleName ? ` [${moduleName}]` : ''}`;
    return [prefix, ...messages];
}

/**
 * Logs an error message.
 * @param {string} moduleName - Optional: The name of the module originating the log.
 * @param {...any} messages - The messages to log.
 */
export function error(moduleName, ...messages) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
        if (typeof moduleName !== 'string') { // If moduleName is omitted, messages start directly
            messages.unshift(moduleName); // moduleName was actually the first message
            console.error(...formatMessage("ERROR", null, messages));
        } else {
            console.error(...formatMessage("ERROR", moduleName, messages));
        }
    }
}

/**
 * Logs a warning message.
 * @param {string} moduleName - Optional: The name of the module originating the log.
 * @param {...any} messages - The messages to log.
 */
export function warn(moduleName, ...messages) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
         if (typeof moduleName !== 'string') {
            messages.unshift(moduleName);
            console.warn(...formatMessage("WARN", null, messages));
        } else {
            console.warn(...formatMessage("WARN", moduleName, messages));
        }
    }
}

/**
 * Logs an informational message.
 * @param {string} moduleName - Optional: The name of the module originating the log.
 * @param {...any} messages - The messages to log.
 */
export function info(moduleName, ...messages) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
         if (typeof moduleName !== 'string') {
            messages.unshift(moduleName);
            console.log(...formatMessage("INFO", null, messages)); // console.log for info
        } else {
            console.log(...formatMessage("INFO", moduleName, messages));
        }
    }
}

/**
 * Logs a debug message.
 * @param {string} moduleName - Optional: The name of the module originating the log.
 * @param {...any} messages - The messages to log.
 */
export function debug(moduleName, ...messages) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
         if (typeof moduleName !== 'string') {
            messages.unshift(moduleName);
            console.debug(...formatMessage("DEBUG", null, messages));
        } else {
            console.debug(...formatMessage("DEBUG", moduleName, messages));
        }
    }
}

/**
 * Logs a verbose message (most detailed).
 * @param {string} moduleName - Optional: The name of the module originating the log.
 * @param {...any} messages - The messages to log.
 */
export function verbose(moduleName, ...messages) {
    if (currentLogLevel >= LOG_LEVELS.VERBOSE) {
         if (typeof moduleName !== 'string') {
            messages.unshift(moduleName);
            // console.trace(...formatMessage("VERBOSE", null, messages)); // Using console.trace for VERBOSE can give stack
            console.log(...formatMessage("VERBOSE", null, messages)); // Or just console.log
        } else {
            // console.trace(...formatMessage("VERBOSE", moduleName, messages));
            console.log(...formatMessage("VERBOSE", moduleName, messages));
        }
    }
}

// Example of a convenience group logger
/**
 * Starts a collapsed console group for debugging.
 * @param {string} moduleName - Optional: Module name.
 * @param {string} groupName - The name for the console group.
 */
export function groupStart(moduleName, groupName) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) { // Or a specific level for groups
        if (typeof moduleName !== 'string') {
            groupName = moduleName; // moduleName was actually the groupName
             console.groupCollapsed(`[${getTimestamp()}] [GROUP] ${groupName}`);
        } else {
            console.groupCollapsed(`[${getTimestamp()}] [GROUP] [${moduleName}] ${groupName}`);
        }
    }
}

/**
 * Ends the current console group.
 */
export function groupEnd() {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
        console.groupEnd();
    }
}


// Self-log initialization (optional, good for seeing if logger itself loads)
// This will only show if default currentLogLevel is INFO or higher.
// To ensure it shows, we can temporarily set level high.
const initialInternalLogLevel = currentLogLevel;
currentLogLevel = LOG_LEVELS.INFO;
info('Logger', 'Logger initialized. Default log level:', Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === initialInternalLogLevel));
currentLogLevel = initialInternalLogLevel; // Restore default