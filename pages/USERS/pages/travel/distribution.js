// distribution.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url+'../../utils/common.js');
var publicFun = require(_url +'../../utils/public.js');
// var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        choose: false, // 显示海报选中背景层
        product: '',   //产品信息
        shareDesc: ''

    },
    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色

        if (wx.getStorageSync('productInfo')) {
            that.setData({ product: wx.getStorageSync('productInfo') })
        }
        common.post('app.php?c=travel&a=share&preview=1&id=' + wx.getStorageSync('roadId'), '', "productData", that);
    },

    // 接口商品数据
    productData: function (res) {
        var that = this;
        if (res.err_code == 0) {
            that.setData({
                product: res.err_msg,
                shareDesc: res.err_msg.product.name + '，物美价廉，购物必选!'
            })
            publicFun.barTitle(that.data.product.title)
        }
    },

    // 推荐语
    bindDescBlur: function(e) {
        var that = this;
        if (e.detail.value != '') {
            that.setData({
                shareDesc: e.detail.value
            })
        } else {
            that.setData({
                shareDesc: that.data.product.product.name + '，物美价廉，购物必选!'
            })
        }
    },

    // 点击选项卡时的js
    // chooseItem: function (e) {
    //     //记录上次点击的对象的序号
    //     var oldidx = this.data.currentidx;
    //     //记录当前点击的对象的序号
    //     var currentidx = e.currentTarget.dataset.idx;
    //     if (oldidx == currentidx) {
    //         var choose = this.data.choose;
    //         this.setData({
    //             currentidx: currentidx,
    //             choose: !choose
    //         })
    //     } else {
    //         this.setData({
    //             currentidx: currentidx,
    //             choose: true
    //         });
    //     }
    // },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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
    onShareAppMessage: function (res) {
        return {
            title: this.data.product.name,
            imageUrl: this.data.product.image,
            desc: this.data.shareDesc,
          path: '/pages/USERS/pages/travel/index?product_id=' + this.data.product.product_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1",
        }
    }
})