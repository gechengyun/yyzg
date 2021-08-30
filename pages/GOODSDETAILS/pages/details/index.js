var common = require('../../../../utils/common.js');
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../../../utils/Tpublic.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvasFun = require('../../../../utils/canvas-post.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();
var shopPublic = require('../../../../utils/public.js');
Page({
    data: {
        detailsTable: '',
        currentTab: 0,
        scrollTop: {
            scroll_top: 0,
            goTop_show: false
        },
        scrollHeight: '',
        dateilsData: '',
        productInfo: '',
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
        },
        tuan_id: '',
        animationData: {},
        tuanHide:true,
        firstShow: true
    },
    onLoad: function (e) { // 页面渲染完成
        console.log('分享的参数',e)
        var that = this;
        shopPublic.setBarBgColor(app, that);// 设置导航条背景色

        if(e.store_id){//分享进入
            app.globalData.store_id = e.store_id
        }
        var tuan_id = '';
        var preview = 0;
        if (e.scene != undefined) {
            that.setData({
                firstShow: false
              });
            var scene_id = decodeURIComponent(e.scene);
            console.log("GOODSDETAILS/pages/details/index.js",scene_id);
            if (scene_id) { // 预览模式
                let url = 'app.php?c=store&a=get_share_data',
                    data = {
                    scene_id: scene_id
                    };
                common.post(url, data ,function(result){
                console.log("123",result);
                if(result.err_code == 0){
                    preview = 1;
                    //tuan_id = 这里tuan_id  文档里没看到
                    //tuan_id = result.err_msg.active_id;
                    that.setData({
                        tuan_id: result.err_msg.activity_id,
                        preview: preview,
                    });
                    app.globalData.store_id = result.err_msg.store_id;
                    app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid       
                    that.readyOn();            
                }
                },''); 
                // tuan_id = scene.split(',')[1];
                // preview = 1;
                //app.globalData.store_id = scene.split(',')[0];
                //app.globalData.share_uid = scene.split(',')[3];
            }
        } else { // 正常模式
            tuan_id = e.tuan_id;
            that.setData({
                tuan_id: tuan_id,
                preview: preview
            });
            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid ||  '';
            getApp().globalData.shareType = e.shareType || 2;
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
        });
      //是否展示分享图片
      app.shareWidthPic(that);

      //拉粉注册分享人id  分享来源1商品 2本店推广；
      // getApp().globalData.share_uid = e.share_uid || '';
      // getApp().globalData.shareType = e.shareType || 2;
    },
    onReady: function () {
        if(this.data.firstShow){
            this.readyOn();
          }
    },
    onShow: function () {
        if (this.data.dateilsData != '') {
            publicFun.setUrl('')
        }
    },
    readyOn:function (){
        var animation = wx.createAnimation({
            duration: 5000,
            delay: 100,
            timingFunction: 'ease'
        })
        this.animation = animation;
        var that = this;
        publicFun.height(that);
        common.tuanPost('webapp.php?c=tuan&a=detail&tuan_id=' + that.data.tuan_id + '&preview=' + that.data.preview, '', "setIndexData", that);
        let url = '/pages/GOODSDETAILS/pages/details/index?tuan_id=' + this.data.tuan_id;
        publicFun.setUrl(url)
    },
    setIndexData: function (result) {
        var that = this;
        if (result.err_code == 0) {
8          // result.err_msg.team_list = [...result.err_msg.team_list, ...result.err_msg.team_list, ...result.err_msg.team_list, ...result.err_msg.team_list]
            // 转换时间格式
            for (let i = 0; i < result.err_msg.team_list.length; i++) {
                result.err_msg.team_list[i].end_time_txt = publicFun.dataCode(result.err_msg.team_list[i].end_time * 1000, 'full_fenzhong');
            }
            result.err_msg.tuan.start_time_txt = publicFun.dataCode(result.err_msg.tuan.start_time * 1000, 'full_fenzhong');
            result.err_msg.tuan.end_time_txt = publicFun.dataCode(result.err_msg.tuan.end_time * 1000, 'full_fenzhong');
            this.setData({
                dateilsData: result.err_msg
            })
            if (this.data.dateilsData != '') {
                publicFun.setUrl('')
            }
            let status = this.data.dateilsData.tuan.status;
            publicFun.status(status, that);
            let barTitle = this.data.dateilsData.title;
            publicFun.barTitle(barTitle); //修改头部标题
            let text = this.data.dateilsData.product.info;
            let description = this.data.dateilsData.tuan.description_html;

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
        }

    },
    swichNav: function (e) {
        var that = this;
        publicFun.swichNav(e, that);
    },
    collect: function (e) { //点击收藏
        var that = this;
        publicFun.collection(that);

    },
    shoppingVid: function (e) { //选择商品规格
        var that = this;
        publicFun.shoppingVid(e, that);
    },
    payment: function () { //下一步,去支付
        var that = this;
        let data = {};
        data = {
            tuan_id: this.data.shoppingData.shoppingCatData.tuan_config.tuan_id,
            quantity: this.data.shoppingData.shoppingNum,
            type: this.data.shoppingData.shoppingCatData.tuan_config.grade_type,
            team_id: '',
            sku_id: this.data.shoppingData.sku_id,
            item_id: this.data.shoppingData.shoppingCatData.tuan_config.id,
            f_id: that.data.formId
        };
        publicFun.payment(data, that)
    },
    goBack: function (e) {
        wx.redirectTo({ url: '/pages/index/index' })
    },
    mycollageGo: function (e) { //我的拼团
      if (!app.isLoginFun(this)) {//判断用户是否登录
        common.setUserInfoFun(this, app);
        return false;
      }
      wx.navigateTo({ url: '/pages/USERS/pages/myCollage/myCollageList' })
    },
    scrollTopFun: function (e) { //滚动条函数
        var that = this;
        publicFun.scrollTopFun(e, that)
    },
    goTopFun: function (e) { //回到顶部滚动条
        var that = this;
        publicFun.goTopFun(e, that)
    },
    dataCode: function (data) { //时间戳
        return publicFun.dataCode(data)
    },
    closeShopping: function (e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    oppenShopping: function (e) { //加入购物袋
        var that = this;
        if (that.data.dateilsData.tuan.status == 4) {
            return publicFun.warning('当前拼团已结束，客官去看看别的吧~', that)
        }
        if (that.data.dateilsData.tuan.status != 2) {
            return publicFun.warning('当前拼团'+that.data.dateilsData.tuan.status_txt+'，客官去看看别的吧~', that)
        }
        that.animation.opacity(1).step()
        that.setData({
            //输出动画
            animation: that.animation.export()
        })
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
    joinGo: function (e) { //跳转参团页面
        var that = this;
        if (that.data.dateilsData.tuan.status == 4) {
            return publicFun.warning('当前拼团已结束，客官去看看别的吧~', that)
        }
        publicFun.joinGo(e, that)

    },
    shopGO: function () { //跳转店铺活动页面
        // let store_id = this.data.dateilsData.store.store_id;
        // wx.redirectTo({ url: '/pages/GOODSDETAILS/pages/details/shop?store_id=' + store_id });
        wx.redirectTo({ url: '/pages/index/index' })

    },
    shareClick: function (e) {
        var that = this;
        // publicFun.warning('点击屏幕右上角，邀请好友来参团!', that);
        wx.showShareMenu({
            withShareTicket: false
        })

    },
    onShareAppMessage: function () {
      const { show_share_img, share_img } = app.globalData;
        return {
            title: this.data.dateilsData.wxapp_share.title,
            desc: this.data.dateilsData.wxapp_share.descript,
            path: '/pages/GOODSDETAILS/pages/details/index?tuan_id=' + this.data.tuan_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=2" + '&store_id=' + app.globalData.store_id,
            imageUrl: show_share_img == 1 ? (share_img) : (this.data.dateilsData.product.image || '')
        }
    },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        publicFun.formSubmit({
            e: e,
            that: that
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
            path: 'pages/GOODSDETAILS/pages/details/index',
            id: that.data.tuan_id,
            share_uid: getApp().globalData.my_uid,
            shareType: "activity",
            activity_type :"tuan"
        }
        // 处理canvas
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
                wx.hideLoading();
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
        let product_name = that.data.dateilsData.product.product_name
        console.log("===");
        console.log(that.data.dateilsData.product);
        let min_price = canvasFun.formatPrice(that.data.dateilsData.product.min_price);
        let price = canvasFun.formatPrice(that.data.dateilsData.product.price);
        var canvasData = { // 画布数据
            status: true,
            canvasId: 'tuanPost',
            // canvasWidth: 500,
            // canvasHeight: 740,
            // paddingLeft: that.data.winWidth * 0.15,
            // paddingTop: that.data.winWidth * 0.15,
            canvasWidth: 750,
            canvasHeight: 1363,
            paddingLeft: 0,
            paddingTop: 0,
            radius: 10,
            bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
            whiteBg: '../../images/white_bg.png',
            bgPath: '../../images/white_bg.png', // 海报背景图
            product_name: product_name, // 名称
            min_price: min_price,
            price: price,
            text_qrcode_btm: '长按识别小程序码，即可参与拼团~', // 二维码下方文字
            loadFailTapStatus: false, // 下载失败处理函数是否已执行
            // 图片数据
            avatarPath: that.data.dateilsData.user.avatar, // 用户头像
            qrcodePath: that.data.qrcodePath, // 二维码
            productImage: 'https://' + that.data.dateilsData.product.image.split('://')[1], // 商品首图
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

        }, 500)

    },

    // 绘图 created 18-04-25 by cms_shangshouan
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
        let prePrice = `￥${that.data.dateilsData.tuan_config_list[0].price}`; 
        canvas.drawText({
            ctx: ctx,
            x: w / 2,
            y: positionY,
            text: prePrice,
            align: 'center',
            color: '#030000',
            fontSize: 70
        });

        // 绘制原价
        let price = '￥' + that.data.canvasData.price;
        let number = that.data.dateilsData.tuan_config_list[0].grade_type == 0 ? '团购价' : `${that.data.dateilsData.tuan_config_list[0].number}人成团`;
        ctx.font = '26px PingFang-SC-Bold';
        const metrics1 = ctx.measureText(price).width;
        const metrics2 = ctx.measureText(number).width;

        canvas.drawText({
            ctx: ctx,
            x: (w / 2), //  - 10 - (metrics1 / 2),
            y: positionY + 132,
            text: price,
            fontSize: 26,
            baseline: 'bottom',
            align: 'center',
            color: '#A3A3A3',
            underLine: true
        });

        // 绘制几人成团印章
        // canvas.roundRect({
        //     ctx: ctx,
        //     x: (w / 2) + 10,
        //     y: positionY + 96,
        //     w: metrics2 + 20,
        //     h: 40,
        //     r: 4,
        //     bg: '#df6f61'
        // });

        // canvas.drawText({
        //     ctx: ctx,
        //     x: (w / 2) + 10 + 10 + (metrics2 / 2),       //由中部对齐，第一个10是印章margin，第二个10是内部padding
        //     y: positionY + 132,
        //     text: number,
        //     fontSize: 26,
        //     baseline: 'bottom',
        //     align: 'center',
        //     color: '#fff'
        // });

        // 绘制中间容器
        canvas.roundImg({
            ctx: ctx,
            x: left + innerLeft + 20,
            y: positionY + 170,
            img: that.data.canvasData.productImage,
            w: imgH - 40,
            h: imgH - 40,
            r: 14,
            blur: 14,
            shadow: 'rgba(180,180,180,.4)',
            // 是否显示蒙层
            cover: false,
            // 蒙层高度
            coverH: 140
        });


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
                y: positionY + 170 + imgH + 20, // positionY + 170 + imgH是商品图底部x距离，减去70然后底部对齐
                fontSize: 30,
                baseline: 'bottom',
                color: '#030000'
            })
        }else{
            canvas.drawText({
                ctx: ctx,
                text: product_name_text,
                x: left + innerLeft + 28,
                y: positionY + 170 + imgH + 25, // positionY + 170 + imgH是商品图底部x距离，减去70然后底部对齐
                fontSize: 30,
                baseline: 'bottom',
                color: '#030000'
            });
        }


        //绘制分割线
        canvas.roundBorderRect({
            ctx,x:left + innerLeft + 40, y:positionY + imgH + 170 + 80, h:0.1, w:imgH - 80, r:0,border:"#eeeeee"
        })

        // 绘制二维码
        positionY = positionY + 170 + imgH +　80;
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
    // 画图;废弃
    creatCanvas: function () {
        var that = this;
        // 定义变量
        let valueY = that.data.canvasData.paddingTop;
        let r_avatar = 30; // 头像半径
        let r_qrcode = 50; // 二维码半径

        // 1生成画笔
        let ctx = wx.createCanvasContext(that.data.canvasData.canvasId);

        // 2设置画布背景及容器样式
        // canvasFun.setPostStyle({
        //     that: that,
        //     ctx: ctx,
        //     paddingLeft: that.data.canvasData.paddingLeft,
        //     paddingTop: that.data.canvasData.paddingTop,
        //     radius: that.data.canvasData.radius,
        //     bg_color: that.data.canvasData.bg_color,
        //     bgPath: that.data.canvasData.bgPath
        // });

        let shadow = 'rgba(180,180,180,.4)';
        ctx.drawImage(that.data.canvasData.bgPath, 0, 0, that.data.canvasData.canvasWidth, that.data.canvasData.canvasHeight);


        ctx.setFillStyle('#fff');
        let top = that.data.canvasData.paddingTop;
        let left = that.data.canvasData.paddingLeft;
        ctx.setShadow(0, 0, 120, shadow)
        ctx.fillRect(left + 5, top + 5, that.data.canvasData.canvasWidth - left * 2 - 10, that.data.canvasData.canvasHeight - top * 2 - 10)
        ctx.drawImage(that.data.canvasData.whiteBg, left, top, that.data.canvasData.canvasWidth - left * 2, that.data.canvasData.canvasHeight - top * 2);
        ctx.setShadow(0, 0, 0, '#ffffff');


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
            y: valueY + r_avatar,
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
            x: that.data.canvasData.paddingLeft + 140,
            fontSize: 45,
            color: '#B4282D'
        })

        // 绘制中部
        valueY += 45 + 30;
        // canvasFun.roundRect({
        //     that: that,
        //     ctx: ctx,
        //     paddingLeft: that.data.canvasData.paddingLeft + 10,
        //     paddingTop: valueY,
        //     radius: 10,
        //     bg_color: '#ffffff',
        //     h: 300,
        //     img: that.data.canvasData.productImage,
        //     img_x: that.data.canvasData.paddingLeft + 10,
        //     img_y: valueY,
        //     img_w: that.data.canvasData.canvasWidth - (that.data.canvasData.paddingLeft + 10) * 2,
        //     img_h: 220
        // })

        ctx.setFillStyle('#fff');
        let imgW = that.data.canvasData.canvasWidth - (that.data.canvasData.paddingLeft + 10) * 2;
        ctx.setShadow(0, 0, 100, shadow)
        ctx.fillRect(that.data.canvasData.paddingLeft + 15, valueY + 5, imgW - 10, 290)
        ctx.drawImage(that.data.canvasData.whiteBg, that.data.canvasData.paddingLeft + 10, valueY, imgW, 300);
        ctx.setShadow(0, 0, 0, '#ffffff');

        ctx.drawImage(that.data.canvasData.productImage, that.data.canvasData.paddingLeft + 10, valueY, imgW, 220);


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
            x: that.data.canvasData.paddingLeft + r_qrcode * 2 + 20,
            y: valueY
        })

        // 最终绘出画布
        ctx.draw()
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
  close_btn:function(e){
    this.setData({
      tuanHide:true
    })
  },
  chaMore:function(e){
   this.setData({
     tuanHide: false
   })
  },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({error});
        this.setData({
            applet_guide_subscribe: false
        })
    }

})
