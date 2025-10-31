// Weather service using free APIs (no key required)
const weather = {
  currentService: 'open-meteo', // Default service
  
  fetchWeather: function (city) {
    // Try multiple services in sequence
    this.fetchWithOpenMeteo(city)
      .catch(() => this.fetchWithWeatherAPI(city))
      .catch(() => this.fetchWithAPINinjas(city))
      .catch((error) => {
        console.error("All weather services failed:", error);
        alert("Unable to fetch weather data. Please try again later.");
      });
  },

  // Service 1: Open-Meteo (No API key required)
  fetchWithOpenMeteo: function (city) {
    return new Promise((resolve, reject) => {
      // First, geocode the city to get coordinates
      this.geocodeCity(city)
        .then(coords => {
          const { lat, lon } = coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
          
          return fetch(url);
        })
        .then(response => {
          if (!response.ok) throw new Error('Weather data not found');
          return response.json();
        })
        .then(data => {
          this.displayOpenMeteoWeather(data, city);
          resolve(data);
        })
        .catch(error => reject(error));
    });
  },

  // Service 2: WeatherAPI (Free tier, no key for basic info)
  fetchWithWeatherAPI: function (city) {
    return fetch(`https://api.weatherapi.com/v1/current.json?key=YOUR_FREE_KEY_HERE&q=${city}&aqi=no`)
      .then(response => {
        if (!response.ok) throw new Error('Weather data not found');
        return response.json();
      })
      .then(data => {
        this.displayWeatherAPI(data);
      });
  },

  // Service 3: API Ninjas Weather (Free tier)
  fetchWithAPINinjas: function (city) {
    return fetch(`https://api.api-ninjas.com/v1/weather?city=${city}`)
      .then(response => {
        if (!response.ok) throw new Error('Weather data not found');
        return response.json();
      })
      .then(data => {
        this.displayAPINinjasWeather(data, city);
      });
  },

  // Geocoding service (Free - OpenStreetMap Nominatim)
  geocodeCity: function (city) {
    return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          return {
            lat: data[0].lat,
            lon: data[0].lon
          };
        }
        throw new Error('City not found');
      });
  },

  // Display methods for different services
  displayOpenMeteoWeather: function (data, city) {
    const current = data.current;
    const weatherCode = current.weather_code;
    
    document.querySelector(".city").innerText = "Weather in " + city;
    document.querySelector(".temp").innerText = Math.round(current.temperature_2m) + "°C";
    document.querySelector(".humidity").innerText = "Humidity: " + current.relative_humidity_2m + "%";
    document.querySelector(".wind").innerText = "Wind: " + Math.round(current.wind_speed_10m) + " km/h";
    document.querySelector(".feels-like").innerText = "Feels like: " + Math.round(current.temperature_2m) + "°C";
    
    // Convert weather code to description and icon
    const weatherInfo = this.getWeatherInfo(weatherCode);
    document.querySelector(".description").innerText = weatherInfo.description;
    document.querySelector(".icon").src = weatherInfo.icon;
    
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + city + " landscape')";
  },

  displayWeatherAPI: function (data) {
    const current = data.current;
    
    document.querySelector(".city").innerText = "Weather in " + data.location.name;
    document.querySelector(".temp").innerText = Math.round(current.temp_c) + "°C";
    document.querySelector(".humidity").innerText = "Humidity: " + current.humidity + "%";
    document.querySelector(".wind").innerText = "Wind: " + Math.round(current.wind_kph) + " km/h";
    document.querySelector(".feels-like").innerText = "Feels like: " + Math.round(current.feelslike_c) + "°C";
    document.querySelector(".description").innerText = current.condition.text;
    document.querySelector(".icon").src = "https:" + current.condition.icon;
    
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + data.location.name + " landscape')";
  },

  displayAPINinjasWeather: function (data, city) {
    document.querySelector(".city").innerText = "Weather in " + city;
    document.querySelector(".temp").innerText = Math.round(data.temp) + "°C";
    document.querySelector(".humidity").innerText = "Humidity: " + data.humidity + "%";
    document.querySelector(".wind").innerText = "Wind: " + Math.round(data.wind_speed) + " km/h";
    document.querySelector(".feels-like").innerText = "Feels like: " + Math.round(data.feels_like) + "°C";
    
    // Simple weather description based on temperature
    let description = "Clear";
    if (data.temp < 10) description = "Cold";
    else if (data.temp > 30) description = "Hot";
    
    document.querySelector(".description").innerText = description;
    document.querySelector(".icon").src = this.getSimpleWeatherIcon(description);
    
    document.querySelector(".weather").classList.remove("loading");
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + city + " landscape')";
  },

  // Helper methods for weather codes and icons
  getWeatherInfo: function (code) {
    const weatherMap = {
      0: { description: "Clear sky", icon: "https://openweathermap.org/img/wn/01d@2x.png" },
      1: { description: "Mainly clear", icon: "https://openweathermap.org/img/wn/02d@2x.png" },
      2: { description: "Partly cloudy", icon: "https://openweathermap.org/img/wn/03d@2x.png" },
      3: { description: "Overcast", icon: "https://openweathermap.org/img/wn/04d@2x.png" },
      45: { description: "Fog", icon: "https://openweathermap.org/img/wn/50d@2x.png" },
      48: { description: "Depositing rime fog", icon: "https://openweathermap.org/img/wn/50d@2x.png" },
      51: { description: "Light drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      53: { description: "Moderate drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      55: { description: "Dense drizzle", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      61: { description: "Slight rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
      63: { description: "Moderate rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
      65: { description: "Heavy rain", icon: "https://openweathermap.org/img/wn/10d@2x.png" },
      80: { description: "Light showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      81: { description: "Moderate showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      82: { description: "Violent showers", icon: "https://openweathermap.org/img/wn/09d@2x.png" },
      95: { description: "Thunderstorm", icon: "https://openweathermap.org/img/wn/11d@2x.png" }
    };
    
    return weatherMap[code] || { description: "Unknown", icon: "https://openweathermap.org/img/wn/01d@2x.png" };
  },

  getSimpleWeatherIcon: function (description) {
    const iconMap = {
      "Clear": "https://openweathermap.org/img/wn/01d@2x.png",
      "Cold": "https://openweathermap.org/img/wn/13d@2x.png",
      "Hot": "https://openweathermap.org/img/wn/01d@2x.png",
      "Cloudy": "https://openweathermap.org/img/wn/03d@2x.png",
      "Rain": "https://openweathermap.org/img/wn/10d@2x.png"
    };
    
    return iconMap[description] || "https://openweathermap.org/img/wn/01d@2x.png";
  },

  search: function () {
    const city = document.querySelector(".search-bar").value.trim();
    if (city) {
      document.querySelector(".weather").classList.add("loading");
      this.fetchWeather(city);
    }
  },
};

// Location detection using browser geolocation
const locationService = {
  getLocation: function() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  },

  reverseGeocode: function (lat, lon) {
    return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`)
      .then(response => response.json())
      .then(data => {
        if (data && data.address) {
          return data.address.city || data.address.town || data.address.village || data.address.county;
        }
        throw new Error("Location not found");
      });
  },

  getCityFromLocation: function() {
    this.getLocation()
      .then(position => {
        const { latitude, longitude } = position.coords;
        return this.reverseGeocode(latitude, longitude);
      })
      .then(city => {
        if (city) {
          weather.fetchWeather(city);
        } else {
          weather.fetchWeather("Delhi");
        }
      })
      .catch(error => {
        console.error("Error getting location:", error);
        weather.fetchWeather("Delhi");
      });
  }
};

// Event listeners
document.querySelector(".search-btn").addEventListener("click", function () {
  weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    weather.search();
  }
});

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  // Initialize tilt effect
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll(".card"), {
      max: 4,
      speed: 800,
      scale: 1.03,
      glare: true,
      "max-glare": 0.3,
    });
  }
  
  // Get weather for user's location or default
  locationService.getCityFromLocation();
});