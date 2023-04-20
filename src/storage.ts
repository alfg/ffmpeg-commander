interface IItem {
  [key: string]: string;
}

interface IQueueItem {
  id: number;
  input: string;
  output: string;
  status: string;
  payload: object;
  error?: string;
  _showDetails: boolean;
}

const storage = {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  },

  getItems<T>(key: string): T[] {
    const items = localStorage.getItem(key);
    if (items) {
      return JSON.parse(items);
    }
    return [];
  },

  setItem<T>(key: string, value: T): void {
    return window.localStorage.setItem(key, JSON.stringify(value));
  },

  add(key: string, value: string) {
    const item = window.localStorage.getItem(key);
    let q = [];
    if (item) {
      q = JSON.parse(item);
      q.push(value);
    }
    window.localStorage.setItem(key, JSON.stringify(q));
  },

  getAll(key: string): IQueueItem[] {
    const item = window.localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return [];
  },

  // get(key: string, id: string): string | null {
  //   // const q = JSON.parse(window.localStorage.getItem(key)) || [];
  //   const item = window.localStorage.getItem(key);
  //   let q = [];
  //   if (item) {
  //     q = JSON.parse(item);
  //     return q.find((i: { id: string; }) => i.id === id);
  //   }
  //   return null;
  //   // return q.find((item) => item.id === id);
  // },

  setError(key: string, id: number, error: string) {
    const items = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    if (item) {
      item.error = error;
    }
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  updateStatus(key: string, id: number, value: string) {
    const items: IQueueItem[] = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    if (item) {
      item.status = value;
    }
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  toggleDetails(key: string, id: number, value: boolean) {
    const items: IQueueItem[] = storage.getAll(key);
    const item = items.find((o) => o.id === id);
    if (item) {
      item._showDetails = value; // eslint-disable-line no-underscore-dangle
    }
    window.localStorage.setItem(key, JSON.stringify(items));
    return item;
  },

  deleteAll(key: string) {
    window.localStorage.removeItem(key);
  },
};

export default storage;
