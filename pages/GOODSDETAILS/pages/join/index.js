var common = require('../../../../utils/common.js');
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../../../utils/Tpublic.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvasFun = require('../../../../utils/canvas-post.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();
Page({
    data: {
        detailsTable: '',
        currentTab: 0,
        explainShow: false,
        scrollTop: {
            scroll_top: 0,
            goTop_show: false
        },
        scrollHeight: '',
        shoppingData: {
            shoppingShow: false,
            shoppingCatData: '',
            specList: [{
                'vid': 0
            }, {
                'vid': 0
            }, {
                'vid': 0
            }],
            value: '',
            sku_id: '',
            shoppingNum: 1,
        },
        item_id: '',
        team_id: '',
        tuan_id: '',
        type: '',
		preview: '',
        joinData: '',
        memberShow: false,
        is_end: false, //团购是否结束(日期)
        firstShow: true
    },
    onLoad: function (e) { // 页面渲染完成
        var that = this;
        console.log('分享的参数',e)
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        that.setData({
            tuan_id: e.tuan_id,
            team_id: e.team_id,
            item_id: e.item_id,
            type: e.type
        })
        if(e.store_id){//分享进入
            app.globalData.store_id = e.store_id
        }
        // ================处理页面参数=================
        let tuan_id = 0, team_id = 0, item_id = 0, type = 0;
        let preview = 0;
        if (e.scene != undefined) {
            that.setData({
                firstShow: false
              });
            var scene_id = decodeURIComponent(e.scene);
            if (scene_id) { // 预览模式 scene: 第一个数字是store_id(此处需排除)
                let url = 'app.php?c=store&a=get_share_data',
                data = {
                    scene_id: scene_id
                };
                common.post(url, data ,function(result){
                    console.log("123",result);
                    if(result.err_code == 0){
                        preview = 1;
                        that.setData({
                            tuan_id: result.err_msg.activity_id,
                            preview: preview,
                            team_id : result.err_msg.team_id,
                            item_id : result.err_msg.item_id,
                            type : result.err_msg.type,
                        });
                        app.globalData.store_id = result.err_msg.store_id;
                        app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid 
                        getApp().globalData.shareType = result.err_msg.shareType;      
                        common.tuanPost('webapp.php?c=tuan&a=tuan_info&tuan_id=' + that.data.tuan_id + '&team_id=' + that.data.team_id + '&item_id=' + that.data.item_id + '&type=' + that.data.type + '&preview=' + preview, '', "joinData", that);     
                    }
                    },''); 

            }
        } else { // 正常模式
            tuan_id = e.tuan_id;
            team_id = e.team_id;
            item_id = e.item_id;
            type = e.type;
            //拉粉注册分享人id  分享来源1商品 2本店推广；
            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
            getApp().globalData.shareType = e.shareType || 2;
            that.setData({
                tuan_id: tuan_id,
                team_id: team_id,
                item_id: item_id,
                type: type,
                preview: preview
            });
        }

        if(this.data.firstShow){
            common.tuanPost('webapp.php?c=tuan&a=tuan_info&tuan_id=' + that.data.tuan_id + '&team_id=' + that.data.team_id + '&item_id=' + that.data.item_id + '&type=' + that.data.type + '&preview=' + preview, '', "joinData", that);
        }
        // 获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            },
        })
        
    },
    onReady: function () {

    },
    onShow: function () {
        var that = this;
        // 此处调用ajax为严重问题，异步数据可能未获取
        // common.tuanPost('webapp.php?c=tuan&a=tuan_info&tuan_id=' + that.data.tuan_id + '&team_id=' + that.data.team_id + '&item_id=' + that.data.item_id + '&type=' + that.data.type + '&preview=' + preview, '', "joinData", that);
        let url = '/pages/GOODSDETAILS/pages/join/index?tuan_id=' + this.data.tuan_id + '&team_id=' + this.data.team_id + '&item_id=' + this.data.item_id + '&type=' + this.data.type;
        publicFun.height(that);
        publicFun.setUrl(url)

        if (this.data.joinData != '') {
            publicFun.setUrl('')
        }
    },
    joinData: function (result) {
        console.log(result)
        var that = this;
        if (result.err_code == 0) {
            let is_end = result.err_msg.current_time * 1 - result.err_msg.tuan.end_time * 1 > 0;
            this.setData({
                joinData: result.err_msg,
                is_end: is_end
            })
            if (this.data.joinData != '') {
                publicFun.setUrl('')
            }
            let status = this.data.joinData.tuan.status;
            publicFun.status(status, that);
            let barTitle = this.data.joinData.title;
            publicFun.barTitle(barTitle); //修改头部标题

            let text = this.data.joinData.product.info;
            let description = this.data.joinData.tuan.description;

            if (text != '') {
                text = wxParse.wxParse('text', 'html', text, that, 5);
            }
            if (description != '' && description != undefined) {
                description = wxParse.wxParse('description', 'html', description, that, 5);
            }
            this.setData({ //模板富文本转化
                productInfo: text,
                description: description
            });
        };

    },
    swichNav: function (e) {
        var that = this;
        publicFun.swichNav(e, that);
    },
    scrollTopFun: function (e) { //滚动条函数
        var that = this;
        publicFun.scrollTopFun(e, that)
    },
    goTopFun: function (e) { //回到顶部滚动条
        var that = this;
        publicFun.goTopFun(e, that)
    },
    closeShopping: function (e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    oppenShopping: function (e) { //加入购物袋
        var that = this
        publicFun.oppenShopping(e, that);
    },
    plus: function () { //加
        var that = this;
        publicFun.plus(that);
    },
    reduce: function () { //减
        var that = this;
        publicFun.reduce(that);
    },
    shoppingBlur: function (e) { //输入框
        var that = this;
        publicFun.shoppingBlur(e, that)
    },

    shoppingVid: function (e) { //选择商品规格
        var that = this;
        publicFun.shoppingVid(e, that);
    },
    payment: function () { //下一步,去支付
        var that = this;
        let data = {};
        data = {
            tuan_id: this.data.tuan_id,
            quantity: this.data.shoppingData.shoppingNum,
            type: this.data.type,
            team_id: this.data.team_id,
            sku_id: this.data.shoppingData.sku_id,
            item_id: this.data.item_id,
        };
        publicFun.payment(data, that)
    },
    shearLayer: function (e) {
        // var that = this;
        // publicFun.warning('点击屏幕右上角，邀请好友来参团!', that);
        wx.showShareMenu({
            withShareTicket: false
        })

    },
    closeMemberShow: function (e) { //关闭团员遮罩层
        this.setData({
            memberShow: false
        })
    },
    oppenMemberShow: function (e) { //开启团员
        this.setData({
            memberShow: true
        })
    },
    closeExplain: function (e) { //关闭拼团说明
        this.setData({
            explainShow: false
        })
    },
    oppenExplain: function (e) { //开启拼团说明
        this.setData({
            explainShow: true
        })
    },
    goBack: function (e) {
        wx.redirectTo({ url: '/pages/index/index' })
    },
    onShareAppMessage: function () {
      const { show_share_img, share_img } = app.globalData;
console.log('/pages/GOODSDETAILS/pages/join/index?tuan_id=' + this.data.tuan_id + '&team_id=' + this.data.team_id + '&item_id=' + this.data.item_id + '&type=' + this.data.type + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1" + '&store_id=' + app.globalData.store_id)
        return {
            title: this.data.joinData.wxapp_share.title,
            desc: this.data.joinData.wxapp_share.descript,
            path: '/pages/GOODSDETAILS/pages/join/index?tuan_id=' + this.data.tuan_id + '&team_id=' + this.data.team_id + '&item_id=' + this.data.item_id + '&type=' + this.data.type + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1" + '&store_id=' + app.globalData.store_id,
            imageUrl: show_share_img == 1 ? share_img : ''
        }
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
        console.log('点击了分享好友或群');
        wx.showShareMenu({
            withShareTicket: false
        })
    },
    //分享朋友圈
    _shareFriendsCircle: function () {
        var that = this;
        console.log('点击了分享朋友圈');
        let ticket = wx.getStorageSync('ticket');
        let data = {
            path: 'pages/GOODSDETAILS/pages/join/index',
            id: that.data.tuan_id,
            team_id:that.data.team_id,  
            item_id:that.data.item_id,  
            tuan_type:that.data.type,
            share_uid: getApp().globalData.my_uid,
            shareType: "activity",
            activity_type :"tuan"
        }
        wx.showLoading({
            title: '正在准备颜料...',
            mask: true
        })

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
                    //没有登录或没有openID,需要重新授权
                    if (res.data.err_code == 20000 || res.data.err_code == 10000) {
                        if (ticket) {
                            wx.setStorageSync('ticket', '');
                            ticket = '';
                        }
                        var config_data = common.getCurrentPages();
                        console.log(config_data)
                        app.getUserInfo({
                            pageThat: that,
                            refreshConfig: config_data,
                            callback: '',
                        });
                    }

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
        let product_name = canvasFun.formatText(that.data.joinData.product.name, 11);
        let min_price = canvasFun.formatPrice(that.data.joinData.product.min_price);
        let original_price = canvasFun.formatPrice(that.data.joinData.product.original_price);
        var canvasData = { // 画布数据
            status: true,
            canvasId: 'pullTuanPost',
            // canvasWidth: 500,
            // canvasHeight: 770,
            // paddingLeft: that.data.winWidth * 0.15,
            // paddingTop: that.data.winWidth * 0.15,
            canvasWidth: 750,
            canvasHeight: 1263,
            paddingLeft: 40,
            paddingTop: 50,
            radius: 10,
            bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
            bgPath: '../../../../images/white_bg.png', // 海报背景图
            product_name: product_name, // 名称
            min_price: min_price, // 团购价
            original_price: original_price, // 团原价
            tuan_num: that.data.joinData.tuan_config.number, // 团标准人数
            tuan_join_num: that.data.joinData.tuan_config.count, // 实际已参团人数
            text_qrcode_btm: '长按识别小程序码，即可参与拼团~', // 二维码下方文字
            loadFailTapStatus: false, // 下载失败处理函数是否已执行
            // 图片数据
            avatarPath: that.data.joinData.user.avatar, // 用户头像
            qrcodePath: that.data.qrcodePath, // 二维码
            productImage: 'https://' + that.data.joinData.product.image.split('://')[1], // 商品首图
        };
        let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
        that.setData({
            canvasData: canvasData,
            canvasPosition: obj
        });

        setTimeout(() => { // 防止this.setData()此异步操作没有成功执行完毕
            loopDownLoadFile('productImage', that.data.canvasData.productImage);
            loopDownLoadFile('qrcodePath', that.data.canvasData.qrcodePath);
            loopDownLoadFile('avatarPath', that.data.canvasData.avatarPath);

            // 检测是否所有downloadFile方法成功执行完毕
            let xhrStatusArr = []; // 用于检测downloadFile方法的执行
            let xhrLength = 3; // 预先定义好要下载的图片的数量，以供检测是否全部下载完毕
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
                    }, 500)
                    clearInterval(loopDownloadTimer)
                }
            }, 300)

            // 下载所需图片
            function loopDownLoadFile(name, urls) {
                console.log(urls);
                if (Array.isArray(urls) && urls.length > 0) {
                    that.data.canvasData[name] = [];
                    for (let i = 0; i < urls.length; i++) {
                        wx.downloadFile({
                            url: urls[i],
                            success: function (res) {
                                console.info("下载一个文件成功");
                                that.data.canvasData[name].push(res.tempFilePath);
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

        // 绘制背景图片
        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.bgPath,
            x: 0,
            y: 0,
            w: w,
            h: h
        });

        // 绘制白色圆角背景
        canvas.roundRect({
            ctx: ctx,
            x: left,
            y: top,
            w: w - left * 2,
            h: h - top * 2,
            r: 14,
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

        // 绘制头像右侧文字
        canvas.drawText({
            ctx: ctx,
            x: left + 68 + head_r * 2 + 45,
            y: positionY + head_r,
            text: '这里有场团战，等你来约！',
            baseline: 'middle',
            fontSize: 24
        });

        // 绘制团购价
        positionY = positionY + head_r * 2 + 10;
        let minPrice = '￥' + that.data.canvasData.min_price;
        canvas.drawText({
            ctx: ctx,
            x: w / 2,
            y: positionY,
            text: minPrice,
            align: 'center',
            color: '#030000',
            fontSize: 70
        });

        // 绘制原价
        let price = '￥' + that.data.canvasData.original_price;
        let number = that.data.canvasData.tuan_num + '人成团';
        ctx.font = '26px PingFang-SC-Bold';
        const metrics1 = ctx.measureText(price).width;
        const metrics2 = ctx.measureText(number).width;

        canvas.drawText({
            ctx: ctx,
            x: (w / 2) - 10 - (metrics1 / 2),
            y: positionY + 132,
            text: price,
            fontSize: 26,
            baseline: 'bottom',
            align: 'center',
            color: '#A3A3A3',
            underLine: true
        });

        // 绘制几人成团印章
        canvas.roundRect({
            ctx: ctx,
            x: (w / 2) + 10,
            y: positionY + 96,
            w: metrics2 + 20,
            h: 40,
            r: 4,
            bg: '#df6f61'
        });

        canvas.drawText({
            ctx: ctx,
            x: (w / 2) + 10 + 10 + (metrics2 / 2),       //由中部对齐，第一个10是印章margin，第二个10是内部padding
            y: positionY + 132,
            text: number,
            fontSize: 26,
            baseline: 'bottom',
            align: 'center',
            color: '#fff'
        });

        // 绘制中间容器
        canvas.roundImg({
            ctx: ctx,
            x: left + innerLeft,
            y: positionY + 170,
            img: that.data.canvasData.productImage,
            w: imgH,
            h: imgH,
            r: 14,
            blur: 14,
            shadow: 'rgba(180,180,180,.4)',
            // 是否显示蒙层
            cover: true,
            // 蒙层高度
            coverH: 140
        });

        // 商品名称
        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + 28,
            y: positionY + 170 + imgH - 70, // positionY + 170 + imgH是商品图底部x距离，减去70然后底部对齐
            text: that.data.canvasData.product_name,
            fontSize: 26,
            baseline: 'bottom',
            color: '#030000'
        });

        // 绘制二维码
        positionY = positionY + 170 + imgH - 30
        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.qrcodePath,
            x: left + innerLeft,
            y: positionY + 45,
            w: qrode_r * 2,
            h: qrode_r * 2
        });

        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + qrode_r * 2 + 30,
            y: positionY + 45 + qrode_r,
            text: '长按识别小程序码 即可参与拼团~',
            fontSize: 26,
            baseline: 'middle',
            color: '#030000'
        });

        // 最终绘出画布
        ctx.draw();
    },

    // 保存图片 18-04-24 created by cms_ssa
    save: function (o) {
        canvas.canvasToTempFilePath(o).then((res) => {
            // console.log(res);
            wx.hideLoading();
            o.imgSrc = res.tempFilePath;
            canvas.saveImageToPhotosAlbum(o).then((res) => {
                // console.log(res);
                wx.showModal({
                    title: '存图成功',
                    content: '图片成功保存到相册了，去发圈噻~',
                    showCancel: false,
                    confirmText: '好哒',
                    confirmColor: '#72B9C3',
                    success: res => {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            this.dialog.hideDialog();
                            wx.previewImage({
                                urls:[o.imgSrc],
                                current:o.imgSrc
                            })
                        }
                    }
                })
            }, err => {
                console.log('保存图片失败');
                this.showErr();
            });
        }, err => {
            console.log(err);
            this.showErr();
        });
    },

    // 画图
    creatCanvas: function () {
        var that = this;
        // 定义变量
        let valueY = that.data.canvasData.paddingTop;
        let r_avatar = 30; // 头像半径
        let r_qrcode = 50; // 二维码半径

        // 1生成画笔
        let ctx = wx.createCanvasContext(that.data.canvasData.canvasId);

        // 2设置画布背景及容器样式
        canvasFun.setPostStyle({
            that: that,
            ctx: ctx,
            paddingLeft: that.data.canvasData.paddingLeft,
            paddingTop: that.data.canvasData.paddingTop,
            radius: that.data.canvasData.radius,
            bg_color: that.data.canvasData.bg_color,
            bgPath: that.data.canvasData.bgPath
        });


        //====================================================
        // 绘制头像
        valueY = that.data.canvasData.paddingTop + 30;
        canvasFun.circleImg({
            that: that,
            ctx: ctx,
            img: that.data.canvasData.avatarPath,
            x: that.data.canvasData.paddingLeft + 40,
            y: valueY,
            r: r_avatar
        });

        ctx.setFillStyle('#000000');

        // 绘制文本
        canvasFun.createMultiText({
            that: that,
            ctx: ctx,
            text: '这里有场团战，等你来约！',
            position: 'start',
            y: valueY + r_avatar + 10,
            x: that.data.canvasData.paddingLeft + 40 + r_avatar * 2 + 35,
            fontSize: 17
        })

        // 绘制单行文本
        valueY += r_avatar * 2 + 30;
        canvasFun.createMultiText({
            that: that,
            ctx: ctx,
            text: '￥' + that.data.canvasData.min_price,
            position: 'end',
            y: valueY + 38,
            x: that.data.canvasData.paddingLeft + 120,
            fontSize: 45,
            color: '#000000'
        })

        // 绘制原价
        ctx.setFontSize(16);
        valueY += 30;
        let original_price_str = '￥' + that.data.canvasData.original_price;
        let original_price_width = ctx.measureText(original_price_str).width;
        canvasFun.createMultiText({
            that: that,
            ctx: ctx,
            text: original_price_str,
            position: 'start',
            y: valueY + 45,
            x: that.data.canvasData.canvasWidth / 2 - original_price_width,
            fontSize: 16,
            color: '#999999'
        })

        // 绘制原价贯穿线
        canvasFun.createLine({
            that: that,
            ctx: ctx,
            x0: that.data.canvasData.canvasWidth / 2 - original_price_width,
            y0: valueY + 45 - 6,
            x1: that.data.canvasData.canvasWidth / 2 + 10,
            y1: valueY + 45 - 6,
            stroke_color: '#999999'
        })

        // 绘制小长方形背景色
        let tuan_num_str = that.data.canvasData.tuan_num + '人成团';
        let tuan_num_width = ctx.measureText(tuan_num_str).width + 20;
        console.log('tuan_num_width === ', tuan_num_width);
        canvasFun.roundRect({
            that: that,
            ctx: ctx,
            paddingLeft: that.data.canvasData.paddingLeft + 10,
            paddingTop: valueY + 25,
            radius: 10,
            bg_color: '#DF6F61',
            w: tuan_num_width,
            h: 30,
            x: that.data.canvasData.canvasWidth / 2 + 15,
            y: valueY,
            shadow: '#ffffff'
        })

        // 绘制几人团标签
        canvasFun.createMultiText({
            that: that,
            ctx: ctx,
            text: tuan_num_str,
            position: 'start',
            y: valueY + 45,
            x: that.data.canvasData.canvasWidth / 2 + 25,
            fontSize: 15,
            color: '#ffffff'
        })

        // 绘制中部
        valueY += 45 + 30;
        canvasFun.roundRect({
            that: that,
            ctx: ctx,
            paddingLeft: that.data.canvasData.paddingLeft + 10,
            paddingTop: valueY,
            radius: 10,
            bg_color: '#ffffff',
            h: 300,
            img: that.data.canvasData.productImage,
            img_x: that.data.canvasData.paddingLeft + 10,
            img_y: valueY,
            img_w: that.data.canvasData.canvasWidth - (that.data.canvasData.paddingLeft + 10) * 2,
            img_h: 220
        })

        // 调用绘制多行文本
        valueY += 250;
        canvasFun.createMultiText({
            that: that,
            ctx: ctx,
            text: that.data.canvasData.product_name,
            fontSize: 20,
            position: 'start',
            x: that.data.canvasData.paddingLeft + 20,
            y: valueY,
        })


        // 7绘制方形图片---二维码
        valueY = that.data.canvasData.canvasHeight - that.data.canvasData.paddingTop - r_qrcode * 2 - 15;
        canvasFun.rectImg({
            that: that,
            ctx: ctx,
            img: that.data.canvasData.qrcodePath,
            position: 'left',
            x: that.data.canvasData.paddingLeft + 10,
            y: valueY,
            width: r_qrcode * 2,
            height: r_qrcode * 2
        })

        // 8调用绘制单行文本
        valueY = that.data.canvasData.canvasHeight - that.data.canvasData.paddingTop - r_qrcode - 10;
        canvasFun.createText({
            that: that,
            ctx: ctx,
            text: that.data.canvasData.text_qrcode_btm,
            fontSize: 16,
            position: 'start',
            x: that.data.canvasData.paddingLeft + r_qrcode * 2 + 15,
            y: valueY
        })

        // 最终绘出画布
        ctx.draw()
    },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({error});
        this.setData({
            applet_guide_subscribe: false
        })
    }


})
