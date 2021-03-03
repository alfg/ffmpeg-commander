const storage = {
  add(value) {
    const q = JSON.parse(window.localStorage.getItem('queue')) || [];
    q.push(value);
    window.localStorage.setItem('queue', JSON.stringify(q));
  },

  getAll() {
    const q = JSON.parse(window.localStorage.getItem('queue')) || [];
    return q;
  },

  get(id) {
    const q = JSON.parse(window.localStorage.getItem('queue')) || [];
    return q.find((item) => item.id === id);
  },

  updateStatus(id, value) {
    const items = storage.getAll();
    const item = items.find((o) => o.id === id);
    item.status = value;
    window.localStorage.setItem('queue', JSON.stringify(items));
    console.log(item);
    return item;
  },

  deleteAll() {
    window.localStorage.removeItem('queue');
  },
};

export default storage;
