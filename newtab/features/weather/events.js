import { fetchWeather, fetchWeatherFromCoords } from "./api.js";
import { renderDropdown, renderWeather } from "./render.js";

export function bindWeatherEvents() {
    const weatherInfo = document.getElementById("weatherinfo");
    const weatherMenu = document.getElementById("weatherMenu");
    const input = document.getElementById("weatherLocationInput");
    const dropdown = document.getElementById("weatherDropdown");

    weatherMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        weatherInfo.classList.toggle("settings-open");
    });

    document.getElementById("weatherCloseSettings").addEventListener("click", () => {
        weatherInfo.classList.remove("settings-open");
    });

    document.getElementById("changeCity").addEventListener("click", async () => {
        const newCity = document.getElementById("weatherLocationInput").value;

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newCity)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const result = data.results?.[0];
            if (!result) return;

            const lat = result.latitude;
            const lon = result.longitude;
            const name = result.name;

            chrome.storage.local.set({
                weatherMode: "manual",
                lat,
                lon,
                name
            });

            const res = await fetchWeatherFromCoords(lat, lon, name);
            if (res) renderWeather(res.weatherData, res.geoData, res.manualName);
        } catch (err) {
            console.error("Geocoding error", err);
        }
    });

    let debounceTimeout;
    input.addEventListener("input", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const query = input.value.trim();
            if (!query) {
                dropdown.innerHTML = "";
                return;
            }

            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                renderDropdown(data.results || []);
            } catch (err) {
                console.error("Geocoding API not working", err);
            }
        }, 300);
    });

    document.getElementById("weatherAuto").addEventListener("click", async () => {
        document.getElementById("weatherLocationInput").value = "";
        weatherInfo.classList.remove("settings-open");

        chrome.storage.local.set({
            weatherMode: "auto",
            lat: null,
            lon: null,
            name: null
        });

        const res = await fetchWeather();
        if (res) renderWeather(res.weatherData, res.geoData, res.manualName || null);
    });
}
