export function renderWallpaperSlots(wallpaperSlots, { loadPreviews = true } = {}) {
    const slotEls = document.querySelectorAll(".slot");

    slotEls.forEach((el, index) => {
        const slot = wallpaperSlots[index];

        if (slot) {
            if (loadPreviews) {
                el.style.backgroundImage = `url(${slot.data})`;
                el.style.backgroundSize = "cover";
            } else {
                el.style.backgroundImage = "";
            }
            el.classList.remove("empty");
        } else {
            el.style.backgroundImage = "";
            el.classList.add("empty");
        }
    });
}

export function bindSlotClicks(wallpaperSlots) {
    const slotEls = document.querySelectorAll(".slot");

    slotEls.forEach((el) => {
        el.addEventListener("click", async () => {

            const index = parseInt(el.dataset.index);
            if (!wallpaperSlots[index]) return;

            const chosen = wallpaperSlots.splice(index, 1)[0];
            wallpaperSlots.unshift(chosen);

            await chrome.storage.local.set({ wallpapers: wallpaperSlots });

            document.querySelectorAll(".slot").forEach(s => s.classList.remove("active"));
            document.querySelector(".slot[data-index='0']").classList.add("active");

            renderWallpaperSlots(wallpaperSlots);
            document.documentElement.style.setProperty("--wallpaper-url", `url(${wallpaperSlots[0].data})`);
        });
    });
}
