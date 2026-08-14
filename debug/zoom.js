// debug/zoom.js
let zoom = 1;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

let panX = 0;
let panY = 0;

let zoomEnabled = false;


// ==================================================
// Controls
// ==================================================

const controls = document.createElement('div');
controls.id = 'debugZoomControls';
controls.innerHTML = `
    <button id="debugZoomToggle">ZOOM</button>
    <button id="debugZoomReset">RESET</button>
    <button id="debugZoomOut">−</button>
    <button id="debugZoomIn">+</button>
`;
document.body.appendChild(controls);

// ==================================================
// Styling
// ==================================================

const style = document.createElement('style');

style.textContent = `
    #debugZoomControls {
        position: fixed !important;

        top: 10px !important;
        right: 10px !important;

        z-index: 2147483647 !important;

        display: flex !important;
        gap: 6px !important;

        pointer-events: auto !important;
    }

    #debugZoomControls button {
        height: 50px !important;

        padding: 0 12px !important;

        font-size: 24px !important;
        line-height: 1 !important;

        background: white !important;
        color: black !important;

        border: 2px solid black !important;
        border-radius: 6px !important;

        pointer-events: auto !important;
    }

    #debugZoomToggle {
        font-size: 14px !important;
        font-weight: bold !important;
    }
`;

document.head.appendChild(style);


// ==================================================
// Toggle
// ==================================================

function updateToggle() {

    const button =
        document.getElementById('debugZoomToggle');

    button.textContent =
        zoomEnabled
            ? 'ZOOM ON'
            : 'ZOOM OFF';

}


document
    .getElementById('debugZoomToggle')
    .addEventListener('click', () => {

        zoomEnabled = !zoomEnabled;

        updateToggle();

    });

// ==================================================
// Reset
// ==================================================

document
    .getElementById('debugZoomReset')
    .addEventListener('click', () => {

        // Restore original view.
        zoom = 1;

        panX = 0;
        panY = 0;

        // Disable debug zoom mode.
        zoomEnabled = false;

        // Update everything.
        updateTransform();
        updateToggle();

    });

// ==================================================
// Canvas
// ==================================================

function getGameCanvas() {

    return document.querySelector('canvas');

}


// ==================================================
// Apply transform
// ==================================================

function updateTransform() {

    const canvas = getGameCanvas();

    if (!canvas) return;

    canvas.style.transformOrigin = '0 0';

    canvas.style.transform =
        `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;

}


// ==================================================
// Buttons
// ==================================================

document
    .getElementById('debugZoomIn')
    .addEventListener('click', () => {

        zoom = Math.min(
            zoom + ZOOM_STEP,
            MAX_ZOOM
        );

        updateTransform();

    });


document
    .getElementById('debugZoomOut')
    .addEventListener('click', () => {

        zoom = Math.max(
            zoom - ZOOM_STEP,
            MIN_ZOOM
        );

        updateTransform();

    });


// ==================================================
// Touch helpers
// ==================================================

function getDistance(a, b) {

    const dx = b.clientX - a.clientX;
    const dy = b.clientY - a.clientY;

    return Math.hypot(dx, dy);

}


function getMidpoint(a, b) {

    return {
        x: (a.clientX + b.clientX) / 2,
        y: (a.clientY + b.clientY) / 2
    };

}


// ==================================================
// Gesture state
// ==================================================

let gesture = null;


// ==================================================
// Touch start
// ==================================================

document.addEventListener(
    'touchstart',
    event => {

        // Zoom mode disabled.
        if (!zoomEnabled) {
            return;
        }


        // Don't process our own buttons.
        if (
            event.target.closest &&
            event.target.closest('#debugZoomControls')
        ) {
            return;
        }


        if (event.touches.length === 1) {

            const touch = event.touches[0];

            gesture = {

                type: 'pan',

                startX: touch.clientX,
                startY: touch.clientY,

                originalPanX: panX,
                originalPanY: panY

            };

        }


        if (event.touches.length >= 2) {

            const a = event.touches[0];
            const b = event.touches[1];

            const midpoint =
                getMidpoint(a, b);


            gesture = {

                type: 'pinch',

                startDistance:
                    getDistance(a, b),

                startZoom:
                    zoom,

                midpointX:
                    midpoint.x,

                midpointY:
                    midpoint.y,

                originalPanX:
                    panX,

                originalPanY:
                    panY

            };

        }

    },
    { passive: true }
);


// ==================================================
// Touch move
// ==================================================

document.addEventListener(
    'touchmove',
    event => {

        // ------------------------------------------
        // IMPORTANT
        //
        // When OFF, we do absolutely nothing.
        //
        // Browser scrolling / Phaser behavior is
        // therefore allowed to continue normally.
        // ------------------------------------------

        if (!zoomEnabled) {
            return;
        }


        if (
            event.target.closest &&
            event.target.closest('#debugZoomControls')
        ) {
            return;
        }


        if (!gesture) return;


        // ------------------------------------------
        // PAN
        // ------------------------------------------

        if (
            gesture.type === 'pan' &&
            event.touches.length === 1
        ) {

            const touch = event.touches[0];

            const dx =
                touch.clientX - gesture.startX;

            const dy =
                touch.clientY - gesture.startY;


            panX =
                gesture.originalPanX + dx;

            panY =
                gesture.originalPanY + dy;


            updateTransform();

            return;
        }


        // ------------------------------------------
        // PINCH
        // ------------------------------------------

        if (event.touches.length >= 2) {

            const a = event.touches[0];
            const b = event.touches[1];

            const distance =
                getDistance(a, b);

            const midpoint =
                getMidpoint(a, b);


            let newZoom =
                gesture.startZoom *
                (distance / gesture.startDistance);


            newZoom = Math.max(
                MIN_ZOOM,
                Math.min(MAX_ZOOM, newZoom)
            );


            const contentX =
                (
                    gesture.midpointX -
                    gesture.originalPanX
                ) / gesture.startZoom;


            const contentY =
                (
                    gesture.midpointY -
                    gesture.originalPanY
                ) / gesture.startZoom;


            zoom = newZoom;


            panX =
                midpoint.x -
                contentX * zoom;

            panY =
                midpoint.y -
                contentY * zoom;


            updateTransform();

        }

    },
    { passive: true }
);


// ==================================================
// Touch end
// ==================================================

document.addEventListener(
    'touchend',
    event => {

        if (event.touches.length === 0) {
            gesture = null;
        }

    }
);


// ==================================================
// Initial
// ==================================================

updateToggle();
updateTransform();