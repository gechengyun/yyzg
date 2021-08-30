var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvasFun = require('../../../../utils/canvas-post.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();


Page({

    /**
     * 页面的初始数据
     */
    data: {
        imgUrls: [],
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        maskShow: false,
        result: { // 共三种状态status：1.普通砍价提示；2.帮砍人砍至底价提示；3.发起人进入已被砍至底价页面的提示
            status: 1,
            resultShow: false,
            title: '恭喜你砍掉',
            price: '0.00',
            text: '赶紧邀请好友砍价接力~',
            btnText: '立即分享',
            btnTap: 'shareTap',
            btnType: ''
        },
        is_lowest: false, // 是否至底价
        teamShow: false,
        id: '',
        friend: '',
        bargain: [],
        t_index: 0,
        allInfo: '',
        cur: 0,
        instant: new Date(),
        isOverEnd: false,
        isBeforeStart: false,
        s_time: '',
        e_time: '',
        buttonArr: [],
        total_show: '00',
        hours_show: '00',
        minutes_show: '00',
        seconds_show: '00',
        BASE_IMG_URL: app.globalData.BASE_IMG_URL,
        firstShow: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.barTitle('全名砍价，低价拿商品'); //修改头部标题
        publicFun.height(that);
        var id = '';
        var preview = 0;

        if (e.scene != undefined) { // 预览模式
            console.log('preview')
            that.setData({
                firstShow: false
              });
            var scene_id = decodeURIComponent(e.scene);
            console.log("GOODSDETAILS/pages/bargain/details",scene_id);
            if (scene_id) {
                let url = 'app.php?c=store&a=get_share_data',
                data = {
                scene_id: scene_id
                };
                common.post(url, data ,function(result){
                    console.log("砍价",result);
                    if(result.err_code == 0){
                      app.globalData.store_id = result.err_msg.store_id;
                      app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid  
                      that.setData({
                        id:  result.err_msg.activity_id,
                        preview: 1,
                        friend: result.err_msg.uid? result.err_msg.uid : ''
                    })
                    that.getDetails();
                    }
                  },'');
            }
        } else { // 正常模式
            console.log('normal')
            id = e.id;
            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid|| '';
            getApp().globalData.shareType = e.shareType || 2;
        }

        that.setData({
            id: id,
            preview: preview,
            friend: e.friend ? e.friend : ''
        })

        // 获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            },
        });
      //是否展示分享图片
      app.shareWidthPic(that);
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      // getApp().globalData.share_uid = e.share_uid||'';
      // getApp().globalData.shareType = e.shareType||2 ;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        clearTimeout(publicFun.timer)
        if(that.data.firstShow){
            that.getDetails();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        clearTimeout(publicFun.timer);
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
        var that = this;
        var f = '';
        if (that.data.friend == '') {
            f = that.data.allInfo.uid
        } else {
            f = that.data.friend
        }
        var image = '';
        if (that.data.ProductImages && that.data.ProductImages[0]) {
            image = that.data.ProductImages[0].image;
        }
        var path = '/pages/GOODSDETAILS/pages/bargain/details?id=' + that.data.id;
        // if (that.data.my_kanuser_count > 0) {
          path += '&friend=' + f;
        // }
          path = path+ "&store_id=" + getApp().globalData.store_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1"
        const { show_share_img, share_img } = app.globalData;
        return {
          title: that.data.bargain.wxtitle,
          desc: that.data.bargain.wxtitle,
          imageUrl: show_share_img == 1 ? (share_img) : (image || ''),
          path: path
        }
    },
    getDetails: function () {
        var that = this;
        var data;
        if (that.data.friend != '') {
            data = {
                id: that.data.id,
                friend: that.data.friend
            }
        } else {
            data = {
                id: that.data.id
            }
        }
        common.post('app.php?c=bargain&a=detail', data, "getDetailsCallBack", that);

    },
    getDetailsCallBack: function (res) {
        var that = this;

        var cur = (res.err_msg.bargain.myqprice / (res.err_msg.bargain.original - res.err_msg.bargain.minimum)) * 100;
        // 处理各种价格（后端价格要除以100）
        let current_price = ((res.err_msg.bargain.original - (res.err_msg.kan_total_money||0)) / 100).toFixed(2);
        res.err_msg.bargain.kan_max = (res.err_msg.bargain.kan_max / 100).toFixed(2);
        res.err_msg.bargain.kan_min = (res.err_msg.bargain.kan_min / 100).toFixed(2);
        res.err_msg.bargain.minimum = (res.err_msg.bargain.minimum / 100).toFixed(2);
        res.err_msg.bargain.original = (res.err_msg.bargain.original / 100).toFixed(2);
        res.err_msg.bargain.myqprice = res.err_msg.bargain.myqprice ? res.err_msg.bargain.myqprice : 0;

        that.data.is_lowest = current_price * 1 <= res.err_msg.bargain.minimum * 1;

        if (res.err_msg.is_over == 5 && !res.err_msg.is_share_link) {
            that.data.result.resultShow = false;
            that.setData({
                maskShow: false,
                result: that.data.result,
                is_lowest: that.data.is_lowest
            })
        }
        if (that.data.updatePrice != 1 && res.err_msg.is_over == 2 && !res.err_msg.is_share_link && that.data.is_lowest) {
            that.data.result = { // √.发起人进入已被砍至底价页面的提示
                status: 3,
                resultShow: true,
                title: '恭喜您已成功砍至底价',
                price: current_price,
                text: '您的砍价大军果然名不虚传~',
                btnText: '立即购买',
                btnTap: 'gopay',
                btnType: 'gopay'
            }
            that.setData({
                maskShow: true,
                result: that.data.result,
                is_lowest: that.data.is_lowest
            })
        }

        // 处理活动状态
        // isStar 活动状态，1 活动未开始，2 活动已结束，3 活动已关闭，4进行中
        if (res.err_msg.isStar == 1) {
            that.data.buttonArr = [{
                text: '活动未开始',
                color: 'gray',
                bind: '',
            }]
        }
        if (res.err_msg.isStar == 2) {
            that.data.buttonArr = [{
                text: '活动已结束',
                color: 'gray',
                bind: '',
            }]
        }
        if (res.err_msg.isStar == 3) {
            that.data.buttonArr = [{
                text: '活动已关闭',
                color: 'gray',
                bind: '',
            }]
        }
        if (res.err_msg.isStar == 4) { // 活动进行中
            // kan_total_time 当前砍价参与人数
            // my_kanuser_count 我的参与数据
            // myhelp_kanuser_count 我的帮忙数据
            // is_over: 0: // 未参与; 1: // 未到底价; 2: // 已到底价; 3: // 未支付; 4: // 已结束; 5: // 已支付
            switch (res.err_msg.is_over) {
                case 0: // 未参与
                    if (res.err_msg.bargain.inventory > 0) {
                        that.data.buttonArr = [{
                            text: '砍下第一刀',
                            color: '',
                            bind: 'cutBtnClick',
                        }]
                    } else {
                        that.data.buttonArr = [{
                            text: '商品已售罄',
                            color: 'gray',
                            bind: '',
                        }]
                    }

                    break;
                case 1: // 未到底价
                    if (res.err_msg.bargain.inventory > 0) {
                        if (res.err_msg.is_share_link) {
                            if (res.err_msg.myhelp_kanuser_count == 0) {
                                that.data.buttonArr = [{
                                    text: '帮TA砍一刀',
                                    color: '',
                                    bind: 'cutBtnClick',
                                }, {
                                    text: '我也要玩',
                                    color: '',
                                    bind: 'playToo',
                                }]
                            } else {
                                that.data.buttonArr = [{
                                    text: '我也要玩',
                                    color: '',
                                    bind: 'playToo',
                                }]
                            }
                        } else {
                            that.data.buttonArr = [{
                              text: '立即分享',
                                color: '',
                                //bind: '_shareGroup',
                                //open: 'share'
                                bind: 'shareTap'
                            }, {
                                text: '立即购买',
                                color: '',
                                bind: 'gopay',
                            }]
                        }
                    } else {
                        that.data.buttonArr = [{
                            text: '商品已售罄',
                            color: 'gray',
                            bind: '',
                        }]
                    }

                    break;
                case 2: // 已到底价
                    if (res.err_msg.bargain.inventory > 0) {
                        if (!res.err_msg.is_share_link) {
                            that.data.buttonArr = [{
                                text: '立即购买',
                                color: '',
                                bind: 'gopay',
                            }]
                        } else {
                            that.data.buttonArr = [{
                                text: '我也要玩',
                                color: '',
                                bind: 'playToo',
                            }]
                        }
                    } else {
                        that.data.buttonArr = [{
                            text: '商品已售罄',
                            color: 'gray',
                            bind: '',
                        }]
                    }

                    break;
                case 3: // 未支付
                    if (res.err_msg.bargain.inventory > 0) {
                        if (!res.err_msg.is_share_link) {
                            if (res.err_msg.my_order.status == 0 || res.err_msg.my_order.status == 1) {
                                that.data.buttonArr = [{
                                    text: '立即付款',
                                    color: '',
                                    bind: 'payNow',
                                }]
                            } else {
                                that.data.buttonArr = [{
                                    text: '立即购买',
                                    color: '',
                                    bind: 'gopay',
                                }]
                            }
                        } else {
                            that.data.buttonArr = [{
                                text: '我也要玩',
                                color: '',
                                bind: 'playToo',
                            }]
                        }
                    } else {
                        that.data.buttonArr = [{
                            text: '商品已售罄',
                            color: 'gray',
                            bind: '',
                        }]
                    }

                    break;
                case 4: // 已结束
                    if (!res.err_msg.is_share_link) {
                        that.data.buttonArr = [{
                            text: '砍价已结束',
                            color: 'gray',
                            bind: '',
                        }]
                    }
                    break;
                case 5: // 已支付
                    if (!res.err_msg.is_share_link) {
                        that.data.buttonArr = [{
                            text: '已购买',
                            color: '',
                            bind: 'toOrder',
                        }]
                    } else {
                        that.data.buttonArr = [{
                            text: '我也要玩',
                            color: '',
                            bind: 'playToo',
                        }]
                    }
                    break;

            }
        }
        that.setData({
            buttonArr: that.data.buttonArr,
        })
        // 处理砍价亲友团时间
        if (res.err_msg.kanuser_list && res.err_msg.kanuser_list.length > 0) {
            for (var i = 0; i < res.err_msg.kanuser_list.length; i++) {
                res.err_msg.kanuser_list[i].addtime_str = publicFun.setDate(res.err_msg.kanuser_list[i].addtime)
            }
        }

        that.setData({
            s_time: that.formatDate(new Date(res.err_msg.bargain.start_time * 1000), 'yyyy-MM-dd hh:mm'),
            e_time: that.formatDate(new Date(res.err_msg.bargain.end_time * 1000), 'yyyy-MM-dd hh:mm'),
            cur: cur,
            current_price: current_price,
            minimum: res.err_msg.bargain.minimum,
            allInfo: res.err_msg,
            ProductImages: res.err_msg.ProductImages,
            bargain: res.err_msg.bargain,
            kanuser_list: res.err_msg.kanuser_list,
            instant: Date.now()
        })
        if (res.err_msg.isStar == 4 && res.err_msg.is_over != 4) {
            that.timeShow();
        }

        if (res.err_msg.bargain && (res.err_msg.bargain.wxtitle||res.err_msg.bargain.name)) {
            publicFun.barTitle(res.err_msg.bargain.wxtitle||res.err_msg.bargain.name); //修改头部标题
        }

        // 处理富文本
        var guizeHtml = res.err_msg.bargain.guize;
        var infoHtml = res.err_msg.bargain.info;
        wxParse.wxParse('infoHtml', 'html', infoHtml, that, 10);
        wxParse.wxParse('guizeHtml', 'html', guizeHtml, that, 10);

        // 购买提示
        if (that.data.updatePrice == 1 && !that.data.is_lowest) {
            that.setData({
                updatePrice: 0
            })
            publicFun.promptMsg('立即付款意味着砍价结束，确定要以当前价格' + that.data.current_price + '支付嘛？', '确定', '取消', function () {

                let data = {};
                data.product_id = that.data.bargain.product_id;
                data.is_add_cart = 0; //是否加入购物袋
                data.send_other = 0;
                data.sku_id = that.data.bargain.sku_id;
                data.custom = [];
                data.quantity = 1;
                data.storeId = that.data.allInfo.storeId;
                data.activityId = that.data.allInfo.pigcms_id;
                data.type = 50;
                var p = that.data.current_price;
                data.price = p < (that.data.bargain.minimum / 100) ? (that.data.bargain.minimum / 100) : p;
                common.post('app.php?c=bargain&a=save_order', data, "saveOrderCallBack", that);
            }, '购买小贴士')
        }

        if (that.data.updatePrice == 1 && that.data.is_lowest) {
            that.setData({
                updatePrice: 0
            })
            let data = {};
            data.product_id = that.data.bargain.product_id;
            data.is_add_cart = 0; //是否加入购物袋
            data.send_other = 0;
            data.sku_id = that.data.bargain.sku_id;
            data.custom = [];
            data.quantity = 1;
            data.storeId = that.data.allInfo.storeId;
            data.activityId = that.data.allInfo.pigcms_id;
            data.type = 50;
            var p = that.data.current_price;
            data.price = p < (that.data.bargain.minimum / 100) ? (that.data.bargain.minimum / 100) : p;
            common.post('app.php?c=bargain&a=save_order', data, "saveOrderCallBack", that);
        }



    },
    cutBtnClick: function () {
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this, app);
          return false;
        }
        var that = this;
      
        var data = {
            id: that.data.id,
            friend: that.data.friend,
        }

        common.post('app.php?c=bargain&a=new_firstblood', data, "cutBtnClickCallBack", that);

    },
    cutBtnClickCallBack: function (res) {
        var that = this;
        // kan_total_time 当前砍价参与人数
        // my_kanuser_count 我的参与数据
        // myhelp_kanuser_count 我的帮忙数据
        // is_over: 0: // 未参与; 1: // 未到底价; 2: // 已到底价; 3: // 未支付; 4: // 已结束; 5: // 已支付
        if (that.data.allInfo.is_over == 1 && that.data.allInfo.is_share_link && that.data.allInfo.myhelp_kanuser_count == 0 && res.err_msg.isdao == 1) {
            that.data.is_lowest = true;
            that.data.result = {
                status: 2,
                resultShow: true,
                price: res.err_msg.dao,
                title: '恭喜你砍掉',
                text: '厉害了，您已成功帮助好友砍至底价！',
                btnText: '去告诉好友',
                btnTap: 'shareTap',
                btnType: ''
            }
        } else {
            that.data.result = {
                status: 1,
                resultShow: true,
                title: '恭喜你砍掉',
                price: res.err_msg.dao,
                text: '赶紧邀请好友砍价接力~',
              btnText: '立即分享',
                btnTap: 'shareTap',
                btnType: ''
                // btnTap: '_shareGroup',
                // btnType:'share'
            }
        }

        that.setData({
            maskShow: true,
            result: that.data.result,
            is_lowest: that.data.is_lowest,
        })
        that.getDetails()
    },
    maskClick: function () {
        var that = this;
        that.data.result.resultShow = false;
        that.setData({
            maskShow: false,
            result: that.data.result,
            teamShow: false
        })
    },
    checkTeamAll: function () {
        var that = this;
        that.setData({
            teamShow: true,
            maskShow: true
        });
    },
    tabClick: function (e) {
        var i = parseInt(e.target.dataset.index)
        var that = this;
        that.setData({
            t_index: i
        })
    },

    timeShow: function () {
        var that = this;
        var endtime = new Date(that.data.allInfo.bargain.end_time * 1000); //结束时间
        var today = new Date((new Date().getTime() - new Date(that.data.instant).getTime()) + new Date(that.data.allInfo.nowTime * 1000).getTime()); //当前时间

        var delta_T = endtime.getTime() - today.getTime(); //时间间隔
        if (delta_T < 0) {
            //clearInterval(auto);
            //$(".header .Places i").text(0);
            console.log("活动已经结束啦");
            return;
        }
        publicFun.timer = setTimeout(that.timeShow, 1000);
        var total_days = delta_T / (24 * 60 * 60 * 1000), //总天数
            total_show = Math.floor(total_days), //实际显示的天数
            total_hours = (total_days - total_show) * 24,//剩余小时
            hours_show = Math.floor(total_hours), //实际显示的小时数
            total_minutes = (total_hours - hours_show) * 60, //剩余的分钟数
            minutes_show = Math.floor(total_minutes), //实际显示的分钟数
            total_seconds = (total_minutes - minutes_show) * 60, //剩余的分钟数
            seconds_show = Math.floor(total_seconds); //实际显示的秒数
        if (total_show <= 15) {
        }
        if (total_show < 10) {
            total_show = String(total_show);
            total_show = "0" + total_show;
        }
        if (hours_show < 10) {
            hours_show = "0" + hours_show;
        }
        if (minutes_show < 10) {
            minutes_show = "0" + minutes_show;
        }
        if (seconds_show < 10) {
            seconds_show = "0" + seconds_show;
        }
        that.setData({
            total_show: total_show,
            hours_show: hours_show,
            minutes_show: minutes_show,
            seconds_show: seconds_show
        })

    },
    compareTime: function (t) {
        var that = this;
        var today = new Date((new Date().getTime() - new Date(that.data.instant).getTime()) + new Date(that.data.allInfo.nowTime * 1000).getTime()); //当前时间
        var targetTime = new Date(t * 1000); //结束时间
        if (today.getTime() < targetTime.getTime()) {
            return true
        } else {
            return false
        }
    },
    playToo: function () {
        wx.navigateTo({
            url: '/pages/GOODSDETAILS/pages/bargain/details?id=' + this.data.id
        })
    },
    gopay: function () {
        var that = this;
        that.setData({
            updatePrice: 1, // 点击立即购买刷新接口刷新价格
        })
        that.getDetails()

    },
    saveOrderCallBack: function (res) {
        var that = this;
        if (res.err_code == 0) {
            clearTimeout(publicFun.timer);
            that.data.result.resultShow = false;
            that.setData({
                maskShow: false,
                result: that.data.result,
            })
            wx.navigateTo({ url: '/pages/payment/index?order_no=' + res.err_msg })
        }
        if (res.err_code == 2) {
            wx.navigateTo({ url: '/pages/payment/index?order_no=' + res.err_msg })
        }

    },
    payNow: function () {
        var that = this;
        clearTimeout(publicFun.timer);
        wx.navigateTo({ url: '/pages/payment/index?order_no=' + that.data.allInfo.my_order.order_no })
    },
    toOrder: function () {
        var that = this;
        wx.navigateTo({
            url: '/pages/user/order/index?order=' + that.data.allInfo.my_order.order_no,
        })
    },
    formatDate: function (date, fmt) {
        var that = this;
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }


        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                // console.log(`${k}`)
                // console.log(RegExp.$1)
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : that.padLeftZero(str));
            }
        }
        return fmt;
    },

    padLeftZero: function (str) {
        return ('00' + str).substr(str.length);
    },



    upper: function (e) {
        console.log(e)
    },
    lower: function (e) {
        console.log(e)
    },
    scroll: function (e) {
        console.log(e)
    },
    tap: function (e) {
        for (var i = 0; i < order.length; ++i) {
            if (order[i] === this.data.toView) {
                this.setData({
                    toView: order[i + 1]
                })
                break
            }
        }
    },
    tapMove: function (e) {
        this.setData({
            scrollTop: this.data.scrollTop + 10
        })
    },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this, app);
          return false;
        }
        console.log(e);
        // console.log(e.detail.target.dataset.bindtap);
        let bindType = e.detail.target.dataset.bindtap
        publicFun.formSubmit({
            e: e,
            that: that,
            callBack: that[bindType]
        });
    },
    /*
    *
    **分享对话框 shareModal start
    *
    */

    //显示对话框
    shareTap: function () {
        var that = this;
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this, app);
          return false;
        }
        that.dialog.showDialog();
    },

    //取消事件
    _cancelEvent: function () {
        var that = this;
        // 修改画布执行状态
        if (that.data.canvasData) {
            that.data.canvasData.status = false;
        }
        wx.hideLoading();
        that.dialog.hideDialog();
    },
    //分享好友或群
    _shareGroup: function () {
        var that = this;
        console.log('点击了分享好友或群');
        if (that.data.friend == '') {
          that.setData({
              friend: that.data.allInfo.uid
          })
        }
        wx.showShareMenu({
            withShareTicket: false
        })
    },
    //分享朋友圈
    _shareFriendsCircle: function () {
        var that = this;
        console.log('点击了分享朋友圈');
        let ticket = wx.getStorageSync('ticket');
        var user = '';
        if (that.data.friend == '') {
          user = that.data.allInfo.uid
        } else {
          user = that.data.friend
        }
        let data = {
            path: 'pages/GOODSDETAILS/pages/bargain/details',
            id: that.data.id,
            uid: user,
            share_uid: getApp().globalData.my_uid,
            shareType: "activity",
            activity_type :"bargain"
        }
        wx.showLoading({
            title: '正在准备颜料...',
            mask: true
        })

        console.log('海报图发送数据：');
        console.log(data)
        wx.request({
            url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
            header: {
                'Content-Type': 'application/json'
            },
            data: data,
            method: "POST",
            success: function (res) {
                console.log('获取二维码成功')
                console.log(res)
                if (res.statusCode == 200) {
                    if (res.data.err_code == 0) {
                        that.setData({
                            qrcodePath: res.data.err_msg
                        })
                        // 处理canvas
                        wx.showLoading({
                            title: '海报生成中...',
                            mask: true
                        })
                        that.creatPost();
                        // 处理canvas
                    }
                }
            },
            fail: function (res) {

            }
        })

    },
    /*
    *
    **分享对话框 shareModal end
    *
    */
    // 生成分享海报
    creatPost: function () {
        var that = this;
        // 1 设置画布数据
        console.log("=============================");
        console.log(that.data.allInfo.kanuser_list);
        let product_name = that.data.allInfo.bargain.name;
        let myqprice = canvasFun.formatPrice(that.data.allInfo.bargain.myqprice / 100);
        let original = canvasFun.formatPrice(that.data.allInfo.bargain.original);
        let current_price = canvasFun.formatPrice(that.data.current_price);
        let minimum = canvasFun.formatPrice(that.data.minimum);
        let kanuser_list = [];// 帮砍者头像列表
        if (that.data.allInfo.kanuser_list && that.data.allInfo.kanuser_list.length > 0) {
            for (let i = 0; i < that.data.allInfo.kanuser_list.length; i++) {
                kanuser_list.push(that.data.allInfo.kanuser_list[i].wecha_id)
            }
        }
        console.log("=============================");
        console.log(kanuser_list);
        var canvasData = { // 画布数据
            status: true,
            canvasId: 'bargainPost',
            // canvasWidth: 500,
            // canvasHeight: 740,
            // paddingLeft: that.data.winWidth * 0.15,
            // paddingTop: that.data.winWidth * 0.15,
            canvasWidth: 750,
            canvasHeight: 1181 + 244,   // 砍价
            paddingLeft: 0,
            paddingTop: 0,
            radius: 10,
            bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
            bgPath: that.data.BASE_IMG_URL+'images/bargain_post_bg.png', // 海报背景图
            whiteBg: that.data.BASE_IMG_URL+'images/white_bg.png',
            heartPath: that.data.BASE_IMG_URL+'images/heart.png', // 爱心图标
            noPeople: that.data.BASE_IMG_URL+'images/no-people.png',
            product_name: product_name, // 活动名称
            myqprice: myqprice, // 我砍掉的价格
            original: original, // 砍价原价
            current_price: minimum, // 砍价当前价
            text_qrcode_btm: '长按识别二维码，即可帮我砍价~', // 二维码下方文字
            text_qrcode_btm2: '感恩我的世界有一个美丽的你！', // 二维码下方文字2
            loadFailTapStatus: false, // 下载失败处理函数是否已执行
            // 图片数据
            avatarPath: that.data.allInfo.avatar, // 用户头像
            qrcodePath: that.data.qrcodePath, // 二维码
            productImage: 'https://' + that.data.ProductImages[0].image.split('://')[1], // 商品首图
            kanuser_list: kanuser_list, // 帮砍者头像列表
        };
        let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
        that.setData({
            canvasData: canvasData,
            canvasPosition: obj
        })

        setTimeout(() => { // 防止this.setData()此异步操作没有成功执行完毕
            loopDownLoadFile('productImage', that.data.canvasData.productImage);
            loopDownLoadFile('qrcodePath', that.data.canvasData.qrcodePath);
            loopDownLoadFile('avatarPath', that.data.canvasData.avatarPath);
            loopDownLoadFile('kanuser_list', kanuser_list);


            // 检测是否所有downloadFile方法成功执行完毕
            let xhrStatusArr = []; // 用于检测downloadFile方法的执行
            let xhrLength = 3 + kanuser_list.length; // 预先定义好要下载的图片的数量，以供检测是否全部下载完毕
            console.log('xhrLength === ', xhrLength)
            let loopDownloadTimer = setInterval(function () {
                let value = true;
                for (let i = 0; i < xhrStatusArr.length; i++) {
                    if (xhrStatusArr[i] == false) {
                        value = false
                    }
                }
                if (value && xhrStatusArr.length == xhrLength) {
                    // 画图开始 =====================
                    // that.creatCanvas();
                    that.drawCanvas();
                    // 画图结束 =====================
                    // setTimeout(function () {
                    //     // 画布转成图片开始
                    //     canvasFun.canvasToTempFilePath({
                    //         that: that,
                    //         canvasId: that.data.canvasData.canvasId,
                    //         callback: callback
                    //     })
                    //     function callback() {
                    //         that.dialog.hideDialog();//隐藏分享弹窗
                    //     }
                    //     // 画布转成图片结束
                    // }, 500)
                    setTimeout(function () {
                        let w = that.data.canvasData.canvasWidth;
                        let h = that.data.canvasData.canvasHeight;
                        that.save({
                            id: that.data.canvasData.canvasId,
                            w: w,
                            h: h,
                            targetW: w * 4,
                            targetH: h * 4
                        });
                    }, 500);
                    clearInterval(loopDownloadTimer)
                }
            }, 300)

            // 下载所需图片
            function loopDownLoadFile(name, urls) {
                if (Array.isArray(urls) && urls.length > 0) {
                    that.data.canvasData[name] = [];
                    for (let i = 0; i < urls.length; i++) {
                        wx.downloadFile({
                            url: urls[i],
                            success: function (res) {
                                console.info("下载一个文件成功");
                                that.data.canvasData[name][i] = res.tempFilePath;  // .push(res.tempFilePath);
                                that.setData({
                                    canvasData: that.data.canvasData
                                })
                                xhrStatusArr.push(true)
                            },
                            fail: function (e) {
                                console.info("下载一个文件失败");
                                xhrStatusArr.push(false)
                                if (!that.data.canvasData.loadFailTapStatus) canvasFun.loadFailTap(that, loopDownloadTimer)
                            }
                        })
                    }
                } else {
                    wx.downloadFile({
                        url: urls,
                        success: function (res) {
                            console.info("下载一个文件成功");
                            that.data.canvasData[name] = res.tempFilePath;
                            that.setData({
                                canvasData: that.data.canvasData
                            })
                            xhrStatusArr.push(true)
                        },
                        fail: function (e) {
                            console.info("下载一个文件失败");
                            xhrStatusArr.push(false)
                            if (!that.data.canvasData.loadFailTapStatus) canvasFun.loadFailTap(that, loopDownloadTimer)
                        }
                    })
                }

            }

        }, 1000)
    },

    // 绘图 created 18-04-26 by cms_ssa
    drawCanvas: function () {
        let that = this;
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        let left = that.data.canvasData.paddingLeft;
        let top = that.data.canvasData.paddingTop;
        // 内部商品图片偏移量
        let innerLeft = 30;
        // 内部商品图片高度
        let imgH = w - (left + innerLeft) * 2;
        // 头像半径
        let head_r = 53;
        // 二维码半径
        let qrode_r = 95;
        let positionY = 0;
        // 生成画笔
        const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);

        // 绘制白色圆角背景
        canvas.roundRect({
            ctx: ctx,
            x: left,
            y: top,
            w: w - left * 2,
            h: h - top * 2,
            r: 0,
            blur: 40,
            shadow: 'rgba(180,180,180,.4)'
        });

        // 绘制头像
        positionY = top + 47;
        canvas.circleImg({
            ctx: ctx,
            img: that.data.canvasData.avatarPath,
            r: head_r,
            x: left + 68,
            y: positionY
        });

        // 绘制头像右侧文字，此处不用多行，是为了可以按照头像居中
        canvas.drawText({
            ctx: ctx,
            text: '我砍了',
            x: left + 68 + head_r * 2 + 45,
            y: top + 47 + head_r - 8,
            fontSize: 24,
            baseline: 'bottom'
        });

        canvas.drawText({
            ctx: ctx,
            text: '看看你能砍多少？',
            x: left + 68 + head_r * 2 + 45,
            y: top + 47 + head_r + 8,
            fontSize: 24,
            baseline: 'top'
        });

        ctx.font = '24px PingFang-SC-Bold';
        const metrics = ctx.measureText('我砍了').width;
        canvas.drawText({
            ctx: ctx,
            text: '￥' + that.data.canvasData.myqprice,
            x: left + 68 + head_r * 2 + 45 + metrics,
            y: top + 47 + head_r - 8,
            fontSize: 24,
            baseline: 'bottom',
            color: 'rgb(180,40,45)'
        });

        let status = !!(that.data.canvasData.kanuser_list && that.data.canvasData.kanuser_list.length > 0);
        let bugY;
        if (status) {
            positionY += 134;
            bugY = positionY;
            canvas.drawText({
                ctx: ctx,
                text: '·砍价排行榜·',
                x: w / 2,
                y: positionY,
                fontSize: 26,
                baseline: 'top',
                align: 'center'
            });
            positionY += 200;
        } else {
            positionY += 156;
            canvas.drawText({
                ctx: ctx,
                text: '·砍价排行榜·',
                x: w / 2,
                y: positionY,
                fontSize: 26,
                baseline: 'top',
                align: 'center'
            });

            canvas.drawText({
                ctx: ctx,
                text: '这里缺个冠军~不服来战！',
                x: w / 2,
                y: positionY + 64,
                fontSize: 24,
                baseline: 'top',
                align: 'center'
            });

            positionY += 134;
        }


        // 绘制中间容器
        canvas.roundImg({
            ctx: ctx,
            x: left + innerLeft + 20,
            y: positionY,
            img: that.data.canvasData.productImage,
            w: imgH - 40,
            h: imgH - 40,
            r: 14,
            blur: 10,
            shadow: 'rgba(180,180,180,.4)',
            // 是否显示蒙层
            cover: false
        });

        positionY += 80;

        // 绘制中间容器,商品名称,超出25个字显示两行，多两行，显示省略号
        let product_name_text = that.data.canvasData.product_name
        if(product_name_text.length > 20){
            if(product_name_text.length > 40){
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,39)+"...";
            }else{
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,product_name_text.length);
            }
            canvas.drawMultiText({
                ctx,
                gap:5,
                text: product_name_text,
                x: left + innerLeft + 28,
                y: positionY + imgH - 120,
                fontSize: 30,
                color: '#030000'
            })
        }else{
            canvas.drawText({
                ctx: ctx,
                text: product_name_text,
                x: left + innerLeft + 28,
                y: positionY + imgH - 100,
                fontSize: 30,
                color: '#030000'
            });
        }

        // 商品低价；左侧对齐
        canvas.drawText({
            ctx: ctx,
            text: '底价 ￥',
            x: left + innerLeft + 28,
            y: positionY + imgH,
            fontSize: 25,
            baseline: 'normal',
            align: 'left',
            color: 'rgb(180,40,45)'
        });

        // 商品底价具体金额；左侧对齐
        ctx.font = '25px PingFang-SC-Bold';
        const metrics2 = ctx.measureText('底价 ￥').width;
        canvas.drawText({
            ctx: ctx,
            text: that.data.canvasData.current_price,
            x: left + innerLeft + 28 + metrics2,
            y: positionY + imgH,
            fontSize: 49,
            baseline: 'normal',
            align: 'left',
            color: 'rgb(180,40,45)'
        });

        // 商品原价；右侧对齐
        let original = '原价￥' + that.data.canvasData.original;
        canvas.drawText({
            ctx: ctx,
            text: original,
            x: w - left - innerLeft - 21,
            y: positionY + imgH,
            fontSize: 25,
            baseline: 'bottom',
            align: 'right',
            color: '#858585',
            underLine: true
        });
        //绘制分割线
        canvas.roundBorderRect({
            ctx,x:left + innerLeft + 40, y:positionY + imgH  + 28, h:0.1, w:imgH - 80, r:0,border:"#eeeeee"
        })

        if(status)positionY += 40;

        // 绘制二维码
        positionY = positionY + imgH - 30;
        let rest = status ? 37 : 74;    // 此处数值37以及74可根据总高度减去占用高度计算出来
        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.qrcodePath,
            x: left + innerLeft,
            y: positionY + rest,
            w: qrode_r * 2,
            h: qrode_r * 2
        });

        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + qrode_r * 2 + 30,
            y: positionY + rest + qrode_r - 8,
            text: '长按识别小程序码 即可帮我砍价~',
            fontSize: 26,
            baseline: 'bottom',
            color: '#030000'
        });

        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + qrode_r * 2 + 30,
            y: positionY + rest + qrode_r + 8,
            text: '感恩我的世界有一个美丽的你！',
            fontSize: 24,
            baseline: 'top',
            color: '#858585'
        });

        // 画帮砍者头像
        let kanArr = that.data.canvasData.kanuser_list;
        // 第一名头像半径
        let r1 = 54;
        // 第二、第三名头像半径
        let r2 = 46;
        // 各位头像的x轴距离
        let valueX = { 1: 297, 2: 170, 3: 442 };
        let imgMap = { 1: that.data.BASE_IMG_URL+'images/gold.png', 2: that.data.BASE_IMG_URL+'images/silver.png', 3: that.data.BASE_IMG_URL+'images/copper.png' };
        function canvasKanuser(kanArr, num) {
            for (let i = 1; i <= 3; i++) {
                // y轴距离
                let valueY = i === 1 ? 59 : 77;
                // 头像半径
                let r = i === 1 ? r1 : r2;
                let img = that.data.canvasData.noPeople;

                canvas.drawImage({
                    ctx: ctx,
                    img: imgMap[i],
                    x: left + innerLeft + valueX[i] - 12,
                    y: bugY + valueY - 12,
                    w: r * 2 + 24,
                    h: r * 2 + 24
                });

                if (i == 3) {
                    canvas.drawImage({
                        ctx: ctx,
                        img: img,
                        x: left + innerLeft + valueX[i],
                        y: bugY + valueY,
                        w: r * 2,
                        h: r * 2
                    });
                }
            }
        }

        function canvasKanuser2(kanArr, num) {
            for (let i = 1; i < 3; i++) {
                // y轴距离
                let valueY = i === 1 ? 59 : 77;
                // 头像半径
                let r = i === 1 ? r1 : r2;
                let img = i > num ? that.data.canvasData.noPeople : kanArr[i - 1];

                canvas.circleImg({
                    ctx: ctx,
                    img: img,
                    r: r,
                    x: left + innerLeft + valueX[i],
                    y: bugY + valueY
                });
            }
        }

        canvasKanuser();
        switch (kanArr.length) {
            case 1: // 第一名
                canvasKanuser2(kanArr, 1)
                break;
            case 2:
                canvasKanuser2(kanArr, 2)
                break;
            default:
                canvasKanuser2(kanArr, 2)
                break;
        }

        // 最终绘出画布
        ctx.draw();

    },
    // 画图 18-04-24 created by cms_ssa
    save: function (o) {
        let that = this;
        canvas.canvasToTempFilePath(o).then(function (res) {
            // console.log(res);
            wx.hideLoading();
            o.imgSrc = res.tempFilePath;
            canvas.saveImageToPhotosAlbum(o).then(function (res) {
                // console.log(res);
                wx.showModal({
                    title: '存图成功',
                    content: '图片成功保存到相册了，去发圈噻~',
                    showCancel: false,
                    confirmText: '好哒',
                    confirmColor: '#72B9C3',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            that.dialog.hideDialog();
                            wx.previewImage({
                                urls:[o.imgSrc],
                                current:o.imgSrc
                            })
                        }
                    }
                })
            }, function (err) {
                console.log(err);
            });
        }, function (err) {
            console.log(err);
        });
    },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({error});
        this.setData({
            applet_guide_subscribe: false
        })
    }

})
