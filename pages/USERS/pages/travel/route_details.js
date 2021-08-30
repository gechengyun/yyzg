// route_details.js
var _url='../../';
var common = require(_url+'../../utils/common.js');
var publicFun = require(_url+'../../utils/public.js');
var wxParse = require(_url+'../../wxParse/wxParse.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        productid: '',
        shoppingData: {
            shoppingShow: false,
            shoppingCatData: '',
            specList: [{
                'vid': 1
            }, {
                'vid': 1
            }, {
                'vid': 1
            }],
            value: '',
            sku_id: '',
            shoppingNum: 1,
            date: '2016-09-01',
            time: '12:00',
        },
        preview: 0,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.setData({ productid: options.productId })
        publicFun.barTitle('详细行程'); //修改头部标题
        that.data.preview = options.preview;
        that.setData({
            preview: that.data.preview,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (e) {
        var that = this;
        let url = '/pages/product/details?product_id=' + that.data.productid;
        publicFun.setUrl(url);
        common.post('app.php?c=travel&a=detail&id=' + that.data.productid + '&preview=' + that.data.preview, '', "productData", that);
        publicFun.height(that);
    },
    productData: function (result) {
        var that = this;
        if (result.err_code == 0) {
            this.setData({
                productData: result.err_msg,
            })

            //模板富文本转化
            let info = this.data.productData.product.info;
            if (info != '' && info != undefined) {
                wxParse.wxParse('info', 'html', info, that, 5);
            }
            this.data.productData.product.info = info;
            this.setData({ //模板富文本转化
                'productData': that.data.productData,
            });
        }
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
    onShareAppMessage: function () {

    }
})