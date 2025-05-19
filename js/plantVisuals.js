// js/plantVisuals.js
import { getRandom, getRandomInt, getRandomElement, darkenColor, clamp } from './utils.js';
import * as logger from './logger.js';

const svgNS = "http://www.w3.org/2000/svg";

function lightenColor(colorStr, percent) {
    if (!colorStr) return 'lightgreen';
    if (colorStr.startsWith('#')) {
        let num = parseInt(colorStr.slice(1), 16);
        let amt = Math.round(2.55 * percent);
        let R = (num >> 16) + amt;
        let G = (num >> 8 & 0x00FF) + amt;
        let B = (num & 0x0000FF) + amt;
        R = R > 255 ? 255 : (R < 0 ? 0 : R); 
        G = G > 255 ? 255 : (G < 0 ? 0 : G); 
        B = B > 255 ? 255 : (B < 0 ? 0 : B);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    const predefinedLighter = {
        'Green': '#90EE90', 'LightGreen': '#98FB98', 'DarkGreen': '#00AA00',
        'Purple': '#DDA0DD', 'PinkishPurple': '#C71585', 
        'YellowGreen': '#ADFF2F', 'Orange': '#FFA500', 'White': '#FFFFFF',
        'Red': '#FF6347', 'Pink':'#FFB6C1', 'Yellow': '#FFFFE0', 
        'LightPurple': '#E6E6FA', 'DeepOrange': '#FF8C00', 'Cyan': '#7FFFD4'
    };
    return predefinedLighter[colorStr] || lightenColor('#666666', percent);
}

function createSimplifiedLeafSVG(cx, cy, baseSize, primaryColor, rotation, numLeaflets = 7) {
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("transform", `translate(${cx}, ${cy}) rotate(${rotation})`);
    const strokeColor = darkenColor(primaryColor, 20);

    for (let i = 0; i < numLeaflets; i++) {
        const leaflet = document.createElementNS(svgNS, "path");
        const angleSpread = 130; 
        const angle = numLeaflets > 1 ? (angleSpread / (numLeaflets - 1)) * i - (angleSpread / 2) : 0;
        const lengthFactor = numLeaflets > 1 ? (1 - 0.6 * Math.abs(i - Math.floor(numLeaflets / 2)) / Math.floor(numLeaflets / 2)) : 1;
        const leafletLength = baseSize * lengthFactor * (0.7 + Math.random() * 0.3); 
        const leafletWidth = leafletLength * 0.18 * (0.7 + Math.random() * 0.3); 
        const d = `M0,0 Q${leafletWidth},-${leafletLength * 0.5} 0,-${leafletLength} Q-${leafletWidth},-${leafletLength * 0.5} 0,0 Z`;
        leaflet.setAttribute("d", d); leaflet.setAttribute("fill", primaryColor); leaflet.setAttribute("stroke", strokeColor);
        leaflet.setAttribute("stroke-width", "0.5"); leaflet.setAttribute("transform", `rotate(${angle})`);
        group.appendChild(leaflet);
    }
    return group;
}

export function generateSilhouetteSVG(plant, TRAIT_DEFINITIONS, options = { width: 200, height: 250, isLightbox: false }) {
    logger.debug('plantVisuals', `Generating SVG for plant: ${plant ? plant.name : 'N/A'}`);
    const svg = document.createElementNS(svgNS, "svg");
    const viewBoxWidth = options.width;
    const viewBoxHeight = options.height;
    svg.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxHeight}`);

    if (!plant || !TRAIT_DEFINITIONS || !TRAIT_DEFINITIONS.numerical_traits || !TRAIT_DEFINITIONS.constants) {
        logger.error('plantVisuals', "generateSilhouetteSVG missing critical data.", {plantExists: !!plant, tdExists: !!TRAIT_DEFINITIONS, hasNumT: !!TRAIT_DEFINITIONS?.numerical_traits, hasConst: !!TRAIT_DEFINITIONS?.constants});
        const errorText = document.createElementNS(svgNS, "text");
        errorText.setAttribute("x", "10"); errorText.setAttribute("y", "20");
        errorText.textContent = "Error: Visual data unavailable.";
        errorText.setAttribute("fill", "red"); errorText.style.fontSize = "12px";
        svg.appendChild(errorText);
        return svg;
    }

    const tdNum = TRAIT_DEFINITIONS.numerical_traits;
    const heightTraitDef = tdNum.find(t=>t.id==='height');
    const widthTraitDef = tdNum.find(t=>t.id==='width');
    const yieldTraitDef = tdNum.find(t => t.id === 'genetic_yield_potential');
    const thcTraitDef = tdNum.find(t => t.id === 'thc');

    if (!heightTraitDef || !widthTraitDef || !yieldTraitDef || !thcTraitDef) {
        logger.error('plantVisuals', "One or more essential trait definitions for visuals are missing.", {heightTraitDef, widthTraitDef, yieldTraitDef, thcTraitDef });
        const errorText = document.createElementNS(svgNS, "text");
        errorText.setAttribute("x", "10"); errorText.setAttribute("y", "20");
        errorText.textContent = "Error: Trait defs missing for visual.";
        errorText.setAttribute("fill", "red"); errorText.style.fontSize = "12px";
        svg.appendChild(errorText);
        return svg;
    }
    
    const plantHeight = plant.height !== undefined ? plant.height : heightTraitDef.min;
    const plantWidth = plant.width !== undefined ? plant.width : widthTraitDef.min;
    const geneticYieldPotential = plant.genetic_yield_potential !== undefined ? plant.genetic_yield_potential : yieldTraitDef.min;
    const plantThc = plant.thc !== undefined ? plant.thc : 0;

    const plantHeightVisual = viewBoxHeight * 0.85 * (clamp(plantHeight, heightTraitDef.min, heightTraitDef.max) / heightTraitDef.max);
    const plantWidthVisual = viewBoxWidth * 0.75 * (clamp(plantWidth, widthTraitDef.min, widthTraitDef.max) / widthTraitDef.max);
    const yieldFactor = clamp((geneticYieldPotential - yieldTraitDef.min) / (yieldTraitDef.max - yieldTraitDef.min), 0.01, 1);
    
    const primaryColor = plant.primaryColor || 'Green';
    const accentColor = plant.accentColor || 'Orange';

    const stem = document.createElementNS(svgNS, "rect");
    const stemWidth = Math.max(viewBoxWidth * 0.015, plantWidthVisual * 0.07 * (0.4 + yieldFactor * 0.6) );
    const stemBaseY = viewBoxHeight - (options.isLightbox ? 10 : 5);
    const stemTopY = stemBaseY - plantHeightVisual;

    stem.setAttribute("x", (viewBoxWidth - stemWidth) / 2);
    stem.setAttribute("y", stemTopY);
    stem.setAttribute("width", stemWidth);
    stem.setAttribute("height", plantHeightVisual);
    stem.setAttribute("fill", primaryColor.toLowerCase().includes('purple') ? darkenColor('Indigo',10) : darkenColor('SaddleBrown',10));
    stem.setAttribute("rx", stemWidth * 0.2); 
    stem.setAttribute("ry", stemWidth * 0.2);
    svg.appendChild(stem);

    const numNodeLevels = Math.max(2, Math.floor(2 + 5 * yieldFactor));
    const yIncrement = plantHeightVisual > 0 ? plantHeightVisual / (numNodeLevels + 1) : 10;  // Prevent division by zero

    for (let i = 0; i < numNodeLevels; i++) {
        const progress = numNodeLevels > 1 ? i / (numNodeLevels -1) : 0;
        const currentY = stemTopY + yIncrement * (numNodeLevels - 1 - i) + yIncrement * 0.5;
        const structureWidthAtLevel = plantWidthVisual * (1 - progress * 0.6);
        const leafBaseSize = viewBoxHeight * 0.15 * (1 - progress * 0.5) * (0.6 + yieldFactor * 0.4);

        if (leafBaseSize > 3) {
            const numLeaflets = (plant.genome && plant.genome.leaf_leaflet_count_gene) ? 
                               parseInt(getRandomElement(plant.genome.leaf_leaflet_count_gene)) : 
                               (options.isLightbox ? 7 : 5);
            
            const leafLX = viewBoxWidth/2 - structureWidthAtLevel * getRandom(0.15, 0.35);
            const leafLY = currentY + getRandom(-yIncrement * 0.1, yIncrement * 0.1);
            const leafLAngle = -getRandom(30, 70) + progress * 20;
            svg.appendChild(createSimplifiedLeafSVG(leafLX, leafLY, leafBaseSize, primaryColor, leafLAngle, numLeaflets));

            const leafRX = viewBoxWidth/2 + structureWidthAtLevel * getRandom(0.15, 0.35);
            const leafRY = currentY + getRandom(-yIncrement * 0.1, yIncrement * 0.1);
            const leafRAngle = getRandom(30, 70) - progress * 20;
            svg.appendChild(createSimplifiedLeafSVG(leafRX, leafRY, leafBaseSize, primaryColor, leafRAngle, numLeaflets));
        }

        const budClusterSize = plantWidthVisual * 0.15 * (0.5 + yieldFactor * 1.5) * (0.4 + progress * 0.6); 
        const numBudEllipses = Math.floor(2 + 5 * yieldFactor * (0.5 + progress));
        
        for (let j = 0; j < numBudEllipses; j++) {
            const bud = document.createElementNS(svgNS, "ellipse");
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * budClusterSize * 0.3; 
            const budX = viewBoxWidth/2 + Math.cos(angle) * radius;
            const budY = currentY + Math.sin(angle) * radius * 0.5 - budClusterSize * 0.05; 
            const budRx = budClusterSize * (0.2 + Math.random() * 0.3) * (0.7 + yieldFactor);
            const budRy = budRx * (0.6 + Math.random() * 0.3);

            bud.setAttribute("cx", budX); bud.setAttribute("cy", budY);
            bud.setAttribute("rx", Math.max(1.5, budRx)); bud.setAttribute("ry", Math.max(1.5, budRy));
            bud.setAttribute("fill", lightenColor(primaryColor, 10 + Math.random() * 15 + (plantThc/(thcTraitDef.max || 30) * 10)));
            bud.setAttribute("stroke", darkenColor(primaryColor, 25));
            bud.setAttribute("stroke-width", "0.4");
            svg.appendChild(bud);

            if (options.isLightbox && Math.random() < 0.6 * yieldFactor) {
                const pistilCount = getRandomInt(1,2);
                for(let k=0; k < pistilCount; k++){
                    const pistil = document.createElementNS(svgNS, "path");
                    const pAngle = (Math.random() - 0.5) * 120 - 90; 
                    const pLength = budRx * (0.8 + Math.random() * 0.7);
                    const d = `M0,0 Q${pLength*0.3 * (Math.random() > 0.5 ? 1:-1)},${-pLength*0.5} 0,${-pLength}`;
                    pistil.setAttribute("d", d); pistil.setAttribute("stroke", accentColor);
                    pistil.setAttribute("stroke-width", "0.6"); pistil.setAttribute("fill", "none");
                    pistil.setAttribute("stroke-linecap", "round");
                    pistil.setAttribute("transform", `translate(${budX}, ${budY}) rotate(${pAngle})`);
                    svg.appendChild(pistil);
                }
            }
        }
    }
    
    const enableSparklesConstant = TRAIT_DEFINITIONS.constants && TRAIT_DEFINITIONS.constants.ENABLE_SPARKLES;
    if (options.isLightbox && plantThc > (thcTraitDef.max * 0.6) && enableSparklesConstant !== false) {
        const numSparkles = Math.floor((plantThc / (thcTraitDef.max || 30)) * (options.isLightbox ? 40 : 15));
        for (let i = 0; i < numSparkles; i++) {
            const sparkle = document.createElementNS(svgNS, "circle");
            const randomY = getRandom(stemTopY, stemBaseY - plantHeightVisual * 0.1);
            const yProgress = plantHeightVisual > 0 ? (randomY - stemTopY) / plantHeightVisual : 0; 
            const currentPlantWidthAtY = plantWidthVisual * (1 - yProgress * 0.6); 

            sparkle.setAttribute("cx", viewBoxWidth/2 + (Math.random()-0.5) * currentPlantWidthAtY * 0.8 );
            sparkle.setAttribute("cy", randomY);
            sparkle.setAttribute("r", getRandom(0.5, 1.2)); 
            sparkle.setAttribute("fill", Math.random() < 0.7 ? "rgba(255, 255, 230, 0.75)" : "rgba(255, 220, 180, 0.7)"); 
            sparkle.style.pointerEvents = "none"; 
            svg.appendChild(sparkle);
        }
    }

    if (svg.childNodes.length === 0 && !svg.querySelector('text[fill="red"]')) {
        logger.error('plantVisuals', `SVG for ${plant.name} is empty after generation process but no explicit error was caught.`);
        const emptyMarker = document.createElementNS(svgNS, "rect");
        emptyMarker.setAttribute("x", "0"); emptyMarker.setAttribute("y", "0");
        emptyMarker.setAttribute("width", viewBoxWidth.toString()); emptyMarker.setAttribute("height", viewBoxHeight.toString());
        emptyMarker.setAttribute("fill", "rgba(255,100,0,0.1)"); // Orangeish transparent fill
        svg.appendChild(emptyMarker);
        const textMarker = document.createElementNS(svgNS, "text");
        textMarker.setAttribute("x", "10"); textMarker.setAttribute("y", "50");
        textMarker.textContent = "[Empty SVG Generated]";
        textMarker.setAttribute("fill", "orange");textMarker.style.fontSize = "10px";
        svg.appendChild(textMarker);
    } else if (!svg.querySelector('text[fill="red"]')) {
         logger.debug('plantVisuals', `SVG generation successful for plant: ${plant.name}. Child count: ${svg.childNodes.length}`);
    }
    return svg;
}