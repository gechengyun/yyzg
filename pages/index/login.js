var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
Page({
    data: {

    },

    onLoad: function() {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
    },
    onReady: function(e) {
        var that = this;
        common.post('app.php?c=widget&a=wxapp_store', '', "shopHomeData", that);

    },
    onShow: function() {
        var app = getApp();
        app.getUserInfo(function(userInfo) {
            setTimeout(function() {
                let url = '';
                try {
                    let urlSet = wx.getStorageSync('url')
                    if (urlSet) {
                        url = urlSet;
                    }
                } catch (e) {}
                publicFun.setUrl('');
                if (url == '' || url == undefined || url == '/pages/index/index') {
                    wx.redirectTo({
                        url: '/pages/index/index',
                    })
                } else {
                    wx.redirectTo({ url: url })
                }
            },500)
        })
    },
    shopHomeData: function(res) {
        this.setData({
            'shopHomeData': res.err_msg
        })
    },
    navigateTo: function(e) { // 
        let url = '';
        try {
            let urlSet = wx.getStorageSync('url')
            if (urlSet) {
                url = urlSet;
            }
        } catch (e) {}
        publicFun.setUrl('');
        if (url == '' || url == undefined || url == '/pages/index/index') {
            wx.redirectTo({
                url: '/pages/index/index',
            })
        } else {
            wx.redirectTo({ url: url })
        }
    }

})
