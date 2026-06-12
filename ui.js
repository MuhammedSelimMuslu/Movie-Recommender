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
