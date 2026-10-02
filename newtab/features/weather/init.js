import { fetchWeather, fetchWeatherFromCoords } from "./api.js";
import { renderWeather } from "./render.js";
import { bindWeatherEvents } from "./events.js";

export async function initWeatherFeature() {
    bindWeatherEvents();

    const saved = await chrome.storage.local.get([
        "weatherMode",
        "lat",
        "lon",
        "name"
    ]);

    if (saved.weatherMode === "manual" && saved.lat && saved.lon) {
        const res = await fetchWeatherFromCoords(saved.lat, saved.lon, saved.name);
        if (res) renderWeather(res.weatherData, res.geoData, res.manualName);
    } else {
        const res = await fetchWeather();
        if (res) renderWeather(res.weatherData, res.geoData, res.manualName || null);
    }
}
