import { saveWallpaper } from "./storage.js";

export async function searchWallpapers(wallpaperSlots = []) {
    const query = document.getElementById("wallpaper-search").value;
    const results = document.getElementById("wallpaper-results");

    results.innerHTML = "";

    const response = await fetch(`https://namastream.migueloliv-dev.workers.dev/v3/searchwallhaven?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        console.error("Failed to fetch wallpapers");
        return wallpaperSlots;
    }

    const responseData = await response.json();

    document.getElementById("modal-results").classList.remove("hidden");

    responseData.data.forEach(wallpaper => {
        const img = document.createElement("img");

        img.src = wallpaper.thumbs.small;

        img.addEventListener("click", async () => {
            const nextSlots = await saveWallpaper({ type: "url", data: wallpaper.path }, wallpaperSlots);
            wallpaperSlots.splice(0, wallpaperSlots.length, ...nextSlots);
            document.documentElement.style.setProperty("--wallpaper-url", `url(${wallpaper.path})`);
            document.getElementById("wallpaper-popup")?.classList.add("hidden");
        });

        results.appendChild(img);
    });

    return wallpaperSlots;
}
