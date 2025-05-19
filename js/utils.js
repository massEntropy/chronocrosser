// js/utils.js

/**
 * Generates a random floating-point number between min (inclusive) and max (exclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random float.
 */
export function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Selects a random element from an array.
 * @param {Array<any>} arr - The array to select from.
 * @returns {any | undefined} A random element from the array, or undefined if the array is empty.
 */
export function getRandomElement(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Clamps a value between a minimum and maximum.
 * Parses inputs to floats for more robust comparison.
 * @param {number | string} value - The value to clamp.
 * @param {number | string} min - The minimum boundary.
 * @param {number | string} max - The maximum boundary.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
    const numVal = parseFloat(value);
    const numMin = parseFloat(min);
    const numMax = parseFloat(max);

    if (isNaN(numVal)) { 
        // If value is not a number, try to return min or max if they are numbers, otherwise 0
        return !isNaN(numMin) ? numMin : (!isNaN(numMax) ? numMax : 0);
    }
    // Ensure min and max are numbers for comparison, or use value if they are not
    const effectiveMin = isNaN(numMin) ? numVal : numMin;
    const effectiveMax = isNaN(numMax) ? numVal : numMax;
    
    return Math.max(effectiveMin, Math.min(numVal, effectiveMax));
}

/**
 * Darkens a color string (hex or named common colors).
 * @param {string} colorStr - The color string (e.g., '#FF0000' or 'Green').
 * @param {number} percent - The percentage to darken by (0-100).
 * @returns {string} The darkened color string.
 */
export function darkenColor(colorStr, percent) {
    if (!colorStr) return 'DarkSlateGray'; // Fallback for undefined color
    if (colorStr.startsWith('#')) {
        let num = parseInt(colorStr.slice(1), 16), 
            amt = Math.round(2.55 * percent),
            R = (num >> 16) - amt, 
            G = (num >> 8 & 0x00FF) - amt, 
            B = (num & 0x0000FF) - amt;
        R = R < 0 ? 0 : R; 
        G = G < 0 ? 0 : G; 
        B = B < 0 ? 0 : B; 
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    // For named colors, use a predefined darker shade or a generic dark color
    const predefinedDarker = {
        'Green': 'DarkGreen', 'LightGreen': 'Green', 'DarkGreen': '#004d00',
        'Purple': 'DarkSlateBlue', 'PinkishPurple': 'Indigo', 'YellowGreen': 'OliveDrab',
        'Orange': 'DarkOrange', 'White': 'Gainsboro', 'Red': 'DarkRed', 
        'Pink':'DeepPink', 'Yellow': 'GoldenRod', 'LightPurple': 'MediumPurple', 
        'DeepOrange': '#E65100', 'Cyan': '#008B8B' // Added cyan for neon theme
    };
    return predefinedDarker[colorStr] || darkenColor('#CCCCCC', percent); // Fallback to darkening grey
}

/**
 * Lightens a color string (hex or named common colors). Very basic.
 * @param {string} colorStr - The color string.
 * @param {number} percent - The percentage to lighten by (0-100).
 * @returns {string} The lightened color string.
 */
export function lightenColor(colorStr, percent) {
    if (!colorStr) return 'lightgreen';
    if (colorStr.startsWith('#')) {
        let num = parseInt(colorStr.slice(1), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        R = R > 255 ? 255 : R;
        G = G > 255 ? 255 : G;
        B = B > 255 ? 255 : B;
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    const predefinedLighter = {
        'Green': '#90EE90', 'LightGreen': '#98FB98', 'DarkGreen': '#00AA00', // Brighter dark green
        'Purple': '#DDA0DD', 'PinkishPurple': '#C71585', // MediumVioletRed as lighter Indigo
        'YellowGreen': '#ADFF2F', 'Orange': '#FFA500', 'White': '#FFFFFF',
        'Red': '#FF6347', 'Pink':'#FFB6C1', 'Yellow': '#FFFFE0', 
        'LightPurple': '#E6E6FA', 'DeepOrange': '#FF8C00', 'Cyan': '#7FFFD4' // Aquamarine
    };
    return predefinedLighter[colorStr] || lightenColor('#666666', percent); // Fallback to lightening grey
}