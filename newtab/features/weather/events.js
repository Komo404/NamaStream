import { fetchWeather, fetchWeatherFromCoords, beginWeatherSelection, currentSelection, requestWeatherLocation, supportsAutomaticWeather } from "./api.js";
import { renderDropdown, renderWeather } from "./render.js";
import { lang } from "../../../shared/translations.js";

export function bindWeatherEvents() {
    const weatherInfo = document.getElementById("weatherinfo");
    const weatherMenu = document.getElementById("weatherMenu");
    const input = document.getElementById("weatherLocationInput");
    const dropdown = document.getElementById("weatherDropdown");
    const autoButton = document.getElementById("weatherAuto");
    const locationNotice = document.getElementById("weatherLocationNotice");
    const locationStatus = document.getElementById("weatherLocationStatus");

    document.getElementById("weatherLocation").textContent = lang.choose_weather_location;

    weatherMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        weatherInfo.classList.toggle("settings-open");
    });

    document.getElementById("weatherCloseSettings").addEventListener("click", () => {
        weatherInfo.classList.remove("settings-open");
    });

    document.getElementById("changeCity").addEventListener("click", async () => {
        const selection = beginWeatherSelection();
        locationStatus.textContent = "";
        const newCity = document.getElementById("weatherLocationInput").value;
        clearTimeout(debounceTimeout);
        dropdown.innerHTML = "";

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newCity)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (selection !== currentSelection) return;
            const result = data.results?.[0];
            if (!result) return;

            const lat = result.latitude;
            const lon = result.longitude;
            const name = result.name;

            chrome.storage.local.set({weatherMode: "manual", lat, lon, name});

            const res = await fetchWeatherFromCoords(lat, lon, name);
            if (selection === currentSelection && res) renderWeather(res.weatherData, res.geoData, res.manualName);
        } catch (err) {
            console.error("Geocoding error", err);
        }
    });

    let debounceTimeout;
    let currentSearch;
    input.addEventListener("input", () => {
        locationStatus.textContent = "";
        clearTimeout(debounceTimeout);
        const search = {};
        currentSearch = search;
        const selection = currentSelection;
        dropdown.innerHTML = "";
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
                if (search !== currentSearch || selection !== currentSelection) return;
                renderDropdown(data.results || []);
            } catch (err) {
                console.error("Geocoding API not working", err);
            }
        }, 300);
    });

    if (!supportsAutomaticWeather) return;

    autoButton.hidden = false;
    autoButton.textContent = lang.use_my_location;
    locationNotice.hidden = false;
    locationNotice.textContent = lang.weather_location_notice;

    autoButton.addEventListener("click", async () => {
        const selection = beginWeatherSelection();
        clearTimeout(debounceTimeout);
        dropdown.innerHTML = "";
        locationStatus.textContent = "";
        autoButton.disabled = true;

        try {
            const granted = await requestWeatherLocation();
            if (selection !== currentSelection) return;
            if (!granted) {
                locationStatus.textContent = lang.weather_location_denied;
                return;
            }

            const res = await fetchWeather(selection);
            if (selection !== currentSelection) return;
            if (!res) {
                locationStatus.textContent = lang.weather_location_unavailable;
                return;
            }

            await chrome.storage.local.set({weatherMode: "auto", lat: null, lon: null, name: null});
            if (selection !== currentSelection) return;
            input.value = "";
            renderWeather(res.weatherData, res.geoData, res.manualName);
            weatherInfo.classList.remove("settings-open");
        } catch (err) {
            console.warn("Could not enable automatic weather location", err);
            if (selection === currentSelection) locationStatus.textContent = lang.weather_location_unavailable;
        } finally {
            autoButton.disabled = false;
        }
    });
}
