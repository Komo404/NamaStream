import { makeDraggable, makeMovable } from "./interactions.js";
import { restoreBarPositions, saveRestoreBarSizes } from "./positioning.js";

export async function initBars(domRefs) {
    const { bars = [] } = domRefs;

    bars.forEach(bar => {
        const scrollContainer = bar.querySelector(".scroll-container") || bar;
        makeDraggable(scrollContainer);
        makeMovable(bar);
    });

    await restoreBarPositions();
    saveRestoreBarSizes();
}
