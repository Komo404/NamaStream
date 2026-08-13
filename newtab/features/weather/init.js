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
        // try to get posição atual -> fetchWeather vai pegar localização
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const res = await fetchWeatherFromCoords(lat, lon);
            if (res) renderWeather(res.weatherData, res.geoData, res.manualName || null);
        }, (err) => { console.warn('Geolocation failed', err); });
    }
}
