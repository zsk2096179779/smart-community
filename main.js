import Vue from 'vue'
import App from './App'
import api from '@/common/api.js'
import common from '@/common/common.js'
import flyio from '@/common/wx.js'
import flyioh from 'flyio'
import store from '@/store/index.js'
import uniNavBar from "@/components/uni-nav-bar/uni-nav-bar.vue"
import {deepCopy} from '@/common/deepCopy.js'

// 创建 fly 实例
const fly = new flyio()

// Vue 配置
Vue.config.productionTip = false

// 全局组件和原型方法注册
Vue.prototype.$api = api
Vue.prototype.$store = store
Vue.prototype.$http = fly
Vue.prototype.$httph = flyioh
Vue.prototype.deepCopy = deepCopy
Vue.component('page-head', uniNavBar)

Vue.use(common)

App.mpType = 'app'

// 创建 Vue 实例
const app = new Vue({
  store,
  ...App
})
app.$mount()

// 请求拦截器
fly.interceptors.request.use((request) => {
  // 设置跨域配置
  uni.getSystemInfo({
    success: function(res) {
      if (res.version === undefined) {
        request.headers.crossDomain = true;
        request.headers.xhrFields = {
          withCredentials: true
        };
      }
    }
  });

  // 设置请求超时
  request.timeout = 50000;

  // 获取认证信息和过期时间
  const bxAuthTicket = uni.getStorageSync("bxAuthTicket");
  const outTime = uni.getStorageSync("outTime");
  const currentTime = new Date().getTime();

  // 检查登录是否过期
  let isExpired = false;
  if (outTime) {
    isExpired = currentTime >= outTime;
  }

  // 调试日志
  console.log("登录状态检查:", {
    currentTime,
    expireTime: outTime,
    isExpired,
    timeLeft: outTime ? outTime - currentTime : 'No expiration time set'
  });

  // 处理 API 路径
  const urlstr = request.url;
  const len = urlstr.lastIndexOf('cn/') + 3;
  const lens = urlstr.indexOf(';');
  const ls = urlstr.lastIndexOf('?');
  
  let apiPath;
  if (lens > 0) {
    apiPath = urlstr.slice(len, lens + 1);
  } else if (ls > 0) {
    apiPath = urlstr.slice(len, ls);
  } else {
    apiPath = urlstr.slice(len);
  }

  // 添加认证票据
  if (bxAuthTicket) {
    request.headers.bx_auth_ticket = bxAuthTicket;
  }

  // 处理过期情况
  if (isExpired) {
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }, 100);
    return Promise.reject(new Error('登录已过期'));
  }

  return request;
});

// 响应拦截器
fly.interceptors.response.use(
  (response) => {
    // 处理响应状态
    if (response.data.resultCode === "0011") {
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }, 100);
      return Promise.reject(new Error('登录已过期'));
    } 
    
    if (response.data.resultCode === '0000' && response.data.state === 'FAILURE') {
      return new Promise((resolve, reject) => {
        uni.showModal({
          title: "警告",
          cancelText: "登录",
          confirmText: "返回",
          content: "无权限访问\n点击返回按钮返回上一级页面\n点击登录跳转到登录页面",
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
              reject(new Error('用户选择返回'));
            } else if (res.cancel) {
              uni.reLaunch({
                url: '/pages/login/login'
              });
              reject(new Error('用户选择重新登录'));
            }
          }
        });
      });
    }

    return response;
  },
  (error) => {
    // 错误重试机制
    const config = error.config;
    
    // 检查是否配置了重试
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    // 检查重试条件
    if (!config.shouldRetry || typeof config.shouldRetry !== "function") {
      return Promise.reject(error);
    }

    // 判断是否满足重试条件
    if (!config.shouldRetry(error)) {
      return Promise.reject(error);
    }

    // 重试计数
    config.__retryCount = config.__retryCount || 0;

    // 检查是否超过重试次数
    if (config.__retryCount >= config.retry) {
      return Promise.reject(error);
    }

    // 增加重试计数
    config.__retryCount += 1;

    // 创建延迟
    const backoff = new Promise((resolve) => {
      setTimeout(resolve, config.retryDelay || 1);
    });

    // 重新发送请求
    return backoff.then(() => {
      console.log('请求失败，正在重新发送请求，重试次数：', config.__retryCount);
      return fly(config);
    });
  }
);

// 导出 Vue 实例
export default app;
 