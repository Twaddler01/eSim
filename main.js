//import { DEBUG } from './config.js';
//if (DEBUG) {
    import('./debug/debug.js'); // logExport, htmlExport
    import('./debug/zoom.js'); // zoom
//}

import BootScene from './scenes/BootScene.js';
import CreationScene from './scenes/CreationScene.js';
import MainScene from './scenes/MainScene.js';

// ==================================================
// GLOBAL GAME HELPERS
// ==================================================

const DEFAULT_FONT_FAMILY = 'Arial';
window.addText = function (scene, x, y, text, style = {}) {
    return scene.add.text(
        x,
        y,
        text,
        {
            fontFamily: DEFAULT_FONT_FAMILY,
            ...style
        }
    );
};

window.jp = (...args) => {

    if (args.length !== 1) {
        console.log(...args);
        return;
    }

    const item = args[0];

    // Array of Object.entries()
    if (
        Array.isArray(item) &&
        item.every(
            entry =>
                Array.isArray(entry) &&
                entry.length === 2
        )
    ) {
        console.table(
            Object.fromEntries(item)
        );
        return;
    }

    // Regular arrays
    if (Array.isArray(item)) {
        console.log(
            JSON.stringify(item, null, 2)
        );
        return;
    }

    // Objects
    if (
        item !== null &&
        typeof item === 'object'
    ) {
        try {
            console.log(
                JSON.stringify(item, null, 2)
            );
        } catch {
            console.log(item);
        }
        return;
    }

    console.log(item);
};

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
        CreationScene, 
        MainScene
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