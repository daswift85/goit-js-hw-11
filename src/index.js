import axios from 'axios';
import Notiflix from 'notiflix';
// Описан в документации
import SimpleLightbox from "simplelightbox";
// Дополнительный импорт стилей
import "simplelightbox/dist/simple-lightbox.min.css";
// import IntersectionObserver from 'intersection-observer';
// import 'intersection-observer';


const form = document.getElementById('search-form');
const input = form.elements.searchQuery;
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a');
let page = 1;
let searchQuery = '';

form.addEventListener('submit', onSubmit);

function onSubmit(event) {
  event.preventDefault();
  searchQuery = input.value.trim();
  if (searchQuery === '') {
    return;
  }
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';
  fetchImages();
}

async function fetchImages() {
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=34729435-1f68c86a9e1e838777c5cf5d0&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
      );
      const images = response.data.hits;
      const totalHits = response.data.totalHits;
  
      if (totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
  
      if (images.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
  
      appendImagesMarkup(images);
  
      if (images.length < 40) {
        loadMoreBtn.style.display = 'none';
        const toTopBtn = document.createElement('button');
        toTopBtn.classList.add('to-top-btn');
        toTopBtn.textContent = 'To Top';
        document.body.appendChild(toTopBtn);
        toTopBtn.addEventListener('click', () => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        return;
      }
  
      loadMoreBtn.style.display = 'block';
      page += 1;
  
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  
    } catch (error) {
        if (error.response && error.response.status === 400) {
          loadMoreBtn.style.display = 'none';
          const toTopBtn = document.createElement('button');
          toTopBtn.classList.add('to-top-btn');
          toTopBtn.textContent = 'To Top';
          document.body.appendChild(toTopBtn);
          toTopBtn.addEventListener('click', () => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          });
          Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        } else {
          console.log('Error on fetchImages: ', error);
        }
      }
      
    }
  
  function appendImagesMarkup(images) {
    const markup = images
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `<a href="${largeImageURL}" class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b> ${likes}</p>
              <p class="info-item"><b>Views</b> ${views}</p>
              <p class="info-item"><b>Comments</b> ${comments}</p>
              <p class="info-item"><b>Downloads</b> ${downloads}</p>
            </div>
          </a>`;
      })
      .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
  
    // вызываем метод refresh() после добавления новой группы карточек изображений
    lightbox.refresh();

    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
  }
  const options = {
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver(handleIntersection, options);
  
  observer.observe(loadMoreBtn);
  
  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Достигнут конец страницы, загружаем следующую страницу изображений
        fetchImages();
      }
    });
  }

loadMoreBtn.addEventListener('click', fetchImages);