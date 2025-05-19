// js/strainNamer.js
import { getRandomElement, getRandomInt } from './utils.js';
import { NAME_PARTS } from './config.js'; // Assumes NAME_PARTS is correctly defined in config.js
import * as logger from './logger.js'; // Import the logger

export function generateStrainName(TRAIT_DEFINITIONS, parent1Name = null, parent2Name = null) {
    // logger.verbose('strainNamer', `Generating strain name. P1: ${parent1Name}, P2: ${parent2Name}`);

    if (!TRAIT_DEFINITIONS || !TRAIT_DEFINITIONS.categorical_traits) {
        logger.error('strainNamer', "TRAIT_DEFINITIONS or categorical_traits missing. Cannot reliably generate terpene-based names.");
        // Fallback to a very generic name if critical data is missing
        return "Mystery Bud";
    }
    
    const p1Words = parent1Name ? parent1Name.split(' ') : [];
    const p2Words = parent2Name ? parent2Name.split(' ') : [];
    
    const primaryTerpeneTraitDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === 'primaryTerpene');
    const primaryTerpeneValues = primaryTerpeneTraitDef?.values || ['UnknownTerp']; // Fallback if not found

    let name = "";
    const nameTypeChance = Math.random();

    // Check if NAME_PARTS and specific lists are defined and not empty before using them
    const hasExclamations = NAME_PARTS.EXCLAMATIONS_FULL_NAMES && NAME_PARTS.EXCLAMATIONS_FULL_NAMES.length > 0;
    const hasFunnyPrefixes = NAME_PARTS.FUNNY_PREFIXES && NAME_PARTS.FUNNY_PREFIXES.length > 0;
    const hasEdgyNouns = NAME_PARTS.EDGY_NOUNS && NAME_PARTS.EDGY_NOUNS.length > 0;
    const hasStandardNouns = NAME_PARTS.NOUNS && NAME_PARTS.NOUNS.length > 0;
    const hasBodyParts = NAME_PARTS.BODY_PARTS_HUMOROUS && NAME_PARTS.BODY_PARTS_HUMOROUS.length > 0;
    const hasActions = NAME_PARTS.ACTIONS_HUMOROUS && NAME_PARTS.ACTIONS_HUMOROUS.length > 0;
    const hasEdgyAdjectives = NAME_PARTS.EDGY_ADJECTIVES && NAME_PARTS.EDGY_ADJECTIVES.length > 0;
    const hasControversialAdjectives = NAME_PARTS.CONTROVERSIAL_ADJECTIVES && NAME_PARTS.CONTROVERSIAL_ADJECTIVES.length > 0;
    const hasControversialNouns = NAME_PARTS.CONTROVERSIAL_NOUNS && NAME_PARTS.CONTROVERSIAL_NOUNS.length > 0;
    const hasStandardAdjectives = NAME_PARTS.ADJECTIVES && NAME_PARTS.ADJECTIVES.length > 0;
    const hasConnectors = NAME_PARTS.CONNECTORS && NAME_PARTS.CONNECTORS.length > 0;


    if (nameTypeChance < 0.20 && hasExclamations) {
        name = getRandomElement(NAME_PARTS.EXCLAMATIONS_FULL_NAMES);
        // logger.debug('strainNamer', "Pattern: Exclamation", name);
    } else if (nameTypeChance < 0.40 && hasFunnyPrefixes && (hasEdgyNouns || hasStandardNouns)) {
        const prefix = getRandomElement(NAME_PARTS.FUNNY_PREFIXES);
        const nounChoice = (Math.random() < 0.5 && hasEdgyNouns) ? NAME_PARTS.EDGY_NOUNS : (hasStandardNouns ? NAME_PARTS.NOUNS : NAME_PARTS.EDGY_NOUNS); // Ensure a choice is made
        const noun = getRandomElement(nounChoice);
        if (prefix && noun) name = `${prefix} ${noun}`;
        // logger.debug('strainNamer', "Pattern: FunnyPrefix + Noun", name);
    } else if (nameTypeChance < 0.55 && hasBodyParts && hasActions) {
        const part = getRandomElement(NAME_PARTS.BODY_PARTS_HUMOROUS);
        const action = getRandomElement(NAME_PARTS.ACTIONS_HUMOROUS);
        if (part && action) name = `${part} ${action}`;
        // logger.debug('strainNamer', "Pattern: BodyPart + Action", name);
    } else if (nameTypeChance < 0.70 && hasEdgyAdjectives && hasEdgyNouns) {
        const adj = getRandomElement(NAME_PARTS.EDGY_ADJECTIVES);
        const noun = getRandomElement(NAME_PARTS.EDGY_NOUNS);
        if (adj && noun) name = `${adj} ${noun}`;
        // logger.debug('strainNamer', "Pattern: EdgyAdj + EdgyNoun", name);
    } else if (nameTypeChance < 0.75 && hasControversialAdjectives && hasControversialNouns && Math.random() < 0.3) { // Reduced chance for controversial
        const adj = getRandomElement(NAME_PARTS.CONTROVERSIAL_ADJECTIVES);
        const noun = getRandomElement(NAME_PARTS.CONTROVERSIAL_NOUNS);
        if (adj && noun) name = `${adj} ${noun}`;
        // logger.debug('strainNamer', "Pattern: Controversial", name);
    }
    else { 
        // logger.debug('strainNamer', "Pattern: Default/Standard");
        const type = getRandomInt(1, 4); 
        switch (type) {
            case 1: 
                if (p1Words.length > 0 && p2Words.length > 0) {
                    const w1 = p1Words[getRandomInt(0, p1Words.length - 1)];
                    const w2 = p2Words[getRandomInt(0, p2Words.length - 1)];
                    if (w1 && w2 && w1.toLowerCase() !== w2.toLowerCase() && w1.length > 2 && w2.length > 2) {
                        name = `${w1} ${w2}`;
                        break;
                    }
                } 
            case 2: 
                let terpName = getRandomElement(primaryTerpeneValues);
                if (terpName && terpName.endsWith('ene')) terpName = terpName.slice(0, -3);
                const nounForTerp = hasStandardNouns ? getRandomElement(NAME_PARTS.NOUNS) : "Bud";
                if (terpName && nounForTerp) name = `${terpName} ${nounForTerp}`;
                break;
            case 3: 
                if (hasStandardAdjectives && hasStandardNouns) {
                    name = `${getRandomElement(NAME_PARTS.ADJECTIVES)} ${getRandomElement(NAME_PARTS.NOUNS)}`;
                }
                break;
            case 4: 
                if (hasStandardAdjectives && hasConnectors) {
                    name = `${getRandomElement(NAME_PARTS.ADJECTIVES)} ${getRandomElement(NAME_PARTS.CONNECTORS)}`;
                }
                break;
        }
    }

    if (!name || name.trim() === "" || name.trim().length < 3) {
        logger.warn('strainNamer', "Generated name was empty or too short, applying fallback.");
        if (hasStandardAdjectives && hasStandardNouns) {
            name = `${getRandomElement(NAME_PARTS.ADJECTIVES)} ${getRandomElement(NAME_PARTS.NOUNS)}`;
        } else if (hasStandardAdjectives) {
            name = `${getRandomElement(NAME_PARTS.ADJECTIVES)} Kush`; // Absolute fallback
        } else if (hasStandardNouns) {
            name = `Super ${getRandomElement(NAME_PARTS.NOUNS)}`; // Absolute fallback
        } else {
            name = "Original Haze"; // Ultimate fallback
        }
    }
    
    const finalName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // logger.info('strainNamer', `Final generated name: ${finalName}`);
    return finalName;
}