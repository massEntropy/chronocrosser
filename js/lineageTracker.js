// js/lineageTracker.js
import * as logger from './logger.js'; // Import the logger

// Helper function to get key trait summary for a plant
function getKeyTraitSummary(plant, currentTraitDefinitions) { 
    if (!plant || !currentTraitDefinitions) {
        logger.warn('lineageTracker', "getKeyTraitSummary missing plant or trait definitions.");
        return "";
    }

    let summaryParts = [];

    // 1. Check for expressed major negative genetic risk traits
    if (currentTraitDefinitions.genetic_risk_traits && plant.genome) { // Check plant.genome exists
        currentTraitDefinitions.genetic_risk_traits.forEach(traitDef => {
            const alleles = plant.genome[traitDef.id];
            if (!alleles || alleles.length !== 2 || !traitDef.alleles || !traitDef.dominant_allele) return;

            let recessiveAlleleSymbol = "";
            for (const key in traitDef.alleles) {
                if (traitDef.alleles[key] !== traitDef.dominant_allele) {
                    recessiveAlleleSymbol = traitDef.alleles[key];
                    break;
                }
            }
            if (!recessiveAlleleSymbol && Object.values(traitDef.alleles).length > 0) {
                const alleleValues = Object.values(traitDef.alleles);
                recessiveAlleleSymbol = alleleValues.find(val => val !== traitDef.dominant_allele) || alleleValues[0];
                 if (recessiveAlleleSymbol === traitDef.dominant_allele && alleleValues.length > 1) {
                    recessiveAlleleSymbol = alleleValues.find(val => val !== traitDef.dominant_allele && val !== alleleValues[0]) || alleleValues[1] || alleleValues[0];
                }
            }
             if (!recessiveAlleleSymbol) { // Still no recessive symbol found
                logger.warn('lineageTracker', `Could not determine recessive allele for risk trait ${traitDef.id} in getKeyTraitSummary.`);
                return; // Skip this trait if symbols are unclear
            }


            const isHomozygousRecessive = alleles[0] === recessiveAlleleSymbol && alleles[1] === recessiveAlleleSymbol;

            if (isHomozygousRecessive && traitDef.recessive_phenotype_text) {
                let shortText = traitDef.recessive_phenotype_text.replace("Highly ", "").replace("High ", "").replace("!", "");
                summaryParts.push(`[-] ${shortText}`);
            }
        });
    }


    if (summaryParts.length > 0) { // Prioritize showing negative traits
        return ` (${summaryParts.join(', ')})`;
    }

    // 2. If no major negative traits, check cannabinoids
    const thcTraitDef = currentTraitDefinitions.numerical_traits?.find(t => t.id === 'thc');
    const cbdTraitDef = currentTraitDefinitions.numerical_traits?.find(t => t.id === 'cbd');

    if (thcTraitDef && plant.thc !== undefined && plant.thc > (thcTraitDef.max * 0.7)) {
        summaryParts.push(`High THC: ${plant.thc.toFixed(1)}%`);
    } else if (cbdTraitDef && plant.cbd !== undefined && plant.cbd > (cbdTraitDef.max * 0.7)) {
        summaryParts.push(`High CBD: ${plant.cbd.toFixed(1)}%`);
    }

    // 3. Add primary terpene
    if (plant.primaryTerpene) {
        summaryParts.push(`${plant.primaryTerpene}`);
    }
    
    if (summaryParts.length > 2) {
        summaryParts = summaryParts.slice(0, 2);
    }
    
    if (summaryParts.length > 0) {
        return ` (${summaryParts.join('; ')})`;
    }

    return "";
}


export function getLineageTextRecursive(plantId, allPlantsMap, currentTraitDefinitions, currentDepth, maxDepth, indent = "", isLastSibling = false) {
    // logger.verbose('lineageTracker', `getLineageTextRecursive for ID: ${plantId}, Depth: ${currentDepth}`);
    if (currentDepth > maxDepth || !plantId) {
        return "";
    }
    const plant = allPlantsMap.get(plantId);
    if (!plant) {
        logger.warn('lineageTracker', `Plant ID ${plantId} not found in allPlantsMap for lineage.`);
        return `${indent}${currentDepth > 0 ? (isLastSibling ? "└─" : "├─") : ""}Unknown Ancestor (ID: ${plantId})\n`;
    }

    let linePrefix = currentDepth > 0 ? (isLastSibling ? "└─ " : "├─ ") : "";
    
    const traitSummary = getKeyTraitSummary(plant, currentTraitDefinitions);

    let plantNameDisplay = (currentDepth === 0) ? 
        `<strong>${plant.name || 'Unnamed'} (G${plant.generation !== undefined ? plant.generation : 'N/A'})${traitSummary}</strong>` : 
        `${plant.name || 'Unnamed'} (G${plant.generation !== undefined ? plant.generation : 'N/A'})${traitSummary}`;
    
    let lineageStr = `${indent}${linePrefix}${plantNameDisplay}\n`;
    
    const newIndent = indent + (currentDepth > 0 ? (isLastSibling ? "    " : "│   ") : "");

    if (plant.parents && plant.parents.length === 2 && currentDepth < maxDepth) {
        const [p1Id, p2Id] = plant.parents;
        if (p1Id) {
            lineageStr += getLineageTextRecursive(p1Id, allPlantsMap, currentTraitDefinitions, currentDepth + 1, maxDepth, newIndent, !p2Id);
        }
        if (p2Id) {
            lineageStr += getLineageTextRecursive(p2Id, allPlantsMap, currentTraitDefinitions, currentDepth + 1, maxDepth, newIndent, true);
        }
    } else if (plant.parents && plant.parents[0] && currentDepth < maxDepth) { 
         lineageStr += getLineageTextRecursive(plant.parents[0], allPlantsMap, currentTraitDefinitions, currentDepth + 1, maxDepth, newIndent, true);
    }
    return lineageStr;
}

export function positionLineageTooltip(tooltipElement, event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    if (!tooltipElement) {
        logger.warn('lineageTracker', "positionLineageTooltip called with no tooltipElement.");
        return;
    }

    const tooltipRect = tooltipElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = mouseY + 15;
    let left = mouseX + 15;

    if (left + tooltipRect.width > viewportWidth -10) { 
        left = mouseX - tooltipRect.width - 15;
    }
    if (top + tooltipRect.height > viewportHeight -10) { 
        top = mouseY - tooltipRect.height - 15;
    }
    // Ensure tooltip doesn't go off-screen at top or left
    if (top < 5) top = 5;
    if (left < 5) left = 5;

    tooltipElement.style.left = `${left}px`;
    tooltipElement.style.top = `${top}px`;
}