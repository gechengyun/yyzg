var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url+'../../utils/common.js');
var publicFun = require(_url +'../../utils/public.js');
var wxParse = require(_url +'../../wxParse/wxParse.js');
var canvasFun = require(_url +'../../utils/canvas-post.js');
var canvas = require(_url +'../../utils/canvas.js');
/*拼团功能单独的公共方法publicFun*/
var publicFun = require(_url +'../../utils/Tpublic.js');

let page = 1;
Page({
    data: {
        currentTab: 0,
        orderlistData: '',
        scrollTop: 0,
        scrollHeight: 0,
        tuan_share_data:null,
        BASE_IMG_URL: 'https://s.404.cn/applet/', //图片访问地址
    },
    onLoad:function(e) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        console.log(that.data)
    },
    onReady: function() {
        var that = this;
        // 获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
        common.tuanPost('webapp.php?c=tuan&a=my_tuan', '', "orderlistData", that);
        publicFun.height(that);
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
        let type = e.currentTarget.dataset.current;
        common.tuanPost('webapp.php?c=tuan&a=my_tuan&type=' + type, '', "orderlistData", that);
    },
    bindDownLoad: function() { //滚动触发到底部
        var that = this;
        page++;
        let url = 'webapp.php?c=tuan&a=my_tuan&type=' + this.data.currentTab + '&page=' + page;
        publicFun.orderPushData(page, that, url)

    },

    // scroll: function(event) { //滚动函数
    //     this.setData({
    //         scrollTop: event.detail.scrollTop
    //     });
    // },

    joinGo: function(e) { //跳转参团页面
        var that = this;
        publicFun.joinGo(e, that)
    },
    orderGo: function(e) { //跳转详情页面
        let order = e.target.dataset.order;
        wx.navigateTo({ url: '/pages/user/order/index?order=' + order });
    },
    paymentGo: function(e) { //去支付
        let order_no = e.target.dataset.order;
        console.log(order_no);
        publicFun.paymentGo(order_no);
    },
    completeCollage: function(e) { //完成拼团
        var that = this;
        publicFun.completeCollage(e, that)
    },
    goButton: function() { //去开团
        wx.redirectTo({ url: '/pages/index/index' })
    },

    //显示对话框
    shareTap: function (e) {
        this.setData({
            tuan_share_data: {
                ...e.currentTarget.dataset,
                type: 1
            }
        })
        this.dialog.showDialog();
    },

    //取消事件
    _cancelEvent: function () {
        var that = this;
        console.log('你点击了取消');
        try {
            clearInterval(loopDownloadTimer); // 清除检测downloadFile是否全部执行完的计时器
        } catch (e) {

        }
        // 修改画布执行状态
        if (that.data.canvasData) {
            that.data.canvasData.status = false;
        }
        that.setData({
            canvasData: that.data.canvasData
        })
        wx.hideLoading();
        that.dialog.hideDialog();
    },
    //分享好友或群
    _shareGroup: function () {
        var that = this;
        console.log('分享好友或群');
        wx.showShareMenu({
            withShareTicket: false
        })
    }
    // onShareAppMessage() {
    //     let {tuan_share_data} = this.data
    //     let shareInfo = {}
    //     if (tuan_share_data) {
    //         shareInfo = {
    //             title: '邀请您参团~' + tuan_share_data.name,
    //             desc: '小伙伴快来参团~',
    //             path: '/pages/GOODSDETAILS/pages/join/index?' + `tuan_id=${tuan_share_data.tuan_id}&team_id=${tuan_share_data.team_id}&item_id=${tuan_share_data.item_id}&type=1`,
    //             imageUrl: tuan_share_data.image
    //         }
    //         console.log(shareInfo);
    //         return shareInfo
    //     }
    // }
})
