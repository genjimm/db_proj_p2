import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const BASE_URL = 'http://127.0.0.1:8000';

async function postJson(path, data) {
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    const errMsg = json.detail || json.message || JSON.stringify(json);
    throw new Error(errMsg);
  }
  return json;
}

async function getJson(path) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await response.json();
  if (!response.ok) {
    const errMsg = json.detail || json.message || JSON.stringify(json);
    throw new Error(errMsg);
  }
  return json;
}

async function putJson(path, data) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok) {
    const errMsg = json.detail || json.message || JSON.stringify(json);
    throw new Error(errMsg);
  }
  return json;
}

async function deleteReq(path) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    let errMsg;
    try {
      const json = await response.json();
      errMsg = json.detail || json.message || JSON.stringify(json);
    } catch {
      errMsg = `Status ${response.status}`;
    }
    throw new Error(errMsg);
  }
  return;
}

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  let response;
  try {
    response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
  } catch (networkError) {
    throw new Error(`Network error during login: ${networkError.message}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Unexpected non-JSON response: ${text.slice(0, 100)}`);
  }

  let body;
  try {
    body = await response.json();
  } catch (err) {
    throw new Error('Failed to parse JSON response');
  }

  const token = body.access_token || body.token;
  if (token) {
    localStorage.setItem('token', token);
    const decodeToken = jwtDecode(token);
    console.log('Decoded Token:', decodeToken);
    localStorage.setItem('role', decodeToken.role);
  }

  return body;
}

export function register(user) {
  return postJson('/customer/', user);
}

export function addBook(book) {
  return postJson('/book/', book);
}

export function deleteBook(bookId) {
  return fetch(`${BASE_URL}/book/${bookId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.detail || 'Failed to delete book');
      });
    }
  });
}

export function updateBook(bookId, bookData) {
  return putJson(`/book/${bookId}`, bookData);
}

export function addBookCopy(bookId, copyData) {
  return postJson(`/book/${bookId}/copy`, copyData);
}

export function getBookCopies(bookId) {
  return getJson(`/book/${bookId}/copies`);
}

export function addAuthorToBook(bookId, authorId) {
  return fetch(`${BASE_URL}/book/${bookId}/authors?author_id=${authorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.detail || 'Failed to add author to book');
      });
    }
    return response.json();
  });
}

export function getBookAuthors(bookId) {
  return getJson(`/book/${bookId}/authors`);
}

export function getBookById(bookId) {
  return getJson(`/book/${bookId}`);
}

export function getAllBooks() {
  return getJson('/book/');
}

export function addAuthor(author) {
  return postJson('/author/', author);
}

export function getAuthorById(authorId) {
  return getJson(`/author/${authorId}`);
}

export function updateAuthor(authorId, authorData) {
  return putJson(`/author/${authorId}`, authorData);
}

export function deleteAuthor(authorId) {
  return deleteReq(`/author/${authorId}`);
}

export async function addRental(rentalData) {
  try {
    const response = await fetch(`${BASE_URL}/rental/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rentalData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.detail || 'Failed to create rental record'}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to create rental record:', error);
    throw error;
  }
}

export const getRentalById = async (rentalId) => {
  const response = await fetch(`${BASE_URL}/rental/${rentalId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch rental record');
  }

  return response.json();
};

export const returnRental = async (rentalId) => {
  try {
    const actualReturnDate = new Date().toISOString();
    
    console.log('Return book data:', {
      rentalId,
      actualReturnDate
    });

    const response = await fetch(`${BASE_URL}/rental/${rentalId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actual_return_date: actualReturnDate
      })
    });

    console.log('Server response status:', response.status);
    console.log('Server response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Server returned data:', data);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to return book');
    }

    return data;
  } catch (error) {
    console.error('Failed to return book:', error);
    throw new Error(error.message || 'Failed to return book');
  }
};

export const getRentalsByCustomer = async (customerId) => {
  const response = await fetch(`${BASE_URL}/rental/customer/${customerId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch customer rental records');
  }

  return response.json();
};

// Create axios instance for new API
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Exhibition related API
export const getExhibitions = () => api.get('/exhibitions');
export const getExhibition = (id) => api.get(`/exhibitions/${id}`);
export const registerExhibition = (eventId, data) => 
  api.post(`/exhibitions/${eventId}/registrations`, data);

// Seminar related API
export const getSeminars = () => api.get('/seminars');
export const getSeminar = (id) => api.get(`/seminars/${id}`);
export const createInvitation = (eventId, data) => 
  api.post(`/seminars/${eventId}/invitations`, data);

// Get user registered events
export const getMyRegistrations = (eventId) => 
  api.get(`/exhibitions/${eventId}/registrations`);
export const getMyInvitations = (eventId) => 
  api.get(`/seminars/${eventId}/invitations`);

export function createEvent(eventData) {
  return postJson('/event/', eventData);
}

export function deleteEvent(eventId) {
  return deleteReq(`/event/${eventId}`);
}

// Get unpaid invoices
export async function getUnpaidInvoices() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://127.0.0.1:8000/invoices/unpaid', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// Pay invoice
export async function payInvoice(invoiceId, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://127.0.0.1:8000/invoices/pay/${invoiceId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export function deleteBookCopy(bookId, copyId) {
  return fetch(`${BASE_URL}/book/${bookId}/copy/${copyId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.detail || 'Failed to delete book copy');
      });
    }
  });
}

// Create new reservation
export function createRoomReservation(data) {
  return fetch('http://127.0.0.1:8000/room-reservation/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

// Get reservations for a specific room
export function getRoomReservations(roomId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/room/${roomId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch room reservation information');
      }
      return res.json();
    });
}

// Get a single reservation
export function getRoomReservationById(reservationId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`)
    .then(res => res.json());
}

// Update reservation
export function updateRoomReservation(reservationId, data) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

// Delete reservation
export function deleteRoomReservation(reservationId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`, {
    method: 'DELETE'
  });
}

// Get all rooms
export function getAllRooms() {
  return fetch('http://127.0.0.1:8000/room/')
    .then(res => res.json());
}

// Get a single study room
export function getRoomById(roomId) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`)
    .then(res => res.json());
}

// Create new study room
export function createRoom(capacity) {
  return fetch('http://127.0.0.1:8000/room/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  }).then(res => res.json());
}

// Update study room
export function updateRoom(roomId, capacity) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  }).then(res => res.json());
}

// Delete study room
export function deleteRoom(roomId) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`, {
    method: 'DELETE'
  });
}

export default api;



