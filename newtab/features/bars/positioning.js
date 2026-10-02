import { get, set } from "../../../shared/storage.js";

export async function saveBarPosition(id, x, y) {
    const result = await get("barPositions");
    const barPositions = { ...(result.barPositions || {}) };
    barPositions[id] = { x, y };

    await set({ barPositions });
}

export async function restoreBarPositions() {
    const result = await get("barPositions");
    const barPositions = result.barPositions || {};

    document.querySelectorAll(".info-bar").forEach(el => {
        el.dataset.posX = "0";
        el.dataset.posY = "0";
        el.style.transform = "";

        const pos = barPositions[el.id];
        if (!pos) return;

        const x = Number(pos.x);
        const y = Number(pos.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;

        el.dataset.posX = String(x);
        el.dataset.posY = String(y);
        el.style.transform = `translate(${x}px, ${y}px)`;
    });
}

export async function restoreBarSizes() {
    const result = await get(["barSizes", "layout-resizable-bar"]);
    let sizes = result.barSizes && typeof result.barSizes === "object" ? result.barSizes : {};

    // migra tamanhos de versoes antigas que usavam localStorage e indexes de array
    if (Object.keys(sizes).length === 0) {
        try {
            const legacySizes = JSON.parse(localStorage.getItem("info-bar-sizes") || "{}");
            const bars = [...document.querySelectorAll(".info-bar")];
            const migratedSizes = {};

            bars.forEach((bar, index) => {
                if (legacySizes && typeof legacySizes === "object" && legacySizes[index]) {
                    migratedSizes[bar.id] = legacySizes[index];
                }
            });

            if (Object.keys(migratedSizes).length > 0) {
                sizes = migratedSizes;
                await set({ barSizes: sizes });
            }
        } catch (err) {
            console.warn("Could not migrate legacy bar sizes", err);
        }
    }

    const resizable = result["layout-resizable-bar"] === true;

    document.querySelectorAll(".info-bar").forEach(bar => {
        if (!resizable) {
            bar.style.removeProperty("width");
            bar.style.removeProperty("height");
            return;
        }

        const size = sizes[bar.id];
        if (!size) return;

        if (typeof size.width === "string") bar.style.width = size.width;
        if (typeof size.height === "string") bar.style.height = size.height;
    });
}

export function saveRestoreBarSizes() {
    restoreBarSizes();

    const observer = new ResizeObserver(async (entries) => {
        const settings = await get("layout-resizable-bar");
        if (settings["layout-resizable-bar"] !== true) return;

        const result = await get("barSizes");
        const barSizes = { ...(result.barSizes || {}) };

        for (const entry of entries) {
            const bar = entry.target;
            barSizes[bar.id] = {
                width: `${bar.offsetWidth}px`,
                height: `${bar.offsetHeight}px`
            };
        }

        await set({ barSizes });
    });

    document.querySelectorAll(".info-bar").forEach(bar => {
        observer.observe(bar);
    });
}
