// pages/LIVEVIDEO//pages/myTeam/myTeam.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    no_more: false,//底部the end
    isUnFold: true,//是否展开
    isDetail: false,//点击详情弹窗
    screenArr:['全部','中级','初级'],//筛选数据
    sortArr: ['添加时间顺序排列', '添加时间倒序排列', '累计收益正序排列','累计收益倒序排列'],//排序数据
    topicVal:'',//搜索框的input值
    isLevel: 0,//等级
    levelIndex: 0,//等级索引
    orderBy: 1,//排序方式:0:时间正序1：时间倒序
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    publicFun.setNavSize(that) // 通过获取系统信息计算导航栏高度

    that.teamAddFun();
    that.myTeamFun();
  },
  // 团队合计
  teamAddFun:function(){
    let that = this;
    let url = 'app.php?c=team&a=team_details';
    let data = {
      store_id: app.globalData.store_id || common.store_id
    };
    common.post(url, data, 'teamAddData', that, '')
  },
  teamAddData: function (res) {
    var that = this;
    that.setData({
      teamAddData: res.err_msg
    });
  },
  // 我的团队
  myTeamFun:function(){
    let that = this;
    let url = 'app.php?c=team&a=my_team';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      keyword: that.data.topicVal,
      level: that.data.isLevel,
      orderby_type: that.data.orderBy,
      page: 1
    };
    common.post(url, data, 'myTeamData', that, '')
  },
  myTeamData: function (res) {
    var that = this;
    that.setData({
      myTeamData: res.err_msg
    });
    if (res.err_msg.next_page == false){
      that.setData({
        no_more: true
      });
    }
  },
  // 详情弹窗
  detailFun:function(uid){
    let that = this;
    let url = 'app.php?c=team&a=user_detail';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      uid: uid
    };
    common.post(url, data, 'detailData', that, '')
  },
  detailData: function (res) {
    var that = this;
    that.setData({
      detailData: res.err_msg,
      isDetail: true
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  // 返回上一页
  goback: function () {
    wx.navigateBack({
      delta: 2
    })
  },
  // 展开收起
  unFold:function(){
    let that = this;
    that.setData({
      isUnFold: !that.data.isUnFold
    });
  },
  // 显示详情弹窗
  showDetail:function(e){
    let that = this;
    let uid = e.currentTarget.dataset.uid
    that.setData({
      teamLevel: e.currentTarget.dataset.teamlevel
    })
    that.detailFun(uid);    
  },
  // 复制手机号码
  copyPhone:function(e){
    let that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.myphone,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  // 关闭详情弹窗
  closeDetail:function(){
    let that = this;
    that.setData({
      isDetail: false
    });
  },
  // 搜索
  // 监听输入框
  wxSearchInput:function(e){
    let that = this;
    that.setData({
      topicVal: e.detail.value
    });
  },
  searchBtn:function(){
    let that = this;
    page = 1;
    that.myTeamFun();
  },
  // 回车
  wxSearchFn:function(){
    let that = this;
    page = 1;
    that.myTeamFun();
  },
  // 筛选
  bindScreenChange: function (e) {
    let that = this;
    page = 1;
    console.log('picker发送选择改变，携带值为', e);
    that.setData({
      levelIndex:e.detail.value*1
    })
    if(e.detail.value == 0){
      that.setData({
        isLevel: e.detail.value*1
      });
    }else{
      that.setData({
        isLevel: 3 - e.detail.value
      });
    }
    that.myTeamFun();
  },
  // 排序
  bindSortChange: function (e) {
    let that = this;
    page = 1;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    that.setData({
      orderBy: e.detail.value*1
    });
    that.myTeamFun();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    // 获取微信胶囊数据
    var data = wx.getMenuButtonBoundingClientRect();
    that.setData({
      boundHeight: data.height,
      boundtop: data.top
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
    console.log('开始刷新');
    let that = this;
    page = 1;
    that.setData({
      keyword: '',
      isLevel: 0,
      orderBy: 1
    });
    wx.showNavigationBarLoading();

    that.teamAddFun();
    that.myTeamFun();

    wx.stopPullDownRefresh({
      success(res) {
        console.log('刷新成功');
        // 隐藏导航栏加载框  
        wx.hideNavigationBarLoading();
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let url = 'app.php?c=team&a=my_team';
    that.listPushData(++page, that, url);
  },
  // 上拉加载方法(分页)
  listPushData: function (page, that, url) {
    //订单相关页面下拉加载
    if (that.data.myTeamData.next_page == false) {      
      return
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      keyword: that.data.topicVal,
      level: that.data.isLevel,
      orderby_type: that.data.orderBy,
      page: page
    };
    common.post(url, data, function (result){
      //添加数据
      var team_list = that.data.myTeamData.team_list;
      for (var i = 0; i < result.err_msg.team_list.length; i++) {
        team_list.push(result.err_msg.team_list[i]);
      }
      that.setData({
        'myTeamData.team_list': team_list,
        'myTeamData.next_page': result.err_msg.next_page
      });
      if (result.err_msg.next_page == false){
        that.setData({
          no_more: true
        });
      }
    }, '');    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})