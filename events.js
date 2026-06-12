// ────────────────────────────────────────────────
// EVENTS
// ────────────────────────────────────────────────

// MOOD BUTTONS
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeMood = btn.dataset.mood;
    state.moodGenres = btn.dataset.genres;
    const moodGenreIds = btn.dataset.genres.split(',').map(Number);
    state.selectedGenres.clear();
    document.querySelectorAll('.tag').forEach(tag => {
      tag.classList.remove('active');
      if (moodGenreIds.includes(Number(tag.dataset.id))) {
        tag.classList.add('active');
        state.selectedGenres.add(tag.dataset.id);
      }
    });
    state.page = 1;
    fetchMovies();
  });
});

// GENRE TAGS
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('active');
    const id = tag.dataset.id;
    if (state.selectedGenres.has(id)) state.selectedGenres.delete(id);
    else state.selectedGenres.add(id);
    state.page = 1;
  });
});

// YEAR RANGE
yearMin.addEventListener('input', updateYearLabels);
yearMax.addEventListener('input', updateYearLabels);

// RATING STARS
stars.forEach((star, idx) => {
  star.addEventListener('click', () => {
    const val = parseFloat(star.dataset.val);
    state.minRating = val;
    ratingDisplay.textContent = val.toFixed(1);
    stars.forEach((s, i) => {
      s.classList.toggle('active', i <= idx);
    });
  });
});

// SORT
document.querySelectorAll('input[name="sort"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.sortBy = radio.value;
    document.querySelectorAll('.radio-opt').forEach(opt => opt.classList.remove('active'));
    radio.closest('.radio-opt').classList.add('active');
  });
});

// LANGUAGE
document.getElementById('language-select').addEventListener('change', e => {
  state.language = e.target.value;
});

// RUNTIME
document.querySelectorAll('.rt-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.rt-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.runtimeMin = parseInt(btn.dataset.min);
    state.runtimeMax = parseInt(btn.dataset.max);
  });
});

// SEARCH BUTTON
document.getElementById('btn-search').addEventListener('click', () => {
  state.textSearch = document.getElementById('text-search').value.trim();
  state.page = 1;
  fetchMovies();
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('text-search').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-search').click();
});

// RESET
document.getElementById('btn-reset').addEventListener('click', () => {
  // Mood
  document.querySelectorAll('.mood-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  state.activeMood = 'happy'; state.moodGenres = '35,10751';

  // Genres
  state.selectedGenres.clear();
  document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));

  // Year
  yearMin.value = 1990; yearMax.value = 2024;
  state.yearMin = 1990; state.yearMax = 2024;
  updateYearLabels();

  // Rating
  state.minRating = 6.0; ratingDisplay.textContent = '6.0';
  stars.forEach((s, i) => s.classList.toggle('active', i < 3));

  // Sort
  document.querySelectorAll('input[name="sort"]')[0].checked = true;
  state.sortBy = 'popularity.desc';
  document.querySelectorAll('.radio-opt').forEach((o, i) => o.classList.toggle('active', i === 0));

  // Language
  document.getElementById('language-select').value = '';
  state.language = '';

  // Runtime
  document.querySelectorAll('.rt-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  state.runtimeMin = 0; state.runtimeMax = 9999;

  // Text
  document.getElementById('text-search').value = '';
  state.textSearch = '';

  state.page = 1;
  fetchMovies();
});

// PAGINATION
prevPageBtn.addEventListener('click', () => { if (state.page > 1) { state.page--; fetchMovies(); } });
nextPageBtn.addEventListener('click', () => { if (state.page < state.totalPages) { state.page++; fetchMovies(); } });