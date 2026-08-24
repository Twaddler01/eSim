// globalHelpers.js

// ==================================================
// GAME HELPERS
// ==================================================

const DEFAULT_FONT_FAMILY = 'Arial';

window.addText = function (scene, x, y, text, style = {}) {

    const displayText =
        style.formatNumber
            ? formatNumber(text)
            : text;

    const finalStyle = {
        ...style
    };

    delete finalStyle.formatNumber;

    return scene.add.text(
        x,
        y,
        displayText,
        {
            fontFamily: DEFAULT_FONT_FAMILY,
            ...finalStyle
        }
    );
};

/* USAGE
addText(scene, 100, 100, amount, {
    formatNumber: true
});
*/

// helper ^ window.addText
function formatNumber(value) {
    if (typeof value !== 'number') {
        return value;
    }

    const abs = Math.abs(value);

    if (abs >= 1_000_000) {
        return `${(value / 1_000_000)
            .toFixed(1)
            .replace(/\.0$/, '')}m`;
    }

    if (abs >= 1_000) {
        return `${(value / 1_000)
            .toFixed(1)
            .replace(/\.0$/, '')}k`;
    }

    return value.toString();
}

// ==================================================
// DEBUGGING
// ==================================================

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