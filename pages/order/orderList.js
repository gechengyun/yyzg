var common = require('../../utils/common.js');
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../utils/Tpublic.js');
var app = getApp();
let page = 2;
Page({
    data: {
        currentTab: 0,
        orderlistData: '',
        scrollTop: 0,
        scrollHeight: 0,
    },
    onLoad: function(e) { // 页面渲染完成
      publicFun.setBarBgColor(app);// 设置导航条背景色
        console.log(e);
        var that = this;
        this.setData({
            currentTab: e.status
        });
        publicFun.height(that);
    },
    onReady: function(e) {
        /*     var that = this;
             common.tuanPost('app.php?c=order&a=wxapp&wx_type=tuan&type=' + this.data.currentTab, '', "orderlistData", that);*/
    },
    onShow: function(e) {
        var that = this;
        common.tuanPost('app.php?c=order&a=wxapp&wx_type=tuan&type=' + this.data.currentTab, '', "orderlistData", that);
    },
    orderlistData: function(result) {
        if (result.err_code == 0) {
            this.setData({
                orderlistData: result.err_msg
            })
        };
    },
    swichNav: function(e) {
        var that = this;
        publicFun.swichNav(e, that);
        let type = e.target.dataset.current;
        common.tuanPost('app.php?c=order&a=wxapp&wx_type=tuan&type=' + type, '', "orderlistData", that);
    },
    bindDownLoad: function() { //滚动触发到底部
        var that = this;
        let url = 'app.php?c=order&a=wxapp&wx_type=tuan&type=' + that.data.currentTab + '&page=' + page;
        publicFun.orderPushData(page++, that, url)
    },
    scroll: function(event) { //滚动函数
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },
    cancelOrder: function(e) { //取消订单
        var that = this;
        let order_no = e.target.dataset.order;
        let index = e.target.dataset.index;
        publicFun.cancelOrder(that, order_no, index);
    },
    paymentGo: function(e) { //去支付
        let order_no = e.target.dataset.order;
        console.log(order_no);
        publicFun.paymentGo(order_no);
    },
    completeOrder: function(e) { //交易完成
        var that = this;
        let order_no = e.target.dataset.order;
        let index = e.target.dataset.index;
        console.log(order_no);
        publicFun.completeOrder(order_no, that, index);
    },
    completeReceipt: function(e) { //确认收货
        var that = this;
        let order_no = e.target.dataset.order;
        let index = e.target.dataset.index;
        console.log(order_no, index);
        publicFun.completeReceipt(order_no, that, index);
    },
    orderGo: function(e) { //跳转详情页面
        publicFun.orderGo(e)
    },
    applyRefundGo: function(e) { //跳转申请退货页面
        publicFun.applyRefundGo(e)
    },
    returnGo: function(e) { //跳转查看退货页面
        publicFun.returnGo(e)
    }
})
