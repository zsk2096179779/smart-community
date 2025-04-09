import Vue from 'vue'
import Vuex from 'vuex'

// 确保 Vue 使用 Vuex
Vue.use(Vuex)

// 创建并导出 Vuex Store 实例
export default new Vuex.Store({
  state: {
    // 定义状态，例如：
    count: 0,
    // 添加用户登录相关状态
    logined: false,
    userInfo: {
      user_no: '',
      dept_no: '',
      email: '',
      mobile: '',
      user_disp: '',
      real_name: ''
    },
    // 其他状态...
    hasLogin: false,
    userInfo_no: {}
  },
  mutations: {
    // 定义变更方法，例如：
    increment(state) {
      state.count++
    },
    
    // 添加登录相关的 mutations
    setLogined(state, status) {
      state.logined = status;
    },
    
    setUserNo(state, userInfo) {
      state.userInfo = userInfo;
    },
    
    // 添加 login mutation，与你在组件中使用的 mapMutations 对应
    login(state, userName) {
      state.hasLogin = true;
      // 如果 userName 是对象，则直接使用，否则创建一个包含 userName 的对象
      if (typeof userName === 'object') {
        state.userInfo_no = userName;
      } else {
        state.userInfo_no = { userName: userName };
      }
      
      // 同时更新 logined 状态，保持状态一致性
      state.logined = true;
    },
    
    logout(state) {
      state.hasLogin = false;
      state.userInfo_no = {};
      state.logined = false;
      state.userInfo = {
        user_no: '',
        dept_no: '',
        email: '',
        mobile: '',
        user_disp: '',
        real_name: ''
      };
    }
  },
  actions: {
    // 定义异步操作，例如：
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
    
    // 添加登录相关的异步操作
    loginAsync({ commit }, userName) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('login', userName);
          resolve();
        }, 1000);
      });
    }
  },
  getters: {
    // 添加 getters 便于获取状态
    isLoggedIn: state => state.hasLogin || state.logined,
    getUserInfo: state => state.userInfo,
    getlogined: state => state.logined,
    getAuthorState: state => state.userInfo_no
  },
  modules: {
    // 如果需要模块化，可以在这里添加
  }
})
