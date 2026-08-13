import { lang } from "../../../shared/translations.js";
import { fetchWeatherFromCoords } from "./api.js";

export function renderWeather(weatherData, geoData, manualName = null) {
    const current = weatherData.current;

    const place = manualName || (geoData?.address?.city || geoData?.address?.town || geoData?.address?.village || geoData?.address?.municipality || geoData?.address?.county || "Local desconhecido") + (geoData?.address?.state ? `, ${geoData.address.state}` : "");

    document.getElementById("weatherTemp").textContent = `${Math.round(current.temperature_2m)}°`;
    document.getElementById("weatherLocation").textContent = place;
    document.getElementById("weatherFeels").textContent = `${lang["feeling"]}: ${Math.round(current.apparent_temperature)}°`;
    document.getElementById("weatherHumidity").textContent = `${lang["humidity"]}: ${current.relative_humidity_2m}%`;
    document.getElementById("weatherWind").textContent = `${lang["wind_speed"]}: ${Math.round(current.wind_speed_10m)} km/h`;
    setWeatherIcon(current.weather_code);
}

export function renderDropdown(results) {
    const dropdown = document.getElementById("weatherDropdown");
    dropdown.innerHTML = "";

    results.forEach((place) => {
        const div = document.createElement("div");
        div.className = "weather-option";

        const label =
            `${place.name}` +
            (place.admin1 ? `, ${place.admin1}` : "") +
            (place.country ? `, ${place.country}` : "");

        div.textContent = label;

        div.addEventListener("click", async () => {
            dropdown.innerHTML = "";
            document.getElementById("weatherLocationInput").value = label;

            chrome.storage.local.set({
                weatherMode: "manual",
                lat: place.latitude,
                lon: place.longitude,
                name: place.name
            });

            const result = await fetchWeatherFromCoords(place.latitude, place.longitude, place.name);
            if (result) {
                renderWeather(result.weatherData, result.geoData, result.manualName || place.name);
            }

            document.getElementById("weatherinfo").classList.remove("settings-open");
        });

        dropdown.appendChild(div);
    });
}

export function setWeatherIcon(code) {
    const weatherIcon = document.getElementById("weatherIcon");
    let icon = "night-clear";

    if (code === 0) {
        icon = "sunny";
    }
    else if ([1, 2].includes(code)) {
        icon = "partly-cloudy";
    }
    else if (code === 3) {
        icon = "cloudy";
    }
    else if (code >= 51 && code <= 67) {
        icon = "rain";
    }
    else if (code >= 80) {
        icon = "thunderstorm";
    }

    weatherIcon.style.content = `url("chrome://browser/skin/weather/${icon}.svg")`;
}
