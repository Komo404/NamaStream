export async function loadWallpapers() {
    const result = await chrome.storage.local.get("wallpapers");
    return result.wallpapers || [];
}

export async function saveWallpaper(wallpaper, wallpaperSlots = []) {
    const nextSlots = [wallpaper, ...wallpaperSlots].slice(0, 3);
    await chrome.storage.local.set({ wallpapers: nextSlots });
    document.documentElement.style.setProperty("--wallpaper-url", `url(${wallpaper.data})`);
    return nextSlots;
}
