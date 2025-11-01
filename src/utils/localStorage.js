const LOCAL_KEY = 'joineazy_data_v1';
const USER_KEY = 'joineazy_user_v1';

export function loadData(defaultData) {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  try { return JSON.parse(raw); } catch(e) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

export function saveData(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e){ return null; }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
