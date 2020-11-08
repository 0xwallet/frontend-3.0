export default {
  getItem (key) {
    return sessionStorage.getItem(key);
  },
  setItem (key, item) {
    return sessionStorage.setItem(key, item);
  }
};