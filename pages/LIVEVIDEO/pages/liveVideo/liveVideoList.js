// pages/LIVEVIDEO//pages/liveVideo/liveVideoList.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var log = require(_url + '../../utils/log.js');
let page = 1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    videoListFail: 0,//0有直播，1000没有直播
    no_more: false,
    topicVal:'',//搜索框的值
    tabName: [{
      "tagname": "关注"
    }, {
      "tagname": "精选"
    }],//Tab名字
    tabIndex: 1,//默认进来是精选
    tabFixed: false,//Tab是否固定
    tagid:'',//Tab对应得id
    tabFiexd: 'view1',//Tab固定的位置
    appointIndex:'',//预约的index
    videoListData: '',//列表数据
    isShade: true,//是否显示内容的遮罩
    isGoLiving: true,//是否跳转到详情页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that);
    app.isLoginFun(that, 1);//判断用户是否登录
    that.videoListFun();
    // that.tabFun();
    // that.comingLive();
    // console.log('列表群组id',getApp().globalData.global_group_id);
  },
  // 原生直播列表数据
  videoListFun: function () {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_live_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        tagid: that.data.tagid,
        keys: that.data.topicVal,
        page: 1
      };
    common.post(url, data, 'videoListData', that,'videoListFail')
  },
  videoListData: function (res) {
    let that = this;
    that.setData({
      videoListData: [],
    });
    that.setData({
      videoListData: res.err_msg,
      isShade: false
    });
    if (res.err_msg.next_page == false){
      that.setData({
        no_more: true
      });
    }
  },
  videoListFail: function (res) {
    var that = this;
    that.setData({
      videoListFail: res.err_code
    });
  },
  // 关注列表
  followListFun:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_my_subscribe_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        keys: that.data.topicVal,
        page: 1
      };
    common.post(url, data, 'followListData', that)
  },
  followListData:function(res){
    let that = this;
    that.setData({
      videoListData: [],
    });
    that.setData({
      videoListData: res.err_msg,
      isShade: false
    });
    if (res.err_msg.next_page == false){
      that.setData({
        no_more: true
      });
    }
  },
  // tab切换
  tabSelect: function (e) {//仅原生/都有
    let that = this;
    page = 1;
    let tabIndex = e.currentTarget.dataset.tabinx;
    if(that.data.tabIndex != tabIndex){
      that.setData({
        tabIndex: tabIndex,
        isShade: true,
        no_more: false
      });
      if (tabIndex == 0){
        that.followListFun();
      }else if (tabIndex == 1){
        that.setData({
          tagid: ''
        });
        that.videoListFun();
      }
    }
  },
  // 预约
  appointClick:function(e){
    let that = this;
    let tabIndex = that.data.tabIndex;
    let appointIndex = e.currentTarget.dataset.liveindex;
    let advanceTotal = e.currentTarget.dataset.advancetotal*1 + 1;
    that.setData({
      appointIndex: appointIndex,
      advanceTotal: advanceTotal
    });
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    if (that.data.videoListData.list[appointIndex].is_advance == 0) {
      wx.requestSubscribeMessage({
        tmplIds: that.data.videoListData.subscribe_template_id,
        success(res) {
          console.log(res);
          if (res[that.data.videoListData.subscribe_template_id] == "accept") { //点击确定授权
            publicFun.warning('订阅成功', that);                       
          }else if(res[that.data.videoListData.subscribe_template_id] == "ban"){
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          } else { //点击取消授权
            publicFun.warning('取消订阅', that);
          }
        },
        fail(res) {
          publicFun.warning('请开启订阅消息方便接收消息提醒', that);
        },
        complete(res){
          let liveId = e.currentTarget.dataset.liveid;
          that.appointFun(liveId);
          // if (that.data.onlyAppletLive.only_applet_live) {//仅官方
          //   let roomId = e.currentTarget.dataset.roomid;
          //   // that.officialFollowFun(roomId);
          // } else if (that.data.onlyAppletLive.unable_applet_live) {//仅原生
          //   let liveId = e.currentTarget.dataset.liveid;
          //   that.appointFun(liveId);
          // } else {//都有
          //   if (tabIndex == 2) {
          //     let roomId = e.currentTarget.dataset.roomid;
          //     // that.officialFollowFun(roomId);
          //   } else {
          //     let liveId = e.currentTarget.dataset.liveid;
          //     that.appointFun(liveId);
          //   }
          // } 
        }
      })
    } else if (that.data.videoListData.list[appointIndex].is_advance == 1) {
      publicFun.warning('已预约', that);
    } else {
      publicFun.warning('已发送', that);
    }    
  },
  
  appointed:function(e){
    let that = this;
    let livestatus = e.currentTarget.dataset.livestatus
    if(livestatus == 1){
      publicFun.warning('直播中无法预约', that);
    }else if(livestatus == 2){
      publicFun.warning('直播结束无法预约', that);
    }    
  },
  // 原生预约函数
  appointFun: function (liveId) {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addPrepareTips',
      data = {
        live_id: liveId,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'appointData', that)
  },
  appointData: function (res) {
    var that = this;
    let appointIndex = that.data.appointIndex;
    let isAdvance = 'videoListData.list[' + appointIndex + '].is_advance';
    let advanceTotal = 'videoListData.list[' + appointIndex + '].advance_total';
    that.setData({
      [isAdvance]: 1,
      [advanceTotal]: that.data.advanceTotal
    });
  },
  // 小程序官方直播预约函数
  // officialFollowFun: function (roomId, liveIndex){
  //   let that = this;
  //   let url = 'app.php?c=tencent_live&a=addAppletLiveTips',
  //     data = {
  //       roomid: roomId,
  //       cfrom: 0,
  //       openid: wx.getStorageSync('openId')
  //     };
  //   common.post(url, data, 'officialFollowData', that, '', true)
  // },
  // 去商品回放页面
  goRecordvideo: function(e) {
      let that = this;
      if (!app.isLoginFun(that)) {//判断用户是否登录
        return false;
      }
      wx.navigateTo({
        url: `/pages/LIVEVIDEO/pages/liveVideo/goodsPlayback?product=${e.currentTarget.dataset.product}&live_id=${e.currentTarget.dataset.lived}&filesrc=${e.currentTarget.dataset.filesrc}&allrecord=${e.currentTarget.dataset.allrecord}&showStatus=${e.currentTarget.dataset.show_status}`
      })
      if(e.currentTarget.dataset.allrecord == 1){
          //更新回放次数
        let url = 'app.php?c=tencent_live&a=update_record_replay_num',
        data = {
          live_id: e.currentTarget.dataset.lived
        };
        common.post(url, data ,function(result){          
          if(result.err_code == 0){
            console.log(result)
          }
        },'');
      }   
  },
  // 跳转详情
  goLiveDetail: function (e) {
    let that = this;
    let tabIndex = that.data.tabIndex;
    let liveId = e.currentTarget.dataset.liveid;
    let imgsrc = e.currentTarget.dataset.imgsrc;
    let status = e.currentTarget.dataset.status;
    let liveIndex = e.currentTarget.dataset.liveindex;
    // if(!that.data.isGoLiving){
    //   return;
    // }
    that.setData({
      liveId: liveId,
      liveIndex: liveIndex,
      isGoLiving: false
    });
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
    })
    // if (that.data.onlyAppletLive.unable_applet_live) {//仅原生
    //   wx.navigateTo({
    //     url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
    //   })
    // }else{//都有
    //   if (tabIndex == 2) {
    //     wx.navigateTo({
    //       url: that.data.officialListData.list[liveIndex].page_url,
    //     })
    //   } else {
    //     wx.navigateTo({
    //       url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
    //     })
    //   }
    // }    
  },
  // 触底加载
  scrollToLower(){
    console.log('触底加载');
    var that = this;
    let tabIndex = that.data.tabIndex;
    if (tabIndex == 0) {
      let url = 'app.php?c=tencent_live&a=get_my_subscribe_list';
      that.listPushData(++page, that, url);
    } else if (tabIndex == 1) {
      let url = 'app.php?c=tencent_live&a=get_live_list';
      that.listPushData(++page, that, url);
    }
  },
  // 上拉加载方法(分页)
  listPushData: function (page, that, url, tabIndex) {
    //订单相关页面下拉加载
    if (that.data.videoListData.next_page == false) {      
      return
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      keys: that.data.topicVal,
      page: page
    };
    if (tabIndex != 0 && tabIndex != 1 && tabIndex != 2){
      data.tagid = that.data.tagid
    }
    common.post(url, data, function (result){
      //添加数据
      var list = that.data.videoListData.list;
      for (var i = 0; i < result.err_msg.list.length; i++) {
        list.push(result.err_msg.list[i]);
      }
      that.setData({
        'videoListData.list': list,
        'videoListData.next_page': result.err_msg.next_page
      });
      if (result.err_msg.next_page == false){
        that.setData({
          no_more: true
        });
      }
    }, '');    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    page = 1;
    that.setData({
      isGoLiving: true
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})