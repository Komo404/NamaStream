import { get, set, onChanged } from "./storage.js";

export const DEFAULT_SETTINGS = {
    "layout-firefox-logo": true,
    "layout-firefox-wordmark": true,
    "layout-search-bar": true,

    "youtube-streams": true,
    "agenda": true,
    "twitch-streams": true,

    "layout-vertical-twitch": false,
    "layout-resizable-bar": false,
    "repositionMode": false,

    "barPositions": {},
    "barSizes": {}
};

export async function getCachedSettings() {
    const result = await get(Object.keys(DEFAULT_SETTINGS));
    return {
        ...DEFAULT_SETTINGS,
        ...result
    };
}

export function applySettings(settings, domRefs = {}) {
    const { firefox_logo, firefox_wordmark, search_bar, barsSection, bars } = domRefs;

    if (bars && bars.length) {
        if (bars[0]) bars[0].classList.toggle('hidden', !settings['youtube-streams']);
        if (bars[1]) bars[1].classList.toggle('hidden', !settings['agenda']);
        if (bars[2]) bars[2].classList.toggle('hidden', !settings['twitch-streams']);
    }

    if (firefox_logo) firefox_logo.classList.toggle('hidden', !settings['layout-firefox-logo']);
    if (firefox_wordmark) firefox_wordmark.classList.toggle('hidden', !settings['layout-firefox-wordmark']);
    if (search_bar) search_bar.classList.toggle('hidden', !settings['layout-search-bar']);

    if (barsSection) barsSection.classList.toggle('twitch-vertical', settings['layout-vertical-twitch']);
    if (barsSection) barsSection.classList.toggle('resizable', settings['layout-resizable-bar']);

    document.body.classList.toggle('reposition-mode', settings.repositionMode);
}

export { get, set, onChanged };
