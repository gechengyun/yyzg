// pages/userInfo/index.js
var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log(app);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    userCall: function (res) {
        if (res.detail['userInfo']) {
            var ticket = wx.getStorageSync('ticket');
            wx.showLoading({
                title: '正在登录',
                mask: true,
            });

            let data = {
                code: app.globalData.login.code,
                encryptedData: res.detail.encryptedData,
                iv: res.detail.iv,
                wxapp_ticket: ticket,
            };

            app.setAddres().then(res=>{
                common.post('app.php?c=lbs&a=switch_substore', {
                    lat:res.latitude,
                    lng:res.longitude
                }, function () {
                    console.log('切换门店');
                    // 后台切换门店
                    app.globalData.switch_store = true;
                }, '');
            });

            common.post('app.php?c=wxapp&a=store_login', data, setUserInfo, '');
            
            function setUserInfo(result) {
                wx.hideLoading()
                try {
                    wx.setStorageSync('ticket', result.err_msg.wxapp_ticket)
                } catch (e) { }

                app.globalData.userInfo = result.err_msg.user;

                typeof app.globalData.storge.callbackObj == "function" && app.globalData.storge.callbackObj(app.globalData.userInfo);

                refresh_page(app.globalData.storge.refreshConfig);
            }

            //登陆跳转到之前页面
            function refresh_page(refreshConfig) {
                var params = '';
                if (refreshConfig.param) {
                    params = '?';
                    for (var i in refreshConfig.param) {
                        if (i == 'equals') continue
                        params += i + '=' + refreshConfig.param[i] + '&';
                    }
                }
                if (refreshConfig.pageType == 'page') {
                    wx.redirectTo({
                        url: '/' + refreshConfig.url + params,
                    })
                } else if (refreshConfig.pageType == 'tab') {
                    wx.redirectTo({
                        url: '/' + refreshConfig.url + params,
                    })
                }
            }

        } else {
            wx.showModal({
                title: '提示',
                content: '拒绝授权，则无法使用本小程序，请手动退出!请确认授权进入小程序!',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                }
            })
        }
    },

    userCallCopy: function (res) {
        console.log(res);
        if (res.detail['userInfo']) {
            wx.login({
                success: (result) => {
                    var ticket = wx.getStorageSync('ticket');
                    wx.showLoading({
                        title: '正在登录',
                        mask: true,
                    });

                    let data = {
                        code: result.code,
                        encryptedData: res.detail.encryptedData,
                        iv: res.detail.iv,
                        wxapp_ticket: ticket,
                    };

                    app.setAddres();

                    common.post('app.php?c=wxapp&a=store_login', data, setUserInfo, '');

                    function setUserInfo(result) {
                        wx.hideLoading()
                        try {
                            wx.setStorageSync('ticket', result.err_msg.wxapp_ticket)
                        } catch (e) { }

                        app.globalData.userInfo = result.err_msg.user;

                        typeof app.globalData.storge.callbackObj == "function" && app.globalData.storge.callbackObj(app.globalData.userInfo);

                        refresh_page(app.globalData.storge.refreshConfig);
                    }

                    //登陆跳转到之前页面
                    function refresh_page(refreshConfig) {
                        var params = '';
                        if (refreshConfig.param) {
                            params = '?';
                            for (var i in refreshConfig.param) {
                                if (i == 'equals') continue
                                params += i + '=' + refreshConfig.param[i] + '&';
                            }
                        }
                        if (refreshConfig.pageType == 'page') {
                            wx.redirectTo({
                                url: '/' + refreshConfig.url + params,
                            })
                        } else if (refreshConfig.pageType == 'tab') {
                            wx.redirectTo({
                                url: '/' + refreshConfig.url + params,
                            })
                        }
                    }
                }
            });
        } else {
            wx.showModal({
                title: '提示',
                content: '拒绝授权，则无法使用本小程序，请手动退出!请确认授权进入小程序!',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定')
                    }
                }
            })
        }
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})