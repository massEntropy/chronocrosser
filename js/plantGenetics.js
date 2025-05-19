// js/plantGenetics.js
import { getRandom, clamp, getRandomElement } from './utils.js';
import * as logger from './logger.js'; // Import the logger

export function inheritNumericalTrait(p1Val, p2Val, traitDef, TRAIT_DEFINITIONS_CONSTANTS) {
    // logger.verbose('plantGenetics', `Inheriting numerical trait: ${traitDef.id}`);
    if (typeof p1Val !== 'number' || typeof p2Val !== 'number') {
        logger.warn('plantGenetics', `Non-numeric parent value for ${traitDef.id}. P1: ${p1Val}, P2: ${p2Val}. Using defaults/fallbacks.`);
        p1Val = typeof p1Val === 'number' ? p1Val : traitDef.min;
        p2Val = typeof p2Val === 'number' ? p2Val : traitDef.min;
    }
    if (!TRAIT_DEFINITIONS_CONSTANTS || TRAIT_DEFINITIONS_CONSTANTS.NUMERICAL_MUTATION_FACTOR === undefined) {
        logger.error('plantGenetics', `NUMERICAL_MUTATION_FACTOR missing from constants for trait ${traitDef.id}. Using default 0.1.`);
        TRAIT_DEFINITIONS_CONSTANTS = { ...TRAIT_DEFINITIONS_CONSTANTS, NUMERICAL_MUTATION_FACTOR: 0.1 };
    }

    let offspringVal = (p1Val + p2Val) / 2 * (1 + (Math.random() - 0.5) * TRAIT_DEFINITIONS_CONSTANTS.NUMERICAL_MUTATION_FACTOR);
    const clampedVal = clamp(offspringVal, traitDef.min, traitDef.max);
    // logger.verbose('plantGenetics', `${traitDef.id} - P1: ${p1Val.toFixed(2)}, P2: ${p2Val.toFixed(2)}, AvgMut: ${offspringVal.toFixed(2)}, Clamped: ${clampedVal.toFixed(2)}`);
    return clampedVal;
}

export function inheritCategoricalTrait(p1Val, p2Val, traitDef, TRAIT_DEFINITIONS_CONSTANTS, currentPlant = null) {
    // logger.verbose('plantGenetics', `Inheriting categorical trait: ${traitDef.id}`);
    if (!TRAIT_DEFINITIONS_CONSTANTS || TRAIT_DEFINITIONS_CONSTANTS.CATEGORICAL_MUTATION_CHANCE === undefined) {
        logger.error('plantGenetics', `CATEGORICAL_MUTATION_CHANCE missing from constants for trait ${traitDef.id}. Using default 0.05.`);
        TRAIT_DEFINITIONS_CONSTANTS = { ...TRAIT_DEFINITIONS_CONSTANTS, CATEGORICAL_MUTATION_CHANCE: 0.05 };
    }

    let inheritedValue;
    if (Math.random() < TRAIT_DEFINITIONS_CONSTANTS.CATEGORICAL_MUTATION_CHANCE || (traitDef.id === 'secondaryTerpene' && Math.random() < 0.2)) {
        const possibleValues = traitDef.values.filter(v => currentPlant && traitDef.id === 'secondaryTerpene' ? v !== currentPlant.primaryTerpene : true);
        inheritedValue = getRandomElement(possibleValues.length > 0 ? possibleValues : traitDef.values); // Fallback to full list if filter is empty
        // logger.debug('plantGenetics', `${traitDef.id} - Mutated to: ${inheritedValue}`);
    } else {
        inheritedValue = Math.random() < 0.5 ? p1Val : p2Val;
        // logger.verbose('plantGenetics', `${traitDef.id} - Inherited from parent: ${inheritedValue}`);
    }
    return inheritedValue;
}

export function inheritAlleles(p1Alleles, p2Alleles, traitDef, TRAIT_DEFINITIONS_CONSTANTS) {
    // logger.verbose('plantGenetics', `Inheriting alleles for trait: ${traitDef.id}`);
    if (!Array.isArray(p1Alleles) || p1Alleles.length !== 2 || !Array.isArray(p2Alleles) || p2Alleles.length !== 2) {
        logger.warn('plantGenetics', `Invalid parent alleles for trait ${traitDef.id}: P1: ${p1Alleles}, P2: ${p2Alleles}. Initializing new alleles as fallback.`);
        return initializeAllelesForLandrace(traitDef, TRAIT_DEFINITIONS_CONSTANTS);
    }

    let allele1FromP1 = getRandomElement(p1Alleles);
    let allele2FromP2 = getRandomElement(p2Alleles);

    let recessiveAlleleSymbol = "";
    let dominantAlleleSymbol = traitDef.dominant_allele; 

    if (traitDef.alleles) {
        for (const key in traitDef.alleles) {
            if (traitDef.alleles[key] !== dominantAlleleSymbol) {
                recessiveAlleleSymbol = traitDef.alleles[key];
                break;
            }
        }
        if (!recessiveAlleleSymbol && Object.values(traitDef.alleles).length > 0) { 
            const alleleValues = Object.values(traitDef.alleles);
            recessiveAlleleSymbol = alleleValues.find(val => val !== dominantAlleleSymbol) || alleleValues[0];
            if (recessiveAlleleSymbol === dominantAlleleSymbol && alleleValues.length > 1) { // If first was dominant, try finding another
                recessiveAlleleSymbol = alleleValues.find(val => val !== dominantAlleleSymbol && val !== alleleValues[0]) || alleleValues[1] || alleleValues[0];
            }
        }
    }
    if (!recessiveAlleleSymbol) { 
        logger.error('plantGenetics', `Could not determine recessive allele for ${traitDef.id}. Defaulting to dominant for safety. Alleles:`, traitDef.alleles, `Dominant: ${dominantAlleleSymbol}`);
        recessiveAlleleSymbol = dominantAlleleSymbol; // Safety fallback, though indicates config issue
    }


    const mutationChance = traitDef.mutation_to_recessive_chance || traitDef.mutation_chance || 0.01; 

    if (Math.random() < mutationChance) {
        const original = allele1FromP1;
        allele1FromP1 = (allele1FromP1 === dominantAlleleSymbol) ? recessiveAlleleSymbol : dominantAlleleSymbol;
        // logger.debug('plantGenetics', `${traitDef.id} - Allele 1 mutated from ${original} to ${allele1FromP1}`);
    }
    if (Math.random() < mutationChance) {
        const original = allele2FromP2;
        allele2FromP2 = (allele2FromP2 === dominantAlleleSymbol) ? recessiveAlleleSymbol : dominantAlleleSymbol;
        // logger.debug('plantGenetics', `${traitDef.id} - Allele 2 mutated from ${original} to ${allele2FromP2}`);
    }
    
    const finalAlleles = [allele1FromP1, allele2FromP2].sort();
    // logger.verbose('plantGenetics', `${traitDef.id} - Final alleles: ${finalAlleles.join('')}`);
    return finalAlleles;
}

export function initializeAllelesForLandrace(traitDef, TRAIT_DEFINITIONS_CONSTANTS) {
    // logger.verbose('plantGenetics', `Initializing landrace alleles for trait: ${traitDef.id}`);
    const alleles = [];
    
    let recessiveAlleleSymbol = "";
    let dominantAlleleSymbol = traitDef.dominant_allele;

    if (traitDef.alleles) {
        for (const key in traitDef.alleles) {
            if (traitDef.alleles[key] !== dominantAlleleSymbol) {
                recessiveAlleleSymbol = traitDef.alleles[key];
                break;
            }
        }
         if (!recessiveAlleleSymbol && Object.values(traitDef.alleles).length > 0) {
            const alleleValues = Object.values(traitDef.alleles);
            recessiveAlleleSymbol = alleleValues.find(val => val !== dominantAlleleSymbol) || alleleValues[0];
             if (recessiveAlleleSymbol === dominantAlleleSymbol && alleleValues.length > 1) {
                recessiveAlleleSymbol = alleleValues.find(val => val !== dominantAlleleSymbol && val !== alleleValues[0]) || alleleValues[1] || alleleValues[0];
            }
        }
    } 
    if (!recessiveAlleleSymbol) {
        logger.error('plantGenetics', `Could not determine recessive allele for landrace ${traitDef.id}. Defaulting to dominant. Alleles:`, traitDef.alleles, `Dominant: ${dominantAlleleSymbol}`);
        recessiveAlleleSymbol = dominantAlleleSymbol;
    }

    const initialRecessiveChance = traitDef.initial_recessive_allele_chance === undefined ? 0.25 : traitDef.initial_recessive_allele_chance;

    for (let i = 0; i < 2; i++) {
        alleles.push(
            Math.random() < initialRecessiveChance ?
            recessiveAlleleSymbol :
            dominantAlleleSymbol
        );
    }
    const finalAlleles = alleles.sort();
    // logger.verbose('plantGenetics', `${traitDef.id} - Initial landrace alleles: ${finalAlleles.join('')}`);
    return finalAlleles;
}


export function inheritSexChromosomes(parent1SexChromosomes, parent1ExpressedSex, parent2SexChromosomes, parent2ExpressedSex, sexChromosomeGeneDef) {
    // logger.verbose('plantGenetics', `Inheriting sex chromosomes. P1: ${parent1ExpressedSex} (${parent1SexChromosomes}), P2: ${parent2ExpressedSex} (${parent2SexChromosomes})`);
    let p1Gamete, p2Gamete;

    if (!parent1SexChromosomes || !parent2SexChromosomes || !sexChromosomeGeneDef || !sexChromosomeGeneDef.alleles || !sexChromosomeGeneDef.female_gamete_options || !sexChromosomeGeneDef.male_gamete_options) {
        logger.error('plantGenetics', "Missing data for sex chromosome inheritance. Defaulting sex determination.");
        return Math.random() < 0.5 ? 
               [sexChromosomeGeneDef?.alleles?.female_determining || 'X', sexChromosomeGeneDef?.alleles?.female_determining || 'X'] :
               [sexChromosomeGeneDef?.alleles?.female_determining || 'X', sexChromosomeGeneDef?.alleles?.male_determining || 'Y'].sort((a,b)=> a > b ? 1 : -1);
    }

    if (parent1ExpressedSex === 'Female') {
        p1Gamete = getRandomElement(sexChromosomeGeneDef.female_gamete_options);
    } else if (parent1ExpressedSex === 'Male') {
        p1Gamete = getRandomElement(sexChromosomeGeneDef.male_gamete_options);
    } else { 
        logger.warn('plantGenetics', `Parent 1 has unexpected sex: ${parent1ExpressedSex}. Determining gamete based on chromosomes.`);
        p1Gamete = parent1SexChromosomes.includes(sexChromosomeGeneDef.alleles.male_determining) ? 
                   getRandomElement(sexChromosomeGeneDef.male_gamete_options) : 
                   getRandomElement(sexChromosomeGeneDef.female_gamete_options);
    }

    if (parent2ExpressedSex === 'Female') {
        p2Gamete = getRandomElement(sexChromosomeGeneDef.female_gamete_options);
    } else if (parent2ExpressedSex === 'Male') {
        p2Gamete = getRandomElement(sexChromosomeGeneDef.male_gamete_options);
    } else {
        logger.warn('plantGenetics', `Parent 2 has unexpected sex: ${parent2ExpressedSex}. Determining gamete based on chromosomes.`);
        p2Gamete = parent2SexChromosomes.includes(sexChromosomeGeneDef.alleles.male_determining) ? 
                   getRandomElement(sexChromosomeGeneDef.male_gamete_options) : 
                   getRandomElement(sexChromosomeGeneDef.female_gamete_options);
    }
    
    const finalChromosomes = [p1Gamete, p2Gamete].sort((a, b) => {
        if (a === sexChromosomeGeneDef.alleles.male_determining && b !== sexChromosomeGeneDef.alleles.male_determining) return 1;
        if (b === sexChromosomeGeneDef.alleles.male_determining && a !== sexChromosomeGeneDef.alleles.male_determining) return -1;
        return 0; 
    });
    // logger.verbose('plantGenetics', `Offspring sex chromosomes: ${finalChromosomes.join('')}`);
    return finalChromosomes;
}

export function determineExpressedSex(sexChromosomesArray, sexChromosomeGeneDef) {
    // logger.verbose('plantGenetics', `Determining expressed sex for chromosomes: ${sexChromosomesArray}`);
    if (!sexChromosomesArray || sexChromosomesArray.length !== 2 || !sexChromosomeGeneDef || !sexChromosomeGeneDef.genotypes || !sexChromosomeGeneDef.alleles) {
        logger.warn('plantGenetics', "Invalid input for determining sex:", sexChromosomesArray, sexChromosomeGeneDef);
        return 'Unknown';
    }
    
    const sortedChromosomes = [...sexChromosomesArray].sort((a, b) => {
        if (a === sexChromosomeGeneDef.alleles.male_determining && b !== sexChromosomeGeneDef.alleles.male_determining) return 1;
        if (b === sexChromosomeGeneDef.alleles.male_determining && a !== sexChromosomeGeneDef.alleles.male_determining) return -1;
        return 0;
    });
    
    const femalePattern = sexChromosomeGeneDef.genotypes.female; 
    const malePattern = sexChromosomeGeneDef.genotypes.male;     

    if (femalePattern && malePattern &&
        sortedChromosomes[0] === femalePattern[0] && sortedChromosomes[1] === femalePattern[1]) {
        // logger.verbose('plantGenetics', "Expressed sex: Female");
        return 'Female';
    } else if (femalePattern && malePattern &&
        ((sortedChromosomes[0] === malePattern[0] && sortedChromosomes[1] === malePattern[1]) ||
         (sortedChromosomes[0] === malePattern[1] && sortedChromosomes[1] === malePattern[0])) 
    ) {
        // logger.verbose('plantGenetics', "Expressed sex: Male");
        return 'Male';
    }
    
    logger.warn('plantGenetics', "Could not determine sex for chromosomes:", sexChromosomesArray, "using patterns:", femalePattern, malePattern);
    return 'Unknown'; 
}

export function initializeSexChromosomes(sexChromosomeGeneDef) {
    // logger.verbose('plantGenetics', "Initializing landrace sex chromosomes.");
     if (!sexChromosomeGeneDef || !sexChromosomeGeneDef.alleles || sexChromosomeGeneDef.initial_male_chance === undefined) {
        logger.error('plantGenetics', "Missing data for sex chromosome initialization. Defaulting to Female.");
        return [sexChromosomeGeneDef?.alleles?.female_determining || 'X', sexChromosomeGeneDef?.alleles?.female_determining || 'X'];
    }
    let chromosomes;
    if (Math.random() < sexChromosomeGeneDef.initial_male_chance) {
        chromosomes = [sexChromosomeGeneDef.alleles.female_determining, sexChromosomeGeneDef.alleles.male_determining];
    } else {
        chromosomes = [sexChromosomeGeneDef.alleles.female_determining, sexChromosomeGeneDef.alleles.female_determining];
    }
    const finalChromosomes = chromosomes.sort((a, b) => {
        if (a === sexChromosomeGeneDef.alleles.male_determining && b !== sexChromosomeGeneDef.alleles.male_determining) return 1;
        if (b === sexChromosomeGeneDef.alleles.male_determining && a !== sexChromosomeGeneDef.alleles.male_determining) return -1;
        return 0;
    });
    // logger.verbose('plantGenetics', `Initial landrace sex chromosomes: ${finalChromosomes.join('')}`);
    return finalChromosomes;
}