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
