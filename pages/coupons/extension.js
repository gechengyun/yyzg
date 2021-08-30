var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var canvasFun = require('../../utils/canvas-post.js');
var canvas = require('../../utils/canvas.js');
var app = getApp();
Page({
    data: {
        dialog:{
            dialogHidden:true,
            titleMsg:"海报图保存失败，用户取消或未开启保存到相册权限",
            determineBtnTxt:"去开启"
        }
    },
    onLoad: function (e) {
        var that = this;
        if (e.store_id != undefined && e.store_id != '') {
            var store_id = e.store_id;
            app.globalData.store_id = e.store_id;
        } else if ((e.store_id == undefined || e.store_id == '') && app.globalData.store_id == '') {
            var store_id = common.store_id;
            app.globalData.store_id = store_id;
        }
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.barTitle('推广海报'); //修改头部标题
        common.post('app.php?c=ucenter&a=publicize&url=/pages/index/index?store_id=' + app.globalData.store_id, '', "coupontsData", that);
    },
    onReady: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            }
        });
        //获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
    },

    init: function () {
        let that = this;
        let ticket = wx.getStorageSync('ticket');
        let data = {
            path: 'pages/index/index',
            id: this.data.coupontsData.share_id,
            uid: 0,
            share_uid: getApp().globalData.my_uid,
            shareType: 'checkin'
          } 
        wx.request({
            url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
            header: {
                'Content-Type': 'application/json'
            },
            data: data,
            method: "POST",
            success: function (res) {
                // console.log('获取二维码成功')
                // console.log(res)
                if (res.statusCode == 200) {
                    if (res.data.err_code == 0) {
                        that.setData({
                            qrcodePath: res.data.err_msg
                        })
                        // 处理canvas
                        // wx.showLoading({
                        //     title: '海报生成中...',
                        // })
                        // that.creatPost();
                        // 处理canvas
                    }
                }
            },
            fail: function (res) {
                wx.hideLoading();
            }
        })

    },

    shear: function () {
        var that = this;
        // publicFun.shear(that);
        wx.showShareMenu({
            withShareTicket: false
        })
    },

    coupontsData: function (result) {
        var that = this;
        if (result.err_code == 0) {
            this.setData({
                coupontsData: result.err_msg,
                ewm: common.Url + '/app.php?c=widget&a=wxapp_qr&store_id=' + app.globalData.store_id,
            });
            that.init();
        }
    },
    /*
    *
    **分享对话框 shareModal start
    *
    */

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
        // that.dialog.hideDialog();
    },

    // 分享到朋友圈：创建海报 creat 18-04-28 by cms_ssa
    _shareFriendsCircle: function () {
        wx.showLoading({
            title: '海报生成中...',
        });

        let canvasData = {
            canvasId: 'shopPost',
            canvasWidth: 750,
            canvasHeight: 962,
            paddingLeft: 40,
            paddingTop: 50,
            bgPath: '../../images/white_bg.png',            // 海报背景图
            shop_name: this.data.coupontsData.store_name, // 店铺名称
            avatarPath: this.data.coupontsData.logo, // 用户头像
            qrcodePath: this.data.qrcodePath             // 二维码
        };

        // 获得自适应屏幕数据
        let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: this.data.winWidth });

        // 赋值海报图参数
        this.setData({
            canvasData: canvasData,
            canvasPosition: obj
        });

        // 下载二维码图片
        let p1 = this.loopDownLoadFile('qrcodePath', this.data.canvasData.qrcodePath);
        // 下载头像图片
        let p2 = this.loopDownLoadFile('avatarPath', this.data.canvasData.avatarPath);

        // 下载图片资源
        Promise.all([p1, p2])
            .then(res => {
                console.log(res);
                this.drawCanvas();

                setTimeout(() => {
                    let w = this.data.canvasData.canvasWidth;
                    let h = this.data.canvasData.canvasHeight;

                    this.save({
                        id: this.data.canvasData.canvasId,
                        w: w,
                        h: h,
                        targetW: w * 4,
                        targetH: h * 4
                    });
                }, 500)
            })
            .catch(e => {
                console.log(e);
                this.showErr();
            });
    },

    // 下载海报图所需图片资源 created by cms_ssa  18-04-26
    loopDownLoadFile: function (key, urls) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(urls) && urls.length > 0) {
                this.data.canvasData[name] = [];
                for (let i = 0; i < urls.length; i++) {
                    wx.downloadFile({
                        url: urls[i],
                        success: function (res) {
                            console.info("下载一个文件成功");
                            this.data.canvasData[name].push(res.tempFilePath);
                            this.setData({
                                canvasData: this.data.canvasData
                            });
                            resolve(res);
                        },
                        fail: function (e) {
                            console.info("下载一个文件失败");
                            reject(e);
                        }
                    })
                }
            } else {
                wx.downloadFile({
                    url: urls,
                    success: res => {
                        console.info("下载一个文件成功");
                        this.data.canvasData[key] = res.tempFilePath;
                        this.setData({
                            canvasData: this.data.canvasData
                        })
                        resolve(res);
                    },
                    fail: function (e) {
                        console.info("下载一个文件失败");
                        reject(e);
                    }
                })
            }

        })
    },

    // 绘制海报图 created by cms_ssa  18-04-28
    drawCanvas: function () {
        let w = this.data.canvasData.canvasWidth;
        let h = this.data.canvasData.canvasHeight;
        let left = this.data.canvasData.paddingLeft;
        let top = this.data.canvasData.paddingTop;
        // 头像半径
        let head_r = 53;
        // 二维码半径
        let qrode_r = 108;
        let positionY = 0;
        // 生成画笔
        const ctx = wx.createCanvasContext(this.data.canvasData.canvasId);

        // 绘制背景图片
        canvas.drawImage({
            ctx: ctx,
            img: this.data.canvasData.bgPath,
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
            r: 20,
            blur: 40,
            shadow: 'rgba(180,180,180,.4)'
        });

        // 绘制头像
        positionY = top + 61;
        canvas.circleImg({
            ctx: ctx,
            img: this.data.canvasData.avatarPath,
            r: head_r,
            x: left + 287,      // 通过实际宽度尺寸计算所得（多数尺寸要根据750宽度基数计算，设计图偏颇较大）
            y: positionY,
            w: head_r * 2,
            h: head_r * 2
        });

        canvas.drawMultiText({
            ctx: ctx,
            text: '推荐一家我超喜欢的店铺给你\n快来一起欢乐剁手啊~',
            x: w / 2,
            y: positionY + 159,
            fontSize: 26,
            align: 'center',
            gap: 16
        });

        canvas.drawText({
            ctx: ctx,
            text: this.data.coupontsData.store_name,
            x: w / 2,
            y: positionY + 159 + 158,
            fontSize: 30,
            align: 'center'
        });

        canvas.drawImage({
            ctx: ctx,
            img: this.data.canvasData.qrcodePath,
            x: left + 227,
            y: positionY + 417,
            w: qrode_r * 2,
            h: qrode_r * 2
        });

        canvas.drawText({
            ctx: ctx,
            text: '长按识别小程序码 即可买买买~',
            x: w / 2,
            y: positionY + 417 + qrode_r * 2 + 45,
            fontSize: 24,
            align: 'center'
        });

        ctx.draw();
    },

    // 保存图片 18-04-24 created by cms_ssa
    save: function (o) {
        let that = this;
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
                            // that.dialog.hideDialog();
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

    showErr: function () {
        wx.hideLoading();
        this.setData({
            'dialog.dialogHidden':false
        })
    },

    // onShareAppMessage: function () {
    //     var that = this;
    //     return {
    //         title: this.data.coupontsData.store.name,
    //         desc: '我想你推荐' + this.data.coupontsData.store.name + '店铺，人品保证',
    //         path: '/pages/index/index?store_id=' + app.globalData.store_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=2",
    //         success: function (res) {
    //             console.log('转发成功');
    //         },
    //         fail: function (res) {
    //             console.log('转发失败')
    //         }
    //     }
    // },

})
