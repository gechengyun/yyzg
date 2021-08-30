// pages/SHOPKEEPER//pages/shop/videoSlide.js
var _url = '../../';
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
var app = getApp();
let animaTime;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // videoList,
    /** 轮播属性 */
    easingFunction: {
      type: String,
      value: 'default'
    },
    duration: {
      type: Number,
      value: 500
    },
    /** 视频属性 */
    loop: {
      type: Boolean,
      value: true
    },
    current: 0,//当前所在滑块的 index
    opt: '',//上下滑动参数up：上划；down：下滑
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    canvasImgState: false,//海报
    canvasData: {},
    comfrom: 0,//进入方式0：列表，1：首页，2：导航
    saveImgBtnHidden: true,//是否显示保存/授权相册按钮
    moreData: -1,//显示更多按钮
    topicVal: '',//话题内容
    updateState: true,//进度条触发

    
    prevQueue: [],//当前循环的数组之前的数组
    curQueue: [],//当前循环的数组（prevQueue + curQueue + nextQueue = 总数组）
    nextQueue: [],//当前循环的数组之后的数组
    circular: true,//是否循环轮播
    _last: 1, //记录当前索引（current）的，用来计算是向上滑动还是向下滑动
    _change: -1,//记录需要替换的current位置
    _invalidUp: 0,//计数器，累计向上滑动的个数
    _invalidDown: 0,//计数器，累计向下滑动的个数(为了计算prevQueue，nextQueue数组的能取几次，就是存了多少)
    firstShow: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // console.log('短视频',options)
    publicFun.setBarBgColor(app, that); //修改头部颜色
    setTimeout(function(){
      publicFun.setBarBgColor(app, that); // 设置导航条背景色 
    },500);
    publicFun.setNavSize(that); // 通过获取系统信息计算导航栏高度
    app.isLoginFun(that, 1);//判断用户是否登录
    if (options.society_id){      
      that.setData({
        society_id: options.society_id
      })
    };
    if(options.comfrom){//进入方式0：列表，1：首页，2：导航
      that.setData({
        comfrom: options.comfrom
      });
    }
    if(options.goType){
      that.setData({
        goType: options.goType
      });
    }

    // 扫码进入判断
    if (options.scene != undefined && options.scene != 'wxapp') {
      var scene_id = decodeURIComponent(options.scene);
      console.log("短视频页面", scene_id);
      if (scene_id) {
        that.setData({
          firstShow: false
        });
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id
            app.globalData.share_uid = result.err_msg.share_uid
            var society_id = result.err_msg.society_id
            that.setData({
                society_id: society_id,
            });
            that.videoData(that.data.opt,that.data.society_id);
          }
        },'');     
      };
    }
    if(that.data.firstShow){
    that.videoData(that.data.opt,that.data.society_id);
    }
  },

  // 基础信息
  videoData: function (opt,society_id) {
    console.log(society_id,112235680);
    let that = this;
    let url = 'app.php?c=society&a=get_video_society',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: society_id,
        comfrom: that.data.comfrom,
        opt: opt
      };
    common.post(url, data, function (res) {
      let listTem = that.data.videoList;
      var dataList = res.err_msg.info;
      //添加新任务列表
      if(opt == 'up'){//上划
        that.setData({
          videoList: listTem.concat(dataList)
        });
      }else if(opt == 'down'){//下滑
        that.setData({
          videoList: dataList.concat(listTem)
        },function(){
          console.log(that.data.videoList)
          console.log(that.data.videoList.length)
        });
      }else {
        that.setData({
          videoData: res.err_msg,
          videoList: res.err_msg.info
        },function(){
          if (that.data.curQueue.length === 0) {
            that.setData({
              curQueue: res.err_msg.info.splice(0, 3)
            }, function(){
              that.playCurrent(that.data.current);
              that.tipanimation();
            });
          }
        });
      }
    }, '')
  },
  goBack:function(e){
    console.log(e);
    let that = this;
    let type = e.currentTarget.dataset.type;
    if(type == 'pre'){
      if(that.data.comfrom == 1 || that.data.comfrom == 2){
        wx.redirectTo({
          url: '/pages/index/index',
        });
      }else if(that.data.comfrom == 0 && that.data.goType == 1){
        wx.redirectTo({
          url: '/pages/SHOPKEEPER/pages/shop/index',
        });
      }else{
        wx.navigateBack({
          delta: 1,
        });
      }
    }else{
      wx.redirectTo({
        url: '/pages/index/index',
      });
    }
  },
  // 话题接口
  // 发表评论
  wxSearchInput:function(e){//监听输入框
    let that = this;
    that.setData({
      topicVal: e.detail.value
    });
  },
  wxSearchFn:function(e){//发送按钮
    let that = this;
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
    that.setData({
      topicVal: e.detail.value || that.data.topicVal
    });
    if(that.data.topicVal != ''){
      that.testTxtFun(that.data.topicVal);
    }else if(that.data.topicVal == ''){
      return publicFun.warning('发送内容不能为空', that);
    }
  },
  // 发表评论接口
  addSay:function(topicVal){
    let that = this;
    let current = that.data.current;
    let url = 'app.php?c=society&a=add_comment',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: that.data.curQueue[current].id,
        content: topicVal || that.data.topicVal
      };
    common.post(url, data, function (res) {
      if(res.err_code == 0){
        that.setData({
          'sayList.list': res.err_msg.concat(that.data.sayList.list),
          'sayList2.list': res.err_msg.concat(that.data.sayList2.list.slice(0,9)),
          topicVal:'',
          showgetPhone: false,
          ['curQueue[' + current + '].comment_total']: ++that.data.curQueue[current].comment_total
        });        
      }
      if(res.err_code == 30002){
        that.setData({
          showgetPhone: true
        });
      }    
      console.log(that.data.sayList.list);
    }, '')
  },
  // 验证发布内容
  testTxtFun: function (testTxt) {
    let that = this;
    let url = 'app.php?c=society&a=msgSecCheck',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        msgSec: testTxt
      };
    common.post(url, data, 'testTxtData', that, '', true)
  },
  testTxtData: function (res,testTxt) {
    let that = this;
    console.log(res);
    if (res.err_msg.errcode == 87014){
      return publicFun.warning('请检查是否有违法违规的内容', that, 'red');
    }else{
      that.addSay(testTxt);
    }
  },
  // 评论列表
  sayList:function(page,id){
    let that = this;
    let url = 'app.php?c=society&a=comment_list',
      data = {
        society_id: id,
        page: page,
        pagesize: 10
      };
    common.post(url, data, function (res) {
      if(page == 1){
        that.setData({
          sayList: res.err_msg,
          next_page: res.err_msg.next_page
        },function(){
          that.setData({//显示聊天弹窗
            showChat: true,
            'sayList2.list':  that.data.sayList.list.slice(0,10)
          });
        });
      }
    }, '')
  },
  // 列表点赞
  listHeart:function(e){
    let that = this;
    let current = that.data.current;
    let likeid = e.currentTarget.dataset.likeid;
    let idxs = e.currentTarget.dataset.idxs;
    let url = 'app.php?c=society&a=comment_like',//点赞
    data = {
      society_id: that.data.curQueue[current].id,
      store_id: app.globalData.store_id || common.store_id,
      comment_id: likeid
    };
    common.post(url, data, function (res) {
      that.setData({
        ['sayList2.list[' + idxs + '].ismylike']: res.err_msg.islike,
        ['sayList2.list[' + idxs + '].likenumstr']: res.err_msg.likenumstr
      })
    },'');
  },
  tipanimation:function() {
    let that = this;
    clearTimeout(animaTime);
    let tipanimation = wx.createAnimation({
      duration: 500,
      transformOrigin: '50% 50% 0',
      timingFunction: 'linear'
    })
    tipanimation.opacity(1).step();
    that.setData({
      tipanimation: tipanimation.export()
    });
    animaTime = setTimeout(function(){
      tipanimation.opacity(0).step();
      that.setData({
        tipanimation: tipanimation.export()
      });
    },15000);
  },
  // 显示更多
  showMore:function(e){
    let that = this;
    let idxs = e.currentTarget.dataset.idx;
    if (that.data.moreData == idxs){
      that.setData({
        moreData: -1
      })
    }else{
      that.setData({
        moreData: idxs
      });
    }
  },
  // 订阅
  noTice:function(){
    let that = this;
    let videoData = that.data.videoData;
    let videoList = that.data.curQueue[that.data.current];
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    if (videoList.live[0].is_preparetips == 0) {
      wx.requestSubscribeMessage({
        tmplIds: videoData.subscribe_template_id,
        success(res) {
          console.log(res);
          if (res[videoData.subscribe_template_id] == "accept") { //点击确定授权
            publicFun.warning('订阅成功', that);
          }else if(res[videoData.subscribe_template_id] == "ban"){
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          } else { //点击取消授权
            publicFun.warning('取消订阅', that);
          }
        },
        fail(e) {
          publicFun.warning('请开启订阅消息方便接收消息提醒', that);
        },
        complete(res){
          that.appointFun(videoList);
        }
      })
    } else if (videoList.live[0].is_preparetips == 1) {
      publicFun.warning('已订阅', that);
    } else {
      publicFun.warning('已发送', that);
    }
  },
  // 订阅方法
  appointFun: function(videoList) {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addPrepareTips',
      data = {
        live_id: videoList.live[0].id,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data,function(res) {
      that.setData({
        shareNumData: res.err_msg,
        ['curQueue[' + current + '].live[0].is_preparetips']: 1
      });
    }, '');
  },
  // 进入直播间
  goLiving:function(e){
    let liveId = e.currentTarget.dataset.liveid;
    let imgsrc = e.currentTarget.dataset.imgsrc;
    let status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
    });
  },
  // 进入话题页面
  goTopic:function(e){
    let tid = e.currentTarget.dataset.tid
    wx.navigateTo({
      url: '/pages/SHOPKEEPER/pages/publish/publishList?way=1&tid=' + tid
    });
  },
  // 名称跳转
  nameClick:function(e){
    let isanchor = e.currentTarget.dataset.isanchor;
    let otheruid = e.currentTarget.dataset.uid;
    otheruid = otheruid == 0? '-1': otheruid;
    if(isanchor == 0){//非主播--进入个人主页
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userPage?otheruid=' + otheruid,
      });
    }else if(isanchor == 1){//主播
      wx.navigateTo({
        url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + otheruid,
      });
    }
  },
  // 头像点击跳转
  avatarClick:function(e){
    let isanchor = e.currentTarget.dataset.isanchor;
    let otheruid = e.currentTarget.dataset.uid;
    otheruid = otheruid == 0? '-1': otheruid;
    if(isanchor == 0){//非主播--进入个人主页
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userPage?otheruid=' + otheruid,
      });
    }else if(isanchor == 1){//主播
      let liveId = e.currentTarget.dataset.liveid;
      let imgsrc = e.currentTarget.dataset.imgsrc;
      let status = e.currentTarget.dataset.status;
      if(status == 1){//有直播中
        wx.navigateTo({
          url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
        });
      }else{//没有直播中的跳主播主页
        wx.navigateTo({
          url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + otheruid,
        });
      }
    }
  },
  // 头像的关注
  aboutClick:function(e){
    let that = this;
    let current = that.data.current;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let ismutual = e.currentTarget.dataset.ismutual;
    let url = 'app.php?c=society&a=subscribe',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: e.currentTarget.dataset.id
      };
      if(ismutual*1 == 1){//已关注，点击取消关注
        data.status = 0
      }if(ismutual*1 == 0){//未关注，点击关注
        data.status = 1
      }
    common.post(url, data, function(res){
      if(res.err_code == 0){
        if(ismutual*1 == 1){//已关注，点击取消关注
          // publicFun.warning('已取消关注', that);
          that.setData({
            ['curQueue[' + current + '].liked']: 0
          })
        }if(ismutual*1 == 0){//未关注，点击关注
          // publicFun.warning('关注成功', that);
          that.setData({
            isAbout: true
          });
          setTimeout(function(){
            that.setData({
              ['curQueue[' + current + '].liked']: 1
            });
          },4000);
        }
      }
    }, '', '', true);
  },
  // 视频点赞
  clickHeart:function(e){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let id = e.currentTarget.dataset.id;
    let liked = e.currentTarget.dataset.liked;
    let current = that.data.current;
    let nowpages = getCurrentPages(); //获取上一个页面信息栈(a页面)
    let prevPage = nowpages[nowpages.length - 2]; //给上一页面的tel赋值
    let url1 = 'app.php?c=society&a=society_like',//点赞
      url2 = 'app.php?c=society&a=cancle_like',//取消赞
      data = {
        society_id: id
      };
    let changeLike = 'curQueue[' + current + '].liked',
      changeNum = 'curQueue[' + current + '].like_num';
    if (liked == 0) {
      // liked：0，当前未点赞，调用点赞接口
      common.post(url1, data, function (res) {
        that.setData({
          [changeLike]: 1,
          [changeNum]: res.err_dom.split('').splice(4).join('')
        });
        if (prevPage) {
          prevPage.setData({
            isLike: 1,
            isClickLike: 1,
            nowLikeNum: res.err_dom.split('').splice(4).join('')
          });
        }        
      }, '');
    } else {
      // liked：1，当前已点赞，调用取消点赞接口
      common.post(url2, data, function (res) {
        that.setData({
          [changeLike]: 0,
          [changeNum]: res.err_dom.split('').splice(4).join('')
        });
        if (prevPage) {
          prevPage.setData({
            isLike: 0,
            isClickLike: 1,
            nowLikeNum: res.err_dom.split('').splice(4).join('')
          });
        }        
      }, '');
    }
  },
  // 消息按钮
  messageBtn:function(e){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    that.sayList(1,e.currentTarget.dataset.id);
  },
  // 关闭消息按钮
  closeChat:function(){
    let that = this;
    that.setData({
      showChat: false
    });
  },
  // 更多评论
  goChatList:function(e){
    let that = this;
    let current = that.data.current;
    that.setData({
      showChat: false
    });
    wx.navigateTo({
      url: '/pages/SHOPKEEPER/pages/chat/chatList?society_id=' + e.currentTarget.dataset.id + '&chatnum=' + that.data.curQueue[current].comment_total
    });
  },
  // 分享按钮
  shareTap:function(e){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
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
    wx.showShareMenu({
      withShareTicket: false
    });
    //保存成功分享数据加一
    that.shareData();
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function () {
    var that = this;
    console.log('分享朋友圈');
    let current = that.data.current;
    let videoData = that.data.curQueue[current];
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: '/pages/SHOPKEEPER/pages/shop/videoSlide',
      id: videoData.id,
      share_uid: getApp().globalData.my_uid,
      store_id: app.globalData.store_id || common.store_id,
      shareType : 'society'
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
      success: function (res) {
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
              success: function (res) {
                that.dialog.hideDialog();
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
  // 生成分享海报
  creatPost: function () {
    let that = this;
    // 过滤富文本标签
    let current = that.data.current;
    let videoData = that.data.curQueue[current];
    let str = videoData.content;
    str = str.split('&nbsp;').join('');
    str = str.split('&#39;').join("'");
    str = str.replace(/(\n)/g, "");
    str = str.replace(/(\t)/g, "");
    str = str.replace(/(\r)/g, "");
    str = str.replace(/<\/?[^>]*>/g, "");
    str = str.replace(/\s*/g, "");
    let product_content = str;
    // 1 设置画布数据
    var windowHeight = wx.getSystemInfoSync().windowHeight
    var windowWidth = wx.getSystemInfoSync().windowWidth
    
    console.log(windowHeight, windowWidth, 750 * Number(windowHeight)/Number(windowWidth) ,"windowWidthwindowWidth------")
  
    let canvasData = { // 画布数据
      status: true,
      canvasW: windowWidth,
      canvasH: windowHeight,
      canvasId: 'productPost',
      canvasWidth: 750,
      canvasHeight: 750 * 1.6,
      whProportion: 1.28,
      paddingLeft: 40,
      paddingTop: 30,
      radius: 10,
      bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
      product_content: product_content, // 活动内容
      shopName: videoData.store_name,
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方文字
      loadFailTapStatus: false, // 下载失败处理函数是否已执行
      // 图片数据
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      productImage: videoData.files[0].thumb || 'https://' + that.data.qrcodePath.split('://')[1], // 商品首图
    };
    let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['productImage', 'qrcodePath']
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
      })
      that.getImageMes();
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
      }, 300)
    }).catch(err => {
      console.log(err);
    })
  },
  getImageMes:function(){
    let that = this;
    var sx, sy, sw, sh, imgH=510;
    wx.getImageInfo({
      src: that.data.canvasData.productImage,
      success(res) {
        var imgw = res.width,
          imgh = res.height, 
          whProportion = that.data.canvasData.whProportion;
        console.log(that.data.canvasData.whProportion, "--------------",imgw,imgh);
      //如果图宽大于高&&图宽小于高*whProportion
        if ((imgh * whProportion > imgw)&&imgw > imgh ) {
          console.log(11);
          sx = 0;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
        //如果图宽小于高&&图高大于*whProportion宽
        } else if (imgw < imgh && (imgh < imgw * whProportion)){
          console.log(22);
          sx = 0;
          sy = 0;
          sw = imgw;
          sh = imgw * whProportion
          //如果图宽大于高*whProportion
        } else if (imgw > imgh * whProportion){
          console.log(33);
          sx = (imgw - imgh / whProportion ) / 2;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
          //如果图高大于*whProportion宽
        } else if (imgh > imgw * whProportion ){
          console.log(44);
          sx = 0;
          sy = (imgh - imgw * whProportion) / 2;
          sw = imgw;
          sh = imgw * whProportion
          //正方形
        }else{
          console.log(55);
          sx = 0;
          sy = (imgh - imgw * whProportion) / 2;
          sw = imgw;
          sh = imgw * whProportion
        }
        that.setData({
          sx: sx,
          sy: sy,
          sw: sw,
          sh: sh
        });
        that.drawCanvas();
      },
      fail(res){
        console.log(res,'getImageInfo失败')
      }
    })
  },
  // 画图海报
  drawCanvas: function () {
    let that = this;
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部商品图片偏移量
    let innerLeft = 40;
    // 内部商品图片高度
    let imgH = w - (innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 70;
    let positionY = 0;

    var sx = that.data.sx,
      sy = that.data.sy,
      sw = that.data.sw,
      sh = that.data.sh;
    console.log(sx, "*************", sy, "*************", sw, "*************", sh)
    // 生成画笔
    // 获取图片信息    
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: 0,
      y: 0,
      w: w ,
      h: h ,
      r: 20,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });
    
    // 绘制商品图片
    positionY =  40;
   
    canvas.roundImg({
      ctx: ctx,
      x: innerLeft,
      sx: sx,
      y: positionY,
      sy: sy,
      img: that.data.canvasData.productImage,
      w: imgH,
      sw: sw,
      h: imgH *that.data.canvasData.whProportion,
      sh: sh,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });
    let product_name_text = that.data.canvasData.product_content;
    // 绘制中间容器,商品内容,超出19个字显示两行，多两行，显示省略号

  //获取字符串长度，中文是两个字符串
    function getStrleng(str) {
      let myLen = 0;
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) //字符编码，128以内的是数字，英文字符，已经英文的符号等
          myLen++;
        else
          myLen += 2;
      }
      return myLen;
    }
  //截取一般
    function _sub(str, len, start) {
      var num = 0;
      for (let i=0  ; i < str.length; i++) {
        var a = str.charAt(i);
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128){//字符编码，128以内的是数字，英文字符，已经英文的符号等
          num++;
        }else{
          num += 2;
        }
        if (num == len) {
          return str.substring(start, i + 1);
        }
        if (num > len) {
          return str.substring(start, i);
        }
      }
    }

    if (getStrleng(product_name_text) > 34) {
      if (getStrleng(product_name_text) > 68) {        
        let start = _sub(product_name_text, 34, 0).length
        console.log(_sub(product_name_text, 34, 0), start, "staetstaetstaet", _sub(product_name_text, 68, start) )
        product_name_text = _sub(product_name_text, 34, 0) + '\n' + _sub(product_name_text, 68, start) + "...";
      }else{
        let len = getStrleng(product_name_text)
        let start = _sub(product_name_text, 34, 0).length
        product_name_text = _sub(product_name_text, 34, 0) + '\n' + _sub(product_name_text, len, start )
      }
      canvas.drawMultiText({
        ctx,
        gap: 15,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH * that.data.canvasData.whProportion + 24,
        fontSize: 30
      })
    } else {
      canvas.drawText({
        ctx: ctx,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH * that.data.canvasData.whProportion + 24,
        fontSize: 30
      });
    }
    
    // 绘制二维码
    positionY = positionY + imgH * that.data.canvasData.whProportion + 24;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x:  innerLeft + 50,
      y: positionY + 110,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码右侧文字
    canvas.drawMultiText({
      ctx: ctx,
      text: '长按小程序码查看详情\n分享自[' + that.data.canvasData.shopName +']',
      x: innerLeft + qrode_r * 2 + 80,
      y: positionY + qrode_r + 110,
      fontSize: 25,
      baseline: 'middle',
      gap: 15,
      color: '#919398'
    });

    // 最终绘出画布
    ctx.draw();
  },
  // 画图 18-04-24 created by cms_ssa
  save: function (o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function (res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath,
        canvasImgState: true,
        myimgsrc: o.imgSrc,
        butshow: true
      })
      that.dialog.hideDialog();  
      
    }, function (err) {
      console.log(err);
    });
  },
  // 海报点击关闭
  closeCanvas: function () {
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
    });
    wx.getSetting({
      success(res) {
        console.log('666', res)
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
  savaImageToPhoto: function () {
    let that = this;
    // saveImageToPhotosAlbum图片保存到本地相册
    console.log(that.data.myimgsrc)
    wx.saveImageToPhotosAlbum({
      filePath: that.data.myimgsrc,
      success: function () {
        console.log('保存成功');
        wx.hideLoading();
        that.setData({
          butshow: false,
          closeModal: true,
          oneModaled: false
        });
        //保存成功分享数据加一
        that.shareData();
      },
      fail: function () {
        console.log('用户取消保存');
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
  // 分享数据接口
  shareData:function(){
    let that = this;
    let current = that.data.current;
    let url = 'app.php?c=society&a=share_callback',
      shareNum = 'curQueue[' + current + '].share_num',
      data = {
        society_id: that.data.curQueue[current].id
      };
    common.post(url, data, function (res) {
      console.log(res);
      that.setData({
        [shareNum]: res.err_dom.split('').splice(4).join('')
      })
    }, '');
  },  
  // 商品按钮
  goodsBtn:function(e){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    that.setData({
      showGoods: true,
      goodsdata: e.currentTarget.dataset.goodsdata
    });
  },
  // 关闭商品列表
  closeShopping1: function(e) {
    var that = this;
    that.setData({
      showGoods: false
    });
  },
  //关闭购物袋规格选择框遮罩层
  closeShopping: function (e) { //关闭提示框遮罩层
    var that = this;
    publicFun.closeShopping(that);
  },
  // 商品跳转详情页
  goodsDetail:function(e){
    let that = this;
    let protype = e.currentTarget.dataset.protype,
    product_id = e.currentTarget.dataset.proid,
    frompointshop = e.currentTarget.dataset.frompointshop;
    if(protype && protype == 99){
      wx.navigateTo({
        url: '/pages/USERS/pages/travel/index?product_id=' + product_id
      });
    }else{
      if(frompointshop*1 == 1){//积分商品
        wx.navigateTo({
          url: '/pages/POINT/pages/product/details?product_id=' + product_id,
        });
      }else{
        wx.navigateTo({
          url: '/pages/product/details?product_id=' + product_id,
        });
      }
    }
  },
  // 商品直接购买
  openShop:function(e){
    let that = this;
    that.setData({
      showGoods: false
    });
    if(e.currentTarget.dataset.type == 'self_buy1'){
      publicFun.oppenShopping(e, that);
    }else{//积分商品
      publicFun.oppenShoppingP(e, that);
    }
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
  selectDeliverDate: function(e){
      let {index} = e.currentTarget.dataset;
      this.setData({
          "shoppingData.deliver_date_index":index
      })
  },
  payment: function (e) { //下一步,去支付
      var that = this;
      publicFun.payment(that, e)
  },
  messageInput: function (e) { //留言内容
      var that = this;
      let index = e.target.dataset.index;
      that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
      this.setData({
          'shoppingData': that.data.shoppingData
      })
  },

  bindDateChange: function (e) { //选择日期
      var that = this;
      let index = e.target.dataset.index;
      let date = e.detail.value;
      that.data.shoppingData.shoppingCatData.custom_field_list[index].date = date;
      that.setData({
          'shoppingData': that.data.shoppingData
      })
  },
  bindTimeChange: function (e) { //选择时间
      var that = this;
      let index = e.target.dataset.index;
      let time = e.detail.value;
      that.data.shoppingData.shoppingCatData.custom_field_list[index].time = time;
      that.setData({
          'shoppingData': that.data.shoppingData
      })
  },
  addImg: function (e) { //图片上传
      var that = this;
      let index = e.target.dataset.index;
      publicFun.addImgMessage(that, index);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    wx.getSystemInfo({//获取设备信息
      success: function (res) {
        that.setData({
          imageHeight: res.windowWidth,
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      },
    });
    // 获得dialog组件
    setTimeout(function(){
      that.dialog = that.selectComponent("#shareModal");
      console.log(that.dialog)
    },1000);
  },

  // 滚动刷新页面数据接口
  configData:function(){
    let that = this;
    let current = that.data.current;
    let url = 'app.php?c=society&a=get_society_info',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: that.data.curQueue[current].id
      };
    common.post(url, data, function (res) {
      console.log(res);
      let listTem = that.data.videoList;
      var dataList = res.err_msg.info;
      //添加新任务列表
      if(opt == 'up'){
        // listTem.splice(0,1);
        that.setData({
          videoList: listTem.concat(dataList)
        });
      }else {
        that.setData({
          videoData: res.err_msg,
          videoList: res.err_msg.info
        });
      }
      that.playCurrent(that.data.current);
      console.log(that.data.videoList.length);
    }, '')
  },
  // 动画结束时触发
  animationfinish:function(e){
    console.log(e);
    let that = this;
    that.tipanimation();
    var _data = this.data,
        _last = _data._last,
        _change = _data._change,
        curQueue = _data.curQueue,
        prevQueue = _data.prevQueue,
        nextQueue = _data.videoList;
    var current = e.detail.current;
    var diff = current - _last;//向上滑始终为1，最后一个跳到第一个的时候才是-2（0-2=-2）；向下滑的时候始终为-1，第一个跳到最后一个的时候才是2（2-0=2）；当为0的时候就是没划走，例如不循环的时候滑到最后一张或第一张的时候，滑不走，这时候return，不往下走
    if (diff === 0) return;
    this.data._last = current;
    this.playCurrent(current);
    var direction = diff === 1 || diff === -2 ? 'up' : 'down';
    if (direction === 'up') {
      console.log(nextQueue.length)
      if(nextQueue.length <= 2){
        this.videoData('up',nextQueue[nextQueue.length-1].id);
      }
      if (this.data._invalidDown === 0) {
        var change = (_change + 1) % 3;
        var add = nextQueue.shift();
        var remove = curQueue[change];
        if (add) {
          prevQueue.push(remove);
          curQueue[change] = add;
          this.data._change = change;
        } else {
          // 防止没数据再进入数据替换判断条件
          this.data._invalidUp += 1;
        }        
      } else {
        //当视频回滑的时候，不进入数据替换判断条件
        this.data._invalidDown -= 1;
      } 
    }
    if (direction === 'down') {
      if (this.data._invalidUp === 0) {
        var _change2 = _change;
        var _remove = curQueue[_change2];
        var _add = prevQueue.pop();
        if (_add) {
          curQueue[_change2] = _add;
          nextQueue.unshift(_remove);
          this.data._change = (_change2 - 1 + 3) % 3;
        } else {
          this.data._invalidDown += 1;
        }
      } else {
        this.data._invalidUp -= 1;
      }
      console.log('down',nextQueue.length)
      if(prevQueue.length == 0){
        this.videoData('down',nextQueue[nextQueue.length-1].id);
      }
    }
    var circular = true;
    // if (nextQueue.length === 0 && current !== 0) {
    //     circular = false;
    // }
    // if (prevQueue.length === 0 && current !== 2) {
    //     circular = false;
    // }
    this.setData({
        curQueue: curQueue,
        circular: circular,
        current:current
    });
  },
  playCurrent: function(current) {
    let that = this;
    let curQueue = that.data.curQueue;
    for(let i=0;i<curQueue.length;i++){
      let videoContext = wx.createVideoContext('video_' + i, this);
      i !== current ? videoContext.pause() : videoContext.play();
    }
  },
  onPlay: function onPlay(e) {
    this.trigger(e, 'play');
  },
  onPause: function onPause(e) {
    this.trigger(e, 'pause');
  },
  onEnded: function onEnded(e) {
    this.trigger(e, 'ended');
  },
  onError: function onError(e) {
    this.trigger(e, 'error');
  },
  onTimeUpdate: function onTimeUpdate(e) {
    // this.trigger(e, 'timeupdate');
    // if (this.data.updateState) { //判断拖拽完成后才触发更新，避免拖拽失效
    //   let sliderValue = e.detail.currentTime / e.detail.duration * 100;
    //   this.setData({
    //     sliderValue: sliderValue,
    //     duration: e.detail.duration
    //   })
    // }
  },
  onWaiting: function onWaiting(e) {
    this.trigger(e, 'wait');
  },
  onProgress: function onProgress(e) {
    this.trigger(e, 'progress');
  },
  onLoadedMetaData: function onLoadedMetaData(e) {
    this.trigger(e, 'loadedmetadata');
  },
  trigger: function trigger(e, type) {
    var ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var detail = e.detail;
    var activeId = e.target.dataset.id;
    this.triggerEvent(type, Object.assign(Object.assign(Object.assign({}, detail), { activeId: activeId }), ext));
  },
  //拖动进度条过程触发事件
  sliderChanging(e) {
    this.setData({
      updateState: false //拖拽过程中，不允许更新进度条
    })
  },
  //拖动进度条完成后触发事件
  sliderChange(e) {
    if (this.data.duration) {
      let videoContext = wx.createVideoContext('video_' + this.data.current);
      videoContext.seek(e.detail.value / 100 * this.data.duration); //完成拖动后，计算对应时间并跳转到指定位置
      
      this.setData({
        sliderValue: e.detail.value,
        updateState: true //完成拖动后允许更新滚动条
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let data = wx.getMenuButtonBoundingClientRect();
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    that.setData({
      boundHeight: data.height,
      boundtop: data.top,
      bound: data
    });
    console.log(data)
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
    clearTimeout(animaTime);
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
  onShareAppMessage: function (options) {
    let that = this;
    let current = that.data.current;
    const product = that.data.curQueue[current];
    // 过滤富文本标签
    let str = product.content;
    str = str.split('&nbsp;').join('');
    str = str.split('&#39;').join("'");
    str = str.replace(/(\n)/g, "");
    str = str.replace(/(\t)/g, "");
    str = str.replace(/(\r)/g, "");
    str = str.replace(/<\/?[^>]*>/g, "");
    str = str.replace(/\s*/g, "");
    let product_content = str;
    if (product_content.length > 30) {
      product_content = product_content.slice(0,31) + "...";    
    }
    if (options.from === 'button') {
      that.dialog.hideDialog();
    }
    return getApp().shareGetFans(product_content, ` `, `/pages/SHOPKEEPER/pages/shop/videoSlide`, 1, product.files[0].thumb, `&society_id=${product.id}`);
  },
})