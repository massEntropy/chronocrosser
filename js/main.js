// js/main.js
import { createPlant, resetPlantIdCounter } from './plantFactory.js';
import { 
    initializeUIManager, 
    updateInventoryDisplay, 
    displayPlantInSlot, 
    updateNurseryHeader,
    highlightSelectedCards,
    showExportModal, 
    renderPlantCard 
} from './uiManager.js';
import * as logger from './logger.js';

logger.info('main.js', "Script loaded and parsing started.");

let TRAIT_DEFINITIONS;
let inventory = [];
let allPlantsMap = new Map();
let selectedParent1 = null;
let selectedParent2 = null;

let inventoryDisplayElement, parent1SlotElement, parent2SlotElement, breedButtonElement, offspringDisplayElement, lineageTooltipElementGlobal;
let importDataAreaElement, importStrainButtonElement;
let exportModalGlobal, exportedStrainDataTextareaGlobal, closeExportModalButtonGlobal, copyExportedDataButtonGlobal;
let plantImageLightboxGlobal, lightboxPlantNameGlobal, lightboxImageContainerGlobal,
    closeLightboxModalGlobal, downloadPlantImageBtnGlobal, downloadPlantDataBtnGlobal;

let gameUtils = {};
let plantGeneticsUtils = {};

async function loadTraits() {
    logger.info('main.js', "loadTraits() called.");
    try {
        const response = await fetch('traits.json'); 
        logger.debug('main.js', "fetch('traits.json') response status:", response.status);
        if (!response.ok) {
            const errorText = await response.text(); 
            logger.error('main.js', "Fetch error response text:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        TRAIT_DEFINITIONS = await response.json();
        logger.info('main.js', "TRAIT_DEFINITIONS successfully parsed.");
        logger.verbose('main.js', "Loaded TRAIT_DEFINITIONS:", JSON.parse(JSON.stringify(TRAIT_DEFINITIONS))); 
        if (!TRAIT_DEFINITIONS || Object.keys(TRAIT_DEFINITIONS).length === 0 || !TRAIT_DEFINITIONS.constants) { 
            logger.error('main.js', "TRAIT_DEFINITIONS is empty, malformed, or missing 'constants' after parsing!", TRAIT_DEFINITIONS);
            alert("CRITICAL ERROR: TRAIT_DEFINITIONS empty or malformed. Check traits.json and ensure 'constants' object exists. Game cannot start.");
            throw new Error("TRAIT_DEFINITIONS malformed - missing constants.");
        }
    } catch (error) {
        logger.error('main.js', "CRITICAL ERROR in loadTraits():", error);
        alert("CRITICAL ERROR: Could not load or parse traits.json. Game cannot start. Check console.");
        throw error; 
    }
}

function initializeGame() {
    logger.info('main.js', "initializeGame() called.");
    if (!TRAIT_DEFINITIONS || !TRAIT_DEFINITIONS.constants) {
        logger.error('main.js', "CRITICAL: TRAIT_DEFINITIONS or TRAIT_DEFINITIONS.constants is not available in initializeGame! Halting game init.");
        alert("CRITICAL ERROR: Game data (TRAIT_DEFINITIONS) not ready for initializeGame. Check console.");
        return; 
    }
    
    resetPlantIdCounter(); 
    inventory = [];
    allPlantsMap.clear();
    selectedParent1 = null;
    selectedParent2 = null;

    let femaleCount = 0;
    let maleCount = 0;
    const initialPlantTarget = (TRAIT_DEFINITIONS.constants.INITIAL_PLANT_COUNT !== undefined) ? TRAIT_DEFINITIONS.constants.INITIAL_PLANT_COUNT : 4;
    const maxInventory = (TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE !== undefined) ? TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE : 20;
    logger.debug('main.js', `initializeGame() - Target initial plants: ${initialPlantTarget}, Max Inventory: ${maxInventory}`);

    for (let i = 0; i < initialPlantTarget; i++) {
        logger.verbose('main.js', `initializeGame() - Attempting to create plant ${i + 1}`);
        if (inventory.length < maxInventory) {
            const newPlant = createPlant(TRAIT_DEFINITIONS, allPlantsMap); 
            logger.debug('main.js', `initializeGame() - Plant ${i + 1} created:`, newPlant ? newPlant.name : "NULL/UNDEFINED PLANT", newPlant);
            if (newPlant && newPlant.name && !newPlant.name.startsWith("ErrorPlant")) { 
                inventory.push(newPlant);
                if (newPlant.expressedSex === 'Female') femaleCount++;
                else if (newPlant.expressedSex === 'Male') maleCount++;
            } else {
                logger.error('main.js', `initializeGame() - createPlant returned a null/undefined or error plant for iteration ${i}! Plant:`, newPlant);
            }
        } else {
            logger.info('main.js', "initializeGame() - Max inventory reached during initial creation.");
            break;
        }
    }
    
    let attempts = 0;
    while ((femaleCount === 0 || maleCount === 0) && attempts < 5 && inventory.length < maxInventory) {
        logger.debug('main.js', `initializeGame() - Attempting to balance sex. Attempt: ${attempts + 1}`);
        const newPlant = createPlant(TRAIT_DEFINITIONS, allPlantsMap);
        logger.verbose('main.js', `initializeGame() - Sex balance attempt, created:`, newPlant ? newPlant.name : "NULL/UNDEFINED PLANT", newPlant);
        if (newPlant && newPlant.name && !newPlant.name.startsWith("ErrorPlant")) {
            inventory.push(newPlant);
            if (newPlant.expressedSex === 'Female') femaleCount++;
            else if (newPlant.expressedSex === 'Male') maleCount++;
        } else {
            logger.error('main.js', `initializeGame() - createPlant returned null/error plant during sex balancing.`);
        }
        attempts++;
    }
    if (femaleCount === 0 || maleCount === 0) {
        logger.warn('main.js', `initializeGame() - Could not ensure a mix of male and female starting plants. Current counts - Females: ${femaleCount}, Males: ${maleCount}`);
    }
    logger.info('main.js', `initializeGame() - Final inventory count: ${inventory.length}`);
    logger.verbose('main.js', "Inventory content IDs:", inventory.map(p => p.id));
    
    refreshAllDisplays(); 
    
    logger.info('main.js', "initializeGame() completed.");
    if(breedButtonElement) breedButtonElement.disabled = true;
}

function handleBreederAction(plant, action, slotType = null) {
    logger.info('main.js', `handleBreederAction: Plant ${plant ? plant.name : 'N/A'}, Action: ${action}, Slot: ${slotType}`);

    if (!plant && action === 'add') {
        logger.error('main.js', `handleBreederAction 'add' called with no plant.`);
        return;
    }
    if (action === 'remove' && (!plant || !slotType)) { 
        logger.error('main.js', `handleBreederAction 'remove' called with missing plant or slotType. Plant: ${plant ? plant.name : 'N/A'}, Slot: ${slotType}`);
        return;
    }

    if (action === 'add') {
        if ((selectedParent1 && selectedParent1.id === plant.id) || (selectedParent2 && selectedParent2.id === plant.id)) {
            logger.warn('main.js', `Plant ${plant.name} is already selected in a breeder slot.`);
            // alert(`${plant.name} is already selected.`); // UI should prevent this via disabled button
            return;
        }
        if (!selectedParent1) {
            selectedParent1 = plant;
            logger.info('main.js', `Added ${plant.name} to Parent Slot 1.`);
        } else if (!selectedParent2) {
            selectedParent2 = plant;
            logger.info('main.js', `Added ${plant.name} to Parent Slot 2.`);
        } else {
            logger.warn('main.js', "Both breeder slots are full when trying to add. UI should prevent this.");
            // alert("Both breeder slots are full. Remove a plant first to add another.");
            return; 
        }
    } else if (action === 'remove') {
        if (slotType === 'parent1') {
            if (selectedParent1 && selectedParent1.id === plant.id) { 
                logger.info('main.js', `Removed ${selectedParent1.name} from Parent Slot 1.`);
                selectedParent1 = null;
            } else {
                logger.warn('main.js', `Mismatch or empty P1 on remove. Plant intended: ${plant.name}, Slot: ${slotType}, Current P1: ${selectedParent1 ? selectedParent1.name : 'Empty'}`);
            }
        } else if (slotType === 'parent2') {
            if (selectedParent2 && selectedParent2.id === plant.id) {
                logger.info('main.js', `Removed ${selectedParent2.name} from Parent Slot 2.`);
                selectedParent2 = null;
            } else {
                 logger.warn('main.js', `Mismatch or empty P2 on remove. Plant intended: ${plant.name}, Slot: ${slotType}, Current P2: ${selectedParent2 ? selectedParent2.name : 'Empty'}`);
            }
        } else {
            logger.warn('main.js', `Attempted to remove from unknown slot type: ${slotType}`);
        }
    }

    // Update UI for breeding slots
    displayPlantInSlot(selectedParent1, parent1SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction);
    displayPlantInSlot(selectedParent2, parent2SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction);
    // Refresh entire inventory display to update button states on nursery cards
    refreshAllDisplays(); 
    if(breedButtonElement) breedButtonElement.disabled = !(selectedParent1 && selectedParent2);
}

function handleDeletePlant(plantIdToDelete) {
    logger.info('main.js', "handleDeletePlant called for ID:", plantIdToDelete);
    inventory = inventory.filter(p => p.id !== plantIdToDelete);
    let changedSlots = false;
    if (selectedParent1 && selectedParent1.id === plantIdToDelete) { 
        selectedParent1 = null; 
        displayPlantInSlot(null, parent1SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction); 
        logger.debug('main.js', "Deleted plant was P1, cleared P1.");
        changedSlots = true;
    }
    if (selectedParent2 && selectedParent2.id === plantIdToDelete) { 
        selectedParent2 = null; 
        displayPlantInSlot(null, parent2SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction); 
        logger.debug('main.js', "Deleted plant was P2, cleared P2.");
        changedSlots = true;
    }
    refreshAllDisplays(); 
    // Ensure breed button state is accurate after potential parent removal
    if(breedButtonElement) { 
        breedButtonElement.disabled = !(selectedParent1 && selectedParent2);
    }
}

function breedSelectedPlants() { 
    logger.info('main.js', "breedSelectedPlants() called.");
    if (!selectedParent1 || !selectedParent2) {
        logger.warn('main.js', "Breeding attempted without two valid parents selected (breedSelectedPlants).");
        return;
    }
    
    const p1Sex = selectedParent1.expressedSex;
    const p2Sex = selectedParent2.expressedSex;

    let femaleParent, maleParent;
    if (p1Sex === 'Female' && p2Sex === 'Male') { 
        femaleParent = selectedParent1; maleParent = selectedParent2; 
    } else if (p1Sex === 'Male' && p2Sex === 'Female') { 
        femaleParent = selectedParent2; maleParent = selectedParent1; 
    } else { 
        let alertMsg = `Breeding failed: Invalid parent sex combination. Please select one male (♂) and one female (♀) plant.`;
        if (p1Sex && p1Sex === p2Sex) {
            alertMsg = `Breeding failed: Cannot breed two ${p1Sex} plants. Select one male (♂) and one female (♀).`;
        }
        
        logger.warn('main.js', `Invalid breeding attempt: P1 (${selectedParent1.name}, ${p1Sex}), P2 (${selectedParent2.name}, ${p2Sex}). Message: ${alertMsg}`);
        alert(alertMsg); 

        selectedParent1 = null;
        selectedParent2 = null;
        displayPlantInSlot(null, parent1SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction);
        displayPlantInSlot(null, parent2SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction);
        refreshAllDisplays(); 
        if(breedButtonElement) breedButtonElement.disabled = true; 
        
        return; 
    }

    if (inventory.length >= TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE) { 
        logger.info('main.js', "Breeding blocked: Nursery is full.");
        alert(`Nursery is full! Max ${TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE} plants. Delete some plants to make space.`); 
        return; 
    }

    logger.debug('main.js', `Breeding ${femaleParent.name} (F) with ${maleParent.name} (M)`);
    const offspring = createPlant(TRAIT_DEFINITIONS, allPlantsMap, [femaleParent, maleParent]);
    logger.info('main.js', "Offspring created:", offspring ? offspring.name : "NULL OFFSPRING");

    if (offspring && offspring.name && !offspring.name.startsWith("ErrorPlant")) {
        inventory.push(offspring);
    } else { 
        logger.error('main.js', "Failed to create valid offspring. Offspring object:", offspring); 
        alert("An error occurred while creating the offspring. Please check the console.");
        return; 
    }

    const offspringPlaceholder = offspringDisplayElement.querySelector('.plant-card-placeholder');
    const existingOffspringCard = offspringDisplayElement.querySelector('.plant-card');
    if (existingOffspringCard) existingOffspringCard.remove();
    if (offspringPlaceholder) offspringPlaceholder.style.display = 'none';
    
    const offspringPreviewCard = renderPlantCard(offspring, TRAIT_DEFINITIONS, allPlantsMap, 
                                                null, null, () => {}, 
                                                false, 'offspring', 
                                                null, null); 
    offspringPreviewCard.style.cursor = 'default'; 
    offspringDisplayElement.appendChild(offspringPreviewCard);
    
    selectedParent1 = null; 
    selectedParent2 = null;
    displayPlantInSlot(null, parent1SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction); 
    displayPlantInSlot(null, parent2SlotElement, TRAIT_DEFINITIONS, allPlantsMap, handleBreederAction);
    
    refreshAllDisplays(); 
    if(breedButtonElement) breedButtonElement.disabled = true;

    const newPlantInInventory = inventoryDisplayElement.querySelector(`[data-plant-id="${offspring.id}"]`);
    if (newPlantInInventory) {
        newPlantInInventory.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    logger.info('main.js', "breedSelectedPlants() completed.");
}

function refreshAllDisplays() { 
    logger.debug('main.js', "refreshAllDisplays() called.");
    if (!inventoryDisplayElement || !TRAIT_DEFINITIONS || !allPlantsMap || !TRAIT_DEFINITIONS.constants) { 
        logger.error('main.js', "Cannot refresh displays - essential elements or data missing in refreshAllDisplays."); 
        return; 
    }
    logger.verbose('main.js', `Calling updateInventoryDisplay. Inventory count: ${inventory ? inventory.length : 'null'}. P1: ${selectedParent1 ? selectedParent1.name : 'null'}, P2: ${selectedParent2 ? selectedParent2.name : 'null'}`);
    
    updateInventoryDisplay(
        inventory, 
        inventoryDisplayElement, 
        TRAIT_DEFINITIONS, 
        allPlantsMap, 
        handleDeletePlant,
        handleExportPlant,
        handleBreederAction,
        selectedParent1, 
        selectedParent2  
    );
    updateNurseryHeader(inventory.length, TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE);
    highlightSelectedCards(selectedParent1, selectedParent2);
    logger.debug('main.js', "refreshAllDisplays() completed.");
}

function handleExportPlant(plantToExp) { 
    logger.info('main.js', `Exporting plant: ${plantToExp.name}`);
    const exportablePlantData = { 
        version: "ChronoCrosser_v1.0", name: plantToExp.name, generation: plantToExp.generation, 
        expressedSex: plantToExp.expressedSex, height: plantToExp.height, width: plantToExp.width, 
        genetic_yield_potential: plantToExp.genetic_yield_potential, thc: plantToExp.thc, cbd: plantToExp.cbd, 
        primaryColor: plantToExp.primaryColor, accentColor: plantToExp.accentColor, 
        primaryTerpene: plantToExp.primaryTerpene, secondaryTerpene: plantToExp.secondaryTerpene, 
        genome: plantToExp.genome, originalIdForReference: plantToExp.id, 
        originalParentsForReference: plantToExp.parents 
    };
    const strainDataString = JSON.stringify(exportablePlantData, null, 2); 
    showExportModal(strainDataString);
}

function handleImportStrain() { 
    logger.info('main.js', "handleImportStrain() called.");
    if (!TRAIT_DEFINITIONS || !TRAIT_DEFINITIONS.constants) { logger.error('main.js', "Game data not loaded. Cannot import strain."); alert("Game data not loaded. Cannot import strain."); return; }
    if (inventory.length >= TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE) { logger.info('main.js', "Import blocked: Nursery full."); alert(`Nursery is full! Max ${TRAIT_DEFINITIONS.constants.MAX_INVENTORY_SIZE} plants. Delete some plants to make space for import.`); return; }
    let importDataString = importDataAreaElement.value.trim(); if (!importDataString) { logger.warn('main.js', "Import attempted with empty data."); alert("Please paste strain card data into the text area."); return; }
    let cleanedDataString = importDataString.replace(/\/\*.*?\*\/|\/\/.*/g, '');
    try {
        const importedData = JSON.parse(cleanedDataString);
        logger.debug('main.js', "Parsed import data:", importedData);
        if (!importedData || typeof importedData !== 'object') { logger.warn('main.js', "Import failed: Data not valid object."); alert("Import failed: Data is not a valid strain card object."); return; }
        if (importedData.version !== "ChronoCrosser_v1.0") { logger.warn('main.js', "Import failed: Incompatible version."); alert("Import failed: Incompatible strain card version or invalid data structure."); return; }
        if (!importedData.name || typeof importedData.genome !== 'object' || !importedData.genome.sex_chromosomes_gene) { logger.warn('main.js', "Import failed: Missing essential data."); alert("Import failed: Essential data (name, genome, sex chromosomes) missing from strain card."); return; }
        if (importedData.originalIdForReference) { const existingPlant = inventory.find(p => (p.originalIdForReference === importedData.originalIdForReference && p.name.startsWith(importedData.name)) || (p.id === importedData.originalIdForReference && !p.name.endsWith("(Imported)"))); if (existingPlant) { logger.info('main.js', "Import cancelled: Strain already in nursery."); alert(`Strain "${importedData.name}" (or its original version) appears to already be in your nursery. Import cancelled.`); return; } }
        
        const newPlant = createPlant(TRAIT_DEFINITIONS, allPlantsMap); 
        newPlant.name = importedData.name + " (Imported)"; 
        newPlant.generation = importedData.generation || 0; 
        newPlant.genome = { ...importedData.genome }; 

        const sexChromosomeGeneDef = TRAIT_DEFINITIONS.genetic_base_traits.find(t => t.id === 'sex_chromosomes_gene');
        if (sexChromosomeGeneDef && newPlant.genome.sex_chromosomes_gene && plantGeneticsUtils.determineExpressedSex) {
            newPlant.expressedSex = plantGeneticsUtils.determineExpressedSex(newPlant.genome.sex_chromosomes_gene, sexChromosomeGeneDef);
        } else {
            logger.error('main.js', "Could not determine sex for imported plant due to missing definitions, genome data, or utility function."); newPlant.expressedSex = "Unknown";
        }
        logger.debug('main.js', `Imported plant ${newPlant.name} expressed sex: ${newPlant.expressedSex}`);

        TRAIT_DEFINITIONS.numerical_traits.forEach(td => {
            if (importedData.hasOwnProperty(td.id) && typeof importedData[td.id] === 'number' && gameUtils.clamp) {
                newPlant[td.id] = gameUtils.clamp(importedData[td.id], td.min, td.max);
            } else if (!newPlant.hasOwnProperty(td.id) && gameUtils.getRandomElement && td.min !== undefined && td.max !== undefined) { 
                const fallbacks = [td.min, (td.min + td.max) / 2, td.max].filter(v => !isNaN(v));
                newPlant[td.id] = fallbacks.length > 0 ? gameUtils.getRandomElement(fallbacks) : 0; 
            }
        });
        TRAIT_DEFINITIONS.categorical_traits.forEach(td => {
            if (importedData.hasOwnProperty(td.id)) {
                const traitDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === td.id);
                if (traitDef && traitDef.values.includes(importedData[td.id])) {
                     newPlant[td.id] = importedData[td.id];
                } else {
                    if (!newPlant[td.id] && traitDef && gameUtils.getRandomElement) newPlant[td.id] = gameUtils.getRandomElement(traitDef.values);
                }
            } else if (!newPlant[td.id]) {
                 const traitDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === td.id);
                 if(traitDef && gameUtils.getRandomElement) newPlant[td.id] = gameUtils.getRandomElement(traitDef.values);
            }
        });
        if (newPlant.primaryTerpene === newPlant.secondaryTerpene && newPlant.secondaryTerpene !== null && gameUtils.getRandomElement) {
            const secondaryTerpDef = TRAIT_DEFINITIONS.categorical_traits.find(t => t.id === 'secondaryTerpene');
            if(secondaryTerpDef) newPlant.secondaryTerpene = gameUtils.getRandomElement(secondaryTerpDef.values.filter(v => v !== newPlant.primaryTerpene && v !== null)) || null;
        }

        const heightTrait = TRAIT_DEFINITIONS.numerical_traits.find(t => t.id === 'height');
        const widthTrait = TRAIT_DEFINITIONS.numerical_traits.find(t => t.id === 'width');
        if (heightTrait && widthTrait && TRAIT_DEFINITIONS.constants) { 
            newPlant.calculatedYieldGrams = (newPlant.height / (heightTrait.unit === 'cm' ? 100 : 1)) * 
                                          (newPlant.width / (widthTrait.unit === 'cm' ? 100 : 1)) * 
                                          newPlant.genetic_yield_potential * 
                                          TRAIT_DEFINITIONS.constants.YIELD_BASE_GRAMS_PER_M2_AT_FULL_POTENTIAL;
            
            if (newPlant.expressedSex === 'Male') newPlant.calculatedYieldGrams *= 0.05; 
            const stabilityGeneAlleles = newPlant.genome.sex_stability_gene; 
            const stabilityDef = TRAIT_DEFINITIONS.genetic_risk_traits.find(t => t.id === 'sex_stability_gene');
            if (stabilityGeneAlleles && stabilityDef && stabilityDef.alleles && stabilityDef.alleles.unstable && 
                stabilityGeneAlleles[0] === stabilityDef.alleles.unstable && 
                stabilityGeneAlleles[1] === stabilityDef.alleles.unstable) {
                newPlant.calculatedYieldGrams *= 0.75; 
            }
            newPlant.calculatedYieldGrams = Math.max(0, parseFloat(newPlant.calculatedYieldGrams.toFixed(0)));
        } else {
            logger.error("main.js: Cannot calculate yield for imported plant, missing trait definitions or constants.");
            newPlant.calculatedYieldGrams = 0;
        }

        newPlant.parents = [null, null]; 
        newPlant.originalIdForReference = importedData.originalIdForReference;
        inventory.push(newPlant); 
        refreshAllDisplays(); 
        if(importDataAreaElement) importDataAreaElement.value = ""; 
        logger.info('main.js', `Strain "${newPlant.name}" imported successfully!`);
        alert(`Strain "${newPlant.name}" imported successfully!`);
    } catch (error) { 
        if (error instanceof SyntaxError) { logger.error('main.js', "Import SyntaxError (JSON format):", error); alert("Import failed: Invalid JSON. Check for extra text/comments."); } 
        else { logger.error('main.js', "Import error (other):", error); alert("Import failed: Unexpected error. See console."); } 
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    logger.info('main.js', "DOMContentLoaded event fired.");
    logger.setLogLevel(logger.LOG_LEVELS.DEBUG); 

    inventoryDisplayElement = document.getElementById('plant-inventory');
    parent1SlotElement = document.getElementById('parent1-slot');
    parent2SlotElement = document.getElementById('parent2-slot');
    breedButtonElement = document.getElementById('breed-button');
    offspringDisplayElement = document.getElementById('offspring-display');
    lineageTooltipElementGlobal = document.getElementById('lineage-tooltip');
    importDataAreaElement = document.getElementById('import-data-area');
    importStrainButtonElement = document.getElementById('import-strain-button');
    exportModalGlobal = document.getElementById('export-modal');
    exportedStrainDataTextareaGlobal = document.getElementById('exported-strain-data');
    closeExportModalButtonGlobal = document.getElementById('close-export-modal');
    copyExportedDataButtonGlobal = document.getElementById('copy-exported-data-button');
    plantImageLightboxGlobal = document.getElementById('plant-image-lightbox');
    lightboxPlantNameGlobal = document.getElementById('lightbox-plant-name');
    lightboxImageContainerGlobal = document.getElementById('lightbox-image-container');
    closeLightboxModalGlobal = document.getElementById('close-lightbox-modal'); 
    downloadPlantImageBtnGlobal = document.getElementById('download-plant-image-btn');
    downloadPlantDataBtnGlobal = document.getElementById('download-plant-data-btn');
    logger.debug('main.js', "DOM elements cached. inventoryDisplayElement:", inventoryDisplayElement ? "Found" : "MISSING!");

    const requiredElements = [
        inventoryDisplayElement, parent1SlotElement, parent2SlotElement, breedButtonElement,
        offspringDisplayElement, lineageTooltipElementGlobal, importDataAreaElement,
        importStrainButtonElement, exportModalGlobal, exportedStrainDataTextareaGlobal,
        closeExportModalButtonGlobal, copyExportedDataButtonGlobal,
        plantImageLightboxGlobal, lightboxPlantNameGlobal, lightboxImageContainerGlobal,
        closeLightboxModalGlobal, 
        downloadPlantImageBtnGlobal, downloadPlantDataBtnGlobal
    ];

    if (requiredElements.some(el => !el)) {
        logger.error('main.js', "One or more essential DOM elements are missing AFTER caching attempts!");
        requiredElements.forEach((el, index) => { if (!el) logger.error(`main.js: Missing element for requiredElements[${index}] (check ID in HTML and JS cache assignment)`); });
        alert("Error: Game UI could not be initialized. Essential DOM elements are missing. Check console.");
        return;
    }
    
    initializeUIManager(
        lineageTooltipElementGlobal, 
        exportModalGlobal, exportedStrainDataTextareaGlobal, closeExportModalButtonGlobal, copyExportedDataButtonGlobal,
        // No onPlantDropCallback as D&D is removed
        plantImageLightboxGlobal, lightboxPlantNameGlobal, lightboxImageContainerGlobal, 
        closeLightboxModalGlobal, 
        downloadPlantImageBtnGlobal, downloadPlantDataBtnGlobal
    );
    logger.info('main.js', "UI Manager initialized.");

    try {
        await loadTraits(); 
        logger.info('main.js', "Traits loading complete. Proceeding with dynamic imports.");
        
        const utilsModule = await import('./utils.js');
        logger.debug('main.js', "utils.js module loaded:", !!utilsModule);
        const plantGeneticsModule = await import('./plantGenetics.js');
        logger.debug('main.js', "plantGenetics.js module loaded:", !!plantGeneticsModule);

        if(utilsModule.clamp) gameUtils.clamp = utilsModule.clamp; else logger.error("main.js: clamp utility not found in utilsModule!");
        if(utilsModule.getRandomElement) gameUtils.getRandomElement = utilsModule.getRandomElement; else logger.error("main.js: getRandomElement utility not found in utilsModule!");
        if(utilsModule.getRandom) gameUtils.getRandom = utilsModule.getRandom; else logger.error("main.js: getRandom utility not found in utilsModule!");

        if(plantGeneticsModule.determineExpressedSex) plantGeneticsUtils.determineExpressedSex = plantGeneticsModule.determineExpressedSex; else logger.error("main.js: determineExpressedSex not found in plantGeneticsModule!");
        logger.debug('main.js', "Utilities assigned. gameUtils keys:", Object.keys(gameUtils), "plantGeneticsUtils keys:", Object.keys(plantGeneticsUtils));

        initializeGame(); 
        
        if(breedButtonElement) breedButtonElement.addEventListener('click', breedSelectedPlants);
        else logger.error("main.js: breedButtonElement is null, cannot attach listener for breeding.");
        if(importStrainButtonElement) importStrainButtonElement.addEventListener('click', handleImportStrain);
        else logger.error("main.js: importStrainButtonElement is null, cannot attach listener for import.");
        logger.info('main.js', "Game initialized and event listeners attached.");
    } catch (error) {
        logger.error('main.js', "CRITICAL Initialization failed in DOMContentLoaded:", error);
    }
});
