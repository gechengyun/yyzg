// pages/SHOPKEEPER//pages/shop/detail.js  
var _url = '../../';
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
var app = getApp();
let creatingPost = false;
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    opacityNav: 0,//头部的透明度
    _barTitle: '掌柜说',
    showDetail:false,
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,//默认初始图片宽度
    imgheight: 0,//默认初始图片高度
    sx: 0,//海报商品图裁剪x轴坐标
    sy: 0,//海报商品图裁剪y轴坐标
    sw: 0,//海报商品图裁剪宽
    sh: 0,//海报商品图裁剪高
    butshow: false,//海报图预览显示
    myimgsrc: '',//海报图图片路径
    closeModal:false,//关闭保存成功弹窗
    status_type: 'details',//'details=>详情页，list=>列表页'
    show_type: 1,//整屏展示， 一屏2列瀑布流展示=>1、整屏，2、瀑布流
    remand_goods:[],
    moreData: 0,//跟多
    society_id:'',
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    canvasImgState: false,//海报
    canvasData: {},
    saveImgBtnHidden: true,//是否显示保存/授权相册按钮
    richtex:'',//富文本图片处理
    isOver: false,//是否显示底部结束信息
    pcode:'',//code是否过期
    flag:true, //关注
    firstShow: true,
    tabIndex:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("分享参数",options);
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    setTimeout(function(){
      publicFun.setBarBgColor(app, that); // 设置导航条背景色 
    },500);
    publicFun.setNavSize(that); // 通过获取系统信息计算导航栏高度    status   
    app.isLoginFun(that, 1);//判断用户是否登录
    if (options.society_id){      
      that.setData({
        society_id: options.society_id
      })
    }
    if (options.store_id){
      app.globalData.store_id = options.store_id
    }
    if(options.share_uid){
      app.globalData.share_uid = options.share_uid;
      that.setData({
        isScene: true
      })
    }

    // 扫码进入判断
    if (options.scene != undefined && options.scene != 'wxapp') {
      that.setData({
        firstShow: false
      });
      var scene_id = decodeURIComponent(options.scene);
      console.log("详情页二维码", scene_id);
      if (scene_id) {
        // 扫查看职工二维码查看员工信息
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          //console.log(result)
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id
            app.globalData.share_uid = result.err_msg.share_uid
            var society_id = result.err_msg.society_id
            that.setData({
                society_id: society_id,
                isScene: true
            });
            that.detailData();
            that.sayList(1);
            that.getHeight();
            that.getWidth();
          }
        },'');     
      };
    }
    // 点击评论定位
    if(options.comment){
      setTimeout(function(){
        that.pageScrollToBottom();
      },1000)
    }
    
    wx.login({
      success: res => {
        that.data.pcode = res.code;
      }
    })
    if(that.data.firstShow){
      that.detailData();
      that.sayList(1);
      that.getHeight();
      that.getWidth();
    }
    // that.shopNameData();
    // that.configData();
    // 分享到朋友圈-临时
    wx.showShareMenu({
     withShareTicket: false,
     menus: ['shareAppMessage','shareTimeline']
    })
  },

  // 掌柜说详情数据
  detailData:function(){
    let that = this;
    let url = 'app.php?c=society&a=society_detail',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: that.data.society_id
      };
    common.post(url, data, 'detailFun', that,'detailFunFali');
  },
  detailFun:function(res){
    let that = this;
    console.log('详情数据',res);
    that.setData({
      detailCode: res.err_code,
      lists: res.err_msg.info,
      remand_goods: res.err_msg.info[0].goods_list,
      shopName: res.err_msg.info[0].store_name,
      userMes: res.err_msg.userinfo,
      detailData: res.err_msg,
      _barTitle:res.err_msg.info[0].title,
      store_logo:res.err_msg.info[0].store_logo
    },function(){
      let rich_text = that.data.lists[0].content;
      if (rich_text != '' && rich_text != undefined) {
        rich_text = wxParse.wxParse(`lists[0].content`, 'html', rich_text, that, 5);
      }
    });
    wx.setStorageSync('_barTitle', res.err_msg.info[0].title);
  },
  detailFunFali:function(){
    let that = this;
    that.setData({
      detailCode: res.err_code
    });
  },
  // 社区配置
  configData: function () {
    let that = this;
    let url = 'app.php?c=society&a=get_config',
      data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, function (res) {
      console.log(res);
      that.setData({
        // show_type: res.err_msg.show_type,
        show_set: res.err_msg,
        showDetail: true
      })
    }, '')
  },
  // 点赞
  clickHeart: function (e) {
    console.log(e);
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let id = e.currentTarget.dataset.id;
    let idxs = e.currentTarget.dataset.idxs;
    let nowpages = getCurrentPages(); //获取上一个页面信息栈(a页面)
    let prevPage = nowpages[nowpages.length - 2]; //给上一页面的tel赋值
    let url1 = 'app.php?c=society&a=society_like',//点赞
      url2 = 'app.php?c=society&a=cancle_like',//取消赞
      data = {
        society_id: id
      };
    // 点击震动
    // wx.vibrateShort({
    //   success: function () {
    //     console.log('点击震动');
    //   }
    // });
    let changeLike = 'lists[' + idxs + '].liked',
      changeNum = 'lists[' + idxs + '].like_num';
    if (that.data.lists[idxs].liked == 0) {
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
      console.log(that.data.lists);
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
      console.log(that.data.lists);
    }
    // 调用列表接口，返回点击后的liked
    // that.shopData();
  },
  // 分享数据接口
  shareData:function(){
    let that = this;
    let url = 'app.php?c=society&a=share_callback',
      shareNum = 'lists[' + 0 + '].share_num',
      data = {
        society_id: that.data.society_id
      };
    common.post(url, data, function (res) {
      console.log(res);
      that.setData({
        [shareNum]: res.err_dom.split('').splice(4).join('')
      })
    }, '')
    console.log(that.data.lists)
  },
  // 店铺名称接口
  shopNameData:function(){
    let that = this;
    let url = 'app.php?c=store&a=index',
      data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, function (res) {
      console.log(res);
      that.setData({
        shopName: res.err_msg.store.name
      })
    }, '')
  },
  // 发表评论
  wxSearchInput:function(e){
    let that = this;
    that.setData({
      topicVal: e.detail.value
    });
  },
  wxSearchFn:function(e){
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
    let url = 'app.php?c=society&a=add_comment',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id: that.data.society_id,
        content: topicVal || that.data.topicVal
      };
    common.post(url, data, function (res) {
      if(res.err_code == 0){
        that.setData({
          'sayList.list': res.err_msg.concat(that.data.sayList.list),
          topicVal:'',
          showgetPhone: false,
          'lists[0].comment_total': ++that.data.lists[0].comment_total
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
  sayList:function(page){
    let that = this;
    let url = 'app.php?c=society&a=comment_list',
      data = {
        society_id: that.data.society_id,
        page: page,
        pagesize: 10
      };
    common.post(url, data, function (res) {
      if(page == 1){
        that.setData({
          sayList: res.err_msg,
          next_page: res.err_msg.next_page
        });
      }else{
        var sayDataList = that.data.sayList.list;
        for (var i = 0; i < res.err_msg.list.length; i++) {
          sayDataList.push(res.err_msg.list[i]);
        }
        that.setData({
          'sayList.list': sayDataList,
          next_page: res.err_msg.next_page
        });
      }
      wx.stopPullDownRefresh();  
    }, '')
  },
  // 列表点赞
  listHeart:function(e){
    let that = this;
    let likeid = e.currentTarget.dataset.likeid;
    let idxs = e.currentTarget.dataset.idxs;
    let url = 'app.php?c=society&a=comment_like',//点赞
    data = {
      society_id: that.data.society_id,
      store_id: app.globalData.store_id || common.store_id,
      comment_id: likeid
    };
    common.post(url, data, function (res) {
      that.setData({
        ['sayList.list[' + idxs + '].ismylike']: res.err_msg.islike,
        ['sayList.list[' + idxs + '].likenumstr']: res.err_msg.likenumstr
      })
    },'');
  },
  // 关注
  switchConcern(e){
    let that = this;
    let ismutual = e.currentTarget.dataset.ismutual;
    let url = 'app.php?c=society&a=subscribe',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        society_id:that.data.society_id
      };
      if(ismutual*1 == 1){//已关注，点击取消关注
        data.status = 0
      }if(ismutual*1 == 0){//未关注，点击关注
        data.status = 1
      }
    common.post(url, data, function(){
      if(ismutual*1 == 1){//已关注，点击取消关注
        publicFun.warning('已取消关注', that);
        that.setData({
          'detailData.is_subscribe': 0
        })
      }if(ismutual*1 == 0){//未关注，点击关注
        publicFun.warning('关注成功', that);
        that.setData({
          'detailData.is_subscribe': 1
        })
      }
    }, '', '', true)
  },
  // 点击头像跳转对应主页
  goPage:function(e){
    let that = this;
    console.log(e);
    let isanchor = e.currentTarget.dataset.isanchor;
    let otheruid = e.currentTarget.dataset.uid;
    otheruid = otheruid == 0? '-1': otheruid;
    if(isanchor == 0){//非主播
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userPage?otheruid=' + otheruid,
      })
    }else if(isanchor == 1){//主播
      wx.navigateTo({
        url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + otheruid,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    //=========================检测登录授权====================================
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
  //获取轮播当前current
  bindchange:function(e){
    let tabIndex = e.detail.current;
    console.log(tabIndex);
    this.setData({
      tabIndex: tabIndex,
    });
    console.log(this.data.tabIndex);
  },
  // 海报
  //显示对话框
  shareTap: function () {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
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
    that.setData({
      canvasImgState: false
    })
  },
  onShareTimeline:function(e){
    let _barTitle = wx.getStorageSync('_barTitle');
    return {
      title:_barTitle,
      imageUrl:this.data.store_logo?this.data.store_logo:''
    }
},
  //分享好友或群
  _shareGroup: function () {
    var that = this;
    console.log('分享好友或群');
    wx.showShareMenu({
      withShareTicket: false
    });
    that.shareData();
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function () {
    var that = this;
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/SHOPKEEPER/pages/shop/detail',
      id: that.data.society_id,
      share_uid: getApp().globalData.my_uid,
      store_id: app.globalData.store_id || common.store_id,
      shareType : 'society'
    }
    creatingPost = true
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    })
    // that.creatPost();
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
            creatingPost = false
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
        creatingPost = false
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
    let that = this;
    // 过滤富文本标签
    let str = that.data.lists[0].content;
    // let reg = RegExp("<[^>]+>", "g");
    // let product_content = str.replace(reg, '');
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
      // canvasWidth: 670,
      // canvasHeight: 720,
      canvasWidth: 750,
      canvasHeight: 750 * 1.6,
      whProportion: 1.28,
      paddingLeft: 40,
      paddingTop: 30,
      radius: 10,
      bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
      product_content: product_content, // 活动内容
      shopName: that.data.shopName,
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方文字
      loadFailTapStatus: false, // 下载失败处理函数是否已执行
      // 图片数据
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      // qrcodePath: that.data.lists[0].files[0].thumb, // 二维码
      // productImage: 'https://' + that.data.lists.files[0].thumb.split('://')[1], // 商品首图
      productImage: that.data.lists[0].files[0].thumb || 'https://' + that.data.qrcodePath.split('://')[1], // 商品首图
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
      creatingPost = false
    })
  },
  getImageMes:function(){
    let that = this;
    var sx, sy, sw, sh, imgH=510;
    // var sx =  0,  sw = 510,  imgW = 510;
    // var sy = 0, sh = 510 * that.data.canvasData.whProportion, imgH = 510 * that.data.canvasData.whProportion;
    wx.getImageInfo({
      src: that.data.canvasData.productImage,
      success(res) {
        var imgw = res.width,
          imgh = res.height, 
          whProportion = that.data.canvasData.whProportion;
        console.log(imgw,"--------------");
        console.log(imgh, "--------------");
        console.log(that.data.canvasData.whProportion, "--------------");
        
        // if (imgw < imgH * whProportion && imgh < imgH * whProportion) {
        //   console.log(1);
        //   sx = (imgw - imgH)/2;
        //   sy = 0;
        //   sw = (imgw * imgH) / imgh;
        //   sh = imgH * whProportion
        // } else if (imgw < imgH && imgh > imgH * whProportion) {
        //   console.log(2);
        //   sx = 0;
        //   sy = (imgh - imgH * whProportion) / 2;
        //   sw = imgH;
        //   sh = imgH * whProportion
        // } else if (imgw > imgH && imgh < imgH * whProportion) {
        //   console.log(3);
        //   sx = (imgw - imgH) / 2;
        //   sy = 0;
        //   sw = imgH;
        //   sh = imgH * whProportion
        // } else if (imgw > imgH && imgh > imgH * whProportion) {
        //   console.log(4);
        //   sx = (imgw - imgH) / 2;
        //   sy = (imgh - imgH * whProportion) / 2;
        //   sw = imgH;
        //   sh = imgH * whProportion
        // }
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
        // product_name_text = product_name_text.slice(0, 17) + '\n' + product_name_text.slice(17, 34) + '\n' + product_name_text.slice(34, 50) + "...";
      // } else if (product_name_text.length > 34 && product_name_text.length < 51){
      //   product_name_text = product_name_text.slice(0, 17) + '\n' + product_name_text.slice(17, 34) + '\n' + product_name_text.slice(34, product_name_text.length);
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this; 
    let nowpages = getCurrentPages(); //获取上一个页面信息栈(a页面)
    let prevPage = nowpages[nowpages.length - 2]; //给上一页面的tel赋值
    if(prevPage){
      prevPage.setData({
        isClickLike: 0,
      });
    }    
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
    var data = wx.getMenuButtonBoundingClientRect();
    that.setData({
      boundHeight: data.height,
      boundtop: data.top,
      bound: data
    });
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
    let that = this;
    page = 1;
    that.setData({
      isOver: false
    });
    that.detailData();
    that.sayList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.next_page ==true){
      that.sayList(++page);
    }else{
      that.setData({
        isOver:true
      });
    }    
  },
   // 计算图片广告2首张图片高度
   imgHeight: function (e) {  
    let that = this;     
    console.log(666888, e, e.detail.height);
    let arrIndex = 0;
    let oldImgW = e.detail.width;//原图的宽
    let oldImgH = e.detail.height;//原图的高
    let imgScale = oldImgW / oldImgH;//原图的宽高比
    let nowImgH = wx.getSystemInfoSync().windowWidth / imgScale;
    console.log(imgScale, '------', nowImgH, oldImgW);
    that.setData({
      // ['nowImgH[' + arrIndex + ']']: nowImgH
      nowImgH:nowImgH
    })
  },

  // 相关推荐跳转商品详情页
  goDetailed: function (e) {
    let that = this;
    console.log(e);
    let product_id = e.currentTarget.dataset.pid;
    let frompointshop = e.currentTarget.dataset.frompointshop;
    if(frompointshop*1 == 1){//积分商品
      wx.navigateTo({
        url: '/pages/POINT/pages/product/details?product_id=' + product_id,
      })
    }else{
      wx.navigateTo({
        url: '/pages/product/details?product_id=' + product_id,
      })
    }
  },
  // 获取元素的高
  getHeight: function () {
    let that = this;
    setTimeout(function () {
      var query = wx.createSelectorQuery();
      query.select('.soft-content').boundingClientRect();
      query.exec(function (rect) {
        if (rect[0] === null) return;
        var marginBM=[];
        marginBM.push(rect[0].height / 26);
        that.setData({
          marginBM: marginBM
        });
      });
    }, 500)
  },
  // 自定义头部滚动事件
  getWidth: function () {
    let that = this;
    setTimeout( ()=> {
      let query = wx.createSelectorQuery();
      query.select('.nav-title11').boundingClientRect();
      query.exec( (rect)=> {
        let screenWidth = app.globalData.phoneModel.windowWidth;
        let scale = 750/screenWidth;
        let navTitleWidth = rect[0].width * scale;
        let titleStr = wx.getStorageSync('_barTitle');
        if(titleStr.length * 32>navTitleWidth){
          setInterval(()=>{
            // console.log(titleStr);
            let startStr = titleStr.slice(0,1);
            let endStr = titleStr.slice(1);
            titleStr = endStr +startStr;
            this.setData({
              _barTitle:titleStr
            })
          },500)
        }
      });
    }, 1000)
  },
  showMore: function (e) {
    let that = this;
    console.log(that.data.moreData)
    let idxs = e.currentTarget.dataset.idxs;
    let toggleVal = that.data.moreData
    if (that.data.moreData == idxs) {
      that.setData({
        moreData: 0
      })
    } else {
      that.setData({
        moreData: idxs
      })
    }
  },
  imageLoad: function (e) {//图片自适应
    console.log("eeeeeeeeeeeeeeee", e)
    var _this = this;
    var _width = e.detail.width,    //获取图片真实宽度
      _height = e.detail.height,
      ratio = _width / _height;   //图片的真实宽高比例
    var viewWidth = _width > 670 ? 670 : _width,           //设置图片显示宽度，
      viewHeight = viewWidth > 670 ? (670 / ratio) : _height;    //计算的高度值   
    this.setData({
      imgwidth: viewWidth,
      imgheight: viewHeight
    })
  },
  // 图片预览
  previewPic: function (e) {
    console.log("eeeeeeee", e, e.currentTarget.dataset.src)
    let _current = e.currentTarget.dataset.src;
    let _urls = e.currentTarget.dataset.urls;
    let arr_urls = [];
    for (var i in _urls) {
      arr_urls.push(_urls[i].thumb);
    }
    console.log("_urls=", arr_urls)
    wx.previewImage({
      current: _current, // 当前显示图片的http链接
      urls: arr_urls// 需要预览的图片http链接列表
    })
  },

  // 一键下载
  oneDownLoad:function(){
    let that = this;
    let filePaths = that.data.lists[0].files;
    let goodsList = that.data.lists[0].goods_list;
    console.log("素材一键下载",goodsList);
    that.setData({
      filePathsLen: filePaths.length,
      filePaths: filePaths,
      bannerImgIdx: 0,//种草banner图索引
      goodsListLen: goodsList.length,
      goodsList:goodsList,
      goodsImgIdx: 0,//关联商品海报索引
    })
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
    // 过滤富文本标签
    let str = that.data.lists[0].content;
    str = str.split('&nbsp;').join('');
    str = str.split('&#39;').join("'");
    str = str.replace(/(\n)/g, "");
    str = str.replace(/(\t)/g, "");
    str = str.replace(/(\r)/g, "");
    str = str.replace(/<\/?[^>]*>/g, "");
    str = str.replace(/\s*/g, "");
    let product_content = str;
    // 复制粘贴
    wx.setClipboardData({
      data: that.data.lists[0].title + '\n' + product_content,
      success: function(res) {
        wx.hideToast();
        wx.getClipboardData({
          success(res) {
            console.log('内容复制成功',res.data);
          }
        });
      }
    });
    // 保存种草Banner图
    that.savePhone(filePaths[0].thumb);
    // 保存关联商品海报
    console.log(goodsList.length,"1234567890");
    if(goodsList.length>0){
      that.shopCircle(goodsList[0]);
    }
  },
  // 保存图片到相册
  savePhone:function(filePath){
    let that = this;
    wx.downloadFile({//下载网络图片为本地图片，以便保存到相册
      url:filePath,
      success(res){
        wx.saveImageToPhotosAlbum({//保存图片到相册
          filePath: res.tempFilePath,
          success: function () {
            wx.hideLoading();
            console.log('保存成功');
            that.setData({
              bannerImgIdx: ++that.data.bannerImgIdx
            });
            if(that.data.bannerImgIdx < that.data.filePathsLen){
              that.savePhone(that.data.filePaths[that.data.bannerImgIdx].thumb);
            }else{
              if(that.data.goodsList.length == 0){//当关联商品为0时
                that.setData({
                  closeModal: true,
                  oneModaled: true
                });
              }
              console.log('所有种草Banner图保存完成');
            }
          },
          fail: function () {
            console.log('用户取消保存');
            wx.hideLoading();
          }
        });
      },
      fail(res){
        console.log('图片下载失败');
      }
    });
  },
  // 生成相关推荐商品海报
  // 二维码生成
  shopCircle:function(goodsList){
    let that = this;
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/product/details',
      id: goodsList.product_id,
      share_uid: getApp().globalData.my_uid,
      shareType: "product",
      leader_id: wx.getStorageSync("leader_id") || app.globalData.leader_id
    }
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功')
        console.log(res.statusCode);
        if (res.statusCode == 200) {
          console.log(res.data.err_code);
          if (res.data.err_code == 0) {
            that.setData({
              goodsQrcodePath: res.data.err_msg
            })
            // 处理canvas
            wx.showLoading({
              title: '海报生成中...',
              mask: true
            })
            that.creatGoodsPost(goodsList);
              // 处理canvas
          } else if (res.data.err_code == 1000) {
            wx.hideLoading();
            creatingPost = false
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function (res) {}
            });
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
      }
    });
  },
  // 生成商品分享海报
  creatGoodsPost: function(goodsList){
    let that = this;
    // 1 设置画布数据
    let product_name = goodsList.name;
    let product_price = goodsList.price;
    let canvasGoodsData = { // 画布数据
      canvasId: 'productPost',
      canvasWidth: 750,
      canvasHeight: 960 + 290,
      paddingLeft: 0,
      paddingTop: 0,
      radius: 10,
      bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
      bgPath: '../../../../images/white_bg.png', // 海报背景图
      whiteBg: '../../../../images/white_bg.png',
      heartPath: '../../../../images/heart.png', // 爱心图标
      product_name: product_name, // 活动名称
      product_price: product_price,
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方文字
      // 图片数据
      avatarPath: that.data.userMes.avatar, // 用户头像
      qrcodePath: 'https://' + that.data.goodsQrcodePath.split('://')[1], // 二维码
      productImage: 'https://' + goodsList.image.split('://')[1], // 商品首图
    };
    let obj = canvas.px2rpx({ w: canvasGoodsData.canvasWidth, h: canvasGoodsData.canvasHeight, base: that.data.winWidth });
    that.setData({
      canvasGoodsData: canvasGoodsData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['productImage','qrcodePath','avatarPath']
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j];
      task.push(canvasFun.loadImageFileByUrl(that.data.canvasGoodsData[filePath]))
    }
    Promise.all(task).then(resultList=>{
      for (let filePathIndex = 0; filePathIndex < resultList.length; filePathIndex++) {
        let resultListElement = resultList[filePathIndex];
        that.data.canvasGoodsData[filePaths[filePathIndex]] = resultListElement.tempFilePath
      }
      that.setData({
        canvasGoodsData: that.data.canvasGoodsData
      })
      that.drawgoodsCanvas();
      setTimeout(function () {
        let w = that.data.canvasGoodsData.canvasWidth;
        let h = that.data.canvasGoodsData.canvasHeight;
        that.saveGoods({
          id: that.data.canvasGoodsData.canvasId,
          w: w,
          h: h,
          targetW: w * 4,
          targetH: h * 4
        });
      }, 300)
    }).catch(err => {
      console.log(err);
    });
  },
  // 绘制关联商品海报
  drawgoodsCanvas:function(){
    let that = this;
    let w = that.data.canvasGoodsData.canvasWidth;
    let h = that.data.canvasGoodsData.canvasHeight;
    let left = that.data.canvasGoodsData.paddingLeft;
    let top = that.data.canvasGoodsData.paddingTop;
    // 内部商品图片偏移量
    let innerLeft = 60;
    // 内部商品图片高度
    let imgH = w - (left + innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 80;
    let positionY = 0;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasGoodsData.canvasId);
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
      img: that.data.canvasGoodsData.avatarPath,
      r: head_r,
      x: left + 68,
      y: positionY,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制头像右侧多行文字
    canvas.drawMultiText({
      ctx: ctx,
      text: '我看上了这款商品\n帮我看看咋样啊~\n比心~     ~',
      x: left + head_r * 2 + 113,
      y: top + 41,
      fontSize: 30,
      gap: 12
    });

    ctx.font = '30px PingFang-SC-Bold'
    let textW = ctx.measureText('比心~ ').width;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasGoodsData.heartPath,
      x: left + head_r * 2 + 113 + textW,
      y: top + 41 + (30 + 12) * 2,
      w: 30,
      h: 30
    });

    // 绘制中间容器
    positionY = positionY + head_r * 2 + 39;
    canvas.roundImg({
      ctx: ctx,
      x: left + innerLeft,
      y: positionY,
      img: that.data.canvasGoodsData.productImage,
      w: imgH,
      h: imgH,
      r: 14,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });

    let product_name_text = that.data.canvasGoodsData.product_name;
    // 绘制中间容器,商品名称,超出19个字显示两行，多两行，显示省略号
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
        x: left + innerLeft,
        y: positionY + imgH + 5,
        fontSize: 30
      })
    }else{
      canvas.drawText({
        ctx: ctx,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH + 22,
        fontSize: 30
      });
    }

    // 绘制中间容器,商品价格
    // 右对齐的文字是以x的距离右对齐
    canvas.drawText({
      ctx: ctx,
      text: '¥' + that.data.canvasGoodsData.product_price,
      x: left + innerLeft,
      y: positionY + imgH + 100,
      fontSize: 50,
      color: '#b4282d',
      align: 'left'
    });

    //绘制分割线
    canvas.roundBorderRect({
      ctx,x:left + innerLeft, y:positionY + imgH + 190, h:0.1, w:imgH, r:0,border:"#eeeeee"
    })

    // 绘制二维码
    positionY = positionY + 466 + 24;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasGoodsData.qrcodePath,
      x: left + innerLeft + 10,
      y: positionY + 370,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码右侧文字
    canvas.drawText({
      ctx: ctx,
      text: '长按识别小程序码 即可查看~',
      x: left + innerLeft + qrode_r * 2 + 41,
      y: positionY + qrode_r + 375,
      fontSize: 30,
      baseline: 'middle',
      color: '#030000'
    });

    // 最终绘出画布
    ctx.draw();
  },
  // 保存海报
  saveGoods:function(o){
    let that = this;
    canvas.canvasToTempFilePath(o).then(function (res) {//画布转化为图片
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      canvas.saveImageToPhotosAlbum(o).then(function (res) {
        console.log('保存成功');
        that.setData({
          goodsImgIdx: ++that.data.goodsImgIdx
        });
        if(that.data.goodsImgIdx < that.data.goodsListLen){
          that.shopCircle(that.data.goodsList[that.data.goodsImgIdx]);
        }else{
          that.setData({
            closeModal: true,
            oneModaled: true
          });
          console.log('所有关联商品海报保存完成');
        }
      }, function (err) {
        console.log('用户取消保存',err);
      });
    }, function (err) {
      console.log(err);
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let that = this;
    const product = that.data.lists[0];
    // 过滤富文本标签
    let str = that.data.lists[0].content;
    // let reg = RegExp("<[^>]+>", "g");
    // let product_content = str.replace(reg, '');
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
    return getApp().shareGetFans(product_content, ` `, `/pages/SHOPKEEPER/pages/shop/detail`, 1, product.files[0].thumb, `&society_id=${that.data.society_id}`);
    
  },
  //高斯模糊背景
  gaussBlur(imgData) {
    var pixes = imgData.data;
    var width = imgData.width;
    var height = imgData.height;
    var gaussMatrix = [],
      gaussSum = 0,
      x, y,
      r, g, b, a,
      i, j, k, len;

    var radius = 10;
    var sigma = 5;

    a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
    b = -1 / (2 * sigma * sigma);
    //生成高斯矩阵
    for (i = 0, x = -radius; x <= radius; x++ , i++) {
      g = a * Math.exp(b * x * x);
      gaussMatrix[i] = g;
      gaussSum += g;
    }
    //归一化, 保证高斯矩阵的值在[0,1]之间
    for (i = 0, len = gaussMatrix.length; i < len; i++) {
      gaussMatrix[i] /= gaussSum;
    }
    //x 方向一维高斯运算
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = x + j;
          if (k >= 0 && k < width) { //确保 k 没超出 x 的范围
            //r,g,b,a 四个一组
            i = (y * width + k) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
        // console.log(gaussSum)
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
        // pixes[i + 3] = a ;
      }
    }
    //y 方向一维高斯运算
    for (x = 0; x < width; x++) {
      for (y = 0; y < height; y++) {
        r = g = b = a = 0;
        gaussSum = 0;
        for (j = -radius; j <= radius; j++) {
          k = y + j;
          if (k >= 0 && k < height) { //确保 k 没超出 y 的范围
            i = (k * width + x) * 4;
            r += pixes[i] * gaussMatrix[j + radius];
            g += pixes[i + 1] * gaussMatrix[j + radius];
            b += pixes[i + 2] * gaussMatrix[j + radius];
            // a += pixes[i + 3] * gaussMatrix[j];
            gaussSum += gaussMatrix[j + radius];
          }
        }
        i = (y * width + x) * 4;
        pixes[i] = r / gaussSum;
        pixes[i + 1] = g / gaussSum;
        pixes[i + 2] = b / gaussSum;
      }
    }
    return imgData;
  },

  // 页面滚动监听
  onPageScroll: function(e){
    let query = wx.createSelectorQuery()
    query.select('.comment').boundingClientRect( (rect) => {
      let top = rect.top
      if (top <= 64) {
        this.setData({
          fixedNav: true   //
        })
      } else {
        this.setData({
          fixedNav: false  //  
        })
      }
    }).exec()
    query.select('.userContent').boundingClientRect( (rect) => {
      let top = rect.top
      if (top <= 64) {
        this.setData({
          opacityNav: 1
        })
      } else {
        this.setData({
          opacityNav: 0
        })
      }
    }).exec()

  },
  // 页面滚动
  pageScrollToBottom: function() {
    let query = wx.createSelectorQuery();
    query.select('.shoper-page').boundingClientRect( (rect) => {
      console.log(rect);
      wx.pageScrollTo({
        scrollTop: rect.height + rect.top + 10
      });
    }).exec()
  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that, that.data.pcode);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            that.data.pcode = res.code;
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
  goback:function(){
    wx.navigateBack({ delata: 1 })
  },
})