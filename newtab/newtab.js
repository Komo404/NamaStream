import { initStreams } from "./features/streams/init.js";
import { initBars } from "./features/bars/init.js";
import { initWeatherFeature } from "./features/weather/init.js";
import { initWallpaperFeature } from "./features/wallpaper/init.js";
import { getCachedSettings, applySettings, onChanged } from "../shared/settings-store.js";
import { restoreBarPositions, restoreBarSizes } from "./features/bars/positioning.js";

document.addEventListener("DOMContentLoaded", async () => {

    const firefox_el = document.getElementById("firefox-image-wordmark");
    const firefox_logo = firefox_el?.querySelector(".image");
    const firefox_wordmark = firefox_el?.querySelector(".wordmark");

    const search_bar = document.getElementById("search-bar")?.querySelector("input");
    const barsSection = document.getElementById("bars");

    const youtubeContainer = document.getElementById("youtube")?.querySelector(".scroll-container");
    const agendaContainer = document.getElementById("agenda")?.querySelector(".scroll-container");
    const twitchContainer = document.getElementById("twitch")?.querySelector(".scroll-container");

    const barsList = [
        document.getElementById("youtube"),
        document.getElementById("agenda"),
        document.getElementById("twitch")
    ];

    // Lê as configs salvas e aplica na tela
    const settings = await getCachedSettings();
    applySettings(settings, { firefox_logo, firefox_wordmark, search_bar, barsSection, bars: barsList });

    // Initialize bar interactions before any network-dependent feature.
    await initBars({ bars: barsList });

    // These features are independent and can load concurrently.
    const featureInitialization = Promise.allSettled([
        initStreams({ youtube: youtubeContainer, agenda: agendaContainer, twitch: twitchContainer }),
        initWeatherFeature(),
        initWallpaperFeature()
    ]);

    featureInitialization.then(results => results.forEach(result => {
        if (result.status === "rejected") console.error("Feature initialization failed:", result.reason);
    }));

    // Ouve mudanças de storage e reaplica elas quando mudam
    onChanged((changes, area) => {
        if (area !== "local") return;

        getCachedSettings().then(settings => applySettings(settings, { firefox_logo, firefox_wordmark, search_bar, barsSection, bars: barsList }));

        if (changes.repositionMode) {
            document.body.classList.toggle("reposition-mode", changes.repositionMode.newValue);
        }

        if (changes["layout-resizable-bar"]) {
            barsSection.classList.toggle("resizable", changes["layout-resizable-bar"].newValue === true);

            if (changes["layout-resizable-bar"].newValue === false) {
                document.querySelectorAll(".info-bar").forEach(bar => {
                    bar.style.removeProperty("width");
                    bar.style.removeProperty("height");
                });
            } else {
                restoreBarSizes();
            }
        }

        if (changes.barPositions) {
            restoreBarPositions();
        }
    });
});
