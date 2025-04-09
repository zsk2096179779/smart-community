<template>
  <view class="content">
    <view class="title">注册账号</view>
    <view class="form">
      <!-- 账号输入 -->
      <view class="input-row">
        <m-input class="m-input" type="text" clearable v-model="regInfo.user_no" placeholder="请输入账号（至少5个字符）"></m-input>
      </view>
      
      <!-- 密码输入 -->
      <view class="input-row">
        <m-input type="password" displayable v-model="regInfo.pwd" placeholder="请输入密码（6-16个字符）"></m-input>
      </view>
      
      <!-- 确认密码 -->
      <view class="input-row">
        <m-input type="password" displayable v-model="regInfo.confirmPwd" placeholder="请确认密码"></m-input>
      </view>
      
      <!-- 手机号 -->
      <view class="input-row">
        <m-input class="m-input" type="number" clearable v-model="regInfo.mobile" placeholder="请输入手机号"></m-input>
      </view>
      
      <!-- 邮箱（可选） -->
      <view class="input-row">
        <m-input class="m-input" type="text" clearable v-model="regInfo.email" placeholder="请输入邮箱（可选）"></m-input>
      </view>
      
      <!-- 身份证（可选） -->
      <view class="input-row">
        <m-input class="m-input" type="text" clearable v-model="regInfo.id_card" placeholder="请输入身份证号（可选）"></m-input>
      </view>
      
      <!-- 注册按钮 -->
      <button type="primary" class="primary" @tap="register">注册</button>
      
      <!-- 返回登录链接 -->
      <view class="login-link">
        <text>已有账号？</text>
        <text @tap="toLoginPage">返回登录</text>
      </view>
      
      <!-- 开发测试按钮 - 上线前可以移除 -->
      <button type="default" class="test-login" @tap="testDirectLogin">测试账号直接登录</button>
    </view>
  </view>
</template>

<script>
import mInput from '../../components/m-input.vue';

export default {
  components: {
    mInput
  },
  data() {
    return {
      regInfo: {
        user_no: '',     // 账号
        pwd: '',         // 密码
        confirmPwd: '',  // 确认密码
        mobile: '',      // 手机号
        email: '',       // 邮箱
        id_card: '',     // 身份证
        // 其他必要字段...
      },
      formRules: {
        user_no: {
          pattern: /^[0-9a-zA-Z_]{5,}$/,
          message: '账号最短为5个字符'
        },
        pwd: {
          pattern: /^[\w_-]{6,16}$/,
          message: '密码最短为6个字符'
        },
        mobile: {
          pattern: /^1[3456789]\d{9}$/,
          message: '手机号格式有误'
        },
        email: {
          pattern: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
          message: '邮箱格式有误'
        },
        id_card: {
          pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
          message: '身份证格式有误'
        }
      }
    }
  },
  methods: {
    validateForm() {
      console.log('开始验证表单');
      
      // 定义必填字段
      const requiredFields = ['user_no', 'pwd', 'mobile'];
      
      // 检查必填字段
      for (const field of requiredFields) {
        if (!this.regInfo[field]) {
          uni.showToast({
            icon: 'none',
            title: `请填写${this.getFieldName(field)}`
          });
          console.log(`必填字段 ${field} 未填写`);
          return false;
        }
      }
      
      // 确认密码检查
      if (this.regInfo.pwd !== this.regInfo.confirmPwd) {
        uni.showToast({
          icon: 'none',
          title: '两次输入的密码不一致'
        });
        console.log('密码不一致');
        return false;
      }
      
      // 校验已填写字段的格式
      for (const [field, rule] of Object.entries(this.formRules)) {
        if (this.regInfo[field] && !rule.pattern.test(this.regInfo[field])) {
          uni.showToast({
            icon: 'none',
            title: rule.message
          });
          console.log(`字段 ${field} 格式验证失败`);
          return false;
        }
      }
      
      console.log('表单验证通过');
      return true;
    },
    
    // 辅助方法：获取字段的用户友好名称
    getFieldName(field) {
      const fieldNames = {
        'user_no': '账号',
        'pwd': '密码',
        'confirmPwd': '确认密码',
        'mobile': '手机号',
        'email': '邮箱',
        'id_card': '身份证号'
      };
      return fieldNames[field] || field;
    },
    
    async register() {
      console.log('开始注册流程', JSON.stringify(this.regInfo));
      
      if (!this.validateForm()) {
        console.log('表单验证失败');
        return;
      }
      
      console.log('表单验证通过，准备发送请求');
      console.log('注册 API 端点:', this.$api.select + '/sqfw/operate/srvsqfw_register');
      
      // 添加加载提示
      uni.showLoading({
        title: '注册中...'
      });
      
      try {
        // 创建一个不包含confirmPwd的数据对象
        const registerData = Object.assign({}, this.regInfo);
        delete registerData.confirmPwd;
        
        // 打印请求数据
        const requestPayload = [{
          data: [registerData],
          serviceName: 'srvsqfw_register'
        }];
        console.log('注册请求数据:', JSON.stringify(requestPayload));
        
        // 检查网络状态
        const networkStatus = await new Promise(resolve => {
          uni.getNetworkType({
            success: res => resolve(res.networkType),
            fail: () => resolve(null)
          });
        });
        
        console.log('当前网络状态:', networkStatus);
        if (!networkStatus || networkStatus === 'none') {
          throw new Error('网络连接不可用');
        }
        
        // 使用直接的 uni.request 发送请求
        uni.request({
          url: this.$api.select + '/sqfw/operate/srvsqfw_register',
          method: 'POST',
          data: requestPayload,
          header: {
            'content-type': 'application/json'
          },
          timeout: 30000, // 30秒超时
          success: (res) => {
            uni.hideLoading();
            console.log('注册请求响应:', JSON.stringify(res));
            
            if (res.statusCode === 200 && res.data.resultCode === 'SUCCESS') {
              uni.showModal({
                title: '提示',
                content: '注册成功，即将跳转到登录页面',
                showCancel: false,
                success: () => {
                  uni.navigateBack({
                    fail: () => {
                      uni.redirectTo({
                        url: '../login/login',
                        fail: () => uni.reLaunch({ url: '../login/login' })
                      });
                    }
                  });
                }
              });
            } else {
              console.log('注册失败，服务器返回:', res.data);
              uni.showToast({
                title: (res.data && res.data.resultMessage) || '注册失败，请重试',
                icon: 'none',
                duration: 3000
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('注册请求失败:', err);
            
            let errorMsg = '注册请求失败，请重试';
            if (err.errMsg) {
              if (err.errMsg.includes('timeout')) {
                errorMsg = '服务器响应超时，请联系管理员或稍后再试';
              } else if (err.errMsg.includes('fail')) {
                errorMsg = '连接服务器失败，请检查网络';
              }
            }
            
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000
            });
          }
        });
      } catch (error) {
        uni.hideLoading();
        console.error('注册过程发生异常:', error);
        uni.showToast({
          title: error.message || '注册过程出错，请重试',
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    toLoginPage() {
      console.log('返回登录页面');
      uni.navigateBack({
        fail: () => {
          console.log('返回失败，尝试跳转到登录页');
          uni.redirectTo({
            url: '../login/login'
          });
        }
      });
    },
    
    // 临时测试功能 - 绕过注册直接跳转到登录页面
    testDirectLogin() {
      console.log('尝试使用测试账号直接登录');
      uni.navigateTo({
        url: '../login/login?testAccount=true'
      });
    }
  },
  onLoad() {
    console.log('注册页面加载完成');
    
    // 检查网络状态
    uni.getNetworkType({
      success: function(res) {
        console.log('当前网络类型:', res.networkType);
      }
    });
    
    // 测试服务器连通性
    uni.request({
      url: this.$api.select, // 使用基础 URL 测试
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log('基础 API 连接成功:', res.statusCode);
      },
      fail: (err) => {
        console.error('基础 API 连接失败:', err);
      }
    });
  }
}
</script>

<style>
.content {
  padding: 40rpx;
}
.title {
  text-align: center;
  font-size: 36rpx;
  margin-bottom: 60rpx;
  margin-top: 60rpx;
  font-weight: bold;
}
.form {
  padding: 0 20rpx;
}
.input-row {
  margin: 40rpx 0;
}
.primary {
  margin: 80rpx 0 40rpx 0;
  border-radius: 50rpx;
  background-color: #007AFF;
}
.login-link {
  text-align: center;
  margin-top: 30rpx;
}
.login-link text:last-child {
  color: #007AFF;
  margin-left: 10rpx;
}
.test-login {
  margin-top: 40rpx;
  background-color: #f0f0f0;
  color: #666;
  font-size: 28rpx;
}
</style>
