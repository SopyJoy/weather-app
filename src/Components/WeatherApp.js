import { useState, useEffect } from "react";
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
  AlertCircle,
} from "lucide-react";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [philippinesCities, setPhilippinesCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState("");

  const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
  const PSGC_API_URL = "https://psgc.gitlab.io/api/cities";

  const cleanCityName = (cityName) => {
    return cityName
      .replace(/^City of\s+/i, "")
      .replace(/^Municipality of\s+/i, "")
      .trim();
  };

  useEffect(() => {
    const fetchPhilippinesCities = async () => {
      try {
        setLoadingCities(true);
        setCitiesError("");

        const response = await fetch(PSGC_API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch Philippines cities from PSGC");
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          throw new Error("No cities found in the PSGC API");
        }

        const cities = data.map((city) => {
          const originalName = city.name;
          const cleanedName = cleanCityName(originalName);
          const coordinates = {
            latitude: city.latitude || 14.5995,
            longitude: city.longitude || 120.9842,
          };

          return {
            original: originalName,
            cleaned: cleanedName,
            coordinates: coordinates,
          };
        });

        setPhilippinesCities(cities);
      } catch (err) {
        console.error("Error fetching Philippines cities:", err);
        setCitiesError(
          "Failed to load Philippines cities. Using default list."
        );
        const fallbackCities = [
          { name: "Manila", latitude: 14.5995, longitude: 120.9842 },
          { name: "Quezon City", latitude: 14.676, longitude: 121.0437 },
          { name: "Davao City", latitude: 7.1907, longitude: 125.4553 },
          { name: "Cebu City", latitude: 10.3157, longitude: 123.8854 },
          { name: "Caloocan", latitude: 14.6459, longitude: 120.9665 },
          { name: "Zamboanga City", latitude: 6.9214, longitude: 122.079 },
          { name: "Taguig", latitude: 14.5176, longitude: 121.0509 },
          { name: "Pasig", latitude: 14.5764, longitude: 121.0851 },
          { name: "Cagayan de Oro", latitude: 8.4542, longitude: 124.6319 },
          { name: "Bacolod", latitude: 10.6713, longitude: 122.9511 },
        ];

        const formattedFallback = fallbackCities.map((city) => ({
          original: city.name,
          cleaned: cleanCityName(city.name),
          coordinates: {
            latitude: city.latitude,
            longitude: city.longitude,
          },
        }));

        setPhilippinesCities(formattedFallback);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchPhilippinesCities();
  }, []);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const enteredCity = city.trim().toLowerCase();
      const matchingCity = philippinesCities.find(
        (c) =>
          c.cleaned.toLowerCase() === enteredCity ||
          c.original.toLowerCase() === enteredCity
      );
      const partialMatchingCity = !matchingCity
        ? philippinesCities.find(
            (c) =>
              c.cleaned.toLowerCase().includes(enteredCity) ||
              enteredCity.includes(c.cleaned.toLowerCase()) ||
              c.original.toLowerCase().includes(enteredCity) ||
              enteredCity.includes(c.original.toLowerCase())
          )
        : null;

      const selectedCity = matchingCity || partialMatchingCity;

      if (!selectedCity) {
        throw new Error("Please enter a valid Philippine city name");
      }
      const { latitude, longitude } = selectedCity.coordinates;
      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        name: selectedCity.cleaned,
        originalName: selectedCity.original,
        country: "Philippines",
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
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    setCity(input);

    if (input.length > 1) {
      const filtered = philippinesCities
        .filter(
          (c) =>
            c.cleaned.toLowerCase().includes(input.toLowerCase()) ||
            c.original.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 5)
        .map((c) => c.cleaned);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (selectedCity) => {
    setCity(selectedCity);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getWeatherIcon = (weatherCode) => {
    if (weatherCode === undefined) return <Cloud />;

    const code = weatherCode;
    if (code === 0) {
      return <Sun className="text-yellow-300" />;
    } else if (code === 1 || code === 2 || code === 3) {
      return <Cloud className="text-white" />;
    } else if (code === 45 || code === 48) {
      return <Cloudy className="text-gray-400" />;
    } else if (code >= 51 && code <= 57) {
      return <CloudRain className="text-blue-300" />;
    } else if (code >= 61 && code <= 67) {
      return <CloudRain className="text-blue-300" />;
    } else if (code >= 71 && code <= 77) {
      return <CloudSnow className="text-white" />;
    } else if (code >= 80 && code <= 82) {
      return <CloudRain className="text-blue-300" />;
    } else if (code >= 85 && code <= 86) {
      return <CloudSnow className="text-white" />;
    } else if (code >= 95 && code <= 99) {
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
          Cities in the Philippines Weather Forecast
        </h1>

        {loadingCities ? (
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
            <p className="text-black text-sm">
              Loading Philippine cities from PSGC...
            </p>
          </div>
        ) : citiesError ? (
          <div className="flex items-center justify-center mb-4 text-orange-600">
            <AlertCircle className="w-4 h-4 mr-2" />
            <p className="text-sm">{citiesError}</p>
          </div>
        ) : (
          <p className="text-black text-sm text-center mb-4">
            {philippinesCities.length} official Philippine cities loaded
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex mb-6 relative">
          <div className="relative flex-1">
            <input
              type="text"
              value={city}
              onChange={handleInputChange}
              placeholder="Enter Philippine city name"
              className="w-full py-2 pl-3 pr-10 rounded-l-md bg-white placeholder-gray-500 text-black outline outline-1 outline-black"
            />
            <MapPin className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />

            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer text-black hover:bg-gray-100"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No matching cities
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="outline outline-1 outline-black bg-black hover:bg-gray-700 py-2 px-4 rounded-r-md flex items-center"
            disabled={loading}
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-2"></div>
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
