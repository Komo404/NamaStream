import { fetchWeather, fetchWeatherFromCoords, beginWeatherSelection, currentSelection } from "./api.js";
import { renderWeather } from "./render.js";
import { bindWeatherEvents } from "./events.js";

export async function initWeatherFeature() {
    const selection = beginWeatherSelection();
    bindWeatherEvents();

    const saved = await chrome.storage.local.get(["weatherMode", "lat", "lon", "name"]);
    if (selection !== currentSelection) return;

    if (saved.weatherMode === "manual" && saved.lat != null && saved.lon != null && saved.name != null) {
        const res = await fetchWeatherFromCoords(saved.lat, saved.lon, saved.name);
        if (selection === currentSelection && res) renderWeather(res.weatherData, res.geoData, res.manualName);
    } else if (saved.weatherMode === "auto") {
        const res = await fetchWeather(selection);
        if (selection === currentSelection && res) renderWeather(res.weatherData, res.geoData, res.manualName || null);
    }
}
