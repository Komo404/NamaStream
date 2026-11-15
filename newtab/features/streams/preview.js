import { lang } from "../../../shared/translations.js";

let liveUniqueIframe = null;
let timeoutId = null;
let activeThumb = null;
let theaterMode = false;
let theaterDialog;
const boundContainers = new WeakSet();

export function closeStreamPreview() 
{
  clearTimeout(timeoutId);
  liveUniqueIframe?.remove();
  liveUniqueIframe = null;
  activeThumb = null;
  if (theaterDialog?.open) theaterDialog.close();
}

export function configureStreamPreviews(settings) {
  const nextMode = settings["preview-theater"] === true;
  if (nextMode !== theaterMode || !settings["bars-visible"] ||
      activeThumb?.closest(".info-bar")?.classList.contains("hidden")) {
    closeStreamPreview();
  }
  theaterMode = nextMode;
}

function openTheater(iframe) {
  if (!theaterDialog) {
    theaterDialog = document.createElement("dialog");
    theaterDialog.id = "stream-preview-theater";
    theaterDialog.setAttribute("aria-label", lang.preview_theater);
    const closeButton = document.createElement("button");
    closeButton.className = "preview-close";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", lang.close_preview);
    closeButton.addEventListener("click", closeStreamPreview);
    theaterDialog.appendChild(closeButton);
    theaterDialog.addEventListener("click", event => {
      if (event.target === theaterDialog) closeStreamPreview();
    });
    theaterDialog.addEventListener("cancel", event => {
      event.preventDefault();
      closeStreamPreview();
    });
    document.body.appendChild(theaterDialog);
  }
  theaterDialog.appendChild(iframe);
  theaterDialog.showModal();
}

export function bindStreamPreviews(containers = []) {
  containers.forEach(bar => {
    if (!bar || boundContainers.has(bar)) return;
    boundContainers.add(bar);
    
    bar.addEventListener("mouseover", event => {
      if (theaterDialog?.open) return;
      const thumb = event.target.closest(".live-thumb");
      if (!thumb || activeThumb === thumb) return;
      const videoId = new URL(thumb.href).searchParams.get("v");
      if (!videoId) return;
      closeStreamPreview();
      activeThumb = thumb;
      timeoutId = setTimeout(() => {
        if (activeThumb !== thumb || !thumb.isConnected || thumb.closest(".hidden")) return;
        const iframe = document.createElement("iframe");
        iframe.src = `https://komo404.github.io/yt-proxy/?v=${videoId}`;
        iframe.title = lang.preview_theater;
        iframe.allowFullscreen = true;
        liveUniqueIframe = iframe;
        if (theaterMode) openTheater(iframe);
        else thumb.appendChild(iframe);
      }, 3000);
    }, true);

    bar.addEventListener("mouseout", event => {
      const thumb = event.target.closest(".live-thumb");
      if (!thumb || thumb.contains(event.relatedTarget)) return;
      if (theaterDialog?.open) return;
      if (activeThumb === thumb) closeStreamPreview();
    }, true);
  });
}
