// pages/user/membersDetails/membersDetails.js
var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var canvasFun = require('../../../utils/canvas-post.js');
var canvas = require('../../../utils/canvas.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vipData: {},//当前页商品、主题数据
    ewmImgUrl: "", //二维码地址；
    shopImge: "", //商品地址；
    avaTarUrl: '', //头像本地地址
    commimgUrl: common.Url,
    canvasIds: 'lafenCanvas',
    imgUrl: common.Url,
    haibaoCanvas: false,
    lafenImgurl: "",
    base_img_url:'https://s.404.cn/applet/',
    showback:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options)
    if (options.showback == 0){
      this.setData({
        showback: true
      })
    }
    publicFun.setBarBgColor(app, that);
    wx.getSystemInfo({
      success: function (res) {
        //获取手机型号
        let nav_top = res.model.indexOf('iPhone X')>=0?105:61;
        that.setData({
          winWidth: res.windowWidth,
          nav_top
        });
      }
    });

    app.getIphoneNum(this);//获取用户是否需要拉取手机号
    //是否展示分享图片
    app.shareWidthPic(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取会员数据
    common.post('app.php?c=ucenter&a=share_info', '', "vipData", this);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#312f30'
    })
    
    // var s = setTimeout(function () {

    //   clearTimeout(s);
    // }, 100)
  },
  vipData: function (result) {
    console.log("vip", result)
    if (result.err_code == 0) {
      let now_num = result.err_msg.now_num;//用户当前粉丝数
      let num = result.err_msg.num;//升级所需粉丝数
      let probar = result.err_msg.is_member==1?100:(now_num / num * 100);
      console.log("probar", probar)
      let less_num = Math.abs(parseInt(num) - parseInt(now_num));
      let desc = result.err_msg.description;
      let arr_desc = '';
      if (desc) {
           arr_desc = desc;
      }
      this.setData({
        vipData: result.err_msg,
        probar,
        arr_desc,
        less_num
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
    var that = this;
    this.setData({
      haibaoCanvas: false
    })
    return getApp().shareGetFans('', '', '/pages/index/index', 2, that.data.lafenImgurl);
  },
  showCanvasWind() { //生成海报
    //该店铺未设置拉粉商品
    if (!this.data.vipData.product.name && !this.data.vipData.product.price) {
      wx.showModal({
        title: '抱歉',
        content: '该店铺尚未设置粉丝任务哟~',
        confirmText: '知道了',
        showCancel: false,
        confirmColor: '#fe6b31',
      })
      return false;
    }
    setTimeout(() => {
      wx.showLoading({
        title: '海报生成中...',
      })
    }, 1000)

    var that = this;
    let data = {
      store_id: app.globalData.store_id
    }
    //获取海报详情
    common.post("app.php?c=ucenter&a=get_share_info", data, callBack, "");

    function callBack(res) {
      console.log(res);
      if (res.err_code == 0) {
        that.setData({
          haibaoData: res.err_msg
        })
        //获取二维码；
        that.getEwmCode();
      } else {
        console.log(res);
        wx.hideLoading();
      }
    }
    // this.setData({
    //   haibaoCanvas: true
    // })
  },
  getEwmCode() { //获取二维码 
    var that = this;
    let data = {
      path: "pages/index/index",
      id: this.data.physical_id,
      uid: getApp().globalData.my_uid,
      share_uid: getApp().globalData.my_uid
    }
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + wx.getStorageSync('ticket'),
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功', res);
        if (res.err_msg == "失败") {
          wx.hideLoading();
          that.setData({
            lafenWindowsState: false
          })
          return false
        }
        //异步下载图片资源
        let ewmImgUrlDownLoad = '';
        let avaTarUrlDownLoad = '';
        let shopImgeDownLoad = '';
        ewmImgUrlDownLoad = new Promise((resolve, reject) => { //下载二维码
          let url = res.data.err_msg
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  ewmImgUrl: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", url);
              wx.hideLoading();
              reject();
            }
          })
        })

        avaTarUrlDownLoad = new Promise((resolve, reject) => { //下载头像
          let url = that.data.haibaoData.avatar;
          if (url.indexOf("https") == -1) {
            url = that.data.commimgUrl + "upload/" + url;
          }
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  avaTarUrl: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", url);
              wx.hideLoading();
              reject();
            }
          })
        })

        shopImgeDownLoad = new Promise((resolve, reject) => { //下载商品
          let url = that.data.haibaoData.image;
          if (url.indexOf("https") == -1) {
            url = that.data.commimgUrl + "upload/" + url;
          }
        
          // 测试代码
          // const downloadTask = wx.downloadFile({
          //   url: 'https://img.catlol.cn/images/000/000/247/201905/5cf0c60cd3a92.png', 
          //   success: function (res) {
          //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          //     console.log(res)
          //     if (res.statusCode === 200) {
          //       that.setData({
          //         shopImge: res.tempFilePath
          //       })
          //       resolve();
          //       wx.showToast({
          //         title: '下载商品成功',
          //       })
          //     }
          //   }
          // })
          // downloadTask.onProgressUpdate((res) => {
          //   console.log('下载进度', res.progress)
          //   console.log('已经下载的数据长度', res.totalBytesWritten)
          //   console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
          // })

       
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  shopImge: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", res);
              wx.hideLoading();
              reject();
            }
          })

        })

        let qCodeStatus = Promise.all([ewmImgUrlDownLoad, avaTarUrlDownLoad, shopImgeDownLoad]);
        qCodeStatus.then(() => {
          that.makeCanvas();
          setTimeout(function () {
            let w = that.data.canvasWidth;
            let h = that.data.canvasHeight;
            that.save({
              id: that.data.canvasIds,
              w: w,
              h: h,
              targetW: w * 4,
              targetH: h * 4
            });
          }, 300)
        }).catch((error) => {
          console.log(error);
          wx.hideLoading();
          wx.showModal({
            title: '提示信息',
            content: "海报生成失败，请重试...",
            confirmText: '知道了',
            showCancel: false,
            confirmColor: '#fe6b31',
            success: (result) => {
              wx.hideLoading();
              that.setData({
                haibaoCanvas: false,
              })
            }
          })
        })
      },
      fail: function (res) {
        console.log('获取二维码fail', res);
        wx.hideLoading();
        wx.showModal({
          title: '提示信息',
          content: "海报生成失败，请重试...",
          confirmText: '知道了',
          showCancel: false,
          confirmColor: '#fe6b31',
          success: (result) => {
            that.setData({
              haibaoCanvas: false,
            })
          }
        })
      }
    })
  },

  //展示分享界面
  showShareOperation() {
    this.setData({
      lafenWindowsState: false,
      showOpertaion: true
    })
  },
  draw2(ctx, x, y, width, height, radius, color, type) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x, y);
    ctx[type + 'Style'] = color || params.color;
    ctx.closePath();
    ctx[type]();
  },
  drawcommon(ctx, x, y, width, height, radius, color, type, num) {
    let radiusBottom = radius;
    let radiusTop = radius;
    ctx.beginPath();
    if (num == 2) {
      radiusBottom == 0;
    }
    ctx.moveTo(x, y + radiusBottom);
    ctx.lineTo(x, y + height - radiusBottom);
    ctx.quadraticCurveTo(x, y + height, x + radiusBottom, y + height);
    ctx.lineTo(x + width - radiusBottom, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radiusBottom);
    if (num == 1) {
      radiusTop == 0;
    }
    ctx.lineTo(x + width, y + radiusTop);
    ctx.quadraticCurveTo(x + width, y, x + width - radiusTop, y);
    ctx.lineTo(x + radiusTop, y);
    ctx.quadraticCurveTo(x, y, x, y + radiusTop);
    ctx[type + 'Style'] = color || params.color;
    ctx.closePath();
    ctx[type]();
  },
  makeCanvas() {

    let that = this;
    let haibaoData = this.data.haibaoData;
    let title = haibaoData.nickname;
    let name = haibaoData.name;
    let original_price = haibaoData.original_price ? haibaoData.original_price : 0;
    let price = haibaoData.price;
    let ratio_money = haibaoData.ratio_money;//赚多少；
    let lafenBg = '/images/lafenbg.png';
    let canvasWidth = this.data.winWidth;
    let bili = canvasWidth / 635;
    let canvasHeight = 1100 * bili;
    this.setData({
      canvasWidth,
      canvasHeight
    })
    const context = wx.createCanvasContext('lafenCanvas');
    context.clearRect(0, 0, 635 * bili, 1100 * bili);
    //绘制背景
    context.drawImage(lafenBg, 0, 0, 635 * bili, 1100 * bili);
    context.save();

    context.beginPath();
    //先画个圆，前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
    context.arc(85 * bili, 100 * bili, 45 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.avaTarUrl, 40 * bili, 55 * bili, 90 * bili, 90 * bili);
    context.restore();
    context.closePath();
    context.save();
    // 谈话框
    that.draw2(context, 140 * bili, 100 * bili, 460 * bili, 72 * bili, 36 * bili, "white", "fill");
    // 设置文字颜色
    context.setFontSize(30 * bili);
    context.fillStyle = "#fff";
    //显示标题
    context.fillText(title, 140 * bili, 80 * bili);
    context.setFontSize(28 * bili);
    context.fillStyle = "#000";
    context.fillText("HI~ 我送你一个新人福利！", 180 * bili, 150 * bili);

    //绘制商品
    that.drawcommon(context, 40 * bili, 200 * bili, 560 * bili, 460 * bili, 8 * bili, "black", "fill", 2);
    context.clip();
    context.drawImage(this.data.shopImge, 40 * bili, 200 * bili, 560 * bili, 460 * bili);
    context.restore();
    context.closePath();
    context.save();
    // 绘制谈话框
    // 绘制文字盒子
    that.drawcommon(context, 40 * bili, 640 * bili, 560 * bili, 200 * bili, 8 * bili, "white", "fill", 1);
    context.save();

    //商品名称
    context.setFontSize(30 * bili);
    context.setFillStyle('#333');
    if (name.length > 17) { //商品名字长度兼容
      let name_a = name.slice(0, 17) + "...";
      context.fillText(name_a, 60 * bili, 710 * bili);
    } else {
      context.fillText(name, 60 * bili, 710 * bili);
    }

    //绘制金额；
    context.setFillStyle('#f62049');
    context.fillText("￥", 60 * bili, 770 * bili);
    context.setFontSize(40 * bili);
    context.fillText(price, 84 * bili, 770 * bili);
    if (price.length < 8) { //适配
      context.drawImage('/images/price.png', (context.measureText(price).width + 160) * bili, 742 * bili, 121 * bili, 30 * bili);
      context.setFillStyle('#ffffff');
      context.setFontSize(18 * bili);
      // context.fillText("赚" + ratio_money, (context.measureText(price).width + 220) * bili, 765 * bili);
      context.fillText("新人专享价", (context.measureText(price).width + 210) * bili, 765 * bili);
    }
    if (original_price != 0) { //没有划线价不显示；
      //原始金额
      context.setFontSize(24 * bili);
      context.setFillStyle('#e1e1e1');
      context.fillText("￥", 60 * bili, 810 * bili);
      context.fillText(original_price, 90 * bili, 810 * bili);
      //横线
      context.moveTo(60 * bili, 802 * bili);
      context.lineTo(164 * bili, 802 * bili);
      context.lineWidth = 1;
      context.strokeStyle = "#e1e1e1";
      context.stroke();
    }


    context.save();
    // context.beginPath();
    // context.moveTo(40 * bili, 1050 * bili);
    // context.lineTo(200 * bili, 1050 * bili);
    // context.moveTo(450 * bili, 1050 * bili);
    // context.lineTo(600 * bili, 1050 * bili);
    // context.strokeStyle = "#fff";
    // context.stroke();
    context.setFillStyle('#fff');
    context.setFontSize(24 * bili);
    context.fillText("长按扫码购买", 250 * bili, 1060 * bili);
    context.closePath();
    //绘制二维码
    context.moveTo(317 * bili, 948 * bili);
    context.beginPath();
    context.arc(320 * bili, 947 * bili, 68 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.ewmImgUrl, 252 * bili, 880 * bili, 136 * bili, 136 * bili);
    context.restore();
    context.draw({
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvasId: 'lafenCanvas',
    }, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          canvasId: 'lafenCanvas',
          fileType: 'png',
          quality: 1.0,
          success: res => {
            let data = res.tempFilePath;
            this.setData({
              lafenImgurl: res.tempFilePath
            })
            wx.hideLoading();
          },
          fail: fail => {
            wx.hideLoading();
            wx.showModal({
              title: '提示信息',
              content: "海报生成失败，请重试...",
              confirmText: '知道了',
              showCancel: false,
              confirmColor: '#fe6b31',
              success: (result) => {
                this.setData({
                  haibaoCanvas: false
                })
              }
            })
          }
        })
      }, 1000)
    })
  },
  save: function (o) {
    let that = this;
    canvas.canvasToTempFilePath(o).then(function (res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath,
        canvasImgState: true,
      })
      canvas.saveImageToPhotosAlbum(o).then(function (res) {
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
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
        console.log('错误', err);
        wx.hideLoading();
        // that.setData({ 'dialog.dialogHidden': false })
        that.setData({
          showOpertaion: false
        })
      });
    }, function (err) {
      console.log(err);
    });
  },
  makeCanvas2() {
    let haibaoData = this.data.haibaoData
    let title = "邀请" + haibaoData.num + "粉享" + haibaoData.degree_name;
    let name = haibaoData.name;
    let original_price = haibaoData.original_price ? haibaoData.original_price : 0;
    let price = haibaoData.price;
    let ratio_money = haibaoData.ratio_money; //赚多少；
    let lafenBg = '/images/lafenbg.png';
    let canvasWidth = this.data.winWidth;
    let bili = canvasWidth / 635;
    let canvasHeight = 1100 * bili;
    this.setData({
      canvasWidth,
      canvasHeight
    })
    const context = wx.createCanvasContext('lafenCanvas');
    context.clearRect(0, 0, 635 * bili, 1100 * bili);
    //绘制背景
    context.drawImage(lafenBg, 0, 0, 635 * bili, 1100 * bili);
    context.save();

    context.beginPath();
    //先画个圆，前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
    context.arc(318 * bili, 62 * bili, 55 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.avaTarUrl, 264 * bili, 6 * bili, 108 * bili, 108 * bili);
    context.restore();
    context.closePath();
    context.save();

    context.setFontSize(30 * bili);
    //居中显示标题
    context.fillText(title, ((canvasWidth - context.measureText(title).width) / 2), 170 * bili);
    //绘制商品
    context.drawImage(this.data.shopImge, 50 * bili, 200 * bili, 200 * bili, 200 * bili);
    //商品名称
    context.setFontSize(30 * bili);
    if (name.length > 8) { //商品名字长度兼容
      let name_a = name.slice(0, 8);
      let name_b = name.slice(9, 17) + "...";
      context.fillText(name_a, 322 * bili, 238 * bili);
      context.fillText(name_b, 322 * bili, 278 * bili);
    } else {
      context.fillText(name, 322 * bili, 248 * bili);
    }

    //绘制金额；
    context.setFillStyle('#f62049');
    context.fillText("￥", 312 * bili, 345 * bili);
    context.setFontSize(40 * bili);
    context.fillText(price, 342 * bili, 345 * bili);
    if (price.length < 8) { //适配
      context.drawImage('/images/price.png', (context.measureText(price).width + 412) * bili, 320 * bili, 101 * bili, 30 * bili);
      context.setFillStyle('#ffffff');
      context.setFontSize(18 * bili);
      context.fillText("赚" + ratio_money, (context.measureText(price).width + 470) * bili, 343 * bili);
    }
    if (original_price != 0) { //没有划线价不显示；
      //原始金额
      context.setFontSize(24 * bili);
      context.setFillStyle('#e1e1e1');
      context.fillText("￥", 322 * bili, 385 * bili);
      context.fillText(original_price, 352 * bili, 385 * bili);
      //横线
      context.moveTo(322 * bili, 378 * bili);
      context.lineTo(425 * bili, 378 * bili);
      context.lineWidth = 1;
      context.strokeStyle = "#e1e1e1";
      context.stroke();
    }

    //自购省钱
    context.font = 'normal bold 18px sans-serif';
    context.setFontSize(30 * bili);
    context.setFillStyle("#333333");
    context.fillText("自购省钱", 230 * bili, 577 * bili);
    context.fillText("分享赚钱", 49 * bili, 737 * bili);

    context.font = 'normal normal 18px sans-serif';
    context.setFontSize(20 * bili);
    context.setFillStyle("#333333");
    context.fillText("自己购买可省" + ratio_money + "元现金，金额可提现", 230 * bili, 617 * bili);
    context.fillText("粉丝购买可赚" + ratio_money + "元现金，金额可提现", 49 * bili, 777 * bili);
    context.save();
    //绘制二维码
    context.moveTo(317 * bili, 948 * bili);
    context.beginPath();
    context.arc(320 * bili, 947 * bili, 68 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.ewmImgUrl, 252 * bili, 880 * bili, 136 * bili, 136 * bili);
    context.restore();
    context.draw({
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvasId: 'lafenCanvas',
    }, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          canvasId: 'lafenCanvas',
          fileType: 'png',
          quality: 1.0,
          success: res => {
            let data = res.tempFilePath;
            this.setData({
              lafenImgurl: res.tempFilePath
            })
            wx.hideLoading();
          },
          fail: fail => {
            console.log(fail);
            wx.hideLoading();
            wx.showModal({
              title: '提示信息',
              content: "海报生成失败，请重试...",
              confirmText: '知道了',
              showCancel: false,
              confirmColor: '#fe6b31',
              success: (result) => {
                this.setData({
                  haibaoCanvas: false
                })
              }
            })
          }
        })
      }, 1000)
    })
  },
  downLoadHb() { //保存海报
    wx.saveImageToPhotosAlbum({
      filePath: this.data.lafenImgurl,
      success: res => {
        wx.showModal({
          title: '提示信息',
          content: "海报已保存到相册，请查看...",
          confirmText: '知道了',
          showCancel: false,
          confirmColor: '#fe6b31',
          success: (result) => {
            console.log("海报保存成功", result)
          }
        })
      },
      fail: res => {
        console.log(res);
        wx.showModal({
          title: '提示信息',
          content: "保存失败，请重试...",
          confirmText: '知道了',
          showCancel: false,
          confirmColor: '#fe6b31',
          success: (result) => {
            this.setData({
              haibaoCanvas: false
            })
          }
        })
      }
    })
  },
  closeCanvas() {
    this.setData({
      haibaoCanvas: false,
      showOpertaion:false
    })
  },
  //返回
  goback() {
    wx.navigateBack({ delata: 1 })
  },
  goToPage(e){
    // console.log(e)
    let url=e.currentTarget.dataset.url;
    wx.navigateTo({
      url: `${url}`,
    })
  },
  //获取手机号
  getPhoneNumber(e) {
    app.getPhoneNumber(e, this);
  }
  
})