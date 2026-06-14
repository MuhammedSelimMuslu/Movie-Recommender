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

function renderModal(movie, credits, videos) {
  const backdropURL = movie.backdrop_path ? `${IMG_BASE}w1280${movie.backdrop_path}` : null;
  const posterURL   = movie.poster_path   ? `${IMG_BASE}w342${movie.poster_path}`    : null;
  const year        = movie.release_date  ? movie.release_date.slice(0, 4) : 'N/A';
  const runtime     = movie.runtime       ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : 'N/A';
  const rating      = movie.vote_average  ? movie.vote_average.toFixed(1) : 'N/A';
  const votes       = movie.vote_count    ? movie.vote_count.toLocaleString() : '0';
  const budget      = movie.budget        ? `$${(movie.budget/1e6).toFixed(0)}M` : 'N/A';
  const revenue     = movie.revenue       ? `$${(movie.revenue/1e6).toFixed(0)}M` : 'N/A';
  const genres      = (movie.genres || []).map(g => g.name).join(' · ') || 'N/A';
  const tagline     = movie.tagline       ? `<p class="modal-tagline">"${escapeHtml(movie.tagline)}"</p>` : '';

  const cast = (credits.cast || []).slice(0, 8);
  const director = (credits.crew || []).find(c => c.job === 'Director');

  const trailer = (videos.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');

  const ratingClass = parseFloat(rating) >= 8 ? 'green' : parseFloat(rating) >= 6 ? 'highlight' : '';

  modalInner.innerHTML = `
    ${backdropURL
      ? `<img class="modal-backdrop" src="${backdropURL}" alt="backdrop"/>`
      : `<div style="height:140px;background:var(--bg3);"></div>`}
    <div class="modal-content">
      <div class="modal-header-row">
        ${posterURL
          ? `<img class="modal-poster" src="${posterURL}" alt="${escapeHtml(movie.title)}"/>`
          : `<div class="modal-poster" style="display:flex;align-items:center;justify-content:center;background:var(--bg3);font-size:2rem;">🎥</div>`}
        <div class="modal-info">
          <h2 class="modal-title">${escapeHtml(movie.title)}</h2>
          ${tagline}
          <div class="modal-meta-row">
            <span class="meta-chip ${ratingClass}"><i class="fa-solid fa-star"></i> ${rating} <small style="opacity:.7">(${votes})</small></span>
            <span class="meta-chip"><i class="fa-solid fa-calendar"></i> ${year}</span>
            <span class="meta-chip"><i class="fa-solid fa-clock"></i> ${runtime}</span>
            <span class="meta-chip"><i class="fa-solid fa-masks-theater"></i> ${genres}</span>
            ${movie.status ? `<span class="meta-chip"><i class="fa-solid fa-circle-check"></i> ${movie.status}</span>` : ''}
          </div>
          <div class="modal-meta-row" style="margin-bottom:0;">
            ${budget !== 'N/A' ? `<span class="meta-chip"><i class="fa-solid fa-sack-dollar"></i> Budget: ${budget}</span>` : ''}
            ${revenue !== 'N/A' ? `<span class="meta-chip"><i class="fa-solid fa-chart-line"></i> Revenue: ${revenue}</span>` : ''}
            ${director ? `<span class="meta-chip"><i class="fa-solid fa-video"></i> ${escapeHtml(director.name)}</span>` : ''}
          </div>
          ${trailer ? `
            <a class="trailer-btn" href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">
              <i class="fa-brands fa-youtube"></i> Watch Trailer
            </a>` : ''}
        </div>
      </div>

      <p class="modal-section-title">Overview</p>
      <p class="modal-overview">${escapeHtml(movie.overview || 'No overview available.')}</p>

      ${cast.length > 0 ? `
        <p class="modal-section-title">Cast</p>
        <div class="cast-row">
          ${cast.map(c => `<span class="cast-chip">${escapeHtml(c.name)}</span>`).join('')}
        </div>` : ''}

      ${(movie.production_companies || []).length > 0 ? `
        <p class="modal-section-title">Production</p>
        <div class="cast-row">
          ${movie.production_companies.slice(0,4).map(c => `<span class="cast-chip" style="color:var(--muted)">${escapeHtml(c.name)}</span>`).join('')}
        </div>` : ''}
    </div>`;
}
