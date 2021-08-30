// pages/livecode/qrcode.js
var publicFun = require('../../utils/public.js');
var canvas = require('../../utils/canvas.js');
var canvasFun = require('../../utils/canvas-post.js');
var common = require('../../utils/common.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canvasPosition: {},
        live_code_data: null,
        BASE_IMG_URL:'https://s.404.cn/applet/',
        dialog: {
            dialogHidden: true,
            titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
            determineBtnTxt: "去开启"
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            options
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        setTimeout(() => {
            publicFun.setBarBgColor(getApp(), this)
            this.init()
        }, 30)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    init() {
        var that = this;
        wx.showLoading();
        common.post('app.php?c=live_code&a=get_live_code_url'+(that.data.options.product_id ? "&product_id=" + that.data.options.product_id : ""), {}, function (res) {
            wx.hideLoading()
            if (res.err_code == 0) {
                that.setData({
                    live_code_data: {
                        ...res.err_msg,
                        logo: res.err_msg.logo.includes('http') ? res.err_msg.logo : common.Url + 'upload/' + res.err_msg.logo
                    }
                })
            }
        }, '')
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    sharePost: function () {
        let that = this;
        let canvasData = { // 画布数据
            canvasWidth: 690,
            canvasHeight: 859,
            canvasId: "sharePost",
            left: 0,
            top: 0,
            right: 0
        };
        let obj = canvas.px2rpx({
            w: canvasData.canvasWidth + canvasData.left + canvasData.right,
            h: canvasData.canvasHeight + canvasData.top * 2
        });
        this.setData({
            canvasData: canvasData,
            canvasPosition: obj
        })
        wx.showToast({
            title: "正在准备颜料...",
            icon: "loading",
            duration: 10000
        })

        Promise.all([canvasFun.loadImageFileByUrl(this.data.live_code_data.logo), canvasFun.loadImageFileByUrl(this.data.live_code_data.url)])
            .then(function (res) {
                wx.showToast({
                    title: "正在绘制...",
                    icon: "loading"
                })
                that.drawCanvas(res)
            }).catch(function (err) {
            console.log(err);
            wx.showToast({
                title: "素材下载失败",
                icon: "none"
            })

        })
    },

    // 绘制海报图
    drawCanvas: function ([logo, qrcode]) {
        let that = this;
        let c = that.data.canvasData;
        let w = c.canvasWidth;
        let h = c.canvasHeight;
        let positionY = c.top;
        // 生成画笔
        const ctx = wx.createCanvasContext(c.canvasId);


        // 绘制白色圆角背景
        canvas.roundRect({
            ctx: ctx,
            x: c.left,
            y: positionY,
            w: w,
            h: h,
            r: 0,
            blur: 40,
            shadow: 'rgba(180,180,180,.4)'
        });

        canvas.drawImage({
            ctx: ctx,
            img: that.data.BASE_IMG_URL+'images/balloon.png',
            x: 300,
            y: -88,
            w: 550,
            h: 391
        });

        ctx.translate(200, 150)
        ctx.rotate(115 * Math.PI / 180)
        ctx.setGlobalAlpha(0.6)
        canvas.drawImage({
            ctx: ctx,
            img: that.data.BASE_IMG_URL +'images/balloon.png',
            x: 230,
            y: 130,
            w: 300,
            h: 213
        });
        ctx.rotate(-115 * Math.PI / 180)
        ctx.translate(-200, -150)
        ctx.setGlobalAlpha(1)
        positionY += 67
        canvas.drawText({
            ctx: ctx,
            text: '邀请函',
            x: c.left + 59,
            y: positionY,
            fontSize: 44,
            color: '#333333',
        });
        positionY += 89
        canvas.roundRect({
            ctx: ctx,
            x: c.left + 62,
            y: positionY,
            w: 41,
            h: 9,
            r: 0,
            bg: '#2ece6f'
        });

        // 圆角logo
        positionY += 60
        canvas.circleImg({
            ctx: ctx,
            x: c.left + 55,
            y: positionY,
            img: logo.tempFilePath,
            w: 98,
            h: 98,
            r: 98 / 2
        });
        positionY += 10
        canvas.drawText({
            ctx: ctx,
            text: that.data.live_code_data.name,
            x: c.left + 174,
            y: positionY,
            fontSize: 26,
            color: '#5a5a5a',
        });

        positionY += 32
        canvas.drawText({
            ctx: ctx,
            text: '诚挚的邀请您加入'+ (that.data.live_code_data.live_code_title ||that.data.live_code_data.group_name || ""),
            x: c.left + 174,
            y: positionY,
            fontSize: 34,
            color: '#333333',
        });

        positionY += 85
        canvas.drawImage({
            ctx: ctx,
            img: qrcode.tempFilePath,
            x: c.left + 123,
            y: positionY,
            w: 444,
            h: 444
        });

        // 最终绘出画布
        ctx.draw();
        setTimeout(function () {
            that.save({
                id: c.canvasId,
                w: w,
                h: h,
                targetW: w * 4,
                targetH: h * 4
            });
        }, 500)

    },
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
                            wx.previewImage({
                                urls: [o.imgSrc],
                                current: o.imgSrc
                            })
                        }
                    }
                })
            }, function (err) {
                console.log(err);
                that.showErr();
            });
        }, function (err) {
            console.log(err);
            that.showErr();
        });
    },

    showErr: function () {
        wx.hideLoading();
        this.setData({
            'dialog.dialogHidden': false
        })
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

})