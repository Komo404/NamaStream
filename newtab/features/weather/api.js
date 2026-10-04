const REQUEST_TIMEOUT_MS = 8000;

function fetchWithTimeout(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    return fetch(url, { signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
}

export async function fetchWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 15 * 60 * 1000
            });
        });

        return fetchWeatherFromCoords(
            position.coords.latitude,
            position.coords.longitude
        );
    } catch (err) {
        console.warn("Geolocation failed", err);
        return null;
    }
}

export async function fetchWeatherFromCoords(lat, lon, manualName = null) {
    try {
        const responsePromise = fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        const geoPromise = manualName
            ? Promise.resolve(null)
            : fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
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

export async function initWeather() {
    // placeholder?
}
