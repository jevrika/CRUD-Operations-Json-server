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
// Globalais mainīgais, lai varētu piekļūt no vairākām veitām,
// fillFormForEdit paņem id tai grāmatai, kurai tiek uzspiest edit
// un vēlāk tas tiek paņemts, lai apdeitotu tikai to grāmatu
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
const bookCreatedAt = (createdAt: string): string => {
  const currentDate: Date = new Date();

  const resultInMinutes: number = differenceInMinutes(currentDate, Date.parse(createdAt));
  const resultInHours: number = differenceInHours(currentDate, Date.parse(createdAt));
  const resultInDays: number = differenceInDays(currentDate, Date.parse(createdAt));

  if (resultInDays === 1 || resultInHours === 24) {
    return `Created ${resultInDays} day ago `;
  }
  if (resultInDays > 1 || resultInHours > 24) {
    return `Created ${resultInDays} days ago `;
  }
  if (resultInMinutes === 60 || resultInHours === 1) {
    return `Created ${resultInHours} hour ago `;
  }
  if (resultInMinutes > 60 && resultInHours > 1) {
    return `Created ${resultInHours} hours ago `;
  }
  if (resultInMinutes === 0) {
    return 'Created Just now';
  }
  if (resultInMinutes === 1) {
    return `Created ${resultInMinutes} minute ago`;
  }
  if (resultInMinutes > 1 && (resultInMinutes as number) < 60) {
    return `Created ${resultInMinutes} minutes ago `;
  }
  return 'Created at an unknown time';
};

// Funkcija kura dzēš ārā grāmatu no datubāzes
const deleteBook = () => {
  const bookDeleteButton = document.querySelectorAll<HTMLButtonElement>('.js-delete__button');

  bookDeleteButton.forEach((bookDeleteBtn) => {
    bookDeleteBtn.addEventListener('click', () => {
      const { bookId } = bookDeleteBtn.dataset;

      axios.delete(`http://localhost:3004/books/${bookId}`).then(() => {
        // eslint-disable-next-line no-use-before-define
        drawBooks();
      });
    });
  });
};

// Funkcija, kura ielasa grāmatas datus iekš formas, kad tiek uzspiesta poga Edit
const fillFormForEdit = (): void => {
  const bookEditButton = document.querySelectorAll<HTMLButtonElement>('.js-edit__button');

  bookEditButton.forEach((bookEditBtn) => {
    bookEditBtn.addEventListener('click', () => {
      // Paņemam add pogu un pārtaisam to par edit pogu
      const addButton = document.querySelector<HTMLButtonElement>('.js-add__button');
      addButton.className = 'book-edit__button';
      addButton.innerText = 'Update';

      // Dabū grāmatas id, lai zinātu kurai grāmatai ņemt datus
      const { bookId } = bookEditBtn.dataset;

      // Paņem grāmatas datus
      axios.get(`http://localhost:3004/books/${bookId}`).then((response) => {
        bookNameInput.value = response.data.name;
        bookAuthorName.value = response.data.author;
        bookGenresInput.value = response.data.genres;
        bookYearInput.value = response.data.year;

        // Iestata isEditMode true un ieliek globalajā mainīgajā bookid
        isEditMode = true;
        lastSelectedId = bookId;
      });
    });
  });
};

// Funkcija, kura uzzīme kartiņas
const drawBooks = (): void => {
  bookWrapper.innerHTML = '';

  axios.get<Book[]>('http://localhost:3004/books').then((response) => {
    response.data.reverse().forEach((book) => {
      bookWrapper.innerHTML += `
      <div class="book" >
      <div class="genre-image-wrapper"> 
      <img class="genre-image" src="./assets/images/${book.genres.toLowerCase()}.png" alt="Genre Image">
      </div>
      <h1 class="book__heading">${book.name}</h1>
      <h2 class="book-author__heading">${book.author}</h2>
      <h3 class="book-genres__heading">Genre: ${book.genres} </h3>
      <h4 class="book-year__heading">The year of publishing : ${book.year} </h4>
      <button class='js-edit__button book-edit__button' data-book-id='${book.id}'> Edit </button>
      <button class='js-delete__button book-delete__button' data-book-id='${book.id}'> Delete </button>
      <p class="creating-date"> ${bookCreatedAt(book.createdAt)} </p>
      </div>
    `;
    });
    fillFormForEdit();
    deleteBook();
  });
};

drawBooks();

// Eventlistener un kas notiek, kad submito formu
bookForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // mMinīgajos saliek grāmatas datus
  const bookNameInputValue = bookNameInput.value;
  const authorNameInputValue = bookAuthorName.value;
  const bookGenresInputValue = bookGenresInput.value;
  const bookYearInputValue = bookYearInput.value;

  // Ja editmode ir false, tad taisa jaunu grāmatu
  // Saliek grāmatas datus datubāze un atgriež tukšu formu
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
    // Ja isEditMode ir true, tad rediģē esošo
    // Samaina datubāzē datus un tad atgriež tukšu formu un samaina pogai klasi un tekstu
    // Atgriež isEditMode uz false
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
