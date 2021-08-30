/**@author wangmu 2016-12-8**/
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../utils/Tpublic.js');
var common = require('../../utils/common.js');
var app = getApp();
Page({
    data: {
        order_no: '',
        orderData: '',
        orderAddress:true,
        postage: true
    },
    onLoad: function(e) { // 页面渲染完成
        var that = this;
      publicFun.setBarBgColor(app, that);// 设置导航条背景色
        this.setData({
            order_no: e.order
        });
    },
    onReady: function(e) {
        var that = this;
        common.tuanPost('app.php?c=order&a=detail&order_no=' + this.data.order_no, '', "orderData", that);
    },
    orderData: function(result) {
        if (result.err_code == 0) {
            this.setData({
                orderData: result.err_msg
            })
        };
        let status = this.data.orderData.order.status * 1;
        publicFun.statusTitle(status) //设置标题
    },
    cancelOrder: function() { //取消订单
        var that = this;
        publicFun.cancelOrder(that, this.data.order_no);
    },
    paymentGo: function() { //去支付
        publicFun.paymentGo(this.data.order_no);
    },
    joinGo: function(e) { //跳转参团页面
        var that = this;
        publicFun.joinGo(e, that)
    },
    completeReceipt: function(e) { //确认收货
        var that = this;
        let order_no = this.data.order_no;
        console.log(order_no);
        publicFun.completeReceipt(order_no, that);
    },
    completeOrder: function(e) { //交易完成
        var that = this;
        let order_no = this.data.order_no;
        console.log(order_no);
        publicFun.completeOrder(order_no, that);
    },
    addressGo: function(e) { //我的地址
        wx.navigateTo({ url: '/pages/address/index' })
    },
    applyRefundGo: function(e) { //跳转申请退货页面
        publicFun.applyRefundGo(e)
    },
    returnGo: function(e) { //跳转退货详情页面
        publicFun.returnGo(e)
    },
    logistics: function(e) { //查看物流信息
        var that = this;
        publicFun.logistics(e, that)
    }


})
