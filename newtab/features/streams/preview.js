import { lang } from "../../../shared/translations.js";

let liveUniqueIframe = null;
let timeoutId = null;
let activeThumb = null;
let theaterMode = false;
let theaterDialog;
let theaterGrid;
let streamList;
let availableStreams = [];
const theaterPlayers = new Map();
const boundContainers = new WeakSet();

export function closeStreamPreview() 
{
  clearTimeout(timeoutId);
  liveUniqueIframe?.remove();
  liveUniqueIframe = null;
  theaterPlayers.forEach(player => player.remove());
  theaterPlayers.clear();
  if (streamList) streamList.hidden = true;
  activeThumb = null;
  if (theaterDialog?.open) theaterDialog.close();
}

export function configureStreamPreviews(settings) 
{
  const nextMode = settings["preview-theater"] === true;

  if (nextMode !== theaterMode || !settings["bars-visible"] ||
      activeThumb?.closest(".info-bar")?.classList.contains("hidden")) {
    closeStreamPreview();
  }
  theaterMode = nextMode;
}

function refreshStreamList() 
{
  if (!streamList) return;

  streamList.replaceChildren();
  const candidates = availableStreams.filter(stream => !theaterPlayers.has(stream.id));
  if (!candidates.length) streamList.textContent = lang.no_available_streams;

  candidates.forEach(stream => {
    const button = document.createElement("button");

    button.className = "preview-stream-option";
    button.disabled = theaterPlayers.size >= 4;

    const image = document.createElement("img");
    image.src = stream.thumbnailHigh ?? stream.thumbnailMax;
    image.alt = "";
    image.loading = "lazy";

    const text = document.createElement("span");
    text.textContent = `${stream.channel}: ${stream.title}`;

    button.append(image, text);
    button.addEventListener("click", () => addTheaterPlayer(stream.id));

    streamList.appendChild(button);
  });
}

function addTheaterPlayer(videoId, iframe = null) 
{
  if (theaterPlayers.has(videoId) || theaterPlayers.size >= 4) return;

  const player = document.createElement("div");
  player.className = "preview-player";

  iframe ??= document.createElement("iframe");
  if (!iframe.src) iframe.src = `https://komo404.github.io/yt-proxy/?v=${encodeURIComponent(videoId)}`;
  iframe.title = availableStreams.find(stream => stream.id === videoId)?.title || lang.preview_theater;
  iframe.allowFullscreen = true;

  const remove = document.createElement("button");
  remove.className = "preview-remove";
  remove.textContent = "×";
  remove.setAttribute("aria-label", lang.remove_stream);

  remove.addEventListener("click", () => {
    player.remove();
    theaterPlayers.delete(videoId);
    theaterGrid.dataset.count = theaterPlayers.size;
    if (!theaterPlayers.size) closeStreamPreview();

    refreshStreamList();
  });

  player.append(remove, iframe);
  theaterPlayers.set(videoId, player);
  theaterGrid.appendChild(player);
  theaterGrid.dataset.count = theaterPlayers.size;
  refreshStreamList();
}

function openTheater(iframe, videoId) 
{
  if (!theaterDialog) {
    theaterDialog = document.createElement("dialog");
    theaterDialog.id = "stream-preview-theater";
    theaterDialog.setAttribute("aria-label", lang.preview_theater);

    const toolbar = document.createElement("div");
    toolbar.className = "preview-toolbar";

    const add = document.createElement("button");
    add.textContent = "+";
    add.setAttribute("aria-label", lang.add_stream);
    add.setAttribute("aria-expanded", "false");

    add.addEventListener("click", () => {
      streamList.hidden = !streamList.hidden;
      add.setAttribute("aria-expanded", String(!streamList.hidden));
    });

    const closeButton = document.createElement("button");
    closeButton.textContent = "x";
    closeButton.setAttribute("aria-label", lang.close_preview);
    closeButton.addEventListener("click", closeStreamPreview);

    toolbar.append(add, closeButton);

    const body = document.createElement("div");
    body.className = "preview-body";

    theaterGrid = document.createElement("div");
    theaterGrid.className = "preview-grid";

    streamList = document.createElement("aside");
    streamList.className = "preview-stream-list";
    streamList.setAttribute("aria-label", lang.add_stream);
    streamList.hidden = true;

    body.append(theaterGrid, streamList);

    theaterDialog.append(toolbar, body);

    theaterDialog.addEventListener("click", event => {
      if (event.target === theaterDialog) closeStreamPreview();
    });

    theaterDialog.addEventListener("cancel", event => {
      event.preventDefault();
      closeStreamPreview();
    });
    
    theaterDialog.addEventListener("close", closeStreamPreview);
    document.body.appendChild(theaterDialog);
  }

  theaterDialog.querySelector("[aria-expanded]").setAttribute("aria-expanded", "false");
  addTheaterPlayer(videoId, iframe);
  theaterDialog.showModal();
}

export function bindStreamPreviews(containers = [], streams = []) 
{
  availableStreams = [...new Map(streams.map(stream => [stream.id, stream])).values()];
  refreshStreamList();
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
        if (theaterMode) openTheater(iframe, videoId);
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
