// Cuida do hover preview (YouTube iframe)
let liveUniqueIframe = null;
let timeoutId = null;
let activeThumb = null;

export function bindStreamPreviews(containers = []) {
  containers.forEach(bar => {
    bar.addEventListener("mouseover", (event) => {
      const thumb = event.target.closest(".live-thumb");
      if (!thumb) return;
      if (activeThumb === thumb) return;
      activeThumb = thumb;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (activeThumb !== thumb) return;

        const videoLink = thumb.href;
        if (!videoLink) return;

        const url = new URL(videoLink);
        const videoId = url.searchParams.get("v");
        if (!videoId) return;

        if (liveUniqueIframe) {
          liveUniqueIframe.remove();
          liveUniqueIframe = null;
        }

        const iframe = document.createElement("iframe");
        iframe.src = `https://m-erm.github.io/yt-proxy/?v=${videoId}`;
        liveUniqueIframe = iframe;

        thumb.appendChild(iframe);
      }, 3000);

    }, true);

    bar.addEventListener("mouseout", (event) => {
      const thumb = event.target.closest(".live-thumb");
      if (!thumb) return;

      if (thumb.contains(event.relatedTarget)) return;

      clearTimeout(timeoutId);

      if (activeThumb === thumb) {
        activeThumb = null;

        if (liveUniqueIframe) {
          liveUniqueIframe.remove();
          liveUniqueIframe = null;
        }
      }
    }, true);
  });
}
