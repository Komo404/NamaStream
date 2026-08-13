import { initInitialOptions } from "./features/initial/init.js";
import { initPopupChannels } from "./features/channels/init.js";
import { initLayoutOptions } from "./features/layout-options/init.js";
import { initNavigation, applyTranslations, renderPage } from "./features/navigation/init.js";
import { lang } from "../shared/translations.js";

export async function initPopup() 
{
    initNavigation();
    initInitialOptions();
    initLayoutOptions();

    renderPage("view-default");
    applyTranslations();

    chrome.storage.local.get(["layout-vertical-twitch", "layout-firefox-logo", "layout-firefox-wordmark", "layout-search-bar", "layout-resizable-bar"], (result) => {
        document.getElementById("layout-firefox-logo").checked = result["layout-firefox-logo"] ?? true;
        document.getElementById("layout-firefox-wordmark").checked = result["layout-firefox-wordmark"] ?? true;
        document.getElementById("layout-search-bar").checked = result["layout-search-bar"] ?? true;
        document.getElementById("layout-vertical-twitch").checked = result["layout-vertical-twitch"] || false;
        document.getElementById("layout-resizable-bar").checked = result["layout-resizable-bar"] || false;
    });

    await initPopupChannels();

    chrome.storage.local.get("repositionMode", (result) => {
        const btn = document.getElementById("reposition-mode-btn");
        btn.classList.toggle("active", result.repositionMode === true);
        btn.textContent = result.repositionMode ? lang.done_repositioning : lang.reposition_bars;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initPopup();
});
