// pages/SEALS//pages/register/register.js
var extConfig = wx.getExtConfigSync();
if (wx.getExtConfig) {
  wx.getExtConfig({
    success: function (res) {
      extConfig = res.extConfig;
    }
  })
}
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var types = extConfig.type;
var requestDomain = extConfig.apiUrl;
common.Url = requestDomain;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    way:0,//判断是否是从编辑进来
    cardid:0,//当前名片的id
    testCode: 0,//0表示未过期  1已过期
    group_detail: {},
    code: '',
    videoSrc:'',
    imgSrc:'',
    playIndex: null,//用于记录当前播放的视频的索引值
    textareaShow: false,//是否显示文本框
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    // publicFun.barTitle(that.data.registData.title || that.data.registData.store.name, that);//修改头部标题
    let login_info = wx.getStorageSync('str_login');
    console.log(login_info)
    let g_code = '';
    if (login_info) {
      login_info = login_info ? JSON.parse(login_info) : {};
      g_code = login_info.code;
    }
    if (wx.getStorageSync('unlogin') == false) {
      that.registData();
      that.cardFun();
    } else {
      that.myopenId(g_code);
    }
    // 扫码进入判断
    if (options.scene != undefined && options.scene != 'wxapp') {
      var scene_id = decodeURIComponent(options.scene);
      console.log("添加职工二维码", scene_id);
      if (scene_id) {
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          //console.log(result)
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id
          }
        },'');     
        // var scene_arr = scene.split(',');
        // app.globalData.store_id = scene_arr[0];        
      };      
    }
    // way进入注册页的方式0：注册；1：编辑
    if(options.way){
      that.setData({
        way: options.way
      })
    };
    if (options.cardid){
      that.setData({
        cardid: options.cardid
      });
      that.cardData();
    }    
  },
  // 二维码过期与否
  registData: function() {
    let that = this;
    let url = 'app.php?c=businesscard&a=checkErWeiMaExpire',
    data={
      uid: app.globalData.my_uid
    }
    common.post(url, data, function(res) {
      that.setData({
        testCode: res.err_msg.status
      });
    }, '');
  },
  // 不授权获取用户openID
  myopenId: function (g_code) {
    let that = this;
    let url = 'app.php?c=wxapp&a=store_login',
      data = {
        code: app.globalData.login.code || g_code
      }
    common.post(url, data, function (result) {
      app.globalData.my_uid = result.err_msg.user.uid;
      wx.setStorageSync('openId', result.err_msg.user.openId);
      that.registData();
      that.cardFun();
    }, '')
  },
  // 名片信息，用来判断用户是否已经注册过
  cardFun: function (result) {
    let that = this;
    let url = 'app.php?c=businesscard&a=detail',
      data = {
        uid: app.globalData.my_uid,
        store_id: app.globalData.store_id || common.store_id,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'cardDataF', that)
  },
  cardDataF: function (res) {
    var that = this;
    console.log('卡片信息',res);
    that.setData({
      myuserid: res.err_msg.myuserid
    });
    if (that.data.way == 0 && that.data.myuserid!=0){
      wx.redirectTo({
        url: '../card/card',
        success: function(res) {
          console.log('已注册过跳转到名片页',res);
        }
      })
    }
  },
  // 名片编辑数据
  cardData: function(){
    let that = this;
    let url = 'app.php?c=businesscard&a=edituser',
    data = {
      uid: app.globalData.my_uid,
      store_id: app.globalData.store_id || common.store_id,
      id: that.data.cardid,
      openid: wx.getStorageSync('openId')
    };
    common.post(url, data, function (res) {
      console.log(res);
      let cardData = res.err_msg;
      var imgSrcs=[];
      for (var i=0; i < cardData.myimages.length; i++){
        imgSrcs.push(cardData.myimages[i].fileurl);
      }
      console.log(imgSrcs);
      that.setData({        
        'group_detail.avatarUrl': cardData.avatarurl,
        'group_detail.name': cardData.xmname,
        'group_detail.work': cardData.positioner,
        'group_detail.tel': cardData.cellphone,
        'group_detail.call': cardData.telephone,
        'group_detail.chat': cardData.wxaccount,
        'group_detail.email': cardData.email,
        'group_detail.introduce': cardData.introduce,
        videoSrc: cardData.myvideos,
        imgSrc: imgSrcs,
      });
    }, '');
  },
  // 数据绑定
  // 输入姓名
  bindName: function(e) {
    this.setData({
      "group_detail.name": e.detail.value
    })
  },
  // 输入职位
  bindWork: function(e) {
    this.setData({
      "group_detail.work": e.detail.value
    })
  },
  // 输入手机号
  bindTel: function(e) {
    this.setData({
      "group_detail.tel": e.detail.value
    })
  },
  // 输入固定电话
  bindCall: function(e) {
    this.setData({
      "group_detail.call": e.detail.value
    })
  },
  // 输入微信
  bindChat: function(e) {
    this.setData({
      "group_detail.chat": e.detail.value
    })
  },
  // 输入邮箱
  bindEmail: function(e) {
    this.setData({
      "group_detail.email": e.detail.value
    })
  },
  // 个人简介
  bindApplynotes: function(e) {
    this.setData({
      "group_detail.introduce": e.detail.value
    })
  },
  // 点击显示textarea文本框
  showTextarea:function(){
    let that = this;
    that.setData({
      textareaShow:true
    });
  },
  hideTextarea:function(){
    let that = this;
    that.setData({
      textareaShow: false
    });
  },
  // 获取头像
  getHeaderPhoto:function(){
    let that = this;
    wx.chooseImage({ //图片上传控件
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '头像正在上传中...',
          mask: true
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function (_res) {
          that.setData({
            "group_detail.avatarUrl": _res.err_msg,
          });
          wx.hideLoading();
        }, '')
      }
    })
  },
  
  // 获取手机号
  getPhoneNumber: function(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that, that.data.code);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            that.data.code = res.code
          }
        })
      }
    })

  },
  // 表单提交
  grouperSave: function() {
    let that = this;
    if (!this.data.group_detail.avatarUrl) {
      return publicFun.warning('请上传您的头像', that);
    };
    if (!this.data.group_detail.name) {
      return publicFun.warning('请填写您的姓名', that);
    };
    if (!this.data.group_detail.work) {
      return publicFun.warning('请填写您的职位', that);
    };
    let phone_no = this.data.group_detail.tel || this.data.phoneNumber;
    if (!(/^1[0123456789]\d{9}$/.test(phone_no))) {
      let that = this;
      return publicFun.warning('手机号码格式不正确', that);
    };
    let params = {
      uid: app.globalData.my_uid,
      store_id: app.globalData.store_id || common.store_id,
      id: that.data.cardid,
      openid: wx.getStorageSync('openId'),
      avatarurl: this.data.group_detail.avatarUrl,
      xmname: this.data.group_detail.name,
      positioner: this.data.group_detail.work,
      cellphone: this.data.group_detail.tel || this.data.phoneNumber,
      telephone: this.data.group_detail.call,
      wxaccount: this.data.group_detail.chat,
      email: this.data.group_detail.email,
      introduce: this.data.group_detail.introduce,
      "imgfile": that.data.imgSrc,
      "vidfile": that.data.videoSrc
    }
    let url = "app.php?c=businesscard&a=saveUser";
    common.post(url, params, function(res) {
      wx.setStorageSync('uId', res.err_msg.userid);
      let uId = res.err_msg.userid
      console.log('名片注册', res)
      if (res.err_code == 0) {
        if(that.data.way == 0){
          that.wxCode(uId);
          wx.navigateTo({
            url: './complated?uId=' + uId,
          });
        }else{
          wx.redirectTo({
            url: '../card/card?uId=' + uId,
          });
        }
      }
    }, '')
  },
  // 添加视频
  addVideo: function() {
    var that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function(res) {
        console.log(res);
        let videoSrcLise = that.data.videoSrc || [];
        // let videoInfo = {};
        
        // videoInfo['fileurl'] = res.tempFilePath;
        // videoInfo['coverimg'] = res.thumbTempFilePath;
        if (res.duration > 300){
          return publicFun.warning('视频长度不超过5分钟', that);
        }
        if (res.size > 1024 * 1024 * 25) {
          return publicFun.warning('视频大小不超过25M', that);
        }
        // videoSrcLise.push(videoInfo);
        // that.setData({
        //   videoSrc: videoSrcLise
        // });
        // console.log(that.data.videoSrc);
        // 视频、图片上传
        wx.showLoading({
          title: '视频正在上传中...',
          mask: true
        })
        var tempFilePathsed = res.tempFilePath;
        let videoUrl = 'app.php?c=attachment&a=file_upload';
        that.upload_file_video(videoUrl, that, tempFilePathsed);
      }
    })
  },
  // 视频暂停
  videoPlay:function(e){
    publicFun.videoPlay(this,e);
  },
  // 添加图片
  addImage:function(){
    var that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const imgList = res.tempFilePaths;//上传的图片数据
        const imageList = that.data.imgSrc || [];//原始的图片数据
        let nowLenght = imgList.length;//当前上传的图片数量
        let imageLenght = imageList.length;//原来的图片数量  
        let data={
          store_id: app.globalData.store_id || common.store_id,
        };
        if (nowLenght > 9) {
          return publicFun.warning('最多上传9张图片', that);
        }
        if (imageLenght == 9) {
          return publicFun.warning('数量已经有9张，请删除在添加...', that);
        }      
        if (imageLenght < 9){
          let imgPath = [];
          let residue = 9 - imageLenght;//获取缺少的图片张数
          if (residue >= nowLenght) {//如果缺少的张数大于当前的的张数
            imgPath = imageList.concat(imgList);
          }else{
            imgPath = imageList.concat(imgList.slice(0, residue));
          }
          that.setData({
            imgSrc: imgPath
          });
          console.log(that.data.imgSrc)
        } 
        // 调用上传
        wx.showLoading({
          title: '图片正在上传中...',
          mask: true
        })
        let imgUrl = 'app.php?c=attachment&a=upload';
        var imgSrc = that.data.imgSrc;
        console.log(imgSrc)
        for (var i in imgSrc){
          that.upload_file_server(imgUrl, that, imgSrc,i);
        }       
      },
    })
  },
  // 上传视频
  upload_file_video: function (videoUrl, that, tempFilePathsed){
    const upload_video_fun = common.uploadFile(videoUrl, tempFilePathsed, function (_res) {
      console.log(_res.err_msg);
      let videoSrcLise = that.data.videoSrc || [];
      let videoInfo = {};
      videoInfo['fileurl'] = _res.err_msg.url;
      videoInfo['coverimg'] = _res.err_msg.vthumb;
      videoSrcLise.push(videoInfo);
      that.setData({
        videoSrc: videoSrcLise
      });
      wx.hideLoading();
    }, '');
  },
  // 上传图片方法
  upload_file_server: function (imgUrl, that, imgSrc, i){
    console.log(imgSrc[i]);
    const upload_img_fun = common.uploadFile(imgUrl, that.data.imgSrc[i], function (_res) {
      var filename = _res.err_msg;
      imgSrc[i] = filename
      that.setData({
        imgSrc: imgSrc
      })
      wx.hideLoading();
    }, '');
    //上传 进度方法
    // upload_img_fun.onProgressUpdate((res) => {
    //   console.log(res)
    //   console.log(res.progress)
    //   imgSrc[i]['upload_percent'] = res.progress
    //   that.setData({
    //     imgSrc: imgSrc
    //   });
    // });
  },
  // 删除上传图片 或者视频
  delFile(e) {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除吗？',
      success(res) {
        if (res.confirm) {
          let delNum = e.currentTarget.dataset.index,
            delType = e.currentTarget.dataset.type,
            imgSrc = that.data.imgSrc,
            videoSrc = that.data.videoSrc;
          if (delType == 'image') {
            imgSrc.splice(delNum, 1)
            that.setData({
              imgSrc: imgSrc
            })
          } else if (delType == 'video') {
            videoSrc.splice(delNum, 1)
            that.setData({
              videoSrc: videoSrc
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },  
  // 生成二维码
  wxCode: function (cardId,) {
    var that = this;
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/SEALS/pages/card/card',
      id: cardId,
      uid: getApp().globalData.my_uid,
      share_uid: '',
      shareType: 1
    }
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
              qrcodePath: res.data.err_msg
            });
            that.savePhoto(that.data.qrcodePath);
          } else if (res.data.err_code == 1000) {
            console.log('未发布，暂不支持分享');
            wx.hideLoading();
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
      }
    })
  },
  // 保存到相册
  savePhoto:function(codeImgSrc){    
    wx.downloadFile({
      url: codeImgSrc,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("当用户拒绝，再次发起授权")
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  } else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          },
          complete(res) {
            console.log(res);
          }
        })
      }
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
  onShareAppMessage: function() {

  }
})