// js/uiManager.js
import { generateSilhouetteSVG } from './plantVisuals.js';
import { getLineageTextRecursive, positionLineageTooltip } from './lineageTracker.js';
import * as logger from './logger.js';

let lineageTooltipElement;
let exportModalElement, exportedStrainDataTextarea, closeExportModalButton, copyExportedDataButtonElement;
let plantImageLightboxElement, lightboxPlantNameElement, lightboxImageContainerElement,
    closeLightboxModalButtonElement, downloadPlantImageBtnElement, downloadPlantDataBtnElement;

let currentPlantForLightbox = null;

export function initializeUIManager(
    tooltipEl, 
    exportModalEl, modalTextareaEl, modalCloseBtnEl, modalCopyBtnEl, 
    // onPlantDropCallback, // D&D is removed
    imgLightboxEl, lightboxNameEl, lightboxImgContainerEl, lightboxCloseBtnEl, downloadImgBtnEl, downloadDataBtnEl
) {
    logger.info('uiManager', "initializeUIManager() called.");
    lineageTooltipElement = tooltipEl; 
    exportModalElement = exportModalEl; 
    exportedStrainDataTextarea = modalTextareaEl; 
    closeExportModalButton = modalCloseBtnEl; 
    copyExportedDataButtonElement = modalCopyBtnEl;

    if (closeExportModalButton) {
        closeExportModalButton.onclick = () => { 
            logger.debug('uiManager', "Close export modal clicked.");
            if (exportModalElement) exportModalElement.style.display = "none"; 
        };
    } else { logger.error('uiManager', "closeExportModalButton (for text export) not found during init."); }

    if (exportModalElement) {
        exportModalElement.onclick = (event) => { 
            if (event.target === exportModalElement) {
                logger.debug('uiManager', "Export modal backdrop clicked.");
                exportModalElement.style.display = "none"; 
            }
        };
    } else { logger.error('uiManager', "exportModalElement not found during init."); }

    plantImageLightboxElement = imgLightboxEl;
    lightboxPlantNameElement = lightboxNameEl;
    lightboxImageContainerElement = lightboxImgContainerEl;
    closeLightboxModalButtonElement = document.getElementById('close-lightbox-modal'); 
    downloadPlantImageBtnElement = downloadImgBtnEl;
    downloadPlantDataBtnElement = downloadDataBtnEl;

    if (closeLightboxModalButtonElement) { 
        closeLightboxModalButtonElement.onclick = () => {
            logger.debug('uiManager', "Close lightbox modal clicked.");
            if (plantImageLightboxElement) plantImageLightboxElement.style.display = "none";
        };
    } else { logger.error('uiManager', "closeLightboxModalButtonElement (for image lightbox) not found during init."); }

    if (plantImageLightboxElement) {
        plantImageLightboxElement.onclick = (event) => {
            if (event.target === plantImageLightboxElement) {
                logger.debug('uiManager', "Lightbox modal backdrop clicked.");
                plantImageLightboxElement.style.display = "none";
            }
        };
    } else { logger.error('uiManager', "plantImageLightboxElement not found during init."); }

    if (downloadPlantImageBtnElement) {
        downloadPlantImageBtnElement.onclick = handleDownloadPlantImage;
    } else { logger.error('uiManager', "downloadPlantImageBtnElement not found during init."); }

    if (downloadPlantDataBtnElement) {
        downloadPlantDataBtnElement.onclick = handleDownloadPlantData;
    } else { logger.error('uiManager', "downloadPlantDataBtnElement not found during init."); }

    logger.info('uiManager', "initializeUIManager() completed.");
}

function showLineageTooltip(plant, event, allPlantsMap, TRAIT_DEFINITIONS_PARAM) {
    if (!lineageTooltipElement || !plant || !TRAIT_DEFINITIONS_PARAM || !TRAIT_DEFINITIONS_PARAM.constants) {
        logger.warn('uiManager', "Cannot show lineage tooltip, missing data.", {hasTooltipEl:!!lineageTooltipElement, hasPlant:!!plant, hasTD:!!TRAIT_DEFINITIONS_PARAM});
        return;
    }
    const lineageText = getLineageTextRecursive( plant.id, allPlantsMap, TRAIT_DEFINITIONS_PARAM, 0, TRAIT_DEFINITIONS_PARAM.constants.LINEAGE_TOOLTIP_DEPTH );
    lineageTooltipElement.innerHTML = lineageText;
    lineageTooltipElement.style.display = 'block';
    positionLineageTooltip(lineageTooltipElement, event);
}

function hideLineageTooltip() {
    if (lineageTooltipElement) lineageTooltipElement.style.display = 'none';
}

function openPlantImageLightbox(plant, TRAIT_DEFINITIONS_PARAM) {
    logger.debug('uiManager', `openPlantImageLightbox() for plant: ${plant ? plant.name : "NULL PLANT"}`);
    if (!plant || !TRAIT_DEFINITIONS_PARAM) {
        logger.error('uiManager', "Cannot open lightbox, plant or TRAIT_DEFINITIONS_PARAM missing.");
        return;
    }
    currentPlantForLightbox = plant; 
    if (lightboxPlantNameElement) lightboxPlantNameElement.textContent = plant.name;
    else logger.error('uiManager', "lightboxPlantNameElement missing.");

    if (lightboxImageContainerElement && TRAIT_DEFINITIONS_PARAM) { 
        lightboxImageContainerElement.innerHTML = ''; 
        const largeSVG = generateSilhouetteSVG(plant, TRAIT_DEFINITIONS_PARAM, { width: 500, height: 550, isLightbox: true }); 
        if (largeSVG) {
            lightboxImageContainerElement.appendChild(largeSVG);
        } else {
            logger.error('uiManager', `generateSilhouetteSVG returned null for lightbox for plant ${plant.name}.`);
            lightboxImageContainerElement.textContent = "Error generating image.";
        }
    } else if (!TRAIT_DEFINITIONS_PARAM) {
        logger.error('uiManager', "TRAIT_DEFINITIONS_PARAM not available for lightbox image generation.");
    } else {
         logger.error('uiManager', "lightboxImageContainerElement missing for lightbox.");
    }
    if (plantImageLightboxElement) plantImageLightboxElement.style.display = "flex";
    else logger.error('uiManager', "plantImageLightboxElement missing for lightbox.");
}

async function handleDownloadPlantImage() { /* ... Same as previous full version ... */ }
function handleDownloadPlantData() { /* ... Same as previous full version ... */ }
export function showExportModal(strainDataString) { /* ... Same as previous full version ... */ }

export function renderPlantCard(
    plant, 
    TRAIT_DEFINITIONS_PARAM, 
    allPlantsMap, 
    onDeleteCallback, 
    onExportCallback, 
    onBreederActionCallback,
    isNurseryCard = true, 
    breederSlotType = null,
    currentSelectedP1 = null, 
    currentSelectedP2 = null 
) {
    logger.debug('uiManager', `renderPlantCard START for: ${plant ? plant.name : "NULL PLANT"}, isNursery: ${isNurseryCard}`);
    if (!plant || !TRAIT_DEFINITIONS_PARAM) {
        logger.error('uiManager', `renderPlantCard() received null plant or missing TRAIT_DEFINITIONS_PARAM. Plant:`, plant, `TD_PARAM:`, TRAIT_DEFINITIONS_PARAM);
        const errorCard = document.createElement('div');
        errorCard.textContent = "Error rendering card data (missing plant/TD_PARAM)."; 
        errorCard.style.cssText = "color:red; border:1px solid red; padding:10px; min-height:50px;";
        return errorCard;
    }
    
    const card = document.createElement('div'); 
    card.className = 'plant-card'; card.dataset.plantId = plant.id;
    
    const header = document.createElement('div'); 
    header.className = 'plant-card-header'; 
    
    const nameEl = document.createElement('h4'); 
    let sexSymbol = plant.expressedSex === 'Female' ? ' ♀' : (plant.expressedSex === 'Male' ? ' ♂' : (plant.expressedSex ? ` (${plant.expressedSex})` : ''));
    nameEl.textContent = `${plant.name || 'Unnamed Strain'} (G: ${plant.generation !== undefined ? plant.generation : 'N/A'})${sexSymbol}`; 
    header.appendChild(nameEl);
    
    // Breeder Action Button is now created and added to actionsContainer below
    card.appendChild(header);

    const contentWrapper = document.createElement('div'); 
    contentWrapper.className = 'plant-card-content-wrapper';
    
    const silhouetteContainer = document.createElement('div'); 
    silhouetteContainer.className = 'plant-silhouette';
    if (TRAIT_DEFINITIONS_PARAM && plant) { 
        const smallSVG = generateSilhouetteSVG(plant, TRAIT_DEFINITIONS_PARAM, { width: 180, height: 150, isLightbox: false });
        if (smallSVG && smallSVG.childNodes.length > 0 && !smallSVG.querySelector('text[fill="red"]')) {
            silhouetteContainer.appendChild(smallSVG);
            logger.verbose('uiManager', `SVG appended for ${plant.name}`);
        } else {
            logger.error('uiManager', `generateSilhouetteSVG returned empty or error SVG for ${plant.name} in card. SVG content:`, smallSVG ? smallSVG.outerHTML.substring(0,100) + "..." : "null");
            silhouetteContainer.innerHTML = `<p style="color:orange; font-size:10px;">[Visual Error for ${plant.name}]</p>`; 
        }
    }
    silhouetteContainer.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        if(plant && TRAIT_DEFINITIONS_PARAM) openPlantImageLightbox(plant, TRAIT_DEFINITIONS_PARAM); 
    });
    contentWrapper.appendChild(silhouetteContainer);
    logger.verbose('uiManager', `Silhouette added for ${plant.name}`);

    function createCollapsibleSection(title, initiallyExpanded = false) {
        const section = document.createElement('div'); section.className = 'plant-card-section';
        const sectionTitleEl = document.createElement('div'); sectionTitleEl.className = 'plant-card-section-title';
        sectionTitleEl.textContent = title;
        const toggleIcon = document.createElement('span'); toggleIcon.className = 'plant-card-section-toggle';
        toggleIcon.textContent = initiallyExpanded ? '▾' : '▸'; sectionTitleEl.appendChild(toggleIcon);
        const sectionContent = document.createElement('div'); sectionContent.className = 'plant-card-section-content';
        if (initiallyExpanded) sectionContent.classList.add('expanded');
        sectionTitleEl.addEventListener('click', (e) => {
            e.stopPropagation(); 
            sectionContent.classList.toggle('expanded');
            toggleIcon.textContent = sectionContent.classList.contains('expanded') ? '▾' : '▸';
        });
        section.appendChild(sectionTitleEl); section.appendChild(sectionContent);
        return { section, sectionContent };
    }

    // --- Populate Collapsible Sections (Full logic) ---
    // Core Stats Section
    if (TRAIT_DEFINITIONS_PARAM && TRAIT_DEFINITIONS_PARAM.numerical_traits) {
        const { section, sectionContent } = createCollapsibleSection("Core Stats", true);
        let itemsAddedToCoreStats = 0;
        TRAIT_DEFINITIONS_PARAM.numerical_traits.forEach(td => {
            const value = plant[td.id]; 
            if (value === undefined) { logger.verbose('uiManager', `Core Stat - Trait: ${td.id} is undefined on plant ${plant.name}.`); return; }
            let text = "";
            if (td.id === "genetic_yield_potential") text = `<strong>Est. Yield:</strong> ${plant.calculatedYieldGrams !== undefined ? plant.calculatedYieldGrams : 'N/A'}g<br><strong>${td.name}:</strong> ${value.toFixed(2)} ${td.unit || ''}`;
            else text = `<strong>${td.name}:</strong> ${value.toFixed(td.unit === '%' ? 2 : 1)} ${td.unit || ''}`;
            const p = document.createElement('p'); p.innerHTML = text; sectionContent.appendChild(p);
            itemsAddedToCoreStats++;
        });
        logger.verbose('uiManager', `Core Stats for ${plant.name}: ${itemsAddedToCoreStats} items populated.`);
        if (sectionContent.hasChildNodes()) contentWrapper.appendChild(section); else { logger.verbose('uiManager', `Core Stats section empty for ${plant.name}, not adding.`); section.remove(); }
    } else { logger.warn('uiManager', `Numerical traits definition missing for ${plant.name}`); }

    // Aroma & Appearance Section
    if (TRAIT_DEFINITIONS_PARAM && TRAIT_DEFINITIONS_PARAM.categorical_traits) {
        const { section, sectionContent } = createCollapsibleSection("Aroma & Appearance");
        let itemsAddedToAroma = 0;
        TRAIT_DEFINITIONS_PARAM.categorical_traits.forEach(td => {
            const value = plant[td.id];
            if (value !== undefined && value !== null) {
                const p = document.createElement('p'); p.innerHTML = `<strong>${td.name}:</strong> ${value}`; sectionContent.appendChild(p);
                itemsAddedToAroma++;
            }
        });
        logger.verbose('uiManager', `Aroma/Appearance for ${plant.name}: ${itemsAddedToAroma} items populated.`);
        if (sectionContent.hasChildNodes()) contentWrapper.appendChild(section); else { logger.verbose('uiManager', `Aroma section empty for ${plant.name}, not adding.`); section.remove(); }
    } else { logger.warn('uiManager', `Categorical traits definition missing for ${plant.name}`); }
    
    // Genetic Markers Section
    const alleleTraitCategories = ['genetic_risk_traits', 'allelic_phenotype_traits'];
    if (TRAIT_DEFINITIONS_PARAM) {
        const { section, sectionContent } = createCollapsibleSection("Genetic Markers");
        let itemsAddedToGenetic = 0;
        alleleTraitCategories.forEach(category => {
            if (TRAIT_DEFINITIONS_PARAM[category]) {
                TRAIT_DEFINITIONS_PARAM[category].forEach(traitDef => {
                    const alleles = plant.genome ? plant.genome[traitDef.id] : undefined; 
                    if (!alleles || alleles.length !== 2) { return; }
                    let recessiveAlleleSymbol = "", dominantAlleleSymbol = traitDef.dominant_allele;
                    if (traitDef.alleles) { for (const key in traitDef.alleles) if (traitDef.alleles[key] !== dominantAlleleSymbol) { recessiveAlleleSymbol = traitDef.alleles[key]; break; } if (!recessiveAlleleSymbol) { const alleleValues = Object.values(traitDef.alleles); recessiveAlleleSymbol = alleleValues.find(val => val !== dominantAlleleSymbol) || alleleValues[alleleValues.length -1];} } 
                    else { logger.warn('uiManager', `Missing 'alleles' definition for genetic marker ${traitDef.id}.`); return; }
                    if (!recessiveAlleleSymbol) { logger.warn('uiManager', `Could not determine recessive allele for ${traitDef.id}.`); recessiveAlleleSymbol = dominantAlleleSymbol; }

                    let phenotypeText = "", phenotypeClass = "";
                    const isHomozygousRecessive = alleles[0] === recessiveAlleleSymbol && alleles[1] === recessiveAlleleSymbol;
                    const isHeterozygous = (alleles[0] === recessiveAlleleSymbol && alleles[1] === dominantAlleleSymbol) || (alleles[0] === dominantAlleleSymbol && alleles[1] === recessiveAlleleSymbol);
                    if (isHomozygousRecessive) { phenotypeText = (traitDef.phenotypes && traitDef.phenotypes.recessive_expressed) || traitDef.recessive_phenotype_text || "Recessive Trait"; if (category === 'genetic_risk_traits') phenotypeClass = "negative-trait"; }
                    else if (isHeterozygous) { phenotypeText = traitDef.carrier_phenotype_text || ((traitDef.phenotypes && traitDef.phenotypes.dominant_expressed) ? `Carrier (Expresses: ${traitDef.phenotypes.dominant_expressed})` : "Carrier"); if (category === 'genetic_risk_traits') phenotypeClass = "carrier-trait"; else phenotypeText = (traitDef.phenotypes && traitDef.phenotypes.dominant_expressed) || "Dominant Trait (Carrier)"; }
                    else { phenotypeText = (traitDef.phenotypes && traitDef.phenotypes.dominant_expressed) || traitDef.homozygous_dominant_phenotype_text || "Dominant Trait"; }
                    if (phenotypeText) { const p = document.createElement('p'); p.textContent = phenotypeText; if (phenotypeClass) p.classList.add(phenotypeClass); sectionContent.appendChild(p); itemsAddedToGenetic++; }
                });
            }
        });
        logger.verbose('uiManager', `Genetic Markers for ${plant.name}: ${itemsAddedToGenetic} items populated.`);
        if (sectionContent.hasChildNodes()) contentWrapper.appendChild(section); else { logger.verbose('uiManager', `Genetic Markers section empty for ${plant.name}, not adding.`); section.remove(); }
    } else { logger.warn('uiManager', `TRAIT_DEFINITIONS_PARAM missing for Genetic Markers on ${plant.name}.`); }
    // --- End Collapsible Sections ---
    card.appendChild(contentWrapper);
    logger.verbose('uiManager', `Content wrapper added for ${plant.name}`);

    const actionsContainer = document.createElement('div'); 
    actionsContainer.className = 'plant-card-actions';

    // Breeder Action Button moved to actionsContainer
    const breederActionButtonMoved = document.createElement('button'); // New instance for clarity
    breederActionButtonMoved.className = 'breeder-action-button'; // Use same class for styling

    if (isNurseryCard) {
        breederActionButtonMoved.classList.add('add');
        const isAlreadySelectedP1 = plant === currentSelectedP1;
        const isAlreadySelectedP2 = plant === currentSelectedP2;
        const bothSlotsFull = !!currentSelectedP1 && !!currentSelectedP2;

        if (isAlreadySelectedP1 || isAlreadySelectedP2) {
            breederActionButtonMoved.textContent = "Selected ✓";
            breederActionButtonMoved.disabled = true;
        } else if (bothSlotsFull) {
            breederActionButtonMoved.textContent = "Slots Full";
            breederActionButtonMoved.disabled = true;
        } else {
            breederActionButtonMoved.textContent = "+ Add to Breeder";
            breederActionButtonMoved.disabled = false;
        }
        
        breederActionButtonMoved.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!breederActionButtonMoved.disabled && typeof onBreederActionCallback === 'function') {
                onBreederActionCallback(plant, 'add', null); 
            }
        });
    } else if (breederSlotType === 'parent1' || breederSlotType === 'parent2') { 
        breederActionButtonMoved.classList.add('remove');
        breederActionButtonMoved.textContent = "X Remove from Slot"; 
        breederActionButtonMoved.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof onBreederActionCallback === 'function') {
                onBreederActionCallback(plant, 'remove', breederSlotType);
            }
        });
    } else { 
        breederActionButtonMoved.style.display = 'none';
    }
    actionsContainer.appendChild(breederActionButtonMoved); // Add to actions container

    const deleteButton = document.createElement('button'); 
    deleteButton.textContent = 'Delete'; deleteButton.className = 'delete-plant-button';
    deleteButton.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Are you sure you want to delete ${plant.name || 'this plant'}?`)) onDeleteCallback(plant.id); });
    actionsContainer.appendChild(deleteButton);

    const exportButton = document.createElement('button'); 
    exportButton.textContent = 'Export Data'; exportButton.className = 'export-plant-button';
    exportButton.addEventListener('click', (e) => { e.stopPropagation(); onExportCallback(plant); });
    actionsContainer.appendChild(exportButton);
    
    if (actionsContainer.hasChildNodes()) card.appendChild(actionsContainer); 
    else { logger.warn('uiManager', `Actions container for ${plant.name} has no buttons, not adding.`); }
    logger.verbose('uiManager', `Actions container added for ${plant.name}`);
    
    header.addEventListener('mouseenter', (event) => showLineageTooltip(plant, event, allPlantsMap, TRAIT_DEFINITIONS_PARAM));
    header.addEventListener('mouseleave', hideLineageTooltip);
    
    logger.debug('uiManager', `renderPlantCard FINISHED for: ${plant.name}. Final card children count: ${card.children.length}`);
    return card;
}

export function updateInventoryDisplay(
    inventory, inventoryDisplayElement, TRAIT_DEFINITIONS_PARAM, allPlantsMap, 
    onDeletePlant, onExportPlant, onBreederActionCallback,
    currentSelectedP1, currentSelectedP2
) {
    logger.info('uiManager', `updateInventoryDisplay() called. Inventory count: ${inventory ? inventory.length : "null/undefined"}`);
    if (!inventoryDisplayElement) { logger.error('uiManager', "inventoryDisplayElement is null in updateInventoryDisplay"); return; }
    inventoryDisplayElement.innerHTML = ''; 
    if (!inventory || inventory.length === 0) {
        logger.info('uiManager', "Inventory is empty or null, nothing to display in nursery.");
        inventoryDisplayElement.innerHTML = '<p style="color: #888; text-align: center; width:100%;">Nursery is empty. Try breeding or importing strains!</p>';
        return;
    }
    if (!TRAIT_DEFINITIONS_PARAM) { 
        logger.error('uiManager', "TRAIT_DEFINITIONS_PARAM is null/undefined in updateInventoryDisplay. Cannot render cards."); 
        console.trace(); 
        return; 
    }

    inventory.forEach((plant, index) => {
        if (!plant) { logger.error('uiManager', `Plant at inventory index ${index} is null/undefined.`); return; }
        const plantCardElement = renderPlantCard(
            plant, TRAIT_DEFINITIONS_PARAM, allPlantsMap, 
            onDeletePlant, onExportPlant, 
            onBreederActionCallback, 
            true, null, 
            currentSelectedP1, currentSelectedP2
        );
        if (plantCardElement) inventoryDisplayElement.appendChild(plantCardElement);
        else logger.error('uiManager', `renderPlantCard returned null for plant: ${plant.name}`);
    });
    logger.debug('uiManager', `updateInventoryDisplay() finished. Children in inventoryDisplayElement: ${inventoryDisplayElement.children.length}`);
}

export function displayPlantInSlot(plant, slotElement, TRAIT_DEFINITIONS_PARAM, allPlantsMap, onBreederActionCallback) {
    logger.debug('uiManager', `displayPlantInSlot() for slot: ${slotElement ? slotElement.id : "NULL SLOT"}, Plant: ${plant ? plant.name : "NO PLANT"}`);
    if (!slotElement) { logger.error('uiManager', "slotElement is null in displayPlantInSlot"); return; }
    const placeholder = slotElement.querySelector('.plant-card-placeholder');
    const existingCard = slotElement.querySelector('.plant-card');
    if (existingCard) existingCard.remove();

    if (plant && TRAIT_DEFINITIONS_PARAM) { 
        if (placeholder) placeholder.style.display = 'none';
        const parentSlotType = slotElement.id === 'parent1-slot' ? 'parent1' : (slotElement.id === 'parent2-slot' ? 'parent2' : 'offspring');
        const card = renderPlantCard(
            plant, TRAIT_DEFINITIONS_PARAM, allPlantsMap, 
            null, null, null, 
            onBreederActionCallback, 
            false, parentSlotType,
            null, null 
        ); 
        if (card) slotElement.appendChild(card);
        else logger.error('uiManager', `renderPlantCard returned null for slot display for plant: ${plant.name}`);
    } else {
        if (placeholder) {
            placeholder.style.display = 'flex';
        } else if (slotElement.id !== 'offspring-display' && !slotElement.querySelector('.plant-card-placeholder')) { 
            const newPlaceholder = document.createElement('div');
            newPlaceholder.className = 'plant-card-placeholder';
            newPlaceholder.textContent = slotElement.id === 'parent1-slot' ? 'Click "+ Breeder" on Plant' : 'Click "+ Breeder" on Plant';
            slotElement.appendChild(newPlaceholder);
            logger.debug('uiManager', `Added new placeholder to slot ${slotElement.id}`);
        }
    }
}

export function updateNurseryHeader(inventoryLength, maxInventorySize) {
    const nurseryHeader = document.querySelector('#nursery h2');
    if (nurseryHeader && maxInventorySize !== undefined) {
        nurseryHeader.textContent = `My Nursery (${inventoryLength}/${maxInventorySize})`;
    }
}

export function highlightSelectedCards(selectedParent1, selectedParent2) {
    logger.verbose('uiManager', "Highlighting selected cards.");
    document.querySelectorAll('#plant-inventory .plant-card').forEach(card => {
        card.classList.remove('selected-for-breeding');
        const plantId = card.dataset.plantId;
        if (selectedParent1 && plantId === selectedParent1.id) {
            card.classList.add('selected-for-breeding');
        }
        if (selectedParent2 && plantId === selectedParent2.id) {
            card.classList.add('selected-for-breeding'); 
        }
    });
}
