export default {
  getItem (key) {
    return localStorage.getItem(key);
  },
  setItem (key, item) {
    return localStorage.setItem(key, item);
  }
};