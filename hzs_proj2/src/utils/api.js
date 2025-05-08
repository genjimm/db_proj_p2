const BASE_URL = 'http://127.0.0.1:8000';

async function postJson(path, data) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
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

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
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
    response = await fetch('http://127.0.0.1:8000/login', {
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
  return deleteReq(`/book/${bookId}`);
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
    // 获取当前时间作为归还时间
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
