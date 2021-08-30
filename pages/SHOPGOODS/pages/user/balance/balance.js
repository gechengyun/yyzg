// pages/SHOPGOODS//pages/user/balance/balance.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    no_more: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录    
    publicFun.height(that);
    page = 1;
    that.balanceFun();
  },
  // 金豆列表
  balanceFun: function () {
    let that = this;
    let url = 'app.php?c=fans_channel&a=user_channel_receive',
      data = {
        page: 1,
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, 'balanceData', that)
  },
  balanceData: function (res) {
    var that = this;
    that.setData({
      balanceData: res.err_msg
    });
    publicFun.barTitle(res.err_msg.privilege_name, that); //修改头部标题 
  },
  /**
   * 页面上拉触底事件的处理函数onReachBottom
   */
  bindDownLoad: function () {
    var that = this;
    let url = 'app.php?c=fans_channel&a=user_channel_receive';
    that.listPushData(++page, that, url);
  },
  // 上拉加载方法(分页)
  listPushData: function (page, that, url) {
    //订单相关页面下拉加载
    if (that.data.balanceData.next_page == false) {
      return;
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data = {
      page: page
    };
    common.post(url, data, function (result) {
      //添加数据
      var list = that.data.balanceData.data;
      for (var i = 0; i < result.err_msg.data.length; i++) {
        list.push(result.err_msg.data[i]);
      }
      that.setData({
        'balanceData.data': list,
        'balanceData.next_page': result.err_msg.next_page
      });
      if (result.err_msg.next_page == false) {
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