import axios from 'axios';

const bookWrapper = document.querySelector<HTMLDivElement>('.js-book-wrapper');
const bookForm = document.querySelector<HTMLDivElement>('.js-book-form');

type Book = {
  id: number;
  name: string;
  author: string;
  genres: string;
  year: string;
};

const drawBooks = () => {
  bookWrapper.innerHTML = '';

  axios.get<Book[]>('http://localhost:3004/books').then((response): void => {
    response.data.forEach((book): void => {
      bookWrapper.innerHTML += `
      <div class="book" >
      <h1 class="book__heading">${book.name}</h1>
      <h2 class="book-author__heading">${book.author}</h2>
      <h3 class="book-genres__heading">${book.genres} </h3>
      <h4 class="book-year__heading">${book.year} </h4>
      <button class='js-delete__button book__button' data-book-id='${book.id}'> Delete </button>
      </div>
    `;
    });
    const bookDeleteButton = document.querySelectorAll<HTMLButtonElement>('.js-delete__button');

    bookDeleteButton.forEach((bookBtn):void => {
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

  const bookGenresInput = bookForm.querySelector<HTMLInputElement>('input[name="book-genres"]');
  const bookGenresInputValue = bookGenresInput.value;

  const bookYearInput = bookForm.querySelector<HTMLInputElement>('input[name="book-year"]');
  const bookYearInputValue = bookYearInput.value;

  axios
    .post<Book>('http://localhost:3004/books', {
      name: bookNameInputValue,
      author: authorNameInputValue,
      genres: bookGenresInputValue,
      year: bookYearInputValue,
    })
    .then((): void => {
      bookNameInput.value = '';
      bookAuthorName.value = '';
      bookGenresInput.value = '';
      bookYearInput.value = '';
    });
  drawBooks();
});
