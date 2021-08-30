var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
Page({
	data: {},
	onLoad: function(options) {
		var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
		wx.showLoading({
         title: '拼命加载中',
         mask:true,
        })
		let wx_ticket = wx.getStorageSync('ticket');

		if (wx_ticket) {
			if (this.data.product != '') {
				publicFun.setUrl('')
			}
			that.getCompanyData();
			console.log(1111111111111111)
		} else {
			console.log(222222222222222);
			try {
				//app.getUserInfo(function(userInfo) {})
				var ticket = setInterval(function() {
					wx_ticket = wx.getStorageSync('ticket');
					if (wx_ticket == '') {
						// wx.hideLoading();
						app.getUserInfo(function(userInfo) {})
					} else {
						let url = '';
						try {
							let urlSet = wx.getStorageSync('url')
							if (urlSet) {
								url = urlSet;
							}
						} catch (e) {}
						publicFun.setUrl('');
						if (url == '' || url == undefined) {
							that.getCompanyData();
							publicFun.setUrl('');
						} else {
							wx.redirectTo({ url: url })
						}
						clearInterval(ticket)
					}
				}, 1000)
			} catch (e) {

			}
		}

		publicFun.height(that); //设置页面高度

	},
	getCompanyData: function() {
		var that=this;
		wx.getLocation({
		  type: 'wgs84',
		  success: function (res) {
		  	console.log('success')
			wx.setNavigationBarTitle({
			  title: '定位中...'
			 })
			// var latitude = res.latitude
			// var longitude = res.longitude
			// var speed = res.speed
			// var accuracy = res.accuracy
			wx.setStorageSync('latitude', res.latitude);
			wx.setStorageSync('longitude', res.longitude);
			var location = {
			"location": wx.getStorageSync("latitude") + "," + wx.getStorageSync("longitude")
			};
			common.post('app.php?c=lbs&a=substore_index', location,"setCompanyData",that);
		  },
		  fail:function(){
		  	console.log('fail')
			 wx.setNavigationBarTitle({
			  title: '门店列表'
			})
			 var location = {};
			common.post('app.php?c=lbs&a=substore_index', location,"setCompanyData",that);
		  }
		}) 
	},
	onReady: function() {
		// 页面渲染完成
	},
	onShow: function() {
		publicFun.barTitle('门店列表'); //设置店铺标题
	},
	onUnload: function() {
		// 页面隐藏
	},
	onHide: function() {
		// 页面关闭
	},
	setCompanyData: function(data) {
		wx.setNavigationBarTitle({
			  title: data.err_msg.store.name
		})
		var that = this;
		var lat1=wx.getStorageSync("latitude")
		var lon1=wx.getStorageSync("longitude")
		if(lat1&&lon1){
			for ( var i = 0;i < data.err_msg.substores.length; i++ ){
				var lat2=data.err_msg.substores[i].lat
				var lon2=data.err_msg.substores[i].long
				var distance=that.getDistance(lat1,lon1,lat2,lon2)
				if ( distance ){
					data.err_msg.substores[i]['text'] = that.countDistanceStr( distance );
				}
			}
		}

		that.setData({
			stores: data.err_msg.substores
		});
		console.log(data.err_msg.substores)
		//如果仅有一个门店 则直接跳转到行业整合页面
		if(data.err_msg.substores.length==1){
		  // var data = '?cid=' + that.data.stores[0].id;
		  // data += "&distance=" + that.data.stores[0].distance;
		  // wx.navigateTo({
		  //  url: '/pages/storeList/main/main' + data 
		 // });
		}
	},
	getDistance:function (lat1, lng1, lat2, lng2) {
	    var radLat1 = lat1 * Math.PI / 180.0;
	    var radLat2 = lat2 * Math.PI / 180.0;
	    var a = radLat1 - radLat2;
	    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
	    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
	    s = s * 6378.137;
	    s = Math.round(s * 10000) / 10000;
	    return s
	},
	countDistanceStr: function( distance ){
		if ( distance < 1000 ){
			return distance + " m";
		} else {
			return ( distance / 1000 ).toFixed(2) + " km";
		}
	},
	onShareAppMessage: function () {
	  return {
		  title:'门店列表',
		  path: '/pages/stores/stores',
		  success: function(res) {
			  // 分享成功
		  },
		  fail: function(res) {
			  // 分享失败
		  }
	  }
	},
	goTo:function(e){
		let that = this;
		let index = parseInt(e.target.dataset.index);
		var data = '?cid=' + that.data.stores[index].store_id;
		console.log(data)
		wx.redirectTo({
		  url: '/pages/index/index'+data,
		  complete:function(res){  
	        console.log(res)  
		  }  
		});
	}

})