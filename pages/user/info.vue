<template>
  <view class="wrap">
    <!-- <cmd-nav-bar back title="个人信息"></cmd-nav-bar> -->
    <view v-if="loading" class="loading-container">
      <view class="loading">加载中...</view>
      <view class="retry-btn" @click="retryLoading">点击重试</view>
    </view>
    <cmd-page-body type="top" v-else-if="userInfo && userInfo.user_no !== 'niming'">
      <cmd-transition name="fade-up">
        <view>
          <cmd-cel-item title="头像" slot-right arrow @click="editAvatar">
           <cmd-avatar :src="userInfo.head_img_path ? userInfo.head_img_path : ''"></cmd-avatar>
          </cmd-cel-item>
          <cmd-cel-item title="ID" :addon="userInfo && userInfo.user_no ? userInfo.user_no : ''" arrow @click="viewId"></cmd-cel-item>
          <cmd-cel-item title="积分" :addon="integras == 'null' ? '0' : integras" @click="refreshIntegra"></cmd-cel-item>
          <cmd-cel-item title="我的审核" @click="audit" arrow></cmd-cel-item>
          <cmd-cel-item title="签到" @click="signIn()" arrow></cmd-cel-item>
          <cmd-cel-item title="姓名" :addon="userInfo && userInfo.real_name ? userInfo.real_name : ' - '" arrow @click="editName"></cmd-cel-item>
          <cmd-cel-item title="联系方式" :addon="userInfo && userInfo.mobile ? userInfo.mobile : ' - '" arrow @click="editMobile"></cmd-cel-item>
          <cmd-cel-item title="证件号码" :addon="userInfo && userInfo.id_card ? userInfo.id_card : ' '" arrow @click="viewIdCard"></cmd-cel-item>
          <cmd-cel-item title="修改资料" @click="fnClick('modifyInfo')" arrow></cmd-cel-item>
          <cmd-cel-item title="修改密码" @click="fnClick('modify')" arrow></cmd-cel-item>
          <button class="btn-logout" @click="logout">退出登录</button>
        </view>
      </cmd-transition>
    </cmd-page-body>
    <view class="tologin" v-else><button style="background: #E51C23;color: #fff;" @click="toLogin">点击跳转到登录</button></view>
  </view>
</template>

<script>
  import cmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue"
  import cmdPageBody from "@/components/cmd-page-body/cmd-page-body.vue"
  import cmdTransition from "@/components/cmd-transition/cmd-transition.vue"
  import cmdCelItem from "@/components/cmd-cell-item/cmd-cell-item.vue"
  import cmdAvatar from "@/components/cmd-avatar/cmd-avatar.vue"

  export default {
    components: {
      cmdNavBar,
      cmdPageBody,
      cmdTransition,
      cmdCelItem,
      cmdAvatar
    },

    data() {
      return {
        userInfo: {},
        integras: '0',
        loading: false,
        loadTimeout: null,
        loadRetries: 0,
        maxRetries: 3
      };
    },

    onLoad() {
      this.initPage();
    },

    onShow() {
      // 如果页面已经加载完成，只刷新需要的数据
      if (!this.loading && this.userInfo && this.userInfo.user_no) {
        // 只在需要时尝试获取积分
        if (this.integras === '0' || this.integras === 'null') {
          this.integra();
        }
      } else {
        // 如果页面尚未加载完成，尝试初始化
        this.initPage();
      }
    },

    mounted() {
      uni.setNavigationBarTitle({
        title: "个人信息"
      });
    },

    methods: {
      // 初始化页面
      initPage() {
        // 先尝试从缓存获取用户信息
        const storedInfo = uni.getStorageSync('userInfo');
        if (storedInfo && storedInfo.user_no) {
          this.userInfo = storedInfo;
          
          // 尝试获取积分信息但不阻塞页面显示
          this.integra();
          
          // 在背景中尝试刷新用户信息，不影响页面加载
          setTimeout(() => {
            this.refreshUserInfo().catch(err => {
              console.log("背景刷新用户信息失败:", err);
            });
          }, 1000);
        } else {
          // 如果没有缓存的用户信息，开始加载流程
          this.startLoading();
        }
      },
      
      // 开始加载流程
      startLoading() {
        this.loading = true;
        this.loadRetries = 0;
        
        // 设置一个更短的全局超时
        this.loadTimeout = setTimeout(() => {
          if (this.loading) {
            this.loading = false;
            uni.showToast({
              title: '加载超时，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        }, 8000); // 8秒超时
        
        this.loadUserInfo();
      },
      
      // 重试加载
      retryLoading() {
        if (this.loadRetries < this.maxRetries) {
          this.loadRetries++;
          uni.showToast({
            title: `正在重试 (${this.loadRetries}/${this.maxRetries})`,
            icon: 'none'
          });
          this.loadUserInfo();
        } else {
          uni.showToast({
            title: '重试次数过多，请检查网络后重启应用',
            icon: 'none',
            duration: 3000
          });
          // 仍然尝试显示页面，使用可能过期的缓存数据
          this.loading = false;
        }
      },
      
      // 刷新积分信息
      refreshIntegra() {
        uni.showToast({
          title: '正在刷新积分',
          icon: 'none'
        });
        this.integra();
      },
      
      // 优化后的积分获取方法
      integra() {
        // 如果用户未登录，不进行请求
        if (!this.userInfo || !this.userInfo.user_no) {
          this.integras = '0';
          return;
        }
        
        let url = this.$api.select + '/sqfw/select/srvzhsq_reg_score_select';
        let req = {
          colNames: ['*'],
          condition: [
            {
              colName: 'user_no',
              ruleType: 'eq',
              value: this.userInfo.user_no
            }
          ],
          serviceName: 'srvzhsq_reg_score_select'
        };
        
        // 使用Promise.race与setTimeout结合控制超时
        const fetchPromise = this.$http.post(url, req);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
        });
        
        Promise.race([fetchPromise, timeoutPromise])
          .then(res => {
            console.log("积分数据:", res);
            if (res.data && res.data.data && res.data.data.length > 0) {
              this.integras = res.data.data[0].score || '0';
            } else {
              this.integras = '0';
            }
          })
          .catch(err => {
            console.error("积分获取错误:", err);
            // 保持当前积分值不变
          });
      },
      
      // 加载用户信息
      loadUserInfo() {
        try {
          const storedInfo = uni.getStorageSync('userInfo');
          if (storedInfo && storedInfo.user_no) {
            this.userInfo = storedInfo;
            // 加载完成后关闭加载状态
            this.loading = false;
            
            // 尝试从服务器获取积分
            this.integra();
            
            // 清除加载超时
            if (this.loadTimeout) {
              clearTimeout(this.loadTimeout);
              this.loadTimeout = null;
            }
          } else {
            // 如果没有存储的用户信息，尝试从服务器获取
            this.refreshUserInfo()
              .then(success => {
                this.loading = false;
                
                // 清除加载超时
                if (this.loadTimeout) {
                  clearTimeout(this.loadTimeout);
                  this.loadTimeout = null;
                }
                
                if (!success) {
                  uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                  });
                }
              })
              .catch(err => {
                console.error("刷新用户信息失败:", err);
                this.loading = false;
                
                // 清除加载超时
                if (this.loadTimeout) {
                  clearTimeout(this.loadTimeout);
                  this.loadTimeout = null;
                }
                
                uni.showToast({
                  title: '获取用户信息失败，请重试',
                  icon: 'none'
                });
              });
          }
        } catch (error) {
          console.error("加载用户信息失败:", error);
          this.loading = false;
          
          // 清除加载超时
          if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
            this.loadTimeout = null;
          }
        }
      },
      
      // 从服务器刷新用户信息
      refreshUserInfo() {
        if (!this.userInfo || !this.userInfo.user_no || this.userInfo.user_no === 'niming') {
          return Promise.resolve(false);
        }
        
        const url = this.$api.select + '/sqfw/select/srvzhsq_user_select';
        const req = {
          colNames: ['*'],
          condition: [{
            colName: 'user_no',
            ruleType: 'eq',
            value: this.userInfo.user_no
          }],
          serviceName: 'srvzhsq_user_select'
        };
        
        // 使用Promise.race与setTimeout结合控制超时
        const fetchPromise = this.$http.post(url, req);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
        });
        
        return Promise.race([fetchPromise, timeoutPromise])
          .then(res => {
            if (res.data && res.data.data && res.data.data.length > 0) {
              this.userInfo = res.data.data[0];
              uni.setStorageSync('userInfo', this.userInfo);
              return true;
            }
            return false;
          })
          .catch(err => {
            console.error("获取用户信息失败:", err);
            // 如果有缓存，则继续使用缓存数据
            return this.userInfo && this.userInfo.user_no;
          });
      },
      
      signIn() {
        // 先检查用户今天是否已经签到
        this.checkSignInStatus().then(hasSignIn => {
          if (hasSignIn) {
            uni.showToast({
              title: '今日已签到',
              icon: 'none'
            });
          } else {
            // 没有签到则跳转到签到页面
            uni.navigateTo({
              url: '../signIn/signIn'
            });
          }
        });
      },
      
      checkSignInStatus() {
        return new Promise((resolve) => {
          if (!this.userInfo || !this.userInfo.user_no) {
            resolve(false);
            return;
          }
          
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          
          const url = this.$api.select + '/sqfw/select/srvzhsq_sign_in_select'; // 替换为您的签到查询接口
          const req = {
            colNames: ['*'],
            condition: [
              {
                colName: 'user_no',
                ruleType: 'eq',
                value: this.userInfo.user_no
              },
              {
                colName: 'sign_date',
                ruleType: 'eq',
                value: dateStr
              }
            ],
            serviceName: 'srvzhsq_sign_in_select'
          };
          
          // 使用Promise.race与setTimeout结合控制超时
          const fetchPromise = this.$http.post(url, req);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
          });
          
          Promise.race([fetchPromise, timeoutPromise])
            .then(res => {
              if (res.data && res.data.data && res.data.data.length > 0) {
                resolve(true); // 已签到
              } else {
                resolve(false); // 未签到
              }
            })
            .catch(err => {
              console.error("签到状态查询失败:", err);
              resolve(false);
            });
        });
      },
      
      audit() {
        // 检查用户是否有权限进行审核
        if (!this.userInfo || !this.userInfo.user_no) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }
        
        // 显示加载提示
        uni.showLoading({
          title: '加载中...'
        });
        
        // 无论是否查询成功，3秒后都跳转到审核页面
        setTimeout(() => {
          uni.hideLoading();
          uni.navigateTo({
            url: '../auditAll/auditAllList'
          });
        }, 3000);
        
        // 查询待审核的数据
        const url = this.$api.select + '/sqfw/select/srvsso_process_todo_select';
        const req = {
          colNames: ['*'],
          condition: [
            {
              colName: 'assignee',
              ruleType: 'eq',
              value: this.userInfo.user_no
            }
          ],
          serviceName: 'srvsso_process_todo_select'
        };
        
        // 使用Promise.race与setTimeout结合控制超时
        const fetchPromise = this.$http.post(url, req);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
        });
        
        Promise.race([fetchPromise, timeoutPromise])
          .then(res => {
            uni.hideLoading();
            uni.navigateTo({
              url: '../auditAll/auditAllList'
            });
          })
          .catch(err => {
            uni.hideLoading();
            console.error("获取审核数据失败:", err);
            uni.navigateTo({
              url: '../auditAll/auditAllList'
            });
          });
      },
      
      toLogin() {
        console.log("跳转到登录");
        uni.navigateTo({
          url: '../login/login',
          success: res => {
            uni.clearStorageSync();
          }
        });
      },
      
      /**
       * 点击触发
       * @param {Object} type 跳转页面名或者类型方式
       */
      fnClick(type) {
        if(type == 'modify') {
          uni.navigateTo({
            url: './modify'
          });
        } else if(type === 'modifyInfo') {
          uni.navigateTo({
            url: './modifyInfo?data=' + encodeURIComponent(JSON.stringify(this.userInfo))
          });
        }
      },
      
      logout() {
        uni.clearStorageSync();
        uni.navigateTo({
          url: '/pages/login/login'
        });
      },
      
      // 新增的方法
      editAvatar() {
        uni.chooseImage({
          count: 1,
          success: (res) => {
            // 这里可以添加上传头像的逻辑
            const tempFilePaths = res.tempFilePaths;
            // 实现上传逻辑，成功后更新 userInfo.head_img_path
            this.uploadAvatar(tempFilePaths[0]);
          }
        });
      },
      
      uploadAvatar(filePath) {
        uni.showLoading({
          title: '上传中...'
        });
        
        // 15秒后自动关闭上传提示
        setTimeout(() => {
          uni.hideLoading();
        }, 15000);
        
        // 这里实现头像上传的逻辑
        uni.uploadFile({
          url: this.$api.select + '/file/upload', // 替换为您的文件上传接口
          filePath: filePath,
          name: 'file',
          timeout: 15000, // 设置15秒超时
          success: (uploadRes) => {
            uni.hideLoading();
            try {
              const data = JSON.parse(uploadRes.data);
              if (data.success) {
                // 更新用户头像信息
                this.userInfo.head_img_path = data.fileUrl; // 根据接口返回调整
                // 保存到本地存储
                uni.setStorageSync('userInfo', this.userInfo);
                // 更新服务器上的用户信息
                this.updateUserInfo('head_img_path', this.userInfo.head_img_path);
                
                uni.showToast({
                  title: '头像上传成功'
                });
              } else {
                uni.showToast({
                  title: '上传失败: ' + (data.message || '未知错误'),
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error("解析上传响应失败:", error);
              uni.showToast({
                title: '上传失败，请重试',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error("上传失败:", err);
            uni.showToast({
              title: '上传失败，请检查网络',
              icon: 'none'
            });
          }
        });
      },
      
      viewId() {
        // ID通常不能修改，可以显示提示
        uni.showToast({
          title: 'ID不可修改',
          icon: 'none'
        });
      },
      
      editName() {
        uni.navigateTo({
          url: './editField?field=real_name&value=' + (this.userInfo.real_name || '') + '&title=修改姓名'
        });
      },
      
      editMobile() {
        uni.navigateTo({
          url: './editField?field=mobile&value=' + (this.userInfo.mobile || '') + '&title=修改联系方式'
        });
      },
      
      viewIdCard() {
        // 证件号码通常有特殊处理
        uni.showModal({
          title: '证件号码',
          content: '是否修改您的证件号码？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: './editField?field=id_card&value=' + (this.userInfo.id_card || '') + '&title=修改证件号码'
              });
            }
          }
        });
      },
      
      // 通用的更新用户信息方法
      updateUserInfo(field, value) {
        if (!this.userInfo || !this.userInfo.user_no) {
          uni.showToast({
            title: '用户未登录',
            icon: 'none'
          });
          return Promise.resolve(false);
        }
        
        const url = this.$api.select + '/sqfw/update/srvzhsq_user_update'; // 替换为您的用户信息更新接口
        const req = {
          data: {
            [field]: value
          },
          condition: [{
            colName: 'user_no',
            ruleType: 'eq',
            value: this.userInfo.user_no
          }],
          serviceName: 'srvzhsq_user_update'
        };
        
        // 使用Promise.race与setTimeout结合控制超时
        const fetchPromise = this.$http.post(url, req);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
        });
        
        return Promise.race([fetchPromise, timeoutPromise])
          .then(res => {
            if (res.data.success) {
              uni.showToast({
                title: '更新成功'
              });
              // 更新本地存储
              this.userInfo[field] = value;
              uni.setStorageSync('userInfo', this.userInfo);
              return true;
            } else {
              uni.showToast({
                title: '更新失败: ' + (res.data.message || '未知错误'),
                icon: 'none'
              });
              return false;
            }
          })
          .catch(err => {
            uni.showToast({
              title: '网络错误',
              icon: 'none'
            });
            console.error("更新用户信息失败:", err);
            return false;
          });
      }
    },
    
    // 在组件销毁前清除定时器
    beforeDestroy() {
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
      }
    }
  }
</script>

<style>
  .wrap{
    width: 100%;
    overflow-y: scroll;
    height: 100vh;
  }
  .btn-logout {
    margin-top: 100upx;
    width: 80%;
    border-radius: 50upx;
    font-size: 16px;
    color: #fff;
    background-color: #E51C23;
  }
  .tologin {
    display: flex;
    height: 500upx;
    width: 100%;
    align-items: center;
    justify-content: center;
  }
  .btn-logout-hover {
    background: linear-gradient(to right, #365fdd, #36bbfa);
  }
  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 80vh;
  }
  .loading {
    font-size: 16px;
    color: #999;
    margin-bottom: 20px;
  }
  .retry-btn {
    padding: 10px 20px;
    font-size: 14px;
    color: #fff;
    background-color: #E51C23;
    border-radius: 4px;
  }
</style>
