const API_KEY = '60e105887186f6220ee8c010ee7c3ee3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/';

// -----
// STATE
// -----
const state = {
  activeMood: 'happy',
  moodGenres: '35,10751',
  selectedGenres: new Set(),
  yearMin: 1990,
  yearMax: 2024,
  minRating: 6.0,
  sortBy: 'popularity.desc',
  language: '',
  runtimeMin: 0,
  runtimeMax: 9999,
  textSearch: '',
  page: 1,
  totalPages: 1,
  totalResults: 0,
};

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

// --------
// DOM REFS
// --------
const movieGrid      = document.getElementById('movie-grid');
const loader         = document.getElementById('loader');
const errorWrap      = document.getElementById('error-wrap');
const errorMsg       = document.getElementById('error-msg');
const resultsCount   = document.getElementById('results-count');
const resultsTitle   = document.getElementById('results-title');
const pagination     = document.getElementById('pagination');
const prevPageBtn    = document.getElementById('prev-page');
const nextPageBtn    = document.getElementById('next-page');
const pageInfo       = document.getElementById('page-info');
const modalOverlay   = document.getElementById('modal-overlay');
const modalInner     = document.getElementById('modal-inner');
const modalClose     = document.getElementById('modal-close');
const yearMin = document.getElementById('year-min');
const yearMax = document.getElementById('year-max');
const yearMinLabel = document.getElementById('year-min-label');
const yearMaxLabel = document.getElementById('year-max-label');
const stars = document.querySelectorAll('.star');
const ratingDisplay = document.getElementById('rating-display');