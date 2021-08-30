// pages/SHOPGOODS//pages/user/checkin/checkin.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
var canvasFun = require(_url + '../../../utils/canvas-post.js');
var canvas = require(_url + '../../../utils/canvas.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    // 通过分享好友进入
    if(options.share_id){
      that.setData({
        share_id: options.share_id
      });
      that.checkinFun();
    }
    // 通过扫码进入
    if (options.scene != undefined && options.scene != 'wxapp') {
      var scene = decodeURIComponent(options.scene);
      console.log("二维码", scene);
      if (scene) {
        var scene_arr = scene.split(',');
        if (scene_arr.length == 2) {
          // 扫后台码进入直播间
          app.globalData.store_id = scene_arr[0];
          this.setData({
            share_id: scene_arr[1]
          });
        } else if (scene_arr.length > 2) { //扫分享码进来的
          app.globalData.store_id = scene_arr[0];
          app.globalData.share_uid = scene_arr[3];
          this.setData({
            share_id: scene_arr[1]
          });
          that.checkinFun();
        }
      };
    }

    that.pageFun();
  },
  // 页面信息
  pageFun: function(result) {
    let that = this;
    let url = 'app.php?c=ucenter&a=sign';
    let data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, 'pageData', that,'')
  },
  pageData: function (res) {
    let that = this;
    that.setData({
      pageData: res.err_msg
    });
    if(res.err_msg.points_desc){//返回提示信息
      let richbak = res.err_msg.points_desc.replace(/\，/g, '\n');
      that.setData({
        richbak: richbak
      });
    };
  },
  // 积分统计
  checkinFun:function(){
    let that = this;
    let url = 'app.php?c=ucenter&a=get_point_by_share';
    let data = {
        store_id: app.globalData.store_id || common.store_id,
        share_id: that.data.share_id,
        physical_id: '',
      };
    common.post(url, data, function(res){
      console.log('积分统计',res)
    },'')
  },
  // 点我签到
  checkClick:function(){
    let that = this;
    let url = 'app.php?c=ucenter&a=signup';
    let data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, function(){
      that.setData({
        showNum: true,
        'pageData.is_sign': true
      });
    }, '');
  },
  //显示对话框
  shareTap: function (e) {
    let that = this;
    that.dialog.showDialog();
  },
  //分享好友或群
  _shareGroup: function() {
    let that = this;
    that.dialog.showDialog();
  },
  //取消事件
  _cancelEvent: function() {
    var that = this;
    that.dialog.hideDialog();
  },
  //分享好友或群
  _shareGroup: function() {
    var that = this;
    if (!app.isLoginFun(that)) { //判断用户是否登录
      return false;
    }
    wx.showShareMenu({
      withShareTicket: false
    });
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function() {
    var that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/index/index',
      id: that.data.pageData.share_id,
      uid: 0,
      share_uid: getApp().globalData.my_uid,
      shareType: 'checkin'
    }
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    })
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function(res) {
        console.log('获取二维码成功')
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
          } else if (res.data.err_code == 1000) {
            console.log('未发布，暂不支持分享');
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function(res) {
                that.dialog.hideDialog();
              }
            });
          }
        }
      },
      fail: function(res) {
        wx.hideLoading();
      }
    })
  },
  // 生成分享海报
  creatPost: function() {
    let that = this;
    // 1 设置画布数据
    let pageData = that.data.pageData;
    let canvasData = { // 画布数据
      canvasId: 'productPost',
      canvasWidth: 750,
      canvasHeight: 1170,
      paddingLeft: 0,
      paddingTop: 0,
      whProportion: 1.2,
      nickname: pageData.user_name, //用户名称
      shopName: pageData.store_name, // 店铺名称
      text_qrcode_btm: '长按二维码选购商品', // 二维码下方文字
      // 图片数据
      userAvatar: pageData.avatar, //用户头像
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      coverImage: pageData.banner_image, // 背景图
    };
    let obj = canvas.px2rpx({
      w: canvasData.canvasWidth,
      h: canvasData.canvasHeight
    });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['coverImage', 'qrcodePath', 'userAvatar']
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j];
      task.push(canvasFun.loadImageFileByUrl(that.data.canvasData[filePath]))
    }
    Promise.all(task).then(resultList => {
      for (let filePathIndex = 0; filePathIndex < resultList.length; filePathIndex++) {
        let resultListElement = resultList[filePathIndex];
        that.data.canvasData[filePaths[filePathIndex]] = resultListElement.tempFilePath
      }
      that.setData({
        canvasData: that.data.canvasData
      });
      that.drawCanvas();
      // that.getImageMes();
      setTimeout(function() {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        that.save({
          id: that.data.canvasData.canvasId,
          w: w,
          h: h
        });
      }, 300)
    }).catch(err => {
      console.log(err);
    })
  },
  // 画图海报
  drawCanvas: function() {
    let that = this;
    let canvasData = that.data.canvasData
    let w = canvasData.canvasWidth;
    let h = canvasData.canvasHeight;
    let l = canvasData.paddingLeft;
    let t = canvasData.paddingTop;
    // 内部偏移量
    let innerLeft = 30;
    // 内部商品图片高度
    let imgH = w * 0.8;
    // 头像半径
    let head_r = 50;
    // 店铺logo半径
    let shop_r = 25;
    // 二维码半径
    let qrode_r = 80;
    let positionY = 0;
    
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制图片背景
    // canvas.roundImg({
    //   ctx: ctx,
    //   x: l,
    //   y: t,
    //   img: '/images/white_bg.png',
    //   w: w,
    //   h: h,
    // });
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: l,
      y: t,
      w: w,
      h: h,
      r: 20,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });
    // 绘制头像
    canvas.circleImg({
      ctx: ctx,
      img: canvasData.userAvatar,
      r: head_r,
      x: l + 45,
      y: innerLeft,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制用户名字
    canvas.drawText({
      ctx: ctx,
      text: canvasData.nickname,
      x: l + head_r * 2 + 75,
      y: innerLeft + head_r - 20,
      fontSize: 40,
      color: '#333'
    });

    var sx = that.data.sx,
      sy = that.data.sy,
      sw = that.data.sw,
      sh = that.data.sh;
    console.log(sx, "*************", sy, "*************", sw, "*************", sh)
    positionY = t + innerLeft*2 + head_r * 2;
    canvas.roundImg({
      ctx: ctx,
      x: innerLeft,
      sx: sx,
      y: positionY,
      sy: sy,
      img: canvasData.coverImage,
      w: w - innerLeft*2,
      sw: sw,
      h: imgH,
      sh: sh,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });
     
    // 绘制二维码
    canvas.drawImage({
      ctx: ctx,
      img: canvasData.qrcodePath,
      x: (w - qrode_r * 2) / 2,
      y: imgH + positionY + 60,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码下面文字
    canvas.drawText({
      ctx: ctx,
      text: canvasData.text_qrcode_btm,
      x: w / 2 - 145,
      y: imgH + positionY + qrode_r * 2 + 100,
      fontSize: 32,
      baseline: 'middle',
      color: '#666'
    });
    // 绘制二维码下面文字
    canvas.drawText({
      ctx: ctx,
      text: '分享自' + canvasData.shopName,
      x: w / 2 - 100,
      y: imgH + positionY + qrode_r * 2 + 150,
      fontSize: 28,
      baseline: 'middle',
      color: '#999'
    });
    // 最终绘出画布
    ctx.draw();
  },

  // 保存到相册
  save: function(o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function(res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      // saveImageToPhotosAlbum图片保存到本地相册
      canvas.saveImageToPhotosAlbum(o).then(function(res) {
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              if (that.data.isShowShare) {
                that.hideDialog();
              }
              wx.previewImage({
                urls: [o.imgSrc],
                current: o.imgSrc
              })
            }
          }
        })
      }, function(err) {
        console.log(err);
        wx.hideLoading();
        that.setData({
          'dialog.dialogHidden': false
        })
      });
    }, function(err) {
      console.log(err);
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    // 获得dialog组件
    setTimeout(function(){
      that.dialog = that.selectComponent("#shareModal");
      console.log(that.dialog)
    },1000);
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
    let that = this;
    if (!app.isLoginFun(this)) { //判断用户是否登录
      return false;
    }
    console.log('转发');
    let pageData = that.data.pageData;
    return getApp().shareGetFans(pageData.title, ` `, `pages/index/index`, `checkin`, pageData.banner_image,`&share_id=${pageData.share_id}`);
  }
})