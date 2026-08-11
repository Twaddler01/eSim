import BootScene from './scenes/BootScene.js';
import CreationScene from './scenes/CreationScene.js';
import MainScene from './scenes/MainScene.js';
import { DEBUG } from './config.js';
if (DEBUG) {
    import('./debug/debug.js'); // logExport, htmlExport
    import('./debug/zoom.js'); // zoom
}

// ==================================================

// GLOBAL GAME OBJECT HELPERS
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