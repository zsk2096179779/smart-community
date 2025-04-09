<template>
  <view class="modify-wrap">
    <view class="cu-form-group margin-top">
      <view class="title">昵称</view>
      <input placeholder="请输入昵称" name="input" v-model="formData.nick_name" />
    </view>
    <view class="cu-form-group margin-top">
      <view class="title">姓名</view>
      <input placeholder="请输入姓名" name="input" v-model="formData.real_name" />
    </view>
    <view class="cu-form-group margin-top">
      <view class="title">年龄</view>
      <input placeholder="请输入年龄" name="input" type="number" v-model="formData.age" />
    </view>
    <view class="cu-form-group">
      <view class="title">电话</view>
      <input placeholder="请输入手机号码" name="input" type="number" v-model="formData.mobile" />
      <view class="cu-capsule radius">
        <view class="cu-tag bg-blue ">+86</view>
        <view class="cu-tag line-blue">中国大陆</view>
      </view>
    </view>
    <view class="cu-form-group margin-top">
      <view class="title">邮箱</view>
      <input placeholder="请输入邮箱" name="input" v-model="formData.email" />
    </view>
    <view class="cu-form-group margin-top">
      <view class="title">地址</view>
      <input placeholder="请输入地址" name="input" v-model="formData.detail_address" />
      <text class="cuIcon-locationfill text-orange"></text>
    </view>
    <view class="cu-form-group margin-top">
      <view class="title">社区</view>
      <picker @change="PickerChange" :value="sqindex" :range="picker">
        <view class="picker">{{ sqindex > -1 ? picker[sqindex] : '请选择所在社区' }}</view>
      </picker>
    </view>
    <view class="padding flex flex-direction"><button class="cu-btn bg-red margin-tb-sm lg" @click="submitFormData()">提交</button></view>
  </view>
</template>

<script>
export default {
  name: 'ModifyInfo',
  data() {
    return {
      sqindex: -1, //社区下标
      picker: [],
      formData: {},
      sqData: [],
      user_no:'',
      queryData:{}
    };
  },
  methods: {
    PickerChange(e) {
      let i = e.detail.value;
      this.sqindex = i;
      let sqname = this.picker[i];
      this.sqData.map(item => {
        if (item.sqname === sqname) {
          this.formData.address = item.sqno;
        }
      });
      // this.regInfo.address = this.sqList[i].sqno;
    },
    getSqList() {
       // 使用测试数据
          this.sqData = [
            {
              sqno: "1",
              sqname: "幸福社区"
            },
            {
              sqno: "2",
              sqname: "阳光社区"
            },
            {
              sqno: "3",
              sqname: "和谐社区"
            },
            {
              sqno: "4",
              sqname: "平安社区"
            },
            {
              sqno: "5",
              sqname: "文明社区"
            }
          ];
          
          this.picker = this.sqData.map(item => item.sqname);
          
          // 如果已有选中的社区，设置对应的index
          if (this.formData.address) {
            this.sqindex = this.sqData.findIndex(item => item.sqno === this.formData.address);
          }
    },
 submitFormData() {
   // ... 验证代码保持不变 ...
   
   // 模拟成功提交
   uni.showLoading({
     title: '提交中...'
   });
   
   // 打印将要提交的数据（仅用于调试）
   console.log('模拟提交数据:', this.formData);
   
   // 模拟网络延迟
   setTimeout(() => {
     uni.hideLoading();
     uni.showToast({
       title: '修改成功',
       icon: 'success'
     });
     
     setTimeout(() => {
       uni.switchTab({
         url: './info'
       });
     }, 1500);
   }, 2000);
 }
  },
  onLoad(option) {
    if (option.data) {
      this.formData = JSON.parse(decodeURIComponent(option.data));
      for(let i in this.formData){
        if(!this.formData[i]){
          this.formData[i] = ''
        }
      }
    }
  },
  created() {
    this.getSqList();
  }
};
</script>

<style lang="scss">
.modify-wrap {
  width: 100%;
}
</style>
