const API_KEY = 'NEWS API-KEY'; 

const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const filterButtons = document.querySelectorAll('.filter-btn');
const trendsContent = document.getElementById('trends-content');


window.addEventListener('load', () => fetchNews('general'));

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchNews(null, query);
    }
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});


filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        fetchNews(category);
    });
});


async function fetchNews(category, query = '') {
    newsContainer.innerHTML = '<p class="placeholder">Loading news...</p>';
    trendsContent.innerHTML = '';
    
    let url;
    if (query) {
        url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&token=${API_KEY}`;
    } else {
        url = `https://gnews.io/api/v4/top-headlines?topic=${category}&lang=en&token=${API_KEY}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors.join(', ') || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        displayArticles(data.articles);
        analyzeAndDisplayTrends(data.articles);

    } catch (error) {
        console.error("Failed to fetch news:", error);
        displayError(`Failed to load news: ${error.message}`);
    }
}

function displayArticles(articles) {
    newsContainer.innerHTML = ''; 

    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = '<p class="placeholder">No articles found. Try a different search!</p>';
        return;
    }

    articles.forEach(article => {
        if (!article.title || !article.image) return;

        const articleCard = `
            <div class="article-card">
                <img src="${article.image}" alt="${article.title}">
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || ''}</p>
                    <a href="${article.url}" target="_blank">Read more</a>
                </div>
            </div>
        `;
        newsContainer.innerHTML += articleCard;
    });
}

function analyzeAndDisplayTrends(articles) {
    if (!articles || articles.length === 0) {
        trendsContent.innerHTML = '<p>No data for analysis.</p>';
        return;
    }

    const sourceCounts = {};
    articles.forEach(article => {
        if (article.source.name) {
            sourceCounts[article.source.name] = (sourceCounts[article.source.name] || 0) + 1;
        }
    });
    
    const sortedSources = Object.entries(sourceCounts)
                                .sort(([,a],[,b]) => b - a)
                                .slice(0, 5);

    if(sortedSources.length > 0) {
      trendsContent.innerHTML = sortedSources
          .map(([source, count]) => `<p>${source} (${count} articles)</p>`)
          .join('');
    } else {
      trendsContent.innerHTML = '<p>No trending sources found.</p>';
    }
}

function displayError(message) {
    newsContainer.innerHTML = `<p class="placeholder error">${message}</p>`;
    trendsContent.innerHTML = '';
}