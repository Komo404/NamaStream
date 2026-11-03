import { set } from "../../../shared/settings-store.js";

export function bindBarsVisibilityToggle(barsSection) 
{
    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() !== "m" || event.ctrlKey || event.altKey || event.metaKey) return;
        if (event.target.matches("input, textarea, select, [contenteditable='true']")) return;

        set({ "bars-visible": barsSection.classList.contains("hidden") });
    });
}
