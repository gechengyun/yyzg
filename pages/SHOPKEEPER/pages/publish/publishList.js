// pages/SHOPKEEPER//pages/publish/publishList.js
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
    scrollHeight: 0,
    no_more: false,//底部的提示信息
    page:1,
    way:0,//0是发布列表 1是话题列表
    tid:''//话题id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    publicFun.setNavSize(that) // 通过获取系统信息计算导航栏高度
    publicFun.height(that);
    if (options.way){
      that.setData({
        way: options.way,
        tid: options.tid
      });
    }
    if(options.way == 0){
      publicFun.barTitle('发布列表', that); //修改头部标题 
    }else if(options.way == 2){
      publicFun.barTitle('喜欢', that); //修改头部标题 
    }
    that.publicListFun();
  },

  publicListFun:function(){
    let that = this;
    let data={
      store_id: app.globalData.store_id || common.store_id,
      cfrom: 1,
      page: 1,
      pagesize: 10
    };
    if (that.data.way == 0) {//我发布的种草
      var url = 'app.php?c=society&a=mylist';
      data.openid = wx.getStorageSync('openId');
    }else if(that.data.way == 2){//我喜欢的种草
      var url = 'app.php?c=society&a=mylikelist';
    }else{//种草标签
      var url = 'app.php?c=society&a=tagSocietyList';
      data.tid = that.data.tid;
    }    
    common.post(url, data, 'publicListData', that)
  },
  publicListData:function(res){
    let that = this;
    console.log(res);
    that.setData({
      publicListData: res.err_msg
    });
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作onPullDownRefresh
   */
  bindUpLoad: function () {
    let that = this;
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    that.publicListFun();
    // 数据请求成功后，关闭刷新
    wx.stopPullDownRefresh({
      success(res) {
        console.log('刷新成功');
      }
    }); 
    that.setData({
      page: 1
    });
  },
  /**
   * 页面上拉触底事件的处理函数onReachBottom
   */
  bindDownLoad: function () {
    var that = this;
    if (that.data.way == 0){
      var url = 'app.php?c=society&a=mylist';
    }else if(that.data.way == 2){//我喜欢的种草
      var url = 'app.php?c=society&a=mylikelist';
    }else{
      var url = 'app.php?c=society&a=tagSocietyList';
    }
    that.orderPushData(++that.data.page, that, url);
    console.log(that.data.page)
  },
  // 上拉加载方法(分页)
  orderPushData: function (page, that, url) {
    //订单相关页面下拉加载
    if (page > that.data.total_page) {
      that.setData({
        no_more: true
      });
      return;
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data={
      store_id: app.globalData.store_id || common.store_id,
      cfrom: 1,
      page: page,
      pagesize: 10
    };
    if (that.data.way == 0) {
      data.openid = wx.getStorageSync('openId');
    }else if(that.data.way == 2){//我喜欢的种草
      
    } else {
      data.tid = that.data.tid;
    }    
    common.post(url, data, setPushData, '');
    function setPushData(result) {
      //添加数据
      var list = that.data.publicListData.list;
      for (var i = 0; i < result.err_msg.list.length; i++) {
        list.push(result.err_msg.list[i]);
      }
      that.setData({
        'publicListData.list': list,
        total_page: result.err_msg.total_page
      });
      if (that.data.total_page < page) {
        that.setData({
          no_more: true
        });
      }
    }
  },
  // 跳转到内容详情页
  goDetail: function (e) {
    let that = this;
    let society_id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;//种草类型1：图片；2：视频
    if(that.data.publicListData.isfullscreen*1 == 1){//1:开启了短视频 0：未开启
      if(type == 1){//跳转种草详情
        wx.navigateTo({
          url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id,
        });
      }else if(type == 2){//跳转短视频
        wx.navigateTo({
          url: '/pages/SHOPKEEPER/pages/shop/videoSlide?society_id=' + society_id + '&comfrom=0',
        });
      }
    }else{
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id,
      });
    }
  },
  goBack:function(){
    wx.navigateBack();
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
    that.setData({
      page: 1
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

  }
})