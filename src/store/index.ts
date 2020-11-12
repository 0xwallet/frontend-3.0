import app from './modules/app';
import user from './modules/user';
import { createStore } from 'vuex';
export default createStore({
  modules: {
      app,
      user
  }
});