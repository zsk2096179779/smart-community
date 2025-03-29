import Vue from 'vue'
import Vuex from 'vuex'

// 确保 Vue 使用 Vuex
Vue.use(Vuex)

// 创建并导出 Vuex Store 实例
export default new Vuex.Store({
  state: {
    // 定义状态，例如：
    count: 0
  },
  mutations: {
    // 定义变更方法，例如：
    increment(state) {
      state.count++
    }
  },
  actions: {
    // 定义异步操作，例如：
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    }
  },
  modules: {
    // 如果需要模块化，可以在这里添加
  }
})
