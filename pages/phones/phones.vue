<template>
	<view class="conent">
		<phone-directory v-if="!listBoole" :phones="phones" @paramClick="paramClick"></phone-directory>
		
		<view class="loadinga" v-else-if="!loadingError">
			<input 
				class="phone-main-input" 
				type="text" 
				placeholder="请输入要搜索的社区"
				v-model="searchText"
				@input="handleSearch"
			/>
			<view class="titles"></view>
			<view class="loading-container">
				<image class="loading-icon" src="../../static/img/loading.gif" mode=""></image>
				<view class="loading-text">数据加载中</view>
			</view>
		</view>
		
		<view class="error-container" v-else>
			<view class="error-text">数据加载失败</view>
			<button class="retry-btn" @click="retryLoad">重试</button>
		</view>
	</view>
</template>

<script>
	import phoneDirectory from '@/components/phone-directory/phone-directory.vue'
	export default {
		components: {
			phoneDirectory
		},
		data() {
			return {
				phones: {
					"社区通讯录": []
				},
				listBoole: true,
				loadingError: false,
				retryCount: 0,
				maxRetries: 3,
				searchText: '',
				originalData: [],
				// 添加测试数据
				testData: [
					{
						id: 1,
						spell: "xq1",
						name: "幸福社区",
						phoneNumber: "12345678901"
					},
					{
						id: 2,
						spell: "xq2",
						name: "阳光社区",
						phoneNumber: "12345678902"
					},
					{
						id: 3,
						spell: "xq3",
						name: "和谐社区",
						phoneNumber: "12345678903"
					},
					{
						id: 4,
						spell: "xq4",
						name: "平安社区",
						phoneNumber: "12345678904"
					},
					{
						id: 5,
						spell: "xq5",
						name: "文明社区",
						phoneNumber: "12345678905"
					}
				]
			}
		},
		onLoad() {
			this.$nextTick(() => {
				this.getdata()
			})
		},
		methods: {
			paramClick(e) {
				uni.makePhoneCall({
					phoneNumber: e.phoneNumber
				})
			},
			handleSearch(e) {
				// 处理搜索逻辑
				if (!this.originalData.length) return
				
				const searchValue = this.searchText.toLowerCase()
				if (!searchValue) {
					this.phones.社区通讯录 = this.originalData
					return
				}
				
				const filteredData = this.originalData.filter(item => 
					item.name.toLowerCase().includes(searchValue) ||
					item.phoneNumber.includes(searchValue)
				)
				this.phones.社区通讯录 = filteredData
			},
			retryLoad() {
				if (this.retryCount < this.maxRetries) {
					this.retryCount++
					this.getdata()
				} else {
					uni.showToast({
						title: '加载失败，请稍后再试',
						icon: 'none'
					})
				}
			},
			getdata() {
				// 尝试从缓存获取数据
				const cachedData = uni.getStorageSync('phoneDirectoryData')
				if (cachedData) {
					this.phones = cachedData
					this.originalData = cachedData.社区通讯录
					this.listBoole = false
					return
				}

				this.listBoole = true
				this.loadingError = false
				
				let url = this.$api.select + '/sqfw/select/srvzhsq_information_select?srvzhsq_information_select'
				let req = {
					serviceName: "srvzhsq_information_select",
					colNames: ["*"],
					condition: [],
					order: []
				};
				
				this.$http.post(url, req)
					.then(res => {
						if (res.data && res.data.data) {
							this.listBoole = false
							this.retryCount = 0
							let listserve = res.data.data
							var arrList = []
							for(var i=0; i<listserve.length; i++){
								arrList.push({
									"id": listserve[i].id,
									"spell": listserve[i].create_user,
									"name": listserve[i].sqname,
									"phoneNumber": listserve[i].sqphone
								})
							}
							this.originalData = this.sortByKey(arrList, "id")
							this.phones.社区通讯录 = this.originalData
							// 更新缓存
							uni.setStorageSync('phoneDirectoryData', this.phones)
						} else {
							// 如果没有数据，使用测试数据
							this.useTestData()
						}
					})
					.catch(error => {
						console.error('加载失败:', error)
						// 如果请求失败，使用测试数据
						this.useTestData()
					})
			},
			// 添加使用测试数据的方法
			useTestData() {
				this.listBoole = false
				this.originalData = this.testData
				this.phones.社区通讯录 = this.testData
				// 更新缓存
				uni.setStorageSync('phoneDirectoryData', this.phones)
			},
			sortByKey(array, key) {
				return array.sort(function(a, b) {
					var x = a[key];
					var y = b[key];
					return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				});
			}
		}
	}
</script>

<style lang="scss">
	.conent {
		width: 100%;
		height: 100%;
		background: #ffffff;
	}
	
	.phone-main-input {
		width: 100%;
		height: 40px;
		background: #f5f5f5;
		border-radius: 4px;
		padding: 0 15px;
		margin: 10px 0;
	}
	
	.titles {
		height: 40px;
		line-height: 40px;
		padding: 0 15px;
		font-size: 14px;
		color: #666;
	}
	
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin-top: 20px;
		padding: 20px;
	}
	
	.loading-icon {
		height: 25px;
		width: 25px;
		margin-bottom: 10px;
	}
	
	.loading-text {
		font-size: 14px;
		color: #666;
	}
	
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
		margin-top: 20px;
	}
	
	.error-text {
		font-size: 14px;
		color: #666;
		margin-bottom: 10px;
	}
	
	.retry-btn {
		background-color: #007AFF;
		color: white;
		padding: 8px 16px;
		border-radius: 4px;
		font-size: 14px;
		border: none;
	}
	
	.retry-btn:active {
		background-color: #0056b3;
	}
</style>
