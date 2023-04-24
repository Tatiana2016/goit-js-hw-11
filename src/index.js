import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import "./css/styles.css";

const API_KEY = "35692569-c6b1047d301c17a4ef696f2c7";
const form = document.getElementById("search-form");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more");
let searchQuery = "";
let page = 1;
const perPage = 40;

const fetchImages = async () => {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`; 
  try {
    const response = await axios.get(url);
    const { data } = response; 
    return data;
  }
  catch (error) {
    console.error(error);
    Notiflix.Notify.failure("An error occurred while fetching images. Please try again later.");
    return null;
  }
};

const displayImages = (data) => { 
  let images = "";
  data.hits.forEach((image) => {
    const { webformatURL, tags, likes, views, comments, downloads } = image; 
    images +=`
      <div class="photo-card" >
        <a href="${webformatURL}" class="gallery-link">
          <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" height="200" width ="100%"/>
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>: ${likes}</p>
          <p class="info-item"><b>Views</b>: ${views}</p>
          <p class="info-item"><b>Comments</b>: ${comments}</p>
          <p class="info-item"><b>Downloads</b>: ${downloads}</p>
        </div>
      </div>`;
  });
  
  gallery.insertAdjacentHTML("beforeend", images);
  
  new SimpleLightbox('.gallery-link',{
  captionsData: 'alt',
  captionDelay: 250,
});
  
  if (data.hits.length < perPage) {
    loadMoreBtn.style.display = "none";
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  } else { 
    loadMoreBtn.style.display = "block"; 
  }
};


form.addEventListener("submit", async (e) => {
  e.preventDefault(); 
  searchQuery = e.target.searchQuery.value.trim();
  page = 1;
  loadMoreBtn.style.display = "none";
  if (!searchQuery) { 
    return; 
  }
  const data = await fetchImages();
  gallery.innerHTML = "";
  if (data.hits.length === 0) {
    Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
  } else {
    displayImages(data);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    if (data.totalHits > perPage) {
      loadMoreBtn.style.display = "block";
    }
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  const data = await fetchImages();
  if (!data) return;
  displayImages(data);
});
