

// API Key for OpenWeatherMap
var apiKey = "6e254fd705b0f110c2707d328992bb3b";

// get the list of previously searched cities from local storage or initialize with an empty array
var searchedArr = JSON.parse(localStorage.getItem("searchedItems")) || [];

// Base API weather conditions
var currentConditions = "https://api.openweathermap.org/data/2.5/weather?appid=";

// When the document is ready
$(document).ready(function() {
    // Display the search history upon loading the page
    displaySearchHistory();

    // Attach an event handler to the city search button to fetch and display weather for the entered city
    $("#citySearchBtn").on("click", function(event) {
        var userInput = $("#cityInput").val();
        getWeather(userInput);
        addCityToHistory(userInput);  // Add the searched city to the search history
    });
});

// Function to fetch and display current weather and 5-day forecast for a given city
function getWeather(cityName) {
    // Construct the full API URL using the base endpoint, API key, and city name
    var currentWeatherApi = `${currentConditions}${apiKey}&q=${cityName}`;

    // AJAX call to fetch the current weather data
    $.ajax({
        url: currentWeatherApi,
        method: "GET"
    }).then(function(response) {
        // Display the current weather data using the fetched response
        displayCurrentWeather(response);
        // Fetch the 5-day forecast using the coordinates from the current weather response
        getForecast(response.coord.lat, response.coord.lon, cityName);
    });
}

// Function to display the current weather details on the webpage
function displayCurrentWeather(data) {
    // Convert temperature from Kelvin to Fahrenheit
    var temperature = (data.main.temp - 273.15) * 1.8 + 32;
    var roundedTemp = Math.floor(temperature);

    // Update the HTML content with the current weather data
    $("#current-weather").empty();
    $("#current-weather").append(`
        <div>${roundedTemp}°F</div>
        <div>${data.name}</div>
        <div><img class="weather-icon" src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png"></div>
        <div>Wind Speed: ${data.wind.speed} mph</div>
        <div>Humidity: ${data.main.humidity}%</div>
    `);
}

// Function to fetch and display the forecast using latitude and longitude
function getForecast(lat, lon, cityName) {
    const forecastApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // Fetch the forecast data
    fetch(forecastApi).then(response => response.json()).then(data => {
        displayForecast(data);
    });
}

// Function to display the forecast data on the webpage
function displayForecast(data) {
    // Clear the existing forecast data from the webpage
    $("#five-day").empty();
    
    // Display daily forecasts 
    for (let i = 8; i < data.list.length; i+=8) {
        var temp = (data.list[i].main.temp - 273.15) * 1.8 + 32; // Convert temperature from Kelvin to Fahrenheit
        var roundedTemp = Math.floor(temp);
        
        $("#five-day").append(`
            <div class="card col-sm-2">
                <div class="card-header">Date: ${data.list[i].dt_txt.split(" ")[0]}</div>
                <div class="card-body">
                    Temperature: ${roundedTemp}°F
                    <div><img class="weather-icon" src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png"></div>
                    Wind Speed: ${data.list[i].wind.speed} mph
                    Humidity: ${data.list[i].main.humidity}%
                </div>
            </div>
        `);
    }
}

// Function to add a city to local storage and refresh the displayed search history
function addCityToHistory(city) {
    if (!searchedArr.includes(city)) {
        searchedArr.push(city);
        localStorage.setItem("searchedItems", JSON.stringify(searchedArr));
    }
    displaySearchHistory();  // Update the display to reflect changes in the search history
}

// Function to display the list of previously searched cities from local storage
function displaySearchHistory() {
    $("#cityList").empty();
    for (let city of searchedArr) {
        $("#cityList").append(`
            <p onclick="getWeather('${city}')">${city}</p>
        `);
    }
}
