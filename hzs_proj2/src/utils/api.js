import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const BASE_URL = 'http://127.0.0.1:8000';

async function postJson(path, data) {
  const token = localStorage.getItem('token'); // Retrieve the token
  console.log('Token:', token);
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include the token
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
  const token = localStorage.getItem('token'); // Retrieve the token
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Include the token
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
  // append账号密码
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  let response;
  try {
    // fetch后端
    response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
  } catch (networkError) {
    throw new Error(`Network error during login: ${networkError.message}`);
  }

  // 如果不是json就报错
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Unexpected non-JSON response: ${text.slice(0, 100)}`);
  }

  // 解析内容
  let body;
  try {
    body = await response.json();
  } catch (err) {
    throw new Error('Failed to parse JSON response');
  }

  // 登录成功，存入token
  const token = body.access_token || body.token;
  if (token) {
    localStorage.setItem('token', token);
    const decodeToken = jwtDecode(token);
    console.log('Decoded Token:', decodeToken);
    localStorage.setItem('role', decodeToken.role);
  }

  // return 内容
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
      throw new Error(`${response.status}: ${data.detail || '创建租借记录失败'}`);
    }

    return data;
  } catch (error) {
    console.error('创建租借记录错误:', error);
    throw error;
  }
}

export const getRentalById = async (rentalId) => {
  const response = await fetch(`${BASE_URL}/rental/${rentalId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '获取租借记录失败');
  }

  return response.json();
};

export const returnRental = async (rentalId) => {
  try {
    const actualReturnDate = new Date().toISOString();
    
    console.log('归还图书数据:', {
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

    console.log('服务器响应状态:', response.status);
    console.log('服务器响应头:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('服务器返回的数据:', data);

    if (!response.ok) {
      throw new Error(data.detail || '归还图书失败');
    }

    return data;
  } catch (error) {
    console.error('归还图书错误:', error);
    throw new Error(error.message || '归还图书失败');
  }
};

export const getRentalsByCustomer = async (customerId) => {
  const response = await fetch(`${BASE_URL}/rental/customer/${customerId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '获取顾客租借记录失败');
  }

  return response.json();
};

// 创建axios实例用于新的API
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，在每个请求中添加token
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

// 展览相关API
export const getExhibitions = () => api.get('/exhibitions');
export const getExhibition = (id) => api.get(`/exhibitions/${id}`);
export const registerExhibition = (eventId, data) => 
  api.post(`/exhibitions/${eventId}/registrations`, data);

// 研讨会相关API
export const getSeminars = () => api.get('/seminars');
export const getSeminar = (id) => api.get(`/seminars/${id}`);
export const createInvitation = (eventId, data) => 
  api.post(`/seminars/${eventId}/invitations`, data);

// 获取用户报名的活动
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

// 获取未支付账单
export async function getUnpaidInvoices() {
  const token = localStorage.getItem('token');
  const res = await fetch('http://127.0.0.1:8000/invoices/unpaid', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

// 支付账单
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

// 新建预约
export function createRoomReservation(data) {
  return fetch('http://127.0.0.1:8000/room-reservation/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}
// 获取特定房间的预约
export function getRoomReservations(roomId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/room/${roomId}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('获取房间预约信息失败');
      }
      return res.json();
    });
}
// 获取单个预约
export function getRoomReservationById(reservationId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`)
    .then(res => res.json());
}

// 更新预约
export function updateRoomReservation(reservationId, data) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

// 删除预约
export function deleteRoomReservation(reservationId) {
  return fetch(`http://127.0.0.1:8000/room-reservation/${reservationId}`, {
    method: 'DELETE'
  });
}

export function getAllRooms() {
  return fetch('http://127.0.0.1:8000/room/')
    .then(res => res.json());
}

// 获取单个自习室
export function getRoomById(roomId) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`)
    .then(res => res.json());
}

// 新建自习室
export function createRoom(capacity) {
  return fetch('http://127.0.0.1:8000/room/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  }).then(res => res.json());
}

// 更新自习室
export function updateRoom(roomId, capacity) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  }).then(res => res.json());
}

// 删除自习室
export function deleteRoom(roomId) {
  return fetch(`http://127.0.0.1:8000/room/${roomId}`, {
    method: 'DELETE'
  });
}



export default api;



