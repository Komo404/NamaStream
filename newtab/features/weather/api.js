export async function fetchWeather() {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
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
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const weatherData = await response.json();

        let geoData = null;

        if (!manualName) {
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
            if (!geoResponse.ok) throw new Error(`Nominatim HTTP ${geoResponse.status}`);
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
