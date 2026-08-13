import { loadWallpapers, saveWallpaper } from "./storage.js";
import { renderWallpaperSlots, bindSlotClicks } from "./render.js";
import { compressImage } from "./compress.js";
import { searchWallpapers } from "./search.js";

export async function initWallpaperFeature() 
{
    let wallpaperSlots = await loadWallpapers();

    if (wallpaperSlots.length === 0) {
        wallpaperSlots = [{ type: "url", data: "/assets/DefaultBackground.png" }];
        await chrome.storage.local.set({ wallpapers: wallpaperSlots });
    }

    window.__wallpaperSlots = wallpaperSlots;
    renderWallpaperSlots(wallpaperSlots);
    bindSlotClicks(wallpaperSlots);

    if (wallpaperSlots[0]) {
        document.documentElement.style.setProperty(
            "--wallpaper-url",
            `url(${wallpaperSlots[0].data})`
        );
    }

    document.getElementById("url-btn").addEventListener("click", async () => {
        const url = document.getElementById("url-input").value.trim();
        if (!url) return;

        wallpaperSlots = await saveWallpaper({ type: "url", data: url }, wallpaperSlots);
        window.__wallpaperSlots = wallpaperSlots;
        renderWallpaperSlots(wallpaperSlots);
        document.getElementById("url-input").value = "";
    });

    document.getElementById("wallpaper-search-btn").addEventListener("click", async () => {
        wallpaperSlots = await searchWallpapers(wallpaperSlots);
        window.__wallpaperSlots = wallpaperSlots;
        renderWallpaperSlots(wallpaperSlots);
        document.getElementById("wallpaper-search-modal")?.classList.add("hidden");
    });

    let currentPendingFile = null;
    document.getElementById("file-input").addEventListener("change", (e) => {
        currentPendingFile = e.target.files[0];
        if (currentPendingFile) {
            document.getElementById("file-name").textContent = currentPendingFile.name;
            document.getElementById("file-set-btn").disabled = false;
        }
    });

    document.getElementById("file-set-btn").addEventListener("click", () => {
        if (!currentPendingFile) return;

        compressImage(currentPendingFile, async (base64) => {
            wallpaperSlots = await saveWallpaper({ type: "base64", data: base64 }, wallpaperSlots);
            window.__wallpaperSlots = wallpaperSlots;
            renderWallpaperSlots(wallpaperSlots);

            currentPendingFile = null;
            document.getElementById("file-input").value = "";
            document.getElementById("file-name").textContent = "No file selected";
            document.getElementById("file-set-btn").disabled = true;
        });
    });

    document.getElementById("wallpaper-btn").addEventListener("click", () => {
        document.getElementById("wallpaper-popup").classList.remove("hidden");
    });

    document.getElementById("wallpaper-close").addEventListener("click", () => {
        document.getElementById("wallpaper-popup").classList.add("hidden");
    });
}
