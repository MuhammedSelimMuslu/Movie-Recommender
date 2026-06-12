// ────────────────────────────────────────────────
// API FETCH
// ────────────────────────────────────────────────
async function fetchMovies() {
  if (!isValidApiKey()) {
    showError('⚠️ Please add your TMDB API key in script.js to fetch real movie data. Get one free at themoviedb.org/settings/api');
    return;
  }

  showLoader(true);
  hideError();
  movieGrid.innerHTML = '';

  try {
    let movies, total_results, total_pages;

    if (state.textSearch) {
      // Search endpoint
      const url = buildSearchURL();
      const data = await fetchJSON(url);
      let results = data.results || [];

      // Client-side filter for rating
      results = results.filter(m => m.vote_average >= state.minRating);
      movies = results;
      total_results = data.total_results;
      total_pages = Math.min(data.total_pages, 500);
    } else {
      // Discover endpoint
      const url = buildDiscoverURL();
      const data = await fetchJSON(url);
      movies = data.results || [];
      total_results = data.total_results;
      total_pages = Math.min(data.total_pages, 500);
    }

    state.totalPages = total_pages || 1;
    state.totalResults = total_results || 0;

    updateResultsMeta();
    renderMovies(movies);
    updatePagination();

  } catch (err) {
    showError('Failed to fetch movies. Please check your API key or internet connection. Error: ' + err.message);
  } finally {
    showLoader(false);
  }
}

function buildDiscoverURL() {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    sort_by: state.sortBy,
    include_adult: false,
    include_video: false,
    page: state.page,
    'vote_average.gte': state.minRating,
    'vote_count.gte': 50,
    'primary_release_date.gte': `${state.yearMin}-01-01`,
    'primary_release_date.lte': `${state.yearMax}-12-31`,
  });

  if (state.selectedGenres.size > 0) {
    params.append('with_genres', [...state.selectedGenres].join(','));
  } else if (state.moodGenres) {
    params.append('with_genres', state.moodGenres);
  }

  if (state.language) params.append('with_original_language', state.language);

  if (state.runtimeMin > 0) params.append('with_runtime.gte', state.runtimeMin);
  if (state.runtimeMax < 9999) params.append('with_runtime.lte', state.runtimeMax);

  return `${BASE_URL}/discover/movie?${params}`;
}

function buildSearchURL() {
  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    query: state.textSearch,
    page: state.page,
    include_adult: false,
  });
  if (state.yearMin && state.yearMax) {
    params.append('year', state.yearMax);
  }
  return `${BASE_URL}/search/movie?${params}`;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.status_message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchMovieDetail(id) {
  openModal();
  modalInner.innerHTML = `<div style="padding:4rem;text-align:center;"><div class="reel" style="margin:0 auto;"></div></div>`;

  try {
    const [details, credits, videos] = await Promise.all([
      fetchJSON(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
      fetchJSON(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`),
      fetchJSON(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=en-US`),
    ]);

    renderModal(details, credits, videos);
  } catch (err) {
    modalInner.innerHTML = `<div style="padding:3rem;text-align:center;color:var(--danger);">
      <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;"></i>
      <p style="margin-top:1rem;">Failed to load movie details.</p>
    </div>`;
  }
}