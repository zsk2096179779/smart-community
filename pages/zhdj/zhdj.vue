<template>
	<view class="content">
		<uni-swiper-dot :info="picUrlList" :current="current" field="content" mode="long" class="aaa" :dotsStyles="dotsStyles">
			<swiper class="swiper-box" @change="change" :autoplay="true" style="height: 470upx;">
				<swiper-item v-for="(item, index) in picUrlList" :key="index">
					<view class="swiper-item"><image :src="item" mode="aspectFill" style="width: 100%;height: 470upx;"></image></view>
				</swiper-item>
			</swiper>
		</uni-swiper-dot>
		<uni-grid v-if="shortcutMenu.length" :options="shortcutMenu" column-num="3" :show-border="false" :highlight="true" @click="onGridItem">
			<template v-slot:default="item">
			    <view>
			      <image :src="item.image" mode="aspectFill" />
			      <text>{{ item.text }}</text>
			    </view>
			  </template>
		</uni-grid>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { uniSwiperDot } from '@dcloudio/uni-ui';
import uniGrid from '@/components/uni-grid/uni-grid.vue';
import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
export default {
	components: { uniSwiperDot, uniGrid },
	data() {
		return {
			picUrlList: [],
			current: 0,
			mode: 'long',
      dotsStyles: {
      	border: 'rgba(255,255,255,.7)',
      	selectedBorder: 'rgba(255,255,255,.5)',
      	backgroundColor: 'rgba(255,255,255,.5)',
      	selectedBackgroundColor: 'rgba(255,255,255,.8)'
      },
			shortcutMenu: [
				// { image: '../../static/img/djhd.png', text: '党建活动' ,'url':'./gggs?serve=srvzhsq_djhdjl_djhd_select'},
				// { image: '../../static/img/gsgg.png', text: '公告公示','url':'./gggs?serve=srvzhsq_gsgg_select' },
				// { image: '../../static/img/jypx.png', text: '党建培训', url: '../djpx/djpx' },
				// { image: '../../static/img/dyfw.png', text: '党员管理','url':'./dygl'},
				// { image: '../../static/img/shzz.png', text: '党组织' ,'url':'./dzz'},
				// { image: '../../static/img/rctd.png', text: '人才天地' ,'url':'./rctd'},
				// { image: '../../static/img/sqlt.png', text: '党建论坛','url':'../djForum/djForum' }
				{ image: '../../static/img/11.png', text: '党建活动' ,'url':'./gggs?serve=srvzhsq_djhdjl_djhd_select'},
				{ image: '../../static/img/22.png', text: '公告公示','url':'./gggs?serve=srvzhsq_gsgg_select' },
				
			]
		};
	},
	computed: mapState(['userName', 'userInfo']),
	methods: {
		// 连接后断后使用下面代码
		// getBannerList() {
		// 	// 获取轮播图路径
		// 	let url = this.$api.select + '/zhdj/select/srvzhsq_djhdjl_djhd_select';
		// 	let req = {};
		// 	req.serviceName = 'srvzhsq_djhdjl_djhd_select';
		// 	req.colNames = ['*'];
		// 	req.condition = [];
		// 	req.order = [];
		// 	req['page'] = {
		// 		pageNo: 1,
		// 		rownumber: 10
		// 	};
		// 	this.$http.post(url, req).then(res => {
		// 		// console.log(res);
		// 		let picUrlList = [];
		// 		res.data.data.map(item => {
		// 			picUrlList.push(item.lbt);
		// 		});
		// 		console.log('picUrlList:', picUrlList);
		// 		picUrlList.map(item => {
		// 			let path = this.$api.select + '/file/download?filePath=';
		// 			let url = this.$api.select + '/file/select/srvfile_attachment_select';
		// 			let req = {
		// 				colNames: ['*'],
		// 				condition: [
		// 					{
		// 						colName: 'file_no',
		// 						ruleType: 'eq',
		// 						value: item
		// 					}
		// 				],
		// 				order: null,
		// 				page: null,
		// 				serviceName: 'srvfile_attachment_select'
		// 			};
		// 			this.$http.post(url, req).then(res => {
		// 				// console.log('res2:', res);
		// 				// res.data.data.map(item => {
		// 				// 	picUrlList.push(path + item.fileurl)
		// 				// })
		// 				this.picUrlList.push(path + res.data.data[0].fileurl);
		// 			});
		// 			console.log('this.picUrlList::', this.picUrlList);
		// 		});
		// 	});
		// },
		getBannerList() {
		  // 模拟接口调用延迟 500ms
		  setTimeout(() => {
		    // 模拟后台返回的轮播图数据，每个对象的 lbt 表示图片文件名
		    const mockData = [
		      { lbt: 'bannertwo.png' },
		      { lbt: 'sszz.png' },
		      { lbt: 'dj.png' }
		    ];
		    let picUrlList = [];
		    // 提取 lbt 字段，即图片文件名
		    mockData.forEach(item => {
		      picUrlList.push(item.lbt);
		    });
		    console.log('模拟的picUrlList:', picUrlList);
		    // 根据模拟数据直接构造完整图片地址
		    // 假设图片存放在 ../../static/img/ 目录下
		    picUrlList.forEach(item => {
		      this.picUrlList.push('../../static/img/' + item);
		    });
		    // 这里可以设定状态，比如将 swperboole 设置为 false 表示用后台数据切换完成
		    // this.swperboole = false;  // 如果你有需要切换的逻辑，可加上
		  }, 500);
		},

		onGridItem(e) {
			console.log(e);
			let url = e.data.url;
			if (url) {
				uni.navigateTo({
					url: url
				});
			}
		},
		change(e) {
			this.current = e.detail.current;
		}
	},
	mounted() {
		console.log("shortcutMenu:", this.shortcutMenu);
		uni.setNavigationBarTitle({
			title: '智慧党建'
		});
	},
	onLoad() {
		this.getBannerList();
	}
};
</script>

<style lang="scss" scoped>
.content {
	background-color: #fff;
	display: flex;
	flex-direction: column;
	height: 100%; /* 确保内容区域占据全屏 */
}
.hello {
	display: flex;
	flex: 1;
	flex-direction: column;
}

.title {
	color: #8f8f94;
	margin-top: 50upx;
}

.ul {
	font-size: 30upx;
	color: #8f8f94;
	margin-top: 50upx;
}

.ul > view {
	line-height: 50upx;
}

swiper-item {
	.swiper-item {
		position: relative;
		height: 100%;
		image {
			height: 100%;
			width: 100%;
		}
		text {
			position: absolute;
			background: rgba(0, 0, 0, 0.6);
			color: #fff;
			bottom: 0;
			z-index: 99;
			left: 0;
			height: 1.2rem;
			line-height: 1.2rem;
		}
	}
}

uni-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 20px;
    padding: 10px;
}

.uni-grid-item {
    width: 30% !important;
    min-height: 120rpx; /* 强制高度 */
}
.uni-grid-item image {
    width: 80rpx;
    height: 80rpx;
}
</style>
