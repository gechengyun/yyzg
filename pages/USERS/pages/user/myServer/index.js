var _url='../../';
var common = require(_url+'../../../utils/common.js');
var publicFun = require(_url+'../../../utils/public.js');
var app = getApp();
let page = 1;
Page({
    data: {
        orderlistData: '',
        scrollTop: 0,
        scrollHeight: 0,
        currentTab: 0,
    },
    onLoad: function(e) {
			var that = this;
			publicFun.setBarBgColor(app, that);// 设置导航条背景色
			if (e.rights) {
					this.setData({
							currentTab: e.rights,
							// order_no: 'PIG20170306091411248170'
					});
			}
    },
    onShow: function() {
			var that = this;
			if (that.data.currentTab == 0) {
				common.post('app.php?c=return&a=all', '', "orderlistData", that);
			} else {
				common.post('app.php?c=rights&a=all', '', "orderlistData", that);
			}
			publicFun.height(that);
    },
    orderlistData: function(result) {
        if (result.err_code == 0) {
					this.setData({
						orderlistData: result.err_msg,
						next_page: result.err_msg.next_page
					})
        };
    },
    bindDownLoad: function() { //滚动触发到底部
				var that = this;
				if (that.data.next_page) {
					page++;
					let url = ''
					if (that.data.currentTab == 0) {
							url = 'app.php?c=return&a=all';
					} else {
							url = 'app.php?c=rights&a=all';
					}
					common.post(url + '&type=' + '&page=' + page, '', "setPushData", that);
			}
    },
    setPushData: function(result) { //添加数据
        var that = this;
        let list = that.data.orderlistData.return_list;
        for (var i = 0; i < result.err_msg.return_list.length; i++) {
            list.push(result.err_msg.return_list[i]);
        }
        that.setData({
						'orderlistData.return_list': list,
						next_page: result.err_msg.next_page
        });
    },
    scroll: function(event) { //滚动函数
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },
    returnGo: function(e) { //查看退货页面
        publicFun.returnGo(e)
    },
    cancelReturn: function(e) { //取消退货
        var that = this;
        let return_id = e.target.dataset.returnid;
        let index = e.target.dataset.index;
        publicFun.cancelReturn(that, return_id, index)
    },
    rightsGo: function(e) { //查看维权页面
        publicFun.rightsGo(e)
    },
    cancelRights: function(e) { //取消维权
        var that = this;
        let return_id = e.target.dataset.returnid;
        let index = e.target.dataset.index;
        publicFun.cancelRights(that, return_id, index)
    },
    swichNav: function(e) {
        var that = this;
        let currentTab = e.target.dataset.current;
        page = 1;
        if (currentTab == 0) {
            common.post('app.php?c=return&a=all', '', "orderlistData", that);
        } else {
            common.post('app.php?c=rights&a=all', '', "orderlistData", that);
        }
        publicFun.swichNav(e, that);
    },


})
