const REQUEST_TIMEOUT_MS = 8000;
const extension = globalThis.browser ?? chrome;
const locationPermissions = { permissions: ["geolocation"], data_collection: ["locationInfo"] };

export const supportsAutomaticWeather = extension.runtime.getURL("").startsWith("moz-extension://");

export let currentSelection;

export function beginWeatherSelection() {
    currentSelection = {};
    return currentSelection;
}

function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    return fetch(url, { signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
}

export function requestWeatherLocation() {
    return extension.permissions.request(locationPermissions);
}

async function hasWeatherLocationPermission() {
    const granted = await extension.permissions.getAll();
    return granted.permissions.includes("geolocation") &&
        granted.data_collection?.includes("locationInfo");
}

export async function fetchWeather(selection) {
    if (!supportsAutomaticWeather) return null;

    try {
        if (!await hasWeatherLocationPermission() || selection !== currentSelection) return null;

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 15 * 60 * 1000
            });
        });

        if (!await hasWeatherLocationPermission() || selection !== currentSelection) return null;
        return fetchWeatherFromCoords(position.coords.latitude, position.coords.longitude);
    } catch (err) {
        console.warn("Geolocation failed", err);
        return null;
    }
}

export async function fetchWeatherFromCoords(lat, lon, manualName = null) {
    try {
        const responsePromise = fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        const geoPromise = manualName ? Promise.resolve(null) : fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
                .catch(err => {
                    console.warn("Reverse geocoding failed", err);
                    return null;
                });

        const [response, geoResponse] = await Promise.all([responsePromise, geoPromise]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const weatherData = await response.json();

        let geoData = null;

        if (geoResponse?.ok) {
            geoData = await geoResponse.json();
        }

        if (manualName) {
            return { weatherData, geoData: null, manualName };
        } else {
            const cityName = geoData?.address?.city || geoData?.address?.town || "Unknown";
            return { weatherData, geoData, manualName: cityName };
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}
