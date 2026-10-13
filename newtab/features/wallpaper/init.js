import { loadWallpapers, saveWallpaper } from "./storage.js";
import { renderWallpaperSlots, bindSlotClicks } from "./render.js";
import { compressImage } from "./compress.js";
import { searchWallpapers } from "./search.js";

export async function initWallpaperFeature() 
{
    let wallpaperSlots = await loadWallpapers();

    if (wallpaperSlots.length === 0) {
        wallpaperSlots = [{ type: "url", data: "/assets/DefaultBackground.webp" }];
        await chrome.storage.local.set({ wallpapers: wallpaperSlots });
    }

    window.__wallpaperSlots = wallpaperSlots;

    // The modal is hidden initially; defer loading its historical wallpapers
    renderWallpaperSlots(wallpaperSlots, { loadPreviews: false });
    bindSlotClicks(wallpaperSlots);

    if (wallpaperSlots[0]) {
        document.documentElement.style.setProperty("--wallpaper-url", `url(${wallpaperSlots[0].data})`);
    }

    document.getElementById("image-search-btn").addEventListener("click", async () => {
        const url = document.getElementById("image-search-input").value.trim();
        if (!url) return;

        wallpaperSlots = await saveWallpaper({ type: "url", data: url }, wallpaperSlots);
        window.__wallpaperSlots = wallpaperSlots;
        renderWallpaperSlots(wallpaperSlots);
        document.getElementById("image-search-input").value = "";
    });

    document.getElementById("wallhaven-search-btn").addEventListener("click", async () => {
        wallpaperSlots = await searchWallpapers(wallpaperSlots);
        window.__wallpaperSlots = wallpaperSlots;
        renderWallpaperSlots(wallpaperSlots);
    });

    let currentPendingFile = null;
    const filePreview = document.getElementById("file-preview");
    let filePreviewUrl = null;

    function clearFilePreview() {
        filePreview.classList.add("hidden");
        filePreview.removeAttribute("src");
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            filePreviewUrl = null;
        }
    }

    filePreview.addEventListener("error", clearFilePreview);

    document.getElementById("file-input-field").addEventListener("change", (e) => {
        clearFilePreview();
        currentPendingFile = e.target.files[0];
        if (currentPendingFile != null && currentPendingFile.type.startsWith("image/")) {
            filePreviewUrl = URL.createObjectURL(currentPendingFile);
            filePreview.src = filePreviewUrl;
            filePreview.classList.remove("hidden");
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
            clearFilePreview();
            document.getElementById("file-input-field").value = "";
            document.getElementById("file-set-btn").disabled = true;
        });
    });

    document.getElementById("wallpaper-btn").addEventListener("click", () => {
        renderWallpaperSlots(wallpaperSlots);
        document.getElementById("wallpaper-popup").classList.remove("hidden");
    });

    document.getElementById("wallpaper-close").addEventListener("click", () => {
        document.getElementById("wallpaper-popup").classList.add("hidden");
    });
}
