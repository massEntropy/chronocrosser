// js/plantFactory.js
import { getRandom, getRandomElement, clamp } from './utils.js';
import { generateStrainName } from './strainNamer.js';
import { 
    inheritNumericalTrait, 
    inheritCategoricalTrait, 
    inheritAlleles, 
    initializeAllelesForLandrace,
    inheritSexChromosomes,
    determineExpressedSex,
    initializeSexChromosomes
} from './plantGenetics.js';
import * as logger from './logger.js'; // Import the logger

let plantIdCounter = 0;

export function createPlant(TRAIT_DEFINITIONS, allPlantsMap, parents = null) {
    const parentNames = parents ? `${parents[0].name} & ${parents[1].name}` : "No (Landrace)";
    logger.debug('plantFactory', `createPlant() called. Parents: ${parentNames}`);
    plantIdCounter++;
    const plant = {
        id: `plant-${plantIdCounter}`,
        genome: {},
        expressedSex: 'Unknown',
        height: 0, width: 0, genetic_yield_potential: 0.5, thc: 0, cbd: 0, // Provide sensible defaults
        calculatedYieldGrams: 0
    };

    if (!TRAIT_DEFINITIONS || 
        !TRAIT_DEFINITIONS.genetic_base_traits || 
        !TRAIT_DEFINITIONS.numerical_traits || 
        !TRAIT_DEFINITIONS.categorical_traits || 
        !TRAIT_DEFINITIONS.constants ||
        !TRAIT_DEFINITIONS.genetic_risk_traits ||
        !TRAIT_DEFINITIONS.allelic_phenotype_traits
        ) {
        logger.error('plantFactory', "CRITICAL - TRAIT_DEFINITIONS is missing or incomplete in createPlant. Cannot create plant properly.", 
                     { has_genetic_base_traits: !!TRAIT_DEFINITIONS?.genetic_base_traits, 
                       has_numerical_traits: !!TRAIT_DEFINITIONS?.numerical_traits,
                       /* ... etc ... */ });
        plant.name = `ErrorPlant-${plant.id}`; 
        plant.generation = -1;
        // Assign minimal defaults from what might be available
        if (TRAIT_DEFINITIONS && TRAIT_DEFINITIONS.numerical_traits) {
            TRAIT_DEFINITIONS.numerical_traits.forEach(traitDef => plant[traitDef.id] = traitDef.min);
        }
        if (TRAIT_DEFINITIONS && TRAIT_DEFINITIONS.categorical_traits) {
            TRAIT_DEFINITIONS.categorical_traits.forEach(traitDef => plant[traitDef.id] = traitDef.values[0]);
        }
        allPlantsMap.set(plant.id, plant);
        return plant; 
    }

    const sexChromosomeGeneDef = TRAIT_DEFINITIONS.genetic_base_traits.find(t => t.id === 'sex_chromosomes_gene');

    if (sexChromosomeGeneDef) {
        if (parents) {
            plant.genome.sex_chromosomes_gene = inheritSexChromosomes(
                parents[0].genome.sex_chromosomes_gene, parents[0].expressedSex,
                parents[1].genome.sex_chromosomes_gene, parents[1].expressedSex,
                sexChromosomeGeneDef
            );
        } else {
            plant.genome.sex_chromosomes_gene = initializeSexChromosomes(sexChromosomeGeneDef);
        }
        plant.expressedSex = determineExpressedSex(plant.genome.sex_chromosomes_gene, sexChromosomeGeneDef);
    } else {
        logger.error('plantFactory', "Sex chromosome gene definition not found in traits.json! Defaulting to Female.");
        plant.genome.sex_chromosomes_gene = ['X','X']; 
        plant.expressedSex = 'Female'; 
    }
    logger.verbose('plantFactory', `Plant ID ${plant.id}, Initial Expressed Sex: ${plant.expressedSex}`);

    TRAIT_DEFINITIONS.numerical_traits.forEach(traitDef => {
        if (parents) {
            const p1Val = parents[0][traitDef.id];
            const p2Val = parents[1][traitDef.id];
            plant[traitDef.id] = inheritNumericalTrait(
                (p1Val !== undefined ? p1Val : traitDef.min), 
                (p2Val !== undefined ? p2Val : traitDef.min),
                traitDef, 
                TRAIT_DEFINITIONS.constants
            );
        } else {
            const minVal = traitDef.min + (traitDef.max - traitDef.min) * traitDef.initial_min_factor;
            const maxVal = traitDef.min + (traitDef.max - traitDef.min) * traitDef.initial_max_factor;
            plant[traitDef.id] = getRandom(minVal, maxVal);
        }
    });
    logger.verbose('plantFactory', `Plant ID ${plant.id}, Numerical traits set.`);

    TRAIT_DEFINITIONS.categorical_traits.forEach(traitDef => {
        if (parents) {
            const p1Val = parents[0][traitDef.id];
            const p2Val = parents[1][traitDef.id];
            plant[traitDef.id] = inheritCategoricalTrait(
                (p1Val !== undefined ? p1Val : traitDef.values[0]), 
                (p2Val !== undefined ? p2Val : traitDef.values[0]),
                traitDef, 
                TRAIT_DEFINITIONS.constants,
                plant 
            );
        } else {
            let value = getRandomElement(traitDef.values);
            if (traitDef.id === 'primaryTerpene' && !plant.primaryTerpene) { // Set only if not already set (can be set by other logic first)
                 plant.primaryTerpene = value;
            } else if (traitDef.id === 'secondaryTerpene' && plant.primaryTerpene) {
                if (value === plant.primaryTerpene) {
                    value = getRandomElement(traitDef.values.filter(v => v !== plant.primaryTerpene && v !== null)) || null;
                }
            }
            // Assign value unless it's primaryTerpene and already set
            if (!(traitDef.id === 'primaryTerpene' && plant.primaryTerpene && plant.primaryTerpene !== value)) {
                 plant[traitDef.id] = value;
            }
        }
    });
    if (!parents && (!plant.primaryTerpene || plant.primaryTerpene === plant.secondaryTerpene && plant.secondaryTerpene !== null)) {
        const primaryTerpDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === 'primaryTerpene');
        if(!plant.primaryTerpene && primaryTerpDef) plant.primaryTerpene = getRandomElement(primaryTerpDef.values);

        const secondaryTerpDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === 'secondaryTerpene');
        if (secondaryTerpDef && plant.primaryTerpene === plant.secondaryTerpene) {
            plant.secondaryTerpene = getRandomElement(secondaryTerpDef.values.filter(v => v !== plant.primaryTerpene && v !== null)) || null;
        }
    }
    logger.verbose('plantFactory', `Plant ID ${plant.id}, Categorical traits set. Primary Terpene: ${plant.primaryTerpene}`);
    
    const alleleBasedTraitCategories = ['genetic_risk_traits', 'allelic_phenotype_traits'];
    alleleBasedTraitCategories.forEach(category => {
        if (TRAIT_DEFINITIONS[category]) {
            TRAIT_DEFINITIONS[category].forEach(traitDef => {
                const p0GenomeTrait = parents && parents[0].genome && parents[0].genome[traitDef.id] ? parents[0].genome[traitDef.id] : undefined;
                const p1GenomeTrait = parents && parents[1].genome && parents[1].genome[traitDef.id] ? parents[1].genome[traitDef.id] : undefined;

                if (parents && p0GenomeTrait && p1GenomeTrait) {
                    plant.genome[traitDef.id] = inheritAlleles(
                        p0GenomeTrait, p1GenomeTrait, traitDef, TRAIT_DEFINITIONS.constants
                    );
                } else {
                    plant.genome[traitDef.id] = initializeAllelesForLandrace(
                        traitDef, TRAIT_DEFINITIONS.constants
                    );
                }
            });
        }
    });
    logger.verbose('plantFactory', `Plant ID ${plant.id}, Allele-based traits set.`);
    
    if (parents) {
        plant.name = generateStrainName(TRAIT_DEFINITIONS, parents[0].name, parents[1].name);
        plant.generation = Math.max(parents[0].generation, parents[1].generation) + 1;
        plant.parents = [parents[0].id, parents[1].id];
    } else {
        plant.name = generateStrainName(TRAIT_DEFINITIONS);
        plant.generation = 0;
        plant.parents = [null, null];
    }
    logger.debug('plantFactory', `Plant ID ${plant.id}, Name: ${plant.name}, Gen: ${plant.generation}`);

    const heightTrait = TRAIT_DEFINITIONS.numerical_traits.find(t => t.id === 'height');
    const widthTrait = TRAIT_DEFINITIONS.numerical_traits.find(t => t.id === 'width');
    const thcTrait = TRAIT_DEFINITIONS.numerical_traits.find(t => t.id === 'thc');

    if (!heightTrait || !widthTrait || !thcTrait) {
        logger.error('plantFactory', "CRITICAL - Height, Width, or THC trait definition missing. Cannot calculate yield/effects properly.");
        plant.calculatedYieldGrams = 0;
    } else {
        plant.calculatedYieldGrams = (plant.height / (heightTrait.unit === 'cm' ? 100: 1)) * 
                                     (plant.width / (widthTrait.unit === 'cm' ? 100: 1)) * 
                                     plant.genetic_yield_potential * 
                                     TRAIT_DEFINITIONS.constants.YIELD_BASE_GRAMS_PER_M2_AT_FULL_POTENTIAL;

        const s420GeneDef = TRAIT_DEFINITIONS.allelic_phenotype_traits.find(t => t.id === 's420_factor_gene');
        if (s420GeneDef && plant.genome[s420GeneDef.id] && s420GeneDef.alleles) { // Added check for s420GeneDef.alleles
            const s420Alleles = plant.genome[s420GeneDef.id];
            if (s420Alleles.includes(s420GeneDef.alleles.present)) { 
                if (s420GeneDef.effects_on_traits && s420GeneDef.effects_on_traits.if_dominant_expressed && s420GeneDef.effects_on_traits.if_dominant_expressed.thc_multiplier) {
                    logger.debug('plantFactory', `Plant ${plant.id} S420 factor active. THC before: ${plant.thc.toFixed(2)}`);
                    plant.thc *= s420GeneDef.effects_on_traits.if_dominant_expressed.thc_multiplier;
                    plant.thc = clamp(plant.thc, thcTrait.min, thcTrait.max);
                    logger.debug('plantFactory', `Plant ${plant.id} S420 factor applied. THC after: ${plant.thc.toFixed(2)}`);
                }
            }
        }

        if (plant.expressedSex === 'Male') {
            plant.calculatedYieldGrams *= 0.05; 
        }
        
        const stabilityGeneAlleles = plant.genome.sex_stability_gene;
        const stabilityDef = TRAIT_DEFINITIONS.genetic_risk_traits.find(t => t.id === 'sex_stability_gene');
        if (stabilityGeneAlleles && stabilityDef && stabilityDef.alleles && stabilityDef.alleles.unstable &&
            stabilityGeneAlleles[0] === stabilityDef.alleles.unstable && 
            stabilityGeneAlleles[1] === stabilityDef.alleles.unstable) {
            plant.calculatedYieldGrams *= 0.75; 
            logger.debug('plantFactory', `Plant ${plant.id} has unstable sex gene (uu), yield reduced.`);
        }
        plant.calculatedYieldGrams = Math.max(0, parseFloat(plant.calculatedYieldGrams.toFixed(0)));
    }
    logger.debug('plantFactory', `Plant ID ${plant.id}, final yield: ${plant.calculatedYieldGrams}, final THC: ${plant.thc ? plant.thc.toFixed(2) : 'N/A'}`);

    logger.verbose('plantFactory', "Final plant object before return:", JSON.parse(JSON.stringify(plant)));
    allPlantsMap.set(plant.id, plant);
    return plant;
}

export function resetPlantIdCounter() {
    logger.info('plantFactory', "Plant ID counter reset.");
    plantIdCounter = 0;
}