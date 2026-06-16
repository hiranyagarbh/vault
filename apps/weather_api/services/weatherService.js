export async function fetchWeather(city) {
    try {
        const weatherRes = await fetch(`${process.env.WEATHER_API_BASE_URL}/${city}?key=${process.env.WEATHER_API_KEY}&unitGroup=metric&include=current`);
        if (weatherRes.status === 400 || weatherRes.status === 404) { return { error: "City not found", status: 404 }; }
        if (!weatherRes.ok) { return { error: "Weather service is unavailable", status: 502 }; }

        const weatherData = await weatherRes.json();
        return {
            city: city,
            temperature: weatherData.currentConditions.temp,
            humidity: weatherData.currentConditions.humidity,
            conditions: weatherData.currentConditions.conditions,
            wind_speed: weatherData.currentConditions.windspeed,
        };
    } catch (error) {
        console.error("Error fetching weather:", error);
        return { error: "Internal server error", status: 500 };
    }
}