// ────────────────────────────────────────────────
// RENDER MOVIES
// ────────────────────────────────────────────────
function renderMovies(movies) {
  if (!movies || movies.length === 0) {
    movieGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:4rem 0; color:var(--muted);">
        <div style="font-size:3rem;margin-bottom:1rem;">🎬</div>
        <p style="font-size:1rem;">No movies found. Try adjusting your filters.</p>
      </div>`;
    return;
  }

  movies.forEach((movie, idx) => {
    const card = createMovieCard(movie, idx);
    movieGrid.appendChild(card);
  });
}

function createMovieCard(movie, idx) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.style.animationDelay = `${idx * 0.05}s`;

  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const posterURL = movie.poster_path
    ? `${IMG_BASE}w342${movie.poster_path}`
    : null;

  const genreNames = (movie.genre_ids || [])
    .slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean);

  card.innerHTML = `
    ${posterURL
      ? `<img class="card-poster" src="${posterURL}" alt="${escapeHtml(movie.title)}" loading="lazy"/>`
      : `<div class="card-poster-placeholder">🎥</div>`}
    <div class="card-overlay">
      <span class="overlay-view"><i class="fa-solid fa-circle-play"></i> View Details</span>
    </div>
    <div class="card-body">
      <div class="card-title">${escapeHtml(movie.title)}</div>
      <div class="card-meta">
        <span class="card-year">${year}</span>
        <span class="card-rating"><i class="fa-solid fa-star"></i> ${rating}</span>
      </div>
      <div class="card-genres">
        ${genreNames.map(g => `<span class="card-genre-tag">${g}</span>`).join('')}
      </div>
    </div>`;

  card.addEventListener('click', () => fetchMovieDetail(movie.id));
  return card;
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

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
function showLoader(show) {
  loader.style.display = show ? 'flex' : 'none';
}
function showError(msg) {
  errorMsg.textContent = msg;
  errorWrap.style.display = 'flex';
}
function hideError() {
  errorWrap.style.display = 'none';
}
function updateResultsMeta() {
  const moodBtn = document.querySelector('.mood-btn.active');
  const moodName = moodBtn ? moodBtn.dataset.mood : '';
  resultsTitle.innerHTML = moodName
    ? `${capitalize(moodName)} <em>picks for you</em>`
    : `Your <em>recommendations</em>`;
  resultsCount.textContent = `${state.totalResults.toLocaleString()} films found`;
}
function updatePagination() {
  if (state.totalPages <= 1) { pagination.style.display = 'none'; return; }
  pagination.style.display = 'flex';
  pageInfo.textContent = `Page ${state.page} of ${state.totalPages.toLocaleString()}`;
  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= state.totalPages;
}
function isValidApiKey() {
  return API_KEY && API_KEY !== 'YOUR_TMDB_API_KEY_HERE' && API_KEY.length > 10;
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function updateYearLabels() {
  let lo = parseInt(yearMin.value), hi = parseInt(yearMax.value);
  if (lo > hi) { const t = lo; lo = hi; hi = t; }
  yearMinLabel.textContent = lo;
  yearMaxLabel.textContent = hi;
  state.yearMin = lo; state.yearMax = hi;
}
function openModal() { modalOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal() { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }

function renderPlaceholderCards() {
  const placeholders = [
    { title: 'The Dark Knight', year: 2008, rating: 9.0, genres: ['Action', 'Crime'], emoji: '🦇' },
    { title: 'Inception', year: 2010, rating: 8.8, genres: ['Sci-Fi', 'Thriller'], emoji: '🌀' },
    { title: 'Parasite', year: 2019, rating: 8.6, genres: ['Drama', 'Thriller'], emoji: '🪲' },
    { title: 'Interstellar', year: 2014, rating: 8.6, genres: ['Sci-Fi', 'Drama'], emoji: '🚀' },
    { title: 'The Shawshank Redemption', year: 1994, rating: 9.3, genres: ['Drama'], emoji: '🔓' },
    { title: 'Pulp Fiction', year: 1994, rating: 8.9, genres: ['Crime', 'Drama'], emoji: '💼' },
    { title: 'Spirited Away', year: 2001, rating: 8.6, genres: ['Animation', 'Family'], emoji: '🌊' },
    { title: 'The Godfather', year: 1972, rating: 9.2, genres: ['Crime', 'Drama'], emoji: '🤌' },
  ];

  resultsCount.textContent = 'Demo mode — add API key for live data';
  state.totalResults = placeholders.length;

  placeholders.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.innerHTML = `
      <div class="card-poster-placeholder">${p.emoji}</div>
      <div class="card-body">
        <div class="card-title">${p.title}</div>
        <div class="card-meta">
          <span class="card-year">${p.year}</span>
          <span class="card-rating"><i class="fa-solid fa-star"></i> ${p.rating}</span>
        </div>
        <div class="card-genres">
          ${p.genres.map(g => `<span class="card-genre-tag">${g}</span>`).join('')}
        </div>
      </div>`;
    movieGrid.appendChild(card);
  }
  );
}