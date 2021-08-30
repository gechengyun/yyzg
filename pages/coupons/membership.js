var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp()
Page({
    data: {

    },
    onLoad: function() {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.barTitle('会员卡'); //修改头部标题
        common.post('app.php?c=my&a=card', '', "coupontsData", that);
    },
    coupontsData: function(result) {
        if (result.err_code == 0) {
            this.setData({
                coupontsData: result.err_msg,
            })
        }
    },

})
