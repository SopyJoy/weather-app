import { useState } from "react";
import {
  Search,
  Cloud,
  Sun,
  Droplets,
  Wind,
  MapPin,
  Thermometer,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
} from "lucide-react";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // We'll use Open-Meteo API which is free and doesn't require API keys
  const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
  const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `${GEOCODING_API_URL}?name=${encodeURIComponent(
          city
        )}&country=Philippines`
      );

      if (!geoResponse.ok) {
        throw new Error("Failed to fetch location data");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(
          "City not found in the Philippines. Please check the spelling."
        );
      }

      // Extra validation to ensure only Philippines results are shown
      const philippinesResults = geoData.results.filter(
        (result) =>
          result.country === "Philippines" || result.country_code === "PH"
      );

      if (philippinesResults.length === 0) {
        throw new Error(
          "Only Philippines locations are supported in this app."
        );
      }

      const { latitude, longitude, name, country } = philippinesResults[0];

      // Step 2: Get weather for the coordinates
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        name,
        country,
        current: weatherData.current,
        units: weatherData.current_units,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather();
  };

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode === undefined) return <Cloud />;

    const code = weatherCode;

    // Clear
    if (code === 0) {
      return <Sun className="text-yellow-300" />;
    }
    // Mainly clear, partly cloudy
    else if (code === 1 || code === 2 || code === 3) {
      return <Cloud className="text-white" />;
    }
    // Fog, rime fog
    else if (code === 45 || code === 48) {
      return <Cloudy className="text-gray-400" />;
    }
    // Drizzle
    else if (code >= 51 && code <= 57) {
      return <CloudRain className="text-blue-300" />;
    }
    // Rain
    else if (code >= 61 && code <= 67) {
      return <CloudRain className="text-blue-300" />;
    }
    // Snow
    else if (code >= 71 && code <= 77) {
      return <CloudSnow className="text-white" />;
    }
    // Rain showers
    else if (code >= 80 && code <= 82) {
      return <CloudRain className="text-blue-300" />;
    }
    // Snow showers
    else if (code >= 85 && code <= 86) {
      return <CloudSnow className="text-white" />;
    }
    // Thunderstorm
    else if (code >= 95 && code <= 99) {
      return <CloudLightning className="text-gray-300" />;
    }

    return <Cloud />;
  };

  const getWeatherDescription = (weatherCode) => {
    if (weatherCode === undefined) return "Unknown";

    const code = weatherCode;

    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };

    return descriptions[code] || "Unknown";
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat p-4 font-lexend"
      style={{ backgroundImage: "url('/nightsky-cloud.jpg')" }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Philippines Weather Forecast
        </h1>

        <form onSubmit={handleSubmit} className="flex mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter Philippine city name"
              className="w-full py-2 pl-3 pr-10 rounded-l-md bg-white placeholder-gray-500 text-black outline outline-1 outline-black"
            />
            <MapPin className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
          </div>
          <button
            type="submit"
            className="outline outline-1 outline-black bg-black hover:bg-gray-700 py-2 px-4 rounded-r-md flex items-center"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-2 "></div>
            <p className="text-black">Fetching weather data...</p>
          </div>
        ) : weather ? (
          <div className="bg-black backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{weather.name}</h2>
                <p className="text-sm">{weather.country}</p>
              </div>
              <div className="flex items-center">
                {getWeatherIcon(weather.current.weather_code)}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Thermometer className="mr-2" />
                <div>
                  <p className="text-3xl font-bold">
                    {Math.round(weather.current.temperature_2m)}°C
                  </p>
                  <p className="text-sm">
                    Feels like:{" "}
                    {Math.round(weather.current.apparent_temperature)}°C
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Droplets className="mr-2 w-5 h-5" />
                  <span>Humidity: {weather.current.relative_humidity_2m}%</span>
                </div>
                <div className="flex items-center">
                  <Wind className="mr-2 w-5 h-5" />
                  <span>
                    Wind: {Math.round(weather.current.wind_speed_10m)}{" "}
                    {weather.units.wind_speed_10m}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-center text-lg">
                {getWeatherDescription(weather.current.weather_code)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/70">
            <Cloud className="w-16 h-16 mx-auto mb-2 text-black" />
            <p className="text-black">
              Enter a Philippine city name to get the weather information
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
