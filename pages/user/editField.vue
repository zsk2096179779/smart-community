<template>
  <view class="edit-field">
    <cmd-nav-bar :title="title" back></cmd-nav-bar>
    <view class="form-item">
      <input class="input" v-model="fieldValue" :placeholder="'请输入' + title" />
    </view>
    <button class="btn-save" @click="saveField">保存</button>
  </view>
</template>

<script>
import cmdNavBar from "@/components/cmd-nav-bar/cmd-nav-bar.vue";

export default {
  components: {
    cmdNavBar
  },
  data() {
    return {
      field: '',
      fieldValue: '',
      title: '',
      userInfo: null
    };
  },
  onLoad(option) {
    this.field = option.field || '';
    this.fieldValue = option.value || '';
    this.title = option.title || '编辑信息';
    this.userInfo = uni.getStorageSync('userInfo');
  },
  methods: {
    saveField() {
      if (!this.fieldValue) {
        uni.showToast({
          title: '请输入内容',
          icon: 'none'
        });
        return;
      }
      
      if (!this.userInfo || !this.userInfo.user_no) {
        uni.showToast({
          title: '用户信息不存在',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '保存中...'
      });
      
      const url = this.$api.select + '/sqfw/update/srvzhsq_user_update';
      const req = {
        data: {
          [this.field]: this.fieldValue
        },
        condition: [{
          colName: 'user_no',
          ruleType: 'eq',
          value: this.userInfo.user_no
        }],
        serviceName: 'srvzhsq_user_update'
      };
      
      this.$http.post(url, req).then(res => {
        uni.hideLoading();
        if (res.data && res.data.success) {
          // 更新本地用户信息
          this.userInfo[this.field] = this.fieldValue;
          uni.setStorageSync('userInfo', this.userInfo);
          
          uni.showToast({
            title: '保存成功'
          });
          
          // 返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        console.error("保存失败:", err);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      });
    }
  }
};
</script>

<style>
.edit-field {
  padding: 20px;
}
.form-item {
  margin-top: 30px;
  padding: 15px;
  background-color: #fff;
  border-radius: 5px;
}
.input {
  height: 40px;
  width: 100%;
}
.btn-save {
  margin-top: 50px;
  background-color: #E51C23;
  color: #fff;
  border-radius: 50px;
}
</style>
