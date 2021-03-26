const storage = {
  getItem(key) {
    return JSON.parse(window.localStorage.getItem(key));
  },

  setItem(key, value) {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },

  add(key, value) {
    const q = JSON.parse(window.localStorage.getItem(key)) || [];
    q.push(value);
    window.localStorage.setItem(key, JSON.stringify(q));
  },

  getAll(key) {
    return JSON.parse(window.localStorage.getItem(key)) || [];
  },

  get(key, id) {
    const q = JSON.parse(window.localStorage.getItem(key)) || [];
    return q.find((item) => item.id === id);
  },

  set(key, id, k, v) {
    const items = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    item[k] = v;
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  updateStatus(key, id, value) {
    const items = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    item.status = value;
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  toggleDetails(key, id, value) {
    const items = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    item._showDetails = value; // eslint-disable-line no-underscore-dangle
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  deleteAll(key) {
    window.localStorage.removeItem(key);
  },
};

export default storage;
