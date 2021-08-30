// pages/SEALS//pages/card/card.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
let creatingPost = false;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',//
    iconClass: ['icon-telephone', 'icon-dianhua', 'icon-weixin_icon', 'icon-youxiang', 'icon-dizhi'],
    userMessage: ['手机号', '拨打座机', '微信', '邮箱', '地址'],
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    canvasImgState: false,
    canvasData: {},
    shareuid: '', //分享者uid
    cardid: '', //名片
    cardData: '',
    cardShow:true,
    playIndex: null, //用于记录当前播放的视频的索引值
    showCard:1,//0:显示海报，1：显示简单的名片
    butshow:false,//海报图预览显示
    myimgsrc:'',//海报图图片路径
    closeModal: false,//关闭保存成功弹窗
    cardimgsrc:'',//名片图图片路径
    saveImgBtnHidden: true,//是否显示保存/授权相册按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(e) {
    let that = this;
    console.log('带过来的参数',e)
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录 
    if (e.uId) {
      that.setData({
        cardid: e.uId
      })
    }
    if (wx.getStorageSync('uId')) {
      that.setData({
        cardid: wx.getStorageSync('uId')
      })
    }
    // 通过分享朋友圈进入
    if (e.share_uid){
      that.setData({
        cardid: e.myuserid
      });
    }

    // 扫码进入判断
    if (e.scene != undefined && e.scene != 'wxapp') {
      var scene_id = decodeURIComponent(e.scene);
      console.log("卡片二维码", scene_id);
      if (scene_id) {
        var scene_arr = scene.split(',');
        // 扫查看职工二维码查看员工信息
        if (scene_arr.length==2){
          app.globalData.store_id = scene_arr[0];
          var cardid = scene_arr[1];
          this.setData({
            cardid: cardid,
          })
        } else if (scene_arr.length > 2){//扫分享码进来的
          app.globalData.store_id = scene_arr[0];
          var cardid = scene_arr[1];
          var shareuid = scene_arr[3]
          this.setData({
            cardid: cardid,
            shareuid: shareuid
          });
        }       
      };
    } 
    // 不授权获取openID
    let login_info = wx.getStorageSync('str_login');
    let g_code = '';
    if (login_info) {
      login_info = login_info ? JSON.parse(login_info) : {};
      g_code = login_info.code;
    }
    if (wx.getStorageSync('unlogin') == false || app.globalData.my_uid) {
      that.cardFun();
    } else {
      that.myopenId(g_code);
    }
  },
  // 不授权获取用户openID
  myopenId: function (g_code){
    let that = this;
    let url = 'app.php?c=wxapp&a=store_login',
    data={
      code: app.globalData.login.code || g_code
    }
    common.post(url, data, function (result){
      app.globalData.my_uid = result.err_msg.user.uid;
      // wx.setStorageSync('openId', result.err_msg.user.openId);
      that.cardFun();
    }, '')
  },
  // 数据请求
  cardFun: function(result) {
    let that = this;
    let url = 'app.php?c=businesscard&a=detail',
      data = {
        uid: app.globalData.my_uid,
        store_id: app.globalData.store_id || common.store_id,
        shareuid: that.data.shareuid,
        id: that.data.cardid,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'cardDataF', that)
  },
  cardDataF: function(res) {
    var that = this;
    console.log('名片数据',res);
    that.setData({
      cardData: res.err_msg,
      cardid: res.err_msg.id
    });
    // 截取拼接链接
    that.data.cardData.advinfo[0].adUrl = publicFun.getType(that.data.cardData.advinfo[0].adUrl,'card');
    that.setData({
      cardData: that.data.cardData,
      cardShow:false
    });
    // that.creatPost();
    publicFun.barTitle(that.data.cardData.titlename[0].tname ? that.data.cardData.titlename[0].tname : '名片', that); //修改头部标题        
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(e) {
    console.log(e);
    let that = this;
    //=========================检测登录授权====================================
    wx.getSystemInfo({ //获取设备信息
      success: function(res) {
        that.setData({
          imageHeight: res.windowWidth,
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      },
    });
    // 获得dialog组件
    setTimeout(function() {
      that.dialog = that.selectComponent("#shareModaled");
      console.log(that.dialog)
    }, 1000);
  },

  // 编辑
  cardEdit: function() {
    let that = this;
    wx.navigateTo({
      url: '../register/register?way=1' + '&cardid=' + that.data.cardid,
    })
  },
  // 切换到我的名片
  cardChange: function() {
    let that = this;
    that.setData({
      cardid: that.data.cardData.myuserid
    });
    that.cardFun();
  },
  // 存入手机通讯录
  addPhone: function() {
    let that = this;
    let message = that.data.cardData;
    wx.addPhoneContact({
      lastName: message.xmname.split('').splice(0, 1), //姓
      firstName: message.xmname.split('').splice(1).join(''), //名字
      mobilePhoneNumber: message.cellphone, //手机号
      organization: message.company.name, //公司
      title: message.positioner, //职位
      workPhoneNumber: message.telephone, //工作电话
      hostNumber: message.telephone, //公司电话
      weChatNumber: message.wxaccount, //微信号
      email: message.email, //电子邮件
      addressState: message.company.province, //地址省
      addressCity: message.company.city + message.company.area, //城市
      addressStreet: message.company.address, //街道
      success: function(e) {
        console.log('添加成功')
      }
    })
  },
  //显示对话框
  shareTap: function() {
    let that = this;
    that.dialog.showDialog();
    if (!that.data.cardimgsrc) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      that.creatPost();
    }
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
    that.setData({
      canvasImgState: false
    })
  },
  //分享好友或群
  _shareGroup: function() {
    var that = this;
    console.log('分享好友或群');
    that.setData({
      showCard: 1
    });
    that.creatPost();
    if (that.data.cardimgsrc){
      wx.showShareMenu({
        withShareTicket: false
      });
    }    
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function() {
    var that = this;
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/SEALS/pages/card/card',
      id: that.data.cardData.id,
      uid: getApp().globalData.my_uid,
      share_uid: that.data.cardData.myuid,
      shareType: 1
    }
    creatingPost = true
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    })
    // that.setData({
    //   showCard: 0
    // })
    // that.creatPost();
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功');
        if (res.statusCode == 200) {
          if (res.data.err_code == 0) {
            that.setData({
              qrcodePath: res.data.err_msg,
              showCard:0
            })
            // 处理canvas
            wx.showLoading({
              title: '海报生成中...',
              mask: true
            });
            // 调用画好的海报
            that.creatPost();
          } else if (res.data.err_code == 1000) {
            console.log('未发布，暂不支持分享');
            wx.hideLoading();
            creatingPost = false
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function (res) {
              }
            });
          }
        } 
      },
      fail: function (res) {
        wx.hideLoading();
        creatingPost = false
      }
    })
  },
  /*
   *
   **分享对话框 shareModal end
   *
   */
  // 创建海报所需要处理的数据
  creatPost: function() {
    let that = this;
    let mesData = that.data.cardData;
    // 1 设置画布数据
    // 姓名
    let product_name = mesData.xmname;
    // 职位
    let product_positioner = mesData.positioner;
    // 电话
    let product_cellphone = mesData.cellphone;
    // 邮箱
    let product_email = mesData.email;
    // 地址
    let product_adress = mesData.company.province + mesData.company.city + mesData.company.area + mesData.company.address;
    var code_qrcodePath = '';
    if (that.data.showCard == 0) {
      code_qrcodePath = 'https://' + that.data.qrcodePath.split('://')[1];
    }else{
      code_qrcodePath = that.data.cardData.avatarurl;
    }
    let canvasData = { // 定义画布数据
      status: true,
      canvasId: 'productPost',
      // canvasWidth: 500,
      // canvasHeight: 680,
      // paddingLeft: that.data.winWidth * 0.15,
      // paddingTop: that.data.winWidth * 0.15,
      canvasWidth: 670,
      canvasHeight: 740,
      paddingLeft: 40,
      paddingTop: 30,
      radius: 10,
      bg_color: '#ffffff', // 画图填充背景色（不设置默认会生成透明背景的图片）
      c_phone: '../../../../images/c_phone.png', // 电话图
      c_emile: '../../../../images/c_emile.png', //邮件
      c_adress: '../../../../images/c_adress.png', // 地址
      bgPath: '../../images/card.png', // 名片背景图
      product_name: product_name, // 活动名称/姓名
      product_positioner: product_positioner, //职位
      product_cellphone: product_cellphone, //电话
      product_email: product_email, //邮箱
      product_adress: product_adress, //地址
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方/右方文字
      loadFailTapStatus: false, // 下载失败处理函数是否已执行
      // 图片数据
      avatarPath: that.data.cardData.avatarurl, // 用户头像
      qrcodePath: code_qrcodePath, // 二维码
      // qrcodePath: that.data.cardData.avatarurl, // 二维码
    };
    // 绘制画布（通过定义好的px2rpx函数）
    let obj = canvas.px2rpx({
      w: canvasData.canvasWidth,
      h: canvasData.canvasHeight,
      base: that.data.winWidth
    });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    // 存放本地图片路径
    let task = []
    // 存放图片
    let filePaths = ['qrcodePath', 'avatarPath']
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j];
      // loadImageFileByUrl下载文件资源到本地。客户端直接发起一个 HTTPS GET 请求，返回文件的本地临时路径
      task.push(canvasFun.loadImageFileByUrl(that.data.canvasData[filePath]))
    }
    // 通过Promise.all批量异步处理路径返回resultList数组
    Promise.all(task).then(resultList => {
      // 作用将转化的本地路径存到canvasData下的filePaths
      for (let filePathIndex = 0; filePathIndex < resultList.length; filePathIndex++) {
        let resultListElement = resultList[filePathIndex];
        that.data.canvasData[filePaths[filePathIndex]] = resultListElement.tempFilePath
      }
      that.setData({
        canvasData: that.data.canvasData
      })
      // 调用海报结构
      if (that.data.showCard == 0){
        that.drawCanvas();
      } else if (that.data.showCard == 1){
        that.drawCard();
      }
      
      setTimeout(function() {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        // 调用保存海报到本地
        if (that.data.showCard == 0) {
          that.save({
            id: that.data.canvasData.canvasId,
            w: w,
            h: h,
            targetW: w * 4,
            targetH: h * 4
          });
        } else if (that.data.showCard == 1) {
          that.save({
            id: that.data.canvasData.canvasId,
            w: 670,
            h: 350,
            targetW: w * 8,
            targetH: h * 8
          });
        }
        
      }, 300)
    }).catch(err => {
      console.log(err);
      creatingPost = false
    })
  },

  // 绘制海报图结构
  drawCanvas: function() {
    let that = this;
    let userMes = that.data.canvasData; 
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部商品图片偏移量
    let innerLeft = 40;
    // 内部商品图片高度
    let imgH = w - (left + innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 70;
    let positionY = 0;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);

    // 绘制白色圆角背景
    if (userMes.product_email) {
      canvas.roundRect({
        ctx: ctx,
        x: left,
        y: top,
        w: w - left * 2,
        h: h - top,
        r: 20,
        blur: 20,
        shadow: 'rgba(80,80,80,1)'
      });
    }else{
      canvas.roundRect({
        ctx: ctx,
        x: left,
        y: top,
        w: w - left * 2,
        h: h - top - 60,
        r: 20,
        blur: 20,
        shadow: 'rgba(80,80,80,1)'
      });
    }
    

    // 绘制头像
    positionY = top + 72;
    canvas.circleImg({
      ctx: ctx,
      img: that.data.canvasData.avatarPath,
      r: head_r,
      x: left + 48,
      y: positionY,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制头像右侧多行文字
    canvas.drawText({ //姓名
      ctx: ctx,
      text: that.data.canvasData.product_name,
      x: left + head_r * 2 + 80,
      y: positionY + 10,
      fontSize: 36,
      color: '#08132D'
    });
    canvas.drawText({ //职位
      ctx: ctx,
      text: that.data.canvasData.product_positioner,
      x: left + head_r * 2 + 80,
      y: positionY + 72,
      fontSize: 26,
      color: '#606165'
    });

    // 绘制中间容器    
    positionY = positionY + head_r * 2 + 40;
    // 绘制白色圆角背景
    if (userMes.product_email) {
      canvas.roundRect({
        ctx: ctx,
        x: left + 40,
        y: positionY,
        w: w - left * 2 - 80,
        h: 250,
        r: 10,
        blur: 20,
        shadow: 'rgba(180,180,180,.4)'
      });
    } else {
      canvas.roundRect({
        ctx: ctx,
        x: left + 40,
        y: positionY,
        w: w - left * 2 - 80,
        h: 180,
        r: 10,
        blur: 20,
        shadow: 'rgba(180,180,180,.4)'
      });
    }
    // 绘制员工信息    
    canvas.drawImage({ //电话图
      ctx: ctx,
      img: userMes.c_phone,
      x: left + innerLeft + 40,
      y: positionY + 34,
      w: 30,
      h: 30
    });
    canvas.drawText({ //电话
      ctx: ctx,
      text: userMes.product_cellphone,
      x: left + innerLeft + 80,
      y: positionY + 36,
      fontSize: 26,
      color: '#313334'
    });
    if (userMes.product_email){
      canvas.drawImage({ //邮件图
        ctx: ctx,
        img: userMes.c_emile,
        x: left + innerLeft + 40,
        y: positionY + 94,
        w: 30,
        h: 30
      });
      canvas.drawText({ //邮件
        ctx: ctx,
        text: userMes.product_email,
        x: left + innerLeft + 80,
        y: positionY + 96,
        fontSize: 26,
        color: '#313334'
      });
    }
    if (userMes.product_email) {
      positionY = positionY;
    } else {
      positionY = positionY - 60;
    }
    canvas.drawImage({ //地址图
      ctx: ctx,
      img: userMes.c_adress,
      x: left + innerLeft + 40,
      y: positionY + 144,
      w: 30,
      h: 30
    });
    let aDerssed = userMes.product_adress;
    if (aDerssed.length > 17) {
      if (aDerssed.length > 34) {
        aDerssed = aDerssed.slice(0, 17) + '\n' + aDerssed.slice(17, 33) + "...";
      } else {
        aDerssed = aDerssed.slice(0, 17) + '\n' + aDerssed.slice(17, aDerssed.length);
      }
      canvas.drawMultiText({ //地址
        ctx,
        text: aDerssed,
        x: left + innerLeft + 80,
        y: positionY + 146,
        fontSize: 26,
        gap: 8,
        color: '#313334'
      });
    } else {
      canvas.drawMultiText({ //地址
        ctx,
        text: aDerssed,
        x: left + innerLeft + 80,
        y: positionY + 146,
        fontSize: 26,
        color: '#313334'
      });
    }


    // 绘制二维码
    positionY = positionY + 215;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x: left + innerLeft,
      y: positionY + 70,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码右侧文字
    canvas.drawText({
      ctx: ctx,
      text: '长按识别小程序码 即可查看~',
      x: left + innerLeft + qrode_r * 2 + 10,
      y: positionY + qrode_r + 75,
      fontSize: 28,
      baseline: 'middle',
      color: '#919398'
    });

    // 最终绘出画布
    ctx.draw();
  },

  // 生成海报图
  save: function(o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function(res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      if (that.data.showCard == 0){
        that.setData({
          canvasImg: res.tempFilePath,
          canvasImgState: true,
          myimgsrc: o.imgSrc,
          butshow: true
        });
        that.dialog.hideDialog();
      } else if (that.data.showCard == 1){
        that.setData({
          canvasImg: res.tempFilePath,
          canvasImgState: true,
          cardimgsrc: o.imgSrc
        });
        console.log(that.data.cardimgsrc)
      }      
    }, function(err) {
      console.log(err);
      wx.hideLoading();
      wx.showLoading({
        title: '生成失败...',
        mask: true
      });
      setTimeout(function(){
        wx.hideLoading();
      },500);
    });
  },
  // 海报点击关闭
  closeCanvas:function(){
    let that = this;
    that.setData({
      butshow: false
    });
  },
  // 海报点击保存
  saveCanvas: function () {
    let that = this;
    wx.showLoading({
      title: '正在保存中...',
      mask: true
    })
    console.log(that.data.myimgsrc)
    wx.getSetting({
      success(res) {
        console.log('666',res)
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.hideLoading();
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              console.log('用户同意授权')
              that.savaImageToPhoto();
            },
            fail() {//这里是用户拒绝授权后的回调
              console.log('用户拒绝授权');
              that.setData({
                saveImgBtnHidden: false
              })
            }
          })
        } else {//用户已经授权过了
          console.log('用户已经授权过了')
          that.savaImageToPhoto();
        }
      }
    })
  },
  // 用户取消授权重新授权
  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        confirmColor: app.globalData.navigateBarBgColor,
        showCancel: false
      })
      that.setData({
        saveImgBtnHidden: false,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        confirmColor: app.globalData.navigateBarBgColor,
        showCancel: false
      })
      that.setData({
        saveImgBtnHidden: true
      })
    }
  },
  // 保存到相册
  savaImageToPhoto:function(){
    let that = this;
    // saveImageToPhotosAlbum图片保存到本地相册
    wx.saveImageToPhotosAlbum({
      filePath: that.data.myimgsrc,
      success: function () {
        console.log('保存成功');
        wx.hideLoading();
        that.setData({
          butshow: false,
          closeModal: true
        });
      },
      fail: function (res) {
        console.log('用户取消保存');
        console.log(res);
        wx.hideLoading();
      }
    });
  },
  // 关闭保存成功
  closeModaled: function (e) {//关闭弹窗
    this.setData({
      closeModal: false
    })
  },
  // 绘制简单名片
  drawCard:function(){
    let that = this;
    let w = 670;
    let h = 670;
    let left = 30;
    let top = 30;
    // 内部商品图片偏移量
    let innerLeft = 40;
    // 内部商品图片高度
    let imgH = w - (left + innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 70;
    let positionY = 0;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制圆角背景图
    canvas.roundImg({
      ctx: ctx,
      x: 0,
      y: 0,
      img: that.data.canvasData.bgPath,
      w: w,
      h: h,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      cover: true,
      coverH: 140
    });

    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: left,
      y: top,
      w: w - left * 2,
      h: 250,
      r: 20,
      blur: 20,
      shadow: 'rgba(80,80,80,0)'
    });

    // 绘制头像
    positionY = top + 32;
    canvas.circleImg({
      ctx: ctx,
      img: that.data.canvasData.avatarPath,
      r: head_r,
      x: w - left * 2 - head_r * 2,
      y: positionY,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制头像右侧多行文字
    canvas.drawText({ //姓名
      ctx: ctx,
      text: that.data.canvasData.product_name,
      x: left + 40,
      y: positionY + 10,
      fontSize: 36,
      color: '#08132D'
    });
    canvas.drawText({ //职位
      ctx: ctx,
      text: that.data.canvasData.product_positioner,
      x: left + 40,
      y: positionY + 72,
      fontSize: 26,
      color: '#606165'
    });
    let userMes = that.data.canvasData;
    canvas.drawImage({ //电话图
      ctx: ctx,
      img: userMes.c_phone,
      x: left + 40,
      y: positionY + head_r * 2 + 34,
      w: 30,
      h: 30
    });
    canvas.drawText({ //电话
      ctx: ctx,
      text: userMes.product_cellphone,
      x: left + 80,
      y: positionY + head_r * 2 + 36,
      fontSize: 30,
      color: '#313334'
    });
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: left + 100,
      y: positionY + head_r * 2 + 150,
      w: w - left * 2 - 200,
      h: 80,
      r: 40,
      blur: 20
    });
    canvas.drawText({
      ctx: ctx,
      text: '立即查看',
      x: left + 235,
      y: positionY + head_r * 2 + 175,
      fontSize: 30,
      color: '#313334',
      shadow: 'rgba(80,80,80,0)'
    });
    // 最终绘出画布
    ctx.draw();
  },
  // 打电话、复制微信、邮箱、查找地址地址
  useNumber: function(e) {
    let that = this;
    let idx = e.currentTarget.dataset.idx;
    if (idx == 0 || idx == 1) {
      wx.makePhoneCall({
        phoneNumber: String(e.currentTarget.dataset.mobile)
      })
    } else if (idx == 2 || idx == 3) {
      wx.setClipboardData({
        data: String(e.currentTarget.dataset.text),
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              if (idx == 2) {
                wx.showToast({
                  title: '微信号已复制'
                })
              } else {
                wx.showToast({
                  title: '邮箱号已复制'
                })
              }
            }
          })
        }
      })
    } else if (idx == 4) {
      // 使用微信内置地图查看位置
      if (that.data.cardData.company.latitude != ''){
        wx.openLocation({
          latitude: that.data.cardData.company.latitude,
          longitude: that.data.cardData.company.longitude,
          scale: 18
        })
      }else{
        wx.showModal({
          title: '温馨提示',
          content: '公司未设置定位，请在后台设置好后便可定位呦',
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor,
          showCancel: false,
          success: function (res) {
          }
        });
      }
      
      // 打开地图选择位置
      // wx.chooseLocation({
      //   success: function (res) {
      //     console.log('chooseLocation', res);
          
      //   },
      //   fail: function (res) {
      //     console.log('fail', res);
      //     if (res.errMsg === 'chooseLocation:fail cancel') return;
      //     //res.errMsg === 'chooseLocation:fail auth deny' || res.errMsg === 'chooseLocation:fail auth denied'
      //     //用户取消授权
      //     if (res.errMsg) {
      //       _this.setData({ cancelLoaction: true })
      //       getSetting.call(_this)
      //     }
      //   }
      // })
      // publicFun.chooseLocation(this, function(res) {
        // 
      // })
      // 获取当前的地理位置、速度
      // publicFun.getLocation(this);
    }
  },
  // 主推商品跳转商品详情页
  goDetailed: function (e) {
    let that = this;
    let product_id = e.currentTarget.dataset.pid;
    console.log(product_id)
    wx.navigateTo({
      url: '/pages/product/details?product_id=' + product_id,
    })
  },
  // 视频暂停
  videoPlay: function(e) {
    publicFun.videoPlay(this, e);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(e) {
    let that = that;
    //=========================检测登录授权====================================
    let wx_ticket = wx.getStorageSync('ticket');
    if (wx_ticket) {
      if (this.data.cardData != '') {
        publicFun.setUrl('')
      }

    } else {
      var config_data = publicFun.getCurrentPages();
      app.getUserInfo({
        pageThat: that,
        refreshConfig: config_data,
        callback: '',
      });
    }
    // publicFun.checkAuthorize({ // (此种方式此页无法调用授权)
    //     pageData: this.data.cardData,
    //     app: app,
    //     callbackFunc: '',
    // })
    //=========================检测登录授权====================================
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {
    let that = this;
    const product = this.data.cardData;
    if (options.from === 'button') {
      that.dialog.hideDialog();
    }
    return getApp().shareGetFans(`您好！我是` + product.xmname + `这是我的名片请惠存！`, ` `, `/pages/SEALS/pages/card/card`, 1, that.data.cardimgsrc, `&myuserid=${product.myuserid}`);
  }
})