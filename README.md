# ChronoCrosser: Cannabis Cultivator V1.0

<p align="center"><img src="images/logo.png" alt="ChronoCrosser Logo" width="300"/></p>

**Welcome to ChronoCrosser: Cannabis Cultivator!** Dive into the world of virtual cannabis breeding and genetics. This simulation game allows you to select parent strains, breed new offspring, and observe how genetic traits are passed down through generations. Hone your cultivation skills to create unique strains with desirable characteristics!

This project is open source and can be found at: [github.com/massEntropy/chronocrosser](https://github.com/massEntropy/chronocrosser)

---

## Table of Contents

- [About The Game](#about-the-game)
- [Features](#features)
- [Gameplay](#gameplay)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the Game](#running-the-game)
- [File Structure](#file-structure)
- [Future Development Ideas](#future-development-ideas)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## About The Game

ChronoCrosser is a browser-based simulation game where players engage in the art and science of cannabis breeding. Starting with a few initial "landrace" strains, players can cross-breed plants to discover new genetic combinations. The game aims to simulate, in a simplified yet engaging manner, how traits like plant appearance, color, cannabinoid content (THC/CBD), and terpene profiles are inherited.

The goal is to explore genetic possibilities, cultivate unique strains with interesting names, and perhaps even achieve specific breeding objectives (a potential future feature).

---

## Features (V1.0)

*   **Genetic Inheritance:**
    *   **Numerical Traits:** Height, width, THC, CBD, and genetic yield potential are inherited via parental averaging with a chance of mutation.
    *   **Categorical Traits:** Primary plant color, accent (pistil) color, and primary/secondary terpenes are inherited from parents with a chance of mutation.
    *   **Allele-Based Traits:**
        *   **Plant Sex:** XX (Female) / XY (Male) chromosome system.
        *   **Sex Stability:** A gene influences the plant's stability in expressing its determined sex, with recessive alleles increasing hermaphrodite risk.
        *   **Pest Susceptibility:** A gene influencing resistance or susceptibility to pests.
        *   **Example Phenotype Genes:** Leaf serration and a fictional "S-420 Factor" (affecting THC) are modeled with dominant/recessive alleles.
*   **Procedural Strain Naming:** A dynamic naming system generates unique and often humorous strain names based on parentage, terpenes, or random thematic words.
*   **Visual Plant Silhouettes:** Each plant is represented by a dynamically generated SVG silhouette that reflects its height, width, yield potential, and primary color (using a stable, simplified visual generator).
*   **Collapsible Plant Cards:** Detailed plant information is organized into expandable sections ("Core Stats," "Aroma & Appearance," "Genetic Markers") for a clean UI.
*   **Breeding Station:**
    *   Floating side panel for easy access.
    *   Select parent plants using a click-to-assign system ("+ Breeder" / "Remove" buttons).
    *   Offspring preview after successful breeding.
*   **Nursery Management:**
    *   View your collection of cultivated strains.
    *   Delete unwanted plants to manage inventory space (max inventory limit).
*   **Lineage Tracking:** Hover over a plant card to view a tooltip displaying its recent ancestry and key ancestral traits.
*   **Strain Sharing & Persistence:**
    *   **Export Strain Card:** Generate a JSON data string for any plant to share with others.
    *   **Import Strain Card:** Paste JSON data to add a shared strain to your nursery.
    *   **Image/Data Download:** Download a PNG image of a plant's visual and a separate JSON file of its data via a lightbox.
*   **Modular Codebase:** Written in modern JavaScript (ES6 Modules) for better organization and maintainability.
*   **Centralized Logging:** Features a `logger.js` module with configurable log levels for easier debugging.
*   **Theming:** A dark "Neon" UI theme inspired by the game's logo.
*   **Favicons:** Custom favicons for browser tabs and mobile home screens.

---

## Gameplay

1.  **Start:** The game begins with a few randomly generated "landrace" strains in your Nursery.
2.  **Inspect Plants:** Click on the collapsible sections of a plant card to view its detailed traits. Click the plant's silhouette to view a larger image in a lightbox.
3.  **Select Parents:**
    *   In the Nursery, click the **"+ Breeder"** button on a plant card's header to assign it to an available parent slot in the Breeding Station (located in the left-side panel).
    *   One **Female (♀)** and one **Male (♂)** plant are required for breeding.
    *   To remove a plant from a breeding slot, click the **"Remove"** button on its card in the slot.
4.  **Breed:** Once a valid male and female parent are selected, the "Breed Plants" button will become active. Click it to generate a new offspring.
5.  **Offspring:** The new offspring will briefly appear in the "New Offspring" display in the side panel and will then be automatically added to your Nursery.
6.  **Manage Nursery:**
    *   Your nursery has a maximum plant capacity.
    *   Use the **"Delete"** button on a plant card in the nursery to remove unwanted strains.
7.  **Share Strains:**
    *   Use the **"Export"** button on a plant card in the nursery to get its JSON data string. Copy this to share.
    *   Use the "Import Strain Card" section in the side panel to paste shared JSON data and add new strains to your game.
    *   From the plant image lightbox, you can download a PNG of the plant's visual and its JSON data separately.
8.  **Track Lineage:** Hover over any plant card's header to see a tooltip showing its recent ancestors and their notable traits.
9.  **Continue Experimenting:** Repeat the process to cultivate new generations, aiming for specific trait combinations or just exploring the genetic possibilities!

---

## Tech Stack

*   **HTML5**
*   **CSS3** (Plain CSS with Custom Properties for theming)
*   **JavaScript (ES6+ Modules)** (Plain/Vanilla JS, no external frameworks or libraries for core game logic)

---

## Getting Started

### Prerequisites

*   A modern web browser that supports ES6 Modules (e.g., Chrome, Firefox, Edge, Safari).
*   No other specific software is required to run the game.

### Running the Game

1.  **Clone or Download the Repository:**
    ```bash
    git clone https://github.com/massEntropy/chronocrosser.git
    cd chronocrosser
    ```
    Alternatively, download the project files as a ZIP from the GitHub repository page ([https://github.com/massEntropy/chronocrosser](https://github.com/massEntropy/chronocrosser)) and extract them.

2.  **Open `index.html` in Your Browser:**
    *   Navigate to the project directory where you cloned or extracted the files.
    *   Open the `index.html` file directly in your web browser.
    *   **Note on Local Server for ES6 Modules:** Due to the use of ES6 Modules (`import`/`export`), some browsers restrict loading them directly from the local file system (`file:///...`) due to security policies (CORS). If you encounter issues (like modules not loading):
        *   **Recommended:** Use a simple local HTTP server. If you have Node.js and npm installed, you can easily install and run a static server:
            ```bash
            npm install -g serve 
            serve . 
            ``` 
            Then navigate to the local URL provided (e.g., `http://localhost:3000`).
        *   Many code editors (like VS Code) have extensions (e.g., "Live Server") that can serve local files easily.
        *   Python's built-in HTTP server: `python -m http.server` (for Python 3) or `python -m SimpleHTTPServer` (for Python 2) in the project directory.

---

---

## File Structure

The project is organized as follows:

```text
chronocrosser/
├── images/
│   ├── logo.png
│   ├── favicon.ico
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   └── apple-touch-icon.png
├── js/
│   ├── config.js           # Static configuration like name parts for strain namer
│   ├── lineageTracker.js   # Logic for the lineage tooltip display
│   ├── logger.js           # Centralized logging module
│   ├── main.js             # Main game logic, initialization, event orchestration
│   ├── plantFactory.js     # Responsible for creating new plant objects
│   ├── plantGenetics.js    # Core logic for gene inheritance and trait determination
│   ├── plantVisuals.js     # Generates SVG plant silhouettes
│   ├── strainNamer.js      # Procedural generation of strain names
│   ├── uiManager.js        # Handles DOM manipulation, card rendering, UI updates
│   └── utils.js            # General utility functions
├── index.html              # Main HTML file for the game interface
├── style.css               # All CSS styles for presentation
├── traits.json             # Configurable JSON definitions for plant traits, names, and game constants
├── LICENSE                 # MIT License file
└── README.md               # This documentation file


## Future Development Ideas

*   **Advanced Visuals:** Implement more complex and varied plant visuals based on a wider range of genetic traits (e.g., detailed leaf shapes, branching patterns, bud structures, trichome density).
*   **Environmental Factors:** Introduce environmental conditions (light, nutrients, stress) that can influence a plant's phenotype expression and potentially trigger recessive traits or hermaphroditism.
*   **Advanced Genetic Mechanics:**
    *   Polygenic traits for more nuanced inheritance of THC, CBD, yield.
    *   Incomplete dominance or co-dominance for certain traits.
    *   Epistasis (one gene affecting the expression of another).
    *   Linked genes.
*   **Hermaphrodite Mechanics:** Allow self-pollination for hermaphroditic plants (S1 generation) and explore its genetic consequences.
*   **Pollen System:** Collect and store pollen from male plants to be used for targeted pollination of females.
*   **Game Goals/Challenges:** Introduce breeding objectives, unlockable traits, or market simulation.
*   **Persistence:** Implement saving and loading game progress using `localStorage` or other methods.
*   **User Accounts & Online Sharing (Server-Side):** A more advanced version could allow users to save strains to a database and share them more directly.

---

## Contributing

Contributions, issues, and feature requests are welcome! Please feel free to:
1.  Fork the repository: `https://github.com/massEntropy/chronocrosser/fork`
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request.

Please make sure to update tests as appropriate and adhere to the existing coding style.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
MIT License
Copyright (c) [Year] [Your Name/Organization - e.g., massEntropy]
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Acknowledgements

*   massEntropy

---
