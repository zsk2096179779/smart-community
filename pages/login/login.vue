<template>
  <view class="content">
    <view class="titlehuany">
      欢迎来到智慧社区，
      <text @tap="visitorAccess">游客访问</text>
    </view>
    <view class="inputs">
      <view class="input-row"><m-input class="m-input" type="text" clearable v-model="account.name" placeholder="请输入账号"></m-input></view>
      <view class="input-row"><m-input type="password" displayable v-model="account.password" placeholder="请输入密码"></m-input></view>
    </view>
    <navigator url="../pwd/pwd" style="color: #9E9E9E;text-align: right;margin-right: 40px;margin-top: 5px;">忘记密码?</navigator>
    <view class="btn-row">
      <!-- <button type="primary" class="primary" @tap="bindLogin">登录公众号</button> -->
      <button type="primary" class="primary" style="background-color: #E51C23;" @tap="accoutLogin">登录</button>
    <view class="barbottom" style="">
      <text style="color: #9E9E9E;">还没有账号？</text>
      <!-- 使用编程式导航替代声明式导航 -->
      <text @tap="toRegisterPage">注册账号</text>
    </view>
      <!-- <button type="primary" class="primary" style="background-color: #E51C23;" >游客访问</button> -->
    </view>
    <view class="btn-row"></view>

    <view class="oauth-row" v-if="hasProvider" v-bind:style="{ top: positionTop + 'px' }">
      <view class="oauth-image" v-for="provider in providerList" :key="provider.value"><image :src="provider.image" @tap="oauth(provider.value)"></image></view>
    </view>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import mInput from '../../components/m-input.vue';
import loginimg  from '../../static/img/logins.png'
export default { 
  components: {
    mInput
  },
  data() {
     return {
        providerList: [],
        hasProvider: false,
        imageURL: require('../../static/img/logins.png'),
        account: {
          name: '',
          password: ''
        },
        positionTop: 0,
        // 添加挂载状态标志
        isMounted: false,
        isHidden: false,
        // 用于存储异步任务引用的对象
        pendingRequests: [],
        timers: []
      };
  },
  computed: mapState(['forcedLogin']),
  onLoad(option) {
    if (option.username) {
      this.account.name = option.username;
    }
    if (option.password) {
      this.account.password = option.password;
    }
    //#ifdef MP-WEIXIN
    this.miniLogin();
    //#endif
    //#ifdef APP-PLUS || H5

    this.appLogin();
    //#endif
  },
  methods: {
    ...mapMutations(['login']),
    initPosition() {
      /**
       * 使用 absolute 定位，并且设置 bottom 值进行定位。软键盘弹出时，底部会因为窗口变化而被顶上来。
       * 反向使用 top 进行定位，可以避免此问题。
       */
      this.positionTop = uni.getSystemInfoSync().windowHeight - 100;
    },
	// 安全的定时器方法
	safeTimeout(callback, delay) {
	  // 如果组件未挂载，则不创建定时器
	  if (!this.isMounted) return null;
	  
	  // 创建定时器并保存引用
	  const timer = setTimeout(() => {
	    // 执行回调前检查组件是否仍然挂载
	    if (this.isMounted) {
	      callback();
	    }
	    
	    // 从定时器数组中移除
	    const index = this.timers.indexOf(timer);
	    if (index !== -1) {
	      this.timers.splice(index, 1);
	    }
	  }, delay);
	  
	  // 将定时器添加到数组
	  this.timers.push(timer);
	  return timer;
	},
	
	// 安全的网络请求方法
	safeRequest(options) {
	  // 如果组件未挂载，则不发送请求
	  if (!this.isMounted) return null;
	  
	  // 创建请求任务
	  const requestTask = this.$http.post(options.url, options.data).then(res => {
	    // 执行回调前检查组件是否仍然挂载
	    if (this.isMounted && options.success) {
	      options.success(res);
	    }
	    
	    // 从请求数组中移除
	    const index = this.pendingRequests.indexOf(requestTask);
	    if (index !== -1) {
	      this.pendingRequests.splice(index, 1);
	    }
	    
	    return res;
	  }).catch(err => {
	    if (this.isMounted && options.fail) {
	      options.fail(err);
	    }
	    
	    // 从请求数组中移除
	    const index = this.pendingRequests.indexOf(requestTask);
	    if (index !== -1) {
	      this.pendingRequests.splice(index, 1);
	    }
	    
	    return Promise.reject(err);
	  });
	  
	  // 将请求添加到数组
	  this.pendingRequests.push(requestTask);
	  return requestTask;
	},
    oauth(value) {
      uni.login({
        provider: value,
        success: res => {
          uni.getUserInfo({
            provider: value,
            success: infoRes => {
              /**
               * 实际开发中，获取用户信息后，需要将信息上报至服务端。
               * 服务端可以用 userInfo.openId 作为用户的唯一标识新增或绑定用户信息。
               */
              this.toMain(infoRes.userInfo.nickName);
            }
          });
        },
        fail: err => {
          console.error('授权登录失败：' + JSON.stringify(err));
        }
      });
    },
    toMain(userName) {
      this.login(userName);
      /**
       * 强制登录时使用reLaunch方式跳转过来
       * 返回首页也使用reLaunch方式
       */
      if (this.forcedLogin) {
        uni.reLaunch({
          url: '../SmartCity/smartcity'
        });
      } else {
        uni.navigateBack();
      }
    },
	toRegisterPage() {
	  uni.showLoading({
		title: '加载中...'
	  });
	  
	  uni.navigateTo({
		url: '/pages/reg/reg',
		success: () => {
		  uni.hideLoading();
		},
		fail: (err) => {
		  uni.hideLoading();
		  console.error('注册页面跳转失败', err);
		  uni.showToast({
			title: '页面加载失败，请重试',
			icon: 'none'
		  });
		}
	  });
	},
    appLogin: async function() {},
    miniLogin: async function() {
      let self = this; // 重定向 this
      uni.showLoading({
        title: '小程序登录中'
      });

      //#ifdef MP-WEIXIN
      // 微信小程序获取登录状态
      let AuthorState = this.$store.getters.getAuthorState;
      let code = null;
      uni.setStorageSync('loginInfoSrvCk', ''); // 置空后台票据，准备重新获取
      // self.$store.commit("setWxLoginInfoSrvCk","")  // 置空后台票据，准备重新获取
      wx.login({
        success(res) {
          uni.hideLoading();
          if (res.code) {
            // 发起网络请求
            let ress = {
              url: self.$api.getLoginTicket,
              data: {
                code: res.code,
                app_no: '000003'
              }
            };
            // 发送code 到sso，获取会话信息 ssosessionid
            self.$http
              .post(ress.url, ress.data)
              .then(res => {
                console.log('res====?', res);
                if (res.data.resultCode === 'select_user_type') {
                  // 待绑定用户, 未绑定 百想帐号
                  if (res.data.ssosessionid && res.data.ssosessionid !== null && res.data.ssosessionid !== '' && res.data.ssosessionid !== undefined) {
                    try {
                      uni.setStorageSync('loginInfoSsos', res.data.ssosessionid); // 保存 sso 会话信息
                      uni.setStorageSync('loginInfoSsoCk', ''); //重置sso 票据，通过重新登录获取
                    } catch (e) {
                      // error
                    }
                    uni.hideLoading();
                    // self.showPopupMiddlea = true
                    // Vue.prototype.goWxLink("pages/login/login","navigateTo")
                  }
                } else if (res.data.resultCode === 'SUCCESS') {
                  // 登录成功 | 免登录用户 || 已绑定 百想帐号
                  let userNo = res.data.user_no;
                  if (
                    'ssosessionid' in res.data &&
                    'bxssocookieid' in res.data &&
                    res.data.ssosessionid !== null &&
                    res.data.ssosessionid !== '' &&
                    res.data.ssosessionid !== undefined
                  ) {
                    try {
                      uni.setStorageSync('loginInfoSsos', res.data.ssosessionid); // 保存 sso 会话信息
                      uni.setStorageSync('loginInfoSsoCk', res.data.bxssocookieid); //保存 sso 票据信息
                    } catch (e) {
                      // error
                    }
                    // let ssoCk = self.$store.getters.getWxLoginInfoSsoCk
                    let ssoCk = uni.getStorageSync('loginInfoSsoCk');
                    let logineds = self.$store.getters.getlogined;
                    // 通过sso凭证，获取后台会话
                    let promise = new Promise((resolve, reject) => {
                      let s = self.getSeesionId(ssoCk);
                      resolve(s);
                    });
                    promise.then(e => {
                      if (e) {
                        // 获取后台会话成功，设置本地登录状态，并返回用户页面
                        //console.log("2",e)
                        let users = {
                          logined: true,
                          user_info: {
                            user_no: res.data.user_no,
                            dept_no: '',
                            email: '',
                            mobile: '',
                            user_disp: '',
                            real_name: ''
                          }
                        };
                        self.$store.commit('setLogined', users.logined);
                        self.$store.commit('setUserNo', users.user_info);
                        // uni.navigateBack({ delta: 1})
                        uni.reLaunch({
                          url: '../SmartCity/smartcity'
                        });
                        // self.goWxLink('../home/home', 'reLaunch');
                      } else {
                        let users = {
                          logined: false
                        };

                        self.$store.commit('setLogined', users.logined);
                        //console.log("3:",e)
                      }
                      //console.log("获取seesionid 成功：",e,logineds,srvCk)
                    });
                  }
                } else {
                  //console.log("登录3！ssos",ssos,ssoCk,srvCk,srvCkCode)
                  return ssoCk;
                }
              })
              .catch(err => {
                //console.log('登录失败4！' + res.errMsg)
              });
          } else {
            //console.log('登录失败5！' + res.errMsg)
          }
        }
      });
      //#endif
    },
	// 使用 async/await 改进 visitorAccess 方法
	async visitorAccess() {
	  try {
		// 游客访问 - 前端硬编码方式实现
		uni.clearStorageSync();
		
		// 显示加载提示
		uni.showLoading({
		  title: '正在以游客身份登录...'
		});
		
		// 创建游客信息
		const bx_auth_ticket = 'visitor-mock-ticket-' + new Date().getTime();
		const loginTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24小时后过期
		const userInfo = {
		  user_no: 'visitor',
		  user_name: '游客用户',
		  user_type: 'visitor'
		};
		
		// 保存登录信息到本地存储
		uni.setStorageSync('bxAuthTicket', bx_auth_ticket);
		uni.setStorageSync('userInfo', userInfo);
		uni.setStorageSync('expireTime', 24 * 60 * 60); // 24小时
		uni.setStorageSync('outTime', loginTime);
		
		// 使用 mapMutations 导入的 login 方法
		this.login('游客');
		
		// 隐藏加载提示
		uni.hideLoading();
		
		// 显示登录成功提示
		uni.showToast({
		  title: '游客登录成功',
		  icon: 'success',
		  duration: 1000
		});
		
		// 使用Promise包装页面跳转，以便使用await
		await new Promise(resolve => {
		  uni.switchTab({
			url: '/pages/SmartCity/smartcity',
			success: resolve,
			fail: resolve // 即使失败也resolve，避免阻塞
		  });
		});
		
	  } catch (error) {
		console.error('游客访问出错:', error);
		uni.hideLoading();
		uni.showToast({
		  title: '登录失败，请重试',
		  icon: 'none'
		});
	  }
	},

// 使用 async/await 改进 accoutLogin 方法
async accoutLogin() {
  try {
    // 添加硬编码登录验证
    if (this.account.name === 'admin' && this.account.password === '123456') {
      // 设置登录信息
      const bx_auth_ticket = 'mock-auth-ticket-for-admin';
      const loginTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 24小时后过期
      const userInfo = {
        user_no: 'admin',
        user_name: 'admin',
        user_type: 'admin'
      };
      
      // 保存登录信息到本地存储
      uni.setStorageSync('bxAuthTicket', bx_auth_ticket);
      uni.setStorageSync('userInfo', userInfo);
      uni.setStorageSync('expireTime', 24 * 60 * 60); // 24小时
      uni.setStorageSync('outTime', loginTime);
      
      // 使用 mapMutations 导入的 login 方法
      this.login('admin');
      
      // 显示登录成功提示
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      });
      
      // 使用Promise包装页面跳转，以便使用await
      await new Promise(resolve => {
        uni.switchTab({
          url: '/pages/SmartCity/smartcity',
          success: resolve,
          fail: resolve
        });
      });
      
      return; // 结束函数执行，不再进行后续的登录请求
    }
    
    // 如果不是硬编码用户名和密码，继续执行原有的登录逻辑
    uni.clearStorageSync();
    
    // 登录访问
    let self = this;
    let ssos = uni.getStorageSync('loginInfoSsos');
    
    console.log('ssos', ssos);
    const platform = uni.getSystemInfoSync().platform;
    console.log(`运行在${platform}上`);
    
    console.log('ssos', ssos, uni.getSystemInfoSync());
    let reqS = {
      url: self.$api.programlogin + ';SSOSESSIONID=' + ssos,
      data: [{ serviceName: 'srvuser_login', data: [{ user_no: self.account.name, pwd: self.account.password }] }]
    };
    
    // 根据平台和ssos状态确定请求URL
    if (ssos === '') {
      // #ifdef  MP-WEIXIN
      reqS.url = self.$api.programlogin;
      // #endif
      // #ifdef  APP-PLUS || H5
      reqS.url = self.$api.toLogin;
      // #endif
    } else {
      // #ifdef  MP-WEIXIN
      reqS.url = self.$api.programlogin + ';SSOSESSIONID=' + ssos;
      // #endif
      // #ifdef  APP-PLUS || H5
      reqS.url = self.$api.toLogin + ';SSOSESSIONID=' + ssos;
      // #endif
    }
    
    // 使用安全请求方法发送请求
    const response = await this.safeRequest({
      url: reqS.url,
      data: reqS.data
    });
    
    // 处理响应
    if (!this.isMounted) return; // 如果组件已卸载，停止处理
    
    const res = response;
    this.login.loading = false;
    console.log(res.status, res.data, res.header);
    
    // 根据结果代码处理不同的情况
    switch (res.data.resultCode) {
      case 'FAILURE':
        uni.showToast({
          icon: 'none',
          title: res.data.resultMessage
        });
        break;
      
      case 'bind_login_success':
        // 处理绑定登录成功...
        await this.handleBindLoginSuccess(res);
        break;
      
      case 'bind_login_failure':
      case 'unbind_login_success':
        uni.showToast({
          icon: 'none',
          title: res.data.resultMessage
        });
        break;
      
      case 'SUCCESS':
        // 处理普通登录成功...
        await this.handleNormalLoginSuccess(res);
        break;
      
      default:
        // 处理其他情况
        break;
    }
  } catch (error) {
    console.error('登录出错:', error);
    if (this.isMounted) {
      this.login.loading = false;
      uni.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  }
},

// 添加辅助方法处理登录成功情况
async handleBindLoginSuccess(res) {
  if (!this.isMounted) return;
  
  let self = this;
  // 绑定登录成功，设置登录状态
  let users = {
    logined: true,
    user_info: {
      user_no: res.data.user_no,
      dept_no: '',
      email: '',
      mobile: '',
      user_disp: '',
      real_name: ''
    }
  };
  
  self.$store.commit('setLogined', users.logined);
  self.$store.commit('setUserNo', users.user_info);
  
  try {
    // 等待获取会话ID
    const sessionId = await new Promise((resolve) => {
      const s = self.getSeesionId(res.data.bxssocookieid);
      resolve(s);
    });
    
    if (!this.isMounted) return; // 再次检查组件状态
    
    if (sessionId) {
      // 获取后台会话成功
      let users = {
        logined: true,
        user_info: {
          user_no: res.data.user_no,
          dept_no: '',
          email: '',
          mobile: '',
          user_disp: '',
          real_name: ''
        }
      };
      self.$store.commit('setLogined', users.logined);
      self.$store.commit('setUserNo', users.user_info);
      uni.setStorageSync('loginInfoSrvCk', sessionId); //保存 后端服务 票据信息
      
      await new Promise(resolve => {
        uni.switchTab({
          url: '/pages/SmartCity/smartcity',
          success: resolve,
          fail: resolve
        });
      });
    } else {
      let users = { logined: false };
      self.$store.commit('setLogined', users.logined);
    }
  } catch (error) {
    console.error('获取会话ID失败:', error);
  }
},

async handleNormalLoginSuccess(res) {
  if (!this.isMounted) return;
  
  let self = this;
  // 绑定登录成功，设置登录状态
  let bx_auth_ticket = res.data.response[0].response.bx_auth_ticket;
  let userInfo = res.data.response[0].response.login_user_info;
  let loginTime = new Date().getTime() + res.data.response[0].response.expire_time * 1000;
  
  uni.setStorageSync('bxAuthTicket', bx_auth_ticket); //保存凭证
  uni.setStorageSync('userInfo', userInfo); //保存用户信息
  uni.setStorageSync('expireTime', res.data.response[0].response.expire_time); //保存时效
  uni.setStorageSync('outTime', loginTime); //保存时效
  
  // 异步获取用户信息
  if (this.isMounted) {
    this.getUserInfo(userInfo.user_no);
  }
  
  let use = {
    logined: true,
    user_info: {
      user_no: userInfo.user_no,
      dept_no: '',
      email: '',
      mobile: '',
      user_disp: '',
      real_name: ''
    }
  };
  self.$store.commit('setLogined', use.logined);
  
  // 获取应用菜单
  let menureq = { serviceName: 'srvauth_user_app_menu_select', colNames: ['*'] };
  try {
    const menuRes = await self.$http.post(self.$api.getUserAppMenu, menureq);
    console.log('menureq', menureq, menuRes);
  } catch (error) {
    console.error('获取菜单失败:', error);
  }
  
  if (this.isMounted) {
    await new Promise(resolve => {
      uni.switchTab({
        url: '/pages/SmartCity/smartcity',
        success: resolve,
        fail: resolve
      });
    });
  }
},

	// 改进 getUserInfo 方法
	async getUserInfo(user_no) {
	  // 如果组件已卸载或用户ID为空，不执行任何操作
	  if (!this.isMounted || !user_no) return;
	  
	  try {
		// 获取当前登录账号的信息
		const url = this.$api.select + '/sso/select/srvsso_user_select';
		const req = {
		  serviceName: 'srvsso_user_select',
		  condition: [{ colName: 'user_no', ruleType: 'eq', value: user_no }],
		  colNames: ['*'],
		  hisVer: true
		};
		
		const url3 = this.$api.select + '/sqfw/select/srvzhsq_reg_select';
		const req3 = {
		  serviceName: 'srvzhsq_reg_select',
		  colNames: ['*'],
		  condition: [{ colName: 'user_no', ruleType: 'eq', value: user_no }]
		};
		
		// 并行发送两个请求
		const [regResponse, userResponse] = await Promise.all([
		  this.safeRequest({ url: url3, data: req3 }),
		  this.safeRequest({ url: url, data: req })
		]);
		
		// 如果组件已卸载，不继续处理
		if (!this.isMounted) return;
		
		// 处理注册信息响应
		if (regResponse.data.data) {
		  let userInfo = regResponse.data.data[0];
		  console.log('userInfo', userInfo);
		  if (userInfo) {
			uni.setStorageSync('userInfo', userInfo);
		  }
		}
		
		// 处理用户信息响应
		if (userResponse.data.data && userResponse.data.data[0]) {
		  const userInfo = userResponse.data.data[0];
		  if (userInfo.photo_url) {
			try {
			  const url2 = this.$api.select + '/file/select/srvfile_attachment_select';
			  const req2 = {
				serviceName: 'srvfile_attachment_select',
				colNames: ['*'],
				condition: [
				  { colName: 'file_no', value: userInfo.photo_url, ruleType: 'eq' },
				  { colName: 'is_delete', value: '1', ruleType: 'eq' }
				]
			  };
			  
			  const photoResponse = await this.safeRequest({ url: url2, data: req2 });
			  
			  if (!this.isMounted) return;
			  
			  if (photoResponse.data.data && photoResponse.data.data[0]) {
				let head_img = photoResponse.data.data[0].fileurl;
				head_img = this.$api.select + '/file/download?filePath=' + head_img;
				let storageUserInfo = uni.getStorageSync('userInfo');
				storageUserInfo.head_img_path = head_img;
				uni.setStorageSync('userInfo', storageUserInfo);
			  }
			} catch (error) {
			  console.error('获取用户头像失败:', error);
			}
		  }
		}
	  } catch (error) {
		console.error('获取用户信息失败:', error);
	  }
	},
  // 修改现有的 onReady 方法
  onReady() {
    this.initPosition();
    // this.initProvider();
    this.isMounted = true; // 标记组件已挂载
  },
  
  // 添加 onUnload 生命周期钩子
  onUnload() {
    // 标记组件已卸载
    this.isMounted = false;
    
    // 清理所有定时器
    this.timers.forEach(timer => {
      clearTimeout(timer);
    });
    this.timers = [];
    
    // 取消所有挂起的网络请求
    this.pendingRequests.forEach(request => {
      if (request && typeof request.abort === 'function') {
        request.abort();
      }
    });
    this.pendingRequests = [];
  },
  
  // 添加 onHide 生命周期钩子
  onHide() {
    // 页面隐藏时，可以做一些轻量级的清理
    // 可选：标记组件已隐藏
    this.isHidden = true;
  },
  }
}
</script>

<style>
.primary {
  margin: 0upx 80upx 10px 80upx;
  border-radius: 50upx;
  letter-spacing: 1em;
  height: 80upx;
  line-height: 80upx;
}
.content {
  background-image: url(../../static/img/logins.png);
  height: 100vh;
  width: 100%;
  background-size: cover;
  position: relative;
}
.action-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.action-row navigator {
  color: #007aff;
  padding: 0 20upx;
}

.oauth-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.oauth-image {
  width: 100upx;
  height: 100upx;
  border-radius: 100upx;
  margin: 0 40upx;
  background-color: #ffffff;
}

.oauth-image image {
  width: 60upx;
  height: 60upx;
  margin: 20upx;
}
.inputs {
  margin: 0 30upx;
  margin-top: 35vh;
}
.titlehuany {
  /* line-height: 60vh; */
  position: absolute;
  top: 27vh;
  left: 13vw;
  font-size: 17px;
  font-family: Arial;
  font-weight: lighter;
  letter-spacing: 1px;
}
.titlehuany text {
  color: red;
  border-bottom: 0.5px solid red;
}

.input-row {
  width: calc(100% - 100upx);
  height: 50px;
  margin: 20px 50upx;
  box-sizing: border-box;
  border: none;
}
.barbottom {
  display: flex;
  margin-left: 28vw;
}
</style>
