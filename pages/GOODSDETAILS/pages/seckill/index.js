
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
        duration: 500,
        maskShow: false,
        resultShow: false,
        teamShow: false,
        id: 249, //248,
        banners: [],
        proInfo: '',
        instant: new Date(),
        c_endTime: '', // 可以下单的时间
        isSecKill: false,
        currenttime: '',
        leftCode: '<<',
        rightCode: '>>',
        shoppingCatButton: '', // 底部按钮文案
        buttonColor: 'redBtn', // 底部按钮颜色
        payType: 0, // 底部按钮绑定事件====》0: 无  gopay:立即购买  payNow：支付  goPayCommon：原价购买，走普通订单
        show_seckill_price: '0',
        show_origin_price: '0',
        itemWindowShow: false,
        kcNum: '',
        num1: 1,
        skuPriceData_sub: [],
        shoppingData: {
            shoppingShow: false,
            shoppingCatData: '',
            deliver_date_index: 0,
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
        firstShow: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(e) {
        console.log("秒杀页面参数",e);
        var that = this;
        publicFun.setBarBgColor(app, that); // 设置导航条背景色
        publicFun.height(that);

        var id = '';
        var preview = 0;

        if (e.scene != undefined) { // 预览模式
            that.setData({
                firstShow: false
            });
            var scene_id = decodeURIComponent(e.scene);
            if (scene_id) {
                let url = 'app.php?c=store&a=get_share_data',
                data = {
                scene_id: scene_id
                };
                common.post(url, data ,function(result){
                    console.log("秒杀",result);
                    if(result.err_code == 0){
                      app.globalData.store_id = result.err_msg.store_id;
                      app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid  
                        if(!e.uid && "undefined" != typeof result.err_msg.uid){
                        e.uid = result.err_msg.uid;
                     }
                      that.setData({
                        id:  result.err_msg.activity_id,
                        preview: 1,
                        uid: e.uid ? e.uid : ''
                    })
                    that.getDetails();
                    }
                  },'');

            }
        } else { // 正常模式
            console.log('normal')
            id = e.id;
            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
            getApp().globalData.shareType = e.shareType || 2;
        }
        var bgcolor = app.globalData.navigateBarBgColor;
        that.setData({
            id: id,
            preview: preview,
            uid: e.uid ? e.uid : '',
            bgcolor
        })

        // 获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            },
        });
        //拉粉注册分享人id  分享来源1商品 2本店推广；
        // getApp().globalData.share_uid = e.share_uid || '';
        // getApp().globalData.shareType = e.shareType || 2;

        //是否展示分享图片
        app.shareWidthPic(that);
    },
    getDetails: function() {
        var that = this;
        var data = {
            seckill_id: that.data.id,
            uid: that.data.uid
        };
        common.post('app.php?c=seckill&a=seckill', data, 'getDetailsCallBack', that)
        //=========================检测登录授权====================================
        publicFun.checkAuthorize({
            pageData: that.data.allInfo,
            app: app,
            callbackFunc: '',
        })
        //=========================检测登录授权====================================
    },
    getDetailsCallBack: function(res) {
        var that = this;
        // 轮播图转化处理
        that.data.imgUrls = [];
        for (var i in res.err_msg.product_imgs) {
            that.data.imgUrls.push(res.err_msg.product_imgs[i].image)
        }
        // 价格显示处理
        that.data.show_seckill_price = res.err_msg.seckillInfo.seckill_price * 1 > 10000 ? (res.err_msg.seckillInfo.seckill_price * 1 / 10000).toFixed(2) + '万' : res.err_msg.seckillInfo.seckill_price;
        that.data.show_origin_price = res.err_msg.productInfo.price * 1 > 10000 ? (res.err_msg.productInfo.price * 1 / 10000).toFixed(2) + '万' : res.err_msg.productInfo.price;

        // 处理亲友团时间
        if (res.err_msg.shareUser && res.err_msg.shareUser.length > 0) {
            for (var i = 0; i < res.err_msg.shareUser.length; i++) {
                res.err_msg.shareUser[i].addtime_str = publicFun.setDate(res.err_msg.shareUser[i].add_time)
            }
        }

        that.setData({
            originTotal: that.data.show_seckill_price,
            instant: new Date(),
            imgUrls: that.data.imgUrls,
            order_info: res.err_msg.order_info,
            proInfo: res.err_msg.productInfo,
            seckillInfo: res.err_msg.seckillInfo,
            kcNum: res.err_msg.seckillInfo.quantity,
            allInfo: res.err_msg,
            skuList: res.err_msg.sku_list,
            propertyList: res.err_msg.property_list ? res.err_msg.property_list : [],
            c_endTime: res.err_msg.my_start * 1000,
            currenttime: res.err_msg.currenttime * 1000,
            show_seckill_price: that.data.show_seckill_price,
            show_origin_price: that.data.show_origin_price,
        })
        console.log("[[[[[[[[[[[[[[[[[[[[[-------------------------", res, res.err_msg.seckillInfo.sku_id)
        publicFun.barTitle(that.data.seckillInfo.name); //修改头部标题

        // 富文本处理
        var guizeHtml = that.data.seckillInfo.description ? that.data.seckillInfo.description : "暂无活动说明";
        var infoHtml = that.data.proInfo.info;
        wxParse.wxParse('infoHtml', 'html', infoHtml, that, 0);
        wxParse.wxParse('guizeHtml', 'html', guizeHtml, that, 0);

        // 处理购买按钮
        if (that.data.allInfo.Auditing_status * 1 >= 1) {
            if (that.data.allInfo.is_start == 1) {
                that.data.shoppingCatButton = '活动未开始';
                that.data.buttonColor = 'grayBtn';
                that.data.payType = '';
            }
            if (that.data.allInfo.is_start == 3) {
                that.data.shoppingCatButton = '活动已关闭';
                that.data.buttonColor = 'grayBtn';
                that.data.payType = '';
            }
            if (that.data.allInfo.is_start == 2) { // 活动已结束或活动进行中，用户已秒杀付款成功
                that.data.shoppingCatButton = '原价购买';
                that.data.buttonColor = 'redBtn';
                that.data.payType = 'goPayCommon';
            }
            if (that.data.allInfo.is_start == 4) {
                if (that.data.allInfo.is_seckilled == 1 && that.data.order_info.status * 1 < 2) { // 参加过秒杀 但属于 临时订单或未付款
                    that.data.shoppingCatButton = '支付';
                    that.data.buttonColor = 'redBtn';
                    that.data.payType = 'payNow';
                }
                if (that.data.allInfo.is_seckilled == 1 && that.data.order_info.status * 1 >= 2) { // 参加过秒杀 并 支付成功
                    that.data.shoppingCatButton = '原价购买';
                    that.data.buttonColor = 'redBtn';
                    that.data.payType = 'goPayCommon';
                }
                if (that.data.allInfo.is_seckilled != 1 && that.data.allInfo.quantity * 1 > 0) { // 未参加过秒杀 且 商品有库存
                    that.data.shoppingCatButton = '立即购买';
                    that.data.buttonColor = 'redBtn';
                    that.data.payType = 'gopay';
                }
                if (that.data.allInfo.is_seckilled != 1 && that.data.allInfo.quantity * 1 == 0) { // 未参加过秒杀 且 商品无库存
                    that.data.shoppingCatButton = '商品已售罄';
                    that.data.buttonColor = 'grayBtn';
                    that.data.payType = '';
                }
            }
        } else {
            that.data.shoppingCatButton = '活动未审核';
            that.data.buttonColor = 'grayBtn';
            that.data.payType = 'gopay';
        }
        that.setData({
            shoppingCatButton: that.data.shoppingCatButton,
            buttonColor: that.data.buttonColor,
            payType: that.data.payType,
        })
        //设置初始属性
        that.setDefaultAttr(that.data.propertyList);


        // 处理秒杀计时器
        if (that.data.allInfo.is_start == 1) { // 活动未开始
            that.setData({
                c_endTime: res.err_msg.my_start * 1000
            })
            that.timeShow();
        } else if (that.data.allInfo.is_start == 4) { // 活动已开始
            that.setData({
                isSecKill: true,
                c_endTime: res.err_msg.seckillInfo.end_time * 1000,
            })
            that.timeShow();
        }
    },
    timeShow: function() {
        var that = this;
        var endtime = new Date(that.data.c_endTime); //结束时间
        that.setData({
            currenttime: that.data.currenttime + 1000
        })
        var today = new Date(that.data.currenttime); //当前时间
        // console.log(today)

        var delta_T = endtime.getTime() - today.getTime(); //时间间隔
        // console.log('delta_T = ==== ', delta_T)
        if (delta_T < 0) {
            that.setData({
                total_show: '00',
                hours_show: '00',
                minutes_show: '00',
                seconds_show: '00'
            })
            clearTimeout(publicFun.timer);
            if (that.data.allInfo.is_start === 1) {
                that.getDetails()
            }
            if (that.data.allInfo.is_start === 4) {
                that.getDetails()
            }
            return;
        }
        publicFun.timer = setTimeout(that.timeShow, 1000);
        var total_days = delta_T / (24 * 60 * 60 * 1000), //总天数
            total_show = Math.floor(total_days), //实际显示的天数
            total_hours = (total_days - total_show) * 24, //剩余小时
            hours_show = Math.floor(total_hours), //实际显示的小时数
            total_minutes = (total_hours - hours_show) * 60, //剩余的分钟数
            minutes_show = Math.floor(total_minutes), //实际显示的分钟数
            total_seconds = (total_minutes - minutes_show) * 60, //剩余的分钟数
            seconds_show = Math.round(total_seconds); //实际显示的秒数
        if (seconds_show == 60) seconds_show = 59;

        if (total_show <= 15) {}
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
    compareTime: function(t) {
        var that = this;
        var today = new Date((new Date().getTime() - new Date(that.data.instant).getTime()) + new Date(that.data.allInfo.currenttime * 1000).getTime()); //当前时间
        var targetTime = new Date(t * 1000); //结束时间
        if (today.getTime() < targetTime.getTime()) {
            return true
        } else {
            return false
        }
    },
    // 秒杀下单
    gopay: function() {
        var that = this;
        let data = {};
        data.product_id = that.data.seckillInfo.product_id;
        data.is_add_cart = 0; //是否加入购物袋
        data.send_other = 0;
        data.sku_id = that.data.shoppingData.sku_id;
        data.custom = [];
        data.quantity = 1;
        data.storeId = that.data.seckillInfo.store_id;
        data.activityId = that.data.seckillInfo.pigcms_id;
        data.type = 50;
        data.seckill_id = that.data.id;

        console.log(that.data.propertyList.length, "===www===", that.data, that.data.shoppingData, that.data.shoppingData.sku_id, "that.data.shoppingData.sku_idthat.data.shoppingData.sku_idthat.data.shoppingData.sku_id")

        // 判斷是否是多規格
        if (that.data.shoppingData.sku_id ) {
            if ((that.data.shoppingData.name) && (that.data.shoppingData.name.length == that.data.propertyList.length)) {
                common.post('app.php?c=seckill&a=save_order', data, "getOrder", that);
            } else {
                return wx.showToast({
                    title: "请选择商品规格",
                    icon: "none"
                });
            }
        } else {
            common.post('app.php?c=seckill&a=save_order', data, "getOrder", that);
        }




    },

    getOrder: function(res) {
        var that = this;
        wx.navigateTo({
            url: '/pages/payment/index?order_no=' + res.err_msg,
        })
    },
    // 秒杀支付
    payNow: function() {
        var that = this;
        clearTimeout(publicFun.timer);
        wx.navigateTo({
            url: '/pages/payment/index?order_no=' + that.data.allInfo.order_info.order_no
        })
    },
    // 原价购买
    goPayCommon: function() {
        var that = this;
        let data = {};
        data = {
            quantity: 1,
            sku_id: that.data.seckillInfo.sku_id,
            send_other: 0,
            is_add_cart: 0,
            type: 0,
            custom: [],
            product_id: that.data.seckillInfo.product_id,
        };
        publicFun.warning('订单处理中，请稍后...', that);
        common.post('app.php?c=order&a=add', data, payment, '');

        function payment(result) { //去支付
            if (result.err_code == 1010) {
                publicFun.promptMsg(result.err_msg.msg_txt, '知道了', '', right);

                function right() {
                    wx.redirectTo({
                        url: '/pages/user/order/index?order=' + result.err_msg
                    })
                }
            }
            if (result.err_code == 0) {
                var order_no = result.err_msg;
                publicFun.paymentGo(order_no)
            }
        };
    },

    shareClick: function() {
        wx.showShareMenu({
            withShareTicket: false
        })
    },
    checkTeamAll: function() {
        var that = this;
        that.setData({
            teamShow: true,
            maskShow: true
        });
    },

    //点击查看大图
    previewImage: function(e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.imgUrls // 需要预览的图片http链接列表
        })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
        clearTimeout(publicFun.timer);
        if(that.data.firstShow){
            that.getDetails();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        clearTimeout(publicFun.timer);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    formSubmit: function(e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        if (!app.isLoginFun(this)) { //判断用户是否登录
            common.setUserInfoFun(this, app);
            return false;
        }
        // console.log(e.detail.target.dataset.bindtap);
        let bindType = e.detail.target.dataset.bindtap
        publicFun.formSubmit({
            e: e,
            that: that,
            callBack: that[bindType]
        });
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        var that = this;
        var f = that.data.allInfo.seckill_user.seckill_user_id;
        let title = that.data.seckillInfo.name ? that.data.seckillInfo.name : '秒杀活动';
        var image = '';
        if (that.data.imgUrls && that.data.imgUrls[0]) {
            image = that.data.imgUrls[0];
        }
        return getApp().shareGetFans(title, '', '/pages/GOODSDETAILS/pages/seckill/index', 1, image, `&id=${that.data.id}&uid=${f}`);
    },
    /*
     *
     **分享对话框 shareModal start
     *
     */

    //显示对话框
    shareTap: function() {
        var that = this;
        if (!app.isLoginFun(this)) { //判断用户是否登录
            common.setUserInfoFun(this, app);
            return false;
        }
        that.dialog.showDialog();
    },

    //取消事件
    _cancelEvent: function() {
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
    _shareGroup: function() {
        var that = this;
        console.log('点击了分享好友或群');
        wx.showShareMenu({
            withShareTicket: false
        })
    },
    //分享朋友圈
    _shareFriendsCircle: function() {
        var that = this;
        console.log('点击了分享朋友圈');
        let ticket = wx.getStorageSync('ticket');
        console.log("=======拼团-ticket", ticket)
        let data = {
            path: 'pages/GOODSDETAILS/pages/seckill/index',
            id: that.data.id,
            uid: that.data.allInfo.seckill_user.seckill_user_id,
            share_uid: getApp().globalData.my_uid,
            shareType: "activity",
            activity_type :"seckill"
        }
        wx.request({
            url: common.Url + 'app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
            header: {
                'Content-Type': 'application/json'
            },
            data: data,
            method: "POST",
            success: function(res) {
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
            fail: function(res) {

            }
        })

    },
    /*
     *
     **分享对话框 shareModal end
     *
     */
    // 生成分享海报
    creatPost: function() {
        var that = this;
        // 1 设置画布数据
        let product_name = that.data.allInfo.productInfo.name;
        let seckill_price = canvasFun.formatPrice(that.data.allInfo.seckillInfo.seckill_price);
        let is_advance = that.data.allInfo.is_start == 1 && that.data.allInfo.seckillInfo.preset_time > 0;
        let BASE_IMG_URL = that.data.BASE_IMG_URL;
        var canvasData = { // 画布数据
            status: true,
            canvasId: 'seckillPost',
            // canvasWidth: 500,
            // canvasHeight: 680,
            // paddingLeft: that.data.winWidth * 0.15,
            // paddingTop: that.data.winWidth * 0.15,
            canvasWidth: 750,
            canvasHeight: 960 + 290,
            paddingLeft: 0,
            paddingTop: 0,
            radius: 10,
            bg_color: '#ffffff', // 画图填充背景色（不设置默认会生成透明背景的图片）
            miaosha: BASE_IMG_URL + 'images/miaosha.jpg',
            whiteBg: BASE_IMG_URL + 'images/white_bg.png',
            is_advance: is_advance, // 是否提前
            heartPath: BASE_IMG_URL + 'images/heart.png', // 爱心图标
            product_name: product_name, // 活动名称
            seckill_price: seckill_price,
            text_qrcode_btm: '长按识别小程序码，即可查看~', // 二维码下方文字
            text_qrcode_top: '长按识别小程序码  即可祝我提前~', // 二维码右侧上方文字（秒杀中）
            text_qrode_bottom: '感恩我的世界有一个美丽的你', // 二维码右侧上方文字（秒杀中）
            // 图片数据
            bgPath: BASE_IMG_URL + 'images/white_bg.png', // 海报背景图
            avatarPath: that.data.allInfo.userinfo.avatar, // 用户头像
            qrcodePath: that.data.qrcodePath, // 二维码
            productImage: 'https://' + that.data.allInfo.product_imgs[0].image.split('://')[1], // 商品首图
            loadFailTapStatus: false, // 下载失败处理函数是否已执行
        };
        console.log('is_advance ==== ', is_advance)
        let obj = canvas.px2rpx({
            w: canvasData.canvasWidth,
            h: canvasData.canvasHeight,
            base: that.data.winWidth
        });
        that.setData({
            canvasData: canvasData,
            canvasPosition: obj
        })

        setTimeout(() => { // 防止this.setData()此异步操作没有成功执行完毕
            loopDownLoadFile('productImage', that.data.canvasData.productImage);
            loopDownLoadFile('qrcodePath', that.data.canvasData.qrcodePath);
            loopDownLoadFile('avatarPath', that.data.canvasData.avatarPath);

            // 检测是否所有downloadFile方法成功执行完毕
            let xhrStatusArr = []; // 用于检测downloadFile方法的执行
            let xhrLength = 3; // 预先定义好要下载的图片的数量，以供检测是否全部下载完毕
            console.log('xhrLength === ', xhrLength)
            let loopDownloadTimer = setInterval(function() {
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
                    setTimeout(function() {
                        let w = that.data.canvasData.canvasWidth;
                        let h = that.data.canvasData.canvasHeight;
                        that.save({
                            id: that.data.canvasData.canvasId,
                            w: w,
                            h: h,
                            targetW: w * 4,
                            targetH: h * 4
                        });
                    }, 500)
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
                            success: function(res) {
                                console.info("下载一个文件成功");
                                that.data.canvasData[name].push(res.tempFilePath);
                                that.setData({
                                    canvasData: that.data.canvasData
                                })
                                xhrStatusArr.push(true)
                            },
                            fail: function(e) {
                                console.info("下载一个文件失败");
                                xhrStatusArr.push(false)
                                if (!that.data.canvasData.loadFailTapStatus) canvasFun.loadFailTap(that, loopDownloadTimer)
                            }
                        })
                    }
                } else {
                    wx.downloadFile({
                        url: urls,
                        success: function(res) {
                            console.info("下载一个文件成功");
                            that.data.canvasData[name] = res.tempFilePath;
                            that.setData({
                                canvasData: that.data.canvasData
                            })
                            xhrStatusArr.push(true)
                        },
                        fail: function(e) {
                            console.info("下载一个文件失败");
                            xhrStatusArr.push(false)
                            if (!that.data.canvasData.loadFailTapStatus) canvasFun.loadFailTap(that, loopDownloadTimer)
                        }
                    })
                }

            }

        }, 1000)

    },
    // 画图 18-04-24 created by cms_ssa
    drawCanvas: function() {
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
            blur: 20,
            shadow: 'rgba(180,180,180,.4)'
        });

        // 绘制头像
        positionY = top + 47;
        canvas.circleImg({
            ctx: ctx,
            img: that.data.canvasData.avatarPath,
            r: head_r,
            x: left + 68,
            y: positionY,
            w: head_r * 2,
            h: head_r * 2
        });

        let status = that.data.canvasData.is_advance;
        console.log(that.data.canvasData);
        let _text = '我看上了这款商品\n长按识别小程序码 可以助我\n提前秒杀，感激涕零~';
        if (!status) {
            _text = '我看上了这款商品\n帮我看看咋样啊~\n比心~     ~';

            ctx.font = '30px PingFang-SC-Bold'
            let textW = ctx.measureText('比心~ ').width;
            canvas.drawImage({
                ctx: ctx,
                img: that.data.canvasData.heartPath,
                x: left + head_r * 2 + 109 + textW,
                y: top + 41 + (30 + 12) * 2,
                w: 30,
                h: 30
            });
        }
        canvas.drawMultiText({
            ctx: ctx,
            text: _text,
            x: left + head_r * 2 + 113,
            y: top + 41,
            fontSize: 30,
            gap: 12
        });

        // 绘制中间容器
        positionY = positionY + head_r * 2 + 39;

        canvas.roundImg({
            ctx: ctx,
            x: left + innerLeft + 40,
            y: positionY,
            img: that.data.canvasData.productImage,
            w: imgH - 80,
            h: imgH - 80,
            r: 14,
            blur: 14,
            shadow: 'rgba(180,180,180,.4)',
            // 是否显示蒙层
            cover: false,
            // 蒙层高度
            coverH: 140
        });

        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.miaosha,
            x: left + innerLeft + 38,
            y: positionY + imgH - 113,
            w: 100,
            h: 32
        });

        // 绘制中间容器,商品名称,超出25个字显示两行，多两行，显示省略号
        let product_name_text = that.data.canvasData.product_name;
        if (product_name_text.length > 20) {
            if (product_name_text.length > 40) {
                product_name_text = product_name_text.slice(0, 20) + '\n' + product_name_text.slice(20, 39) + "...";
            } else {
                product_name_text = product_name_text.slice(0, 20) + '\n' + product_name_text.slice(20, product_name_text.length);
            }
            canvas.drawMultiText({
                ctx,
                gap: 5,
                text: product_name_text,
                x: left + innerLeft + 40,
                y: positionY + imgH - 140 + 100,
                fontSize: 30,
                baseline: 'middle',
                color: '#030000'
            })
        } else {
            canvas.drawText({
                ctx: ctx,
                text: product_name_text,
                x: left + innerLeft + 40,
                y: positionY + imgH - 140 + 100,
                fontSize: 30,
                baseline: 'middle',
                color: '#030000'
            });
        }

        // 绘制中间容器,商品价格
        // 右对齐的文字是以x的距离右对齐
        canvas.drawText({
            ctx: ctx,
            text: '¥' + that.data.canvasData.seckill_price,
            x: left + innerLeft + 40,
            y: positionY + imgH + 28,
            fontSize: 50,
            color: '#b4282d',
        });


        //绘制分割线
        canvas.roundBorderRect({
            ctx,
            x: left + innerLeft + 40,
            y: positionY + imgH + 120,
            h: 0.1,
            w: imgH - 80,
            r: 0,
            border: "#eeeeee"
        })

        // 绘制二维码
        positionY = positionY + 466 + 24 - 30;
        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.qrcodePath,
            x: left + innerLeft + 10,
            y: positionY + 290 + 100,
            w: qrode_r * 2,
            h: qrode_r * 2
        });

        // 绘制二维码右侧文字
        if (status) {
            canvas.drawText({
                ctx: ctx,
                text: '长按识别小程序码 即可助我提前~',
                x: left + innerLeft + qrode_r * 2 + 30,
                y: positionY + 290 + 100 + qrode_r - 28 - 14,
                fontSize: 28,
                color: '#030000'
            });

            canvas.drawText({
                ctx: ctx,
                text: '感恩我的世界有一个美丽的你！',
                x: left + innerLeft + qrode_r * 2 + 32,
                y: positionY + 290 + 100 + qrode_r - 14 + 28,
                fontSize: 24,
                color: '#858585'
            });
        } else {
            canvas.drawText({
                ctx: ctx,
                text: '长按识别小程序码 即可查看~',
                x: left + innerLeft + qrode_r * 2 + 41,
                y: positionY + qrode_r + 290 + 100,
                fontSize: 30,
                baseline: 'middle',
                color: '#030000'
            });
        }

        // 最终绘出画布
        ctx.draw();
    },
    // 画图 18-04-24 created by cms_ssa
    save: function(o) {
        let that = this;
        canvas.canvasToTempFilePath(o).then(function(res) {
            // console.log(res);
            wx.hideLoading();
            o.imgSrc = res.tempFilePath;
            canvas.saveImageToPhotosAlbum(o).then(function(res) {
                // console.log(res);
                wx.showModal({
                    title: '存图成功',
                    content: '图片成功保存到相册了，去发圈噻~',
                    showCancel: false,
                    confirmText: '好哒',
                    confirmColor: '#72B9C3',
                    success: function(res) {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            that.dialog.hideDialog();
                            wx.previewImage({
                                urls: [o.imgSrc],
                                current: o.imgSrc
                            })
                        }
                    }
                })
            }, function(err) {
                console.log(err);
            });
        }, function(err) {
            console.log(err);
        });
    },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({
            error
        });
        this.setData({
            applet_guide_subscribe: false
        })
    },
    oppenCat(e) {
        let that = this;
        // console.log(e.currentTarget.dataset.bindtap,e)
        console.log(e)
        if (e.currentTarget.dataset.bindtap == "payNow") {
            that.payNow()
        } else {
            that.setData({
                itemWindowShow: true
            })
        }


    },
    //遮罩点击
    maskClick: function() {
        var that = this;
        that.setData({
            maskShow: false,
            teamShow: false,
            itemWindowShow: false
        })
    },

    //设置初始默认属性
    setDefaultAttr: function(v) {
        var that = this;
        console.log(that.data);

        that.setData({
            'shoppingData.specList[0].vid': '',
            'shoppingData.value[0]': '',
            'shoppingData.specList[1].vid': '',
            'shoppingData.value[1]': '',
            'shoppingData.specList[2].vid': '',
            'shoppingData.value[2]': ''
        });
        // 单规格 默认选中处理
        let single_sku_single_value = false;
        let isAttr = true;
        let sku_id = '';
        if (that.data.skuList) {
            if (that.data.skuList.length == 1) {
                sku_id = that.data.skuList[0].sku_id;
                single_sku_single_value = true;
            }
        } else {
            isAttr = false;
        }
        that.setData({
            'shoppingData.sku_id': sku_id,
            'seckillInfo.sku_id': sku_id,

            'shoppingData.single_sku_single_value': single_sku_single_value,
            isAttr: isAttr
        });


        that.setAttrText();
        that.setData({
            propertyList: v
        })
    },
    //设置属性文字描述
    setAttrText: function() {
        var that = this;
        // var text = '', attrId = '', that = this;
        // for (var d of v) {
        //     for (var c of d.values) {
        //         if (c.flag == true) {
        //             text += c.value + ' ';
        //             attrId += d.pid + ':' + c.vid;
        //         }
        //     }
        // }

        // that.setData({
        //     attrId: attrId,
        //     attrText: text == '' ? '请选择规格' : text
        // })
        // console.log(attrId)
        // for (let i = 0; i < that.data.skuList.length; i++) {
        //     if (attrId == that.data.skuList[i].properties+',') {
        //         that.setData({
        //             currentSkuPrice: that.data.skuList[i].price,
        //             originTotal: (that.data.num * that.data.skuList[i].price).toFixed(2)
        //         })
        //     }
        // }

        let valueDate = '';
        let valueNmae = '';
        let pre_buyer_count = that.data.seckillInfo.pre_buyer_count * 1;
        let skuPriceData = that.data.skuList; //商品规格列表
        let quantity = (that.data.seckillInfo.presale_amount - pre_buyer_count) * 1; //商品库存数量
        // let shoppingNum = that.data.num * 1; //输入框数量
        let shoppingNum = 1;

        if ((skuPriceData == '' || skuPriceData == undefined) && shoppingNum > quantity) { //商品无规格时判断商品库存
            that.setData({
                num: quantity
            });
            wx.showToast({
                title: '超出库存！',
                icon: 'none',
                duration: 2000
            })
            return;
        }

        for (let i in that.data.shoppingData.value) { //添加规格列表
            if (that.data.shoppingData.value[i]) {
                valueDate += that.data.shoppingData.value[i] + ';';
                valueNmae += that.data.shoppingData.name[i] + ',';
            }
        }
        valueDate = valueDate.substring(0, valueDate.length - 1);
        valueNmae = valueNmae.substring(0, valueNmae.length - 1);
        for (let i in skuPriceData) { //判断规格产品的库存以及价格
            if (skuPriceData[i].properties.includes(valueDate)) {
                if (skuPriceData[i].quantity == 0) {
                    wx.showToast({
                        title: '超出库存！',
                        icon: 'none',
                        duration: 2000
                    })
                    return;
                }

                that.setData({
                    currentSkuPrice: skuPriceData[i].price,
                    originTotal: (shoppingNum * skuPriceData[i].price).toFixed(2),
                    attrText: valueNmae == '' ? '请选择规格' : valueNmae,
                    'shoppingData.sku_id': skuPriceData[i].sku_id
                });
                if (quantity < skuPriceData[i].quantity) {
                    if (quantity < shoppingNum) {
                        that.setData({
                            num: quantity,
                            originTotal: (quantity * skuPriceData[i].price).toFixed(2)
                        });
                        wx.showToast({
                            title: '超出库存！',
                            icon: 'none',
                            duration: 2000
                        })
                        return;
                    }
                } else {
                    if (skuPriceData[i].quantity < shoppingNum) {
                        that.setData({
                            num: skuPriceData[i].quantity,
                            originTotal: (skuPriceData[i].quantity * skuPriceData[i].price).toFixed(2)
                        });
                        wx.showToast({
                            title: '超出库存！',
                            icon: 'none',
                            duration: 2000
                        })
                        return;
                    }
                }

            }
        }
    },
    //自己手动设置属性

    setMyAttr: function(e) {
        var that = this;
        console.log(that.data.skuList, e, "ssssssssssssssss")
        let id = e.target.dataset.id;
        let vid = e.target.dataset.vid;
        let pid = e.target.dataset.pid;
        let name = e.target.dataset.name;
        if (that.data.shoppingData.specList[id].vid === vid) {
            return false;
        } else {
            let sku_id;
            let kcNum;
            if (that.data.skuList) {
                let skuPriceData_sub = that.data.skuList.filter(function(item) { //获取所有能与当前规格组合的商品规格列表
                    return item.properties.indexOf(`${pid}:${vid}`) > -1
                });
                let sku = that.data.skuList.find(item => item.properties.includes(`${pid}:${vid}`))
                console.log(sku, "skuiiiiiiiiiii", skuPriceData_sub, pid, vid)
                if (sku) {
                    sku_id = sku.sku_id;
                    kcNum = sku.quantity
                } else {
                    return wx.showToast({
                        title: '该规格无库存',
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
            id = id * 1;

            that.setData({
                [`shoppingData.specList[${id}].vid`]: vid,
                [`shoppingData.value[${id}]`]: pid + ':' + vid,
                [`shoppingData.name[${id}]`]: name,
                'shoppingData.sku_id': sku_id,
                'seckillInfo.sku_id': sku_id,
                kcNum: kcNum
            });
        }
        that.setAttrText(that);
    },
    //检查属性是否未填写完整
    checkAttr: function() {
        var that = this;
        var v = that.data.propertyList;
        var text = '';
        var l = that.data.propertyList.length;

        for (var d of v) {
            for (var c of d.values) {
                var n = 0;
                if (c.flag == true) {
                    n++
                }
                if (n == 0) {
                    text += d.name
                }
            }
        }
        if (text != '') {
            wx.showToast({
                title: text + '属性未选择',
                icon: 'success',
                duration: 2000
            })
            return false
        }
    },
    showItemWindow: function() {
        var that = this;
        console.log(that.data);
        if (that.data.shoppingData.sku_id != '' && (that.data.skuList != '' && that.data.skuList != undefined)) {
            that.setData({
                maskShow: true,
                itemWindowShow: true
            })
            that.setAttrText(that);
        } else {
            that.setData({
                maskShow: true,
                itemWindowShow: true,
                'shoppingData.specList[0].vid': '',
                'shoppingData.value[0]': '',
                'shoppingData.specList[1].vid': '',
                'shoppingData.value[1]': '',
                'shoppingData.specList[2].vid': '',
                'shoppingData.value[2]': ''
            })
        }
    },
    // shoppingVid: function(e) { //选择商品规格
    //   var that = this;
    //   publicFun.shoppingVid(e, that);
    // },

    addNum: function() {
        wx.showModal({
            title: '提示',
            content: '秒杀商品限购一件',
            success(res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },


})