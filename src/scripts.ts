import axios from 'axios';
import { differenceInMinutes } from 'date-fns';

const bookWrapper = document.querySelector<HTMLDivElement>('.js-book-wrapper');
const bookForm = document.querySelector<HTMLDivElement>('.js-book-form');

type Book = {
  id: number;
  name: string;
  author: string;
  genres: string;
  year: string;
  createdAt: string;
};

const difference = (createdAt: string) => {
  const currentDate = new Date();
  const resultInMinutes = differenceInMinutes(currentDate, Date.parse(createdAt));
  let hours = 0;
  hours += Math.floor(resultInMinutes / 60);

  if (resultInMinutes === 60 || hours === 1) {
    return `Created ${hours} hour ago `;
  }
  if (resultInMinutes > 60 && hours > 1) {
    return `Created ${hours} hours ago `;
  }
  if (resultInMinutes === 0) {
    return 'Just now';
  }
  if (resultInMinutes === 1) {
    return `Created ${resultInMinutes} minute ago`;
  }
  if (resultInMinutes > 1 && resultInMinutes < 60) {
    return `Created ${resultInMinutes} minutes ago `;
  }
};

const drawBooks = () => {
  bookWrapper.innerHTML = '';

  axios.get<Book[]>('http://localhost:3004/books').then((response) => {
    response.data.reverse().forEach((book): void => {
      bookWrapper.innerHTML += `
      <div class="book" >
      <div class="genre-image-wrapper"> 
      <img class="genre-image" src="./assets/images/${book.genres.toLowerCase()}.png" alt="Genre Image">
      </div>
      <h1 class="book__heading">${book.name}</h1>
      <h2 class="book-author__heading">${book.author}</h2>
      <h3 class="book-genres__heading">Genre: ${book.genres} </h3>
      <h4 class="book-year__heading">First published : ${book.year} year </h4>
      <button class='js-delete__button book-delete__button' data-book-id='${book.id}'> Delete </button>
      <p class="creating-date"> ${difference(book.createdAt)} </p>
      </div>
    `;
    });
    const bookDeleteButton = document.querySelectorAll<HTMLButtonElement>('.js-delete__button');

    bookDeleteButton.forEach((bookBtn): void => {
      bookBtn.addEventListener('click', () => {
        const { bookId } = bookBtn.dataset;

        axios.delete(`http://localhost:3004/books/${bookId}`).then(() => {
          drawBooks();
        });
      });
    });
  });
};

drawBooks();

bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const bookNameInput = bookForm.querySelector<HTMLInputElement>('input[name="book-name"]');
  const bookNameInputValue = bookNameInput.value;

  const bookAuthorName = bookForm.querySelector<HTMLInputElement>('input[name="author-name"]');
  const authorNameInputValue = bookAuthorName.value;

  const bookGenresInput = bookForm.querySelector<HTMLInputElement>('select[name="book-genre"]');
  const bookGenresInputValue = bookGenresInput.value;

  const bookYearInput = bookForm.querySelector<HTMLInputElement>('input[name="book-year"]');
  const bookYearInputValue = bookYearInput.value;

  axios
    .post<Book>('http://localhost:3004/books', {
      name: bookNameInputValue,
      author: authorNameInputValue,
      genres: bookGenresInputValue,
      year: bookYearInputValue,
      createdAt: `${new Date()}`,
    })
    .then((): void => {
      bookNameInput.value = '';
      bookAuthorName.value = '';
      bookGenresInput.value = 'choose a book genre';
      bookYearInput.value = '';
    });
  drawBooks();
});
