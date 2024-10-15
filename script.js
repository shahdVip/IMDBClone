const apiKey = 'fd04c79a';
const searchBar = document.getElementById('searchBar');
const resultsContainer = document.getElementById('results');
const favoriteMoviesList = document.getElementById('favoriteMoviesList');

let timeout;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentMovies = [];

searchBar.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const query = searchBar.value;
        if (query.length > 2) {
            searchMovies(query).then(movies => {
                if (movies) displaySearchResults(movies);
            });
        } else {
            resultsContainer.innerHTML = '';
        }
    }, 300);
});

async function searchMovies(query) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
        const data = await response.json();
        if (data.Response === "False") {
            throw new Error(data.Error);
        }
        currentMovies = data.Search;
        return data.Search;
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        console.error("Error fetching movies:", error);
    }
}

function displaySearchResults(movies) {
    resultsContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <button onclick="viewDetails('${movie.imdbID}')">View Details</button>
            <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}')">Add to Favorites</button>
        `;
        resultsContainer.appendChild(movieDiv);
    });
}

async function viewDetails(imdbID) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`);
        const movie = await response.json();

        resultsContainer.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <h2>${movie.Title}</h2>
            <p>${movie.Plot}</p>
            <button onclick="addToFavorites('${movie.imdbID}', '${movie.Title}')">Add to Favorites</button>
            <br><br>
            <button onclick="goBack()">Back to Results</button> 
        `;
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        console.error("Error fetching movie details:", error);
    }
}

function goBack() {
    displaySearchResults(currentMovies);
}

function addToFavorites(imdbID, title) {
    favorites.push({ imdbID, title });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function removeFromFavorites(imdbID) {
    favorites = favorites.filter(movie => movie.imdbID !== imdbID);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    favoriteMoviesList.innerHTML = '';
    favorites.forEach(movie => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${movie.title}
            <button onclick="removeFromFavorites('${movie.imdbID}')">Remove</button>
        `;
        favoriteMoviesList.appendChild(li);
    });
}

displayFavorites();
