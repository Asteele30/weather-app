let state = {
    zipcode: '',
    currentWeather: null,
    hourlyForecast: [],
    error: null
};

function getWeather() {
    const apiKey = 'f66539c8da423b87612be27370bd2ed3';
    const zipcode = document.getElementById('zipcode').value; // Get the value of the zipcode input field

    if (!zipcode) {
        alert('Please enter a zipcode');
        state.error = 'Zipcode is required';
        updateUI();
        return;
    }

    state.zipcode = zipcode; // Update state with the current zipcode
    state.error = null; // Clear previous error

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=${apiKey}&units=imperial`; // Fahrenheit
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?zip=${zipcode}&appid=${apiKey}&units=imperial`; // Fahrenheit
    const zippopotUrl = `https://api.zippopotam.us/us/${zipcode}`; // Zippopot for state info

    // Fetch state abbreviation first
    fetch(zippopotUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid ZIP code');
            }
            return response.json();
        })
        .then(data => {
            const stateAbbreviation = data.places[0]['state abbreviation'];
            state.stateAbbreviation = stateAbbreviation; // Save state abbreviation
        })
        .catch(error => {
            console.error('Error fetching state data:', error);
            state.stateAbbreviation = 'N/A';
        })
        .finally(() => {
            // Fetch current weather
            fetch(weatherUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod !== 200) {
                        throw new Error(data.message);
                    }
                    state.currentWeather = data;
                    updateUI(); // Update the UI with the latest data
                })
                .catch(error => {
                    console.error('Error fetching current weather data: ', error);
                    state.error = 'Error fetching current weather data. Please try again.';
                    updateUI();
                });

            // Fetch forecast data
            fetch(forecastUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod !== '200') {
                        throw new Error(data.message);
                    }
                    state.hourlyForecast = data.list.slice(0, 8); // Save only the next 24 hours (3-hour intervals)
                    updateUI(); // Update the UI with the forecast data
                })
                .catch(error => {
                    console.error('Error fetching hourly forecast data: ', error);
                    state.error = 'Error fetching hourly forecast data. Please try again.';
                    updateUI();
                });
        });
}


function updateUI() {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    // Handle errors
    if (state.error) {
        weatherInfoDiv.innerHTML = `<p>${state.error}</p>`;
        return;
    }

    if (state.currentWeather) {
        const cityName = state.currentWeather.name;
        const stateAbbreviation = state.stateAbbreviation || 'N/A'; // Use state abbreviation from state object
        const temperature = Math.round(state.currentWeather.main.temp); // Temperature in Fahrenheit
        const description = state.currentWeather.weather[0].description;
        const iconCode = state.currentWeather.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
        const temperatureHTML = `
            <p>${temperature}°F</p>
        `;
    
        const weatherHtml = `
            <p>${cityName}, ${stateAbbreviation}</p> <!-- Show City and State -->
            <p>${description}</p>
        `;
    
        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
    
        showImage();
    }
    
    if (state.hourlyForecast.length > 0) {
        state.hourlyForecast.forEach(item => {
            const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
            const hour = dateTime.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM'; // Determine AM/PM
            const hour12 = hour % 12 || 12; // Convert 24-hour to 12-hour format
            const temperature = Math.round(item.main.temp); // Temperature in Fahrenheit
            const iconCode = item.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

            const hourlyItemHtml = `
                <div class="hourly-item">
                    <span>${hour12}:00 ${ampm}</span>
                    <img src="${iconUrl}" alt="Hourly Weather Icon">
                    <span>${temperature}°F</span>
                </div>
            `;

            hourlyForecastDiv.innerHTML += hourlyItemHtml;
        });
    }
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}

// Helper function to get state abbreviation from the city (you can implement a more accurate lookup for your specific use case)
function getStateAbbreviation(city) {
    // Example: You can map cities to states here. (For simplicity, we hardcode Georgia here)
    const cityStateMap = {
        "Atlanta": "GA",
        "Savannah": "GA",
        "Marietta": "GA",
        "Dallas" : "GA",
    };

    return cityStateMap[city] || 'N/A'; // Return state abbreviation or 'N/A' if not found
}
