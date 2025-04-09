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
      <!-- <view class="banner" :style="{ backgroundImage: 'url(' + imageURL + ')' }"></view> -->
	  <view class="banner">
	    <image 
	      src="../../static/img/bannertwo.png" 
	      mode="widthFix" 
	      style="width:100%;"
	    />
	  </view>
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
		//连接后端后运行如下代码
        // const url = `${this.$api.select}/auth/select/srvauth_app_menu_select`;
        // const req = {
        //   serviceName: 'srvauth_app_menu_select',
        //   colNames: ['*'],
        //   condition: [
        //     { colName: "apps", ruleType: "in", value: "zhdj,sqfw" },
        //     { colName: "client_type", ruleType: "eq", value: "APP" },
        //     { colName: "is_view", ruleType: "eq", value: "是" }
        //   ],
        //   order: [{ colName: "seq", orderType: "asc" }]
        // };

        // const res = await this.$http.post(url, req);

        // if (res.data.data) {
        //   let menuData = res.data.data;
        //   let parents = [], children = [];

        //   menuData.forEach(menu => {
        //     menu.children = [];
        //     menu.label = menu.menu_name;
        //     menu.value = menu.menu_no;
        //     if (menu.client_type?.includes('APP')) {
        //       this.getImagePath(menu.app_icon).then(res => {
        //         menu.menu_icon_path = res;
        //       });
        //       if (menu.parent_no) children.push(menu);
        //       else parents.push(menu);
        //     }
        //   });

        //   children.forEach(item1 => {
        //     children.forEach(item2 => {
        //       if (item1.parent_no === item2.menu_no) item2.children.push(item1);
        //     });
        //   });
        //   parents.forEach(parent => {
        //     children.forEach(child => {
        //       if (child.parent_no === parent.menu_no) parent.children.push(child);
        //     });
        //   });

        //   this.menuData = parents;
        // }	
		
		// 暂时进行数据模拟，后端设计好后沿用以上代码
		// 模拟异步请求：500ms 后返回模拟数据
		    setTimeout(() => {
		      // 模拟后台返回的菜单数据
		      const mockMenus = [
		          {
		            menu_no: '001',
		            menu_name: '党建',
		            client_type: 'APP',
		            app_icon: 'zh',
		            parent_no: '',
		            app_dest_page: '/pages/zhdj/zhdj' // 添加跳转地址
		          },
		          {
		            menu_no: '002',
		            menu_name: '培训',
		            client_type: 'APP',
		            app_icon: 'zhdj0',
		            parent_no: '',
		            app_dest_page: '/pages/djpx/djpx' // 添加跳转地址
		          },
		          {
		            menu_no: '003',
		            menu_name: '论坛',
		            client_type: 'APP',
		            app_icon: 'zhdj1',
		            parent_no: '',
		            app_dest_page: '/pages/forum/forum' // 添加跳转地址
		          }
		        ];
		
		      let menuData = mockMenus;
		      let parents = [], children = [];
		
		      menuData.forEach(menu => {
		        menu.children = [];
		        menu.label = menu.menu_name;
		        menu.value = menu.menu_no;
		        if (menu.client_type.includes('APP')) {
		          // 这里直接模拟返回图标路径（直接使用本地图片路径）
		          menu.menu_icon_path = "../../static/img/appicon/" + menu.app_icon + ".png";
		          if (menu.parent_no) children.push(menu);
		          else parents.push(menu);
		        }
		      });
		
		      // 如果有父子关系（本例中均为顶级菜单），做简单合并
		      children.forEach(item1 => {
		        children.forEach(item2 => {
		          if (item1.parent_no === item2.menu_no) item2.children.push(item1);
		        });
		      });
		      parents.forEach(parent => {
		        children.forEach(child => {
		          if (child.parent_no === parent.menu_no) parent.children.push(child);
		        });
		      });
		
		      this.menuData = parents;
		      this.loading = false; // 数据加载完毕后，设置 loading 为 false
		    }, 500);
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
	
	 detaile(item) {
	      uni.navigateTo({
	        url: '../normal/detail/detail?query=' + encodeURIComponent(JSON.stringify(item))
	      });
	    },

    // 获取活动列表
    hotlist(serve) {
      // const url = `${this.$api.select}/zhdj/select/${serve}`;
      // const req = { serviceName: serve, colNames: ['*'], condition: [], order: [], page: { pageNo: 1, rownumber: 20 } };
      
      // this.$http.post(url, req).then(res => {
      //   const path = `${this.$api.select}/file/download?filePath=`;
      //   if (Array.isArray(res.data.data)) {
      //     res.data.data.forEach((item, i) => {
      //       if (item.slt) {
      //         const imgReq = {
      //           serviceName: 'srvfile_attachment_select',
      //           colNames: ['*'],
      //           condition: [{ colName: 'file_no', ruleType: 'eq', value: item.slt }]
      //         };
      //         this.$http.post(`${this.$api.select}/file/select/srvfile_attachment_select`, imgReq).then(resImg => {
      //           item.slt = resImg.data?.data?.[0]?.fileurl ? path + resImg.data.data[0].fileurl : this.imageURL;
      //         });
      //       } else {
      //         item.slt = this.imageURL;
      //       }
      //     });
      //     this.xqpage = res.data.data;
      //   }
      // }).catch(error => {
      //   uni.showToast({
      //     title: '活动加载失败，请稍后重试',
      //     icon: 'none'
      //   });
      // });
	  // 模拟接口调用延迟 500ms
	    setTimeout(() => {
	      // 模拟返回的活动数据，每个活动包含 slt（图片）、hdbt（活动标题）、proc_status 和 create_time
	      const mockActivities = [
	        { id: 'a001', slt: '../../static/img/hdsss.png', hdbt: '活动一', proc_status: '完成', create_time: '2025-04-01 12:00:00' },
	        { id: 'a002', slt: '../../static/img/hdsss.png', hdbt: '活动二', proc_status: '完成', create_time: '2025-04-02 14:30:00' },
	        { id: 'a003', slt: '../../static/img/hdsss.png', hdbt: '活动三', proc_status: '未完成', create_time: '2025-04-03 10:00:00' }
	      ];
	      // 只保留状态为 "完成" 的活动进行展示
	      this.xqpage = mockActivities.filter(item => item.proc_status === '完成');
	    }, 500);
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
