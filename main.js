import BootScene from './scenes/BootScene.js';
import CreationScene from './scenes/CreationScene.js';

import { DEBUG } from './config.js';
if (DEBUG) {
    import('./debug/debug.js'); // logExport, htmlExport
    import('./debug/zoom.js'); // zoom
}

// window (global) functions
import('./utils/globalHelpers.js');

/*
OTHER USEFUL CONSOLE FUBCTIONS:
console.dir(object);     // Interactive object inspection
console.table(array);    // Excellent for arrays/objects
console.group('Name');   // Start a collapsible group
console.groupEnd();      // End group
console.warn('Warning'); // Yellow warning
console.error('Error');  // Error
console.time('test');    // Start timer
console.timeEnd('test'); // End timer + elapsed time
console.count('name');   // Count how many times something runs
console.trace();         // Show the call stack
*/

// PHASER START
const MAX_WIDTH = 1280; // Max width for mobile portrait
const MAX_HEIGHT = 1920; // Max height for mobile portrait
const ASPECT_RATIO = 3 / 2; // Portrait aspect ratio (adjust as needed)

function getGameSize() {
    let width = Math.min(window.innerWidth, MAX_WIDTH); // Ensure the width is portrait-friendly
    let height = Math.min(window.innerHeight, width * ASPECT_RATIO); // Maintain aspect ratio

    return { width, height };
}

const { width, height } = getGameSize();

const config = {
    type: Phaser.AUTO,
    scene: [ 
        BootScene,
        CreationScene
    ],
    scale: {
        mode: Phaser.Scale.FIT, // FIT is good for preserving aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game
        width: width,
        height: height,
        min: {
            width: 320, // Minimum width for small devices
            height: 480 // Minimum height for portrait screens
        },
        max: {
            width: MAX_WIDTH, // Maximum width
            height: MAX_HEIGHT // Maximum height (portrait-optimized)
        }
    }
};

const game = new Phaser.Game(config);

// Optional resize handler (may not be necessary if using Phaser's FIT mode)
window.addEventListener("resize", () => {
    const { width, height } = getGameSize();
    game.scale.resize(width, height);
});