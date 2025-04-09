<template>
  <view class="wrap">
    <!-- loading -->
    <Loading v-if="loading" @tap="newtab"></Loading>

    <!-- 主体内容 -->
    <view v-else>
      <!-- 轮播图 -->
      <view class="bannerlun">
        <bw-swiper :swiperList="swperboole ? swiperList : swiperLists" style="width:100%;"></bw-swiper>
      </view>

      <!-- 菜单 -->
      <view>
        <uni-grid :column="4" :showBorder="showBorder">
          <uni-grid-item v-for="(item, index) in menuData" :key="item.menu_no" :url="item.app_temp_col_map || ''" :treeData="item">
            <text class="text">{{ item.label }}</text>
          </uni-grid-item>
        </uni-grid>
      </view>

      <!-- 插图 -->
      <view class="banner" :style="{ backgroundImage: 'url(' + imageURL + ')' }"></view>

      <!-- 活动 -->
      <view v-if="xqpage.length > 0">
        <text class="titleall">热门活动</text>
        <view class="contenthot">
          <view class="hot" v-for="(item, index) in xqpage" :key="item.id || index" v-if="item.proc_status=='完成'">
            <view class="phopos" @tap="detaile(item)" :style="{ backgroundImage: 'url(' + item.slt + ')' }"></view>
            <view class="textline">{{ item.hdbt }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 登录按钮 -->
    <view v-if="!userInfo" @click="redirectToLogin">
      <button class="login-btn">点击跳转到登录</button>
    </view>

    <uni-loading color="#888" />
  </view>
</template>

<script>
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
import bwSwiper from '@/components/kp-swper/bw-swiper.vue';
import uniLoading from '@/components/sqfwl-loading-more/loading.vue';

export default {
  components: { uniGrid, uniGridItem, bwSwiper, uniLoading },
  data() {
    return {
      userInfo: null, // 用户信息
      menuData: [],
      showBorder: false,
      swiperList: [{ img: '../../static/img/dj.png' }, { img: '../../static/img/dj.png' }, { img: '../../static/img/dj.png' }],
      swperboole: true,
      swiperLists: [],
      phoarr: [],
      xqpage: [], // 正确初始化为空数组
      imageURL: '../../static/img/bannertwo.png',
      loading: true, // 使用 loading 状态代替 successNum
      status: 0
    };
  },
  methods: {
    async getMenusList() {
         try {
            const url = `${this.$api.select}/auth/select/srvauth_app_menu_select`;
            const req = {
              serviceName: 'srvauth_app_menu_select',
              colNames: ['*'],
              condition: [
                { colName: "apps", ruleType: "in", value: "zhdj,sqfw" },
                { colName: "client_type", ruleType: "eq", value: "APP" },
                { colName: "is_view", ruleType: "eq", value: "是" }
              ],
              order: [{ colName: "seq", orderType: "asc" }]
            };
      
            const res = await this.$http.post(url, req);
      
            if (res.data.data) {
              let menuData = res.data.data;
              let parents = [], children = [];
      
              // 处理菜单数据
              for (const menu of menuData) {
                menu.children = [];
                menu.label = menu.menu_name;
                menu.value = menu.menu_no;
                
                if (menu.client_type?.includes('APP')) {
                  // 使用 try-catch 处理图片加载
                  try {
                    if (menu.app_icon) {
                      const iconPath = await this.getImagePath(menu.app_icon);
                      menu.menu_icon_path = iconPath;
                    } else {
                      // 如果没有图标，设置一个默认图标
                      menu.menu_icon_path = '/static/images/default-icon.png';
                    }
                  } catch (iconError) {
                    console.log('图标加载失败:', iconError);
                    // 设置默认图标
                    menu.menu_icon_path = '/static/images/default-icon.png';
                  }
                  
                  // 根据是否有父菜单分类
                  if (menu.parent_no) {
                    children.push(menu);
                  } else {
                    parents.push(menu);
                  }
                }
              }
      
              // 建立子菜单之间的关系
              children.forEach(item1 => {
                children.forEach(item2 => {
                  if (item1.parent_no === item2.menu_no) {
                    item2.children.push(item1);
                  }
                });
              });
      
              // 建立父菜单与子菜单的关系
              parents.forEach(parent => {
                children.forEach(child => {
                  if (child.parent_no === parent.menu_no) {
                    parent.children.push(child);
                  }
                });
              });
      
              // 更新菜单数据
              this.menuData = parents;
            }
          } catch (error) {
            console.log('菜单加载失败:', error);
            uni.showToast({
              title: '菜单加载失败，请稍后重试',
              icon: 'none'
            });
          } finally {
            this.loading = false; // 确保结束加载
          }
        },
    // 跳转到登录页面
    redirectToLogin() {
      uni.navigateTo({
        url: '/pages/login/login' // 假设登录页面路径是 `/pages/login/login`
      });
    },

    // 打开新页面
    newtab() {
      uni.switchTab({ url: './smartcity' });
    },

    // 获取轮播图
    getBannerList() {
      const url = `${this.$api.select}/sqfw/select/srvzhsq_banner_app_select`;
      const req = { serviceName: 'srvzhsq_banner_app_select', colNames: ['*'] };
      
      this.$http.post(url, req).then(res => {
        const path = `${this.$api.select}/file/download?filePath=`;
        if (Array.isArray(res.data.data)) {
          // 使用并行请求来提高性能
          Promise.all(res.data.data.map(item => this.getImagePath(item.banner_img).then(file => {
            if (file) {
              this.swiperLists.push({ img: file });
            }
          })))
          .then(() => {
            this.swperboole = false;
          });
        }
      }).catch(error => {
        uni.showToast({
          title: '轮播图加载失败，请稍后重试',
          icon: 'none'
        });
      });
    },

    // 获取活动列表
    hotlist(serve) {
      const url = `${this.$api.select}/zhdj/select/${serve}`;
      const req = { serviceName: serve, colNames: ['*'], condition: [], order: [], page: { pageNo: 1, rownumber: 20 } };
      
      this.$http.post(url, req).then(res => {
        const path = `${this.$api.select}/file/download?filePath=`;
        if (Array.isArray(res.data.data)) {
          res.data.data.forEach((item, i) => {
            if (item.slt) {
              const imgReq = {
                serviceName: 'srvfile_attachment_select',
                colNames: ['*'],
                condition: [{ colName: 'file_no', ruleType: 'eq', value: item.slt }]
              };
              this.$http.post(`${this.$api.select}/file/select/srvfile_attachment_select`, imgReq).then(resImg => {
                item.slt = resImg.data?.data?.[0]?.fileurl ? path + resImg.data.data[0].fileurl : this.imageURL;
              });
            } else {
              item.slt = this.imageURL;
            }
          });
          this.xqpage = res.data.data;
        }
      }).catch(error => {
        uni.showToast({
          title: '活动加载失败，请稍后重试',
          icon: 'none'
        });
      });
    },

    // 获取图片路径
    async getImagePath(imgId) {
      if (!imgId) return '';
      const url = `${this.$api.select}/file/select/srvfile_attachment_select`;
      const req = { serviceName: 'srvfile_attachment_select', colNames: ['*'], condition: [{ colName: 'file_no', ruleType: 'eq', value: imgId }] };
      const res = await this.$http.post(url, req);
      if (res.data.data?.length) return `${this.$api.select}/file/download?filePath=${res.data.data[0].fileurl}`;
      return '';
    }
  },

  onLoad() {
    this.userInfo = uni.getStorageSync('userInfo');
    if (!this.userInfo) {
      this.redirectToLogin(); // 如果没有用户信息，直接跳转到登录页面
    }
    this.getMenusList();
    this.getBannerList();
    this.hotlist('srvzhsq_djhdjl_djhd_select');
  },

  onShow() {
    // 只请求动态数据
    this.hotlist('srvzhsq_djhdjl_djhd_select');
  }
};
</script>

<style lang="scss">
.wrap {
  width: 100%;
  background: #ffffff;
  .text {
    line-height: 60upx;
  }
}
.banner {
  height: 10vh;
  width: calc(100% - 60upx);
  background-size: cover;
  margin: 0 30upx 10px 30upx;
  border-radius: 5px;
}
.titleall {
  font-size: 15px;
  font-weight: 600;
  border-left: 2px solid red;
  padding-left: 8px;
  margin-left: 30upx;
}
.phopos {
  height: 160upx;
  width: 210upx;
  background-size: cover;
  border-radius: 8px;
}
.hot {
  width: 210upx;
  margin-right: 20upx;
}
.contenthot {
  margin-top: 15upx;
  display: flex;
  margin-left: 30upx;
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
}
.textline {
  margin-top: 5px;
  line-height: 18px;
  font-size: 13px;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bannerlun {
  height: 25vh !important;
  overflow: hidden;
}
</style>
