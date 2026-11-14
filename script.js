const API_KEY = 'bd5e378503939ddaee76f12ad7a97608';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');

searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    hideAll();
    loadingDiv.classList.remove('hidden');

    try {
        const currentData = await getCurrentWeather(city);
        const forecastData = await getForecast(city);

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        currentWeatherDiv.classList.remove('hidden');
        forecastDiv.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

async function getCurrentWeather(city) {
    const response = await fetch(
        `${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        }
        throw new Error('Failed to fetch weather data. Please try again later.');
    }

    return await response.json();
}

async function getForecast(city) {
    const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch forecast data.');
    }

    return await response.json();
}

function displayCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('date').textContent = formatDate(new Date());
    document.getElementById('temp').textContent = Math.round(data.main.temp);
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
}

function displayForecast(data) {
    const forecastCards = document.getElementById('forecastCards');
    forecastCards.innerHTML = '';

    const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecasts.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const card = document.createElement('div');
        card.className = 'forecast-card';

        card.innerHTML = `
            <div class="day">${getDayName(date)}</div>
            <div class="date">${formatDateShort(date)}</div>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png"
                 alt="${forecast.weather[0].description}">
            <div class="temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="desc">${forecast.weather[0].description}</div>
        `;

        forecastCards.appendChild(card);
    });
}

function formatDate(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatDateShort(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function hideAll() {
    errorDiv.classList.add('hidden');
    currentWeatherDiv.classList.add('hidden');
    forecastDiv.classList.add('hidden');
}

window.addEventListener('load', () => {
    cityInput.value = 'London';
    searchWeather();
});
