import axios from 'axios';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

const bookWrapper = document.querySelector<HTMLDivElement>('.js-book-wrapper');
const formWrapper = document.querySelector<HTMLButtonElement>('.form-wrapper');
const bookForm = document.querySelector<HTMLDivElement>('.js-book-form');

const bookNameInput = bookForm.querySelector<HTMLInputElement>('input[name="book-name"]');
const bookAuthorName = bookForm.querySelector<HTMLInputElement>('input[name="author-name"]');
const bookGenresInput = bookForm.querySelector<HTMLInputElement>('select[name="book-genre"]');
const bookYearInput = bookForm.querySelector<HTMLInputElement>('input[name="book-year"]');

let isEditMode = false;
let lastSelectedId = '0';

type Book = {
  id: number;
  name: string;
  author: string;
  genres: string;
  year: string;
  createdAt: string;
};
// Funkcija, kura izlogo laiku pirms cik ilga laika tika uztaisīta kartiņa.
const bookCreatedAt = (createdAt: string):string => {
  const currentDate: Date = new Date();
  const resultInMinutes: number = differenceInMinutes(currentDate, Date.parse(createdAt));
  const resultInHours: number = differenceInHours(currentDate, Date.parse(createdAt));
  const resultInDays: number = differenceInDays(currentDate, Date.parse(createdAt));

  if ((resultInDays as number) === 1 || (resultInHours as number) === 24) {
    return `Created ${resultInDays} day ago `;
  }
  if ((resultInDays as number) > 1 || (resultInHours as number) > 24) {
    return `Created ${resultInDays} days ago `;
  }
  if ((resultInMinutes as number) === 60 || (resultInHours as number) === 1) {
    return `Created ${resultInHours} hour ago `;
  }
  if ((resultInMinutes as number) > 60 && (resultInHours as number) > 1) {
    return `Created ${resultInHours} hours ago `;
  }
  if ((resultInMinutes as number) === 0) {
    return 'Created Just now';
  }
  if ((resultInMinutes as number) === 1) {
    return `Created ${resultInMinutes} minute ago`;
  }
  if ((resultInMinutes as number) > 1 && (resultInMinutes as number) < 60) {
    return `Created ${resultInMinutes} minutes ago `;
  }
  return 'Created at an unknown time';
};

// Funkcija kura dzēš ārā grāmatu
const deleteBook = () => {
  const bookDeleteButton = document.querySelectorAll<HTMLButtonElement>('.js-delete__button');

  bookDeleteButton.forEach((bookDeleteBtn) => {
    bookDeleteBtn.addEventListener('click', () => {
      const { bookId } = bookDeleteBtn.dataset;

      axios.delete(`http://localhost:3004/books/${bookId}`).then(() => {
        drawBooks();
      });
    });
  });
};

// Funkcija, kura edito gramatu
const editBook = ():void => {
  const bookEditButton = document.querySelectorAll<HTMLButtonElement>('.js-edit__button');
  bookEditButton.forEach((bookEditBtn):void => {
    bookEditBtn.addEventListener('click', async () => {
      const addButton = document.querySelector<HTMLButtonElement>('.js-add__button');
      const { bookId } = bookEditBtn.dataset;
      const axiosResponse = await axios.get(`http://localhost:3004/books/${bookId}`).then((rs) => rs.data);

      bookNameInput.value = axiosResponse.name;
      bookAuthorName.value = axiosResponse.author;
      bookGenresInput.value = axiosResponse.genres;
      bookYearInput.value = axiosResponse.year;
      addButton.className = 'book-edit__button';
      addButton.innerText = 'Update';
      isEditMode = true;
      lastSelectedId = bookId;
    });
  });
};

// Funkcija, kura uzzīme kartiņas
const drawBooks = ():void => {
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
      <button class='js-edit__button book-edit__button' data-book-id='${book.id}'> Edit </button>
      <button class='js-delete__button book-delete__button' data-book-id='${book.id}'> Delete </button>
      <p class="creating-date"> ${bookCreatedAt(book.createdAt)} </p>
      </div>
    `;
    });
    editBook();
    deleteBook();
  });
};

drawBooks();

// Eventlistener un kas notiek, kad submito formu
bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const bookNameInputValue = bookNameInput.value;
  const authorNameInputValue = bookAuthorName.value;
  const bookGenresInputValue = bookGenresInput.value;
  const bookYearInputValue = bookYearInput.value;
  // ja editmode ir false, tad taisa jaunu grāmatu
  if (isEditMode === false) {
    axios
      .post<Book>('http://localhost:3004/books', {
        name: bookNameInputValue,
        author: authorNameInputValue,
        genres: bookGenresInputValue,
        year: bookYearInputValue,
        createdAt: `${new Date()}`,
      })
      .then(() => {
        bookNameInput.value = '';
        bookAuthorName.value = '';
        bookGenresInput.value = 'choose a book genre';
        bookYearInput.value = '';
      });
    // ja editmode ir true, tad rediģē esošo
  } else {
    const editButton = formWrapper.querySelector<HTMLButtonElement>('.book-edit__button');
    const bookId = lastSelectedId;
    axios
      .patch<Book>(`http://localhost:3004/books/${bookId}`, {
        name: bookNameInputValue,
        author: authorNameInputValue,
        genres: bookGenresInputValue,
        year: bookYearInputValue,
        createdAt: `${new Date()}`,
      })
      .then(() => {
        bookNameInput.value = '';
        bookAuthorName.value = '';
        bookGenresInput.value = 'choose a book genre';
        bookYearInput.value = '';

        editButton.className = 'js-add__button book-form__button';
        editButton.innerText = 'Add book!';
      });
    isEditMode = false;
  }
  drawBooks();
});
