const storage = {
  add(key, value) {
    const q = JSON.parse(window.localStorage.getItem(key)) || [];
    q.push(value);
    window.localStorage.setItem(key, JSON.stringify(q));
  },

  getAll(key) {
    const q = JSON.parse(window.localStorage.getItem(key)) || [];
    return q;
  },

  get(key, id) {
    const q = JSON.parse(window.localStorage.getItem(key)) || [];
    return q.find((item) => item.id === id);
  },

  updateStatus(key, id, value) {
    const items = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    item.status = value;
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  deleteAll(key) {
    window.localStorage.removeItem(key);
  },
};

export default storage;
