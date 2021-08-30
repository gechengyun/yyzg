// pages/SPELL/pages/details/details.js
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    level: "",
    empty:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.barTitle('我的分销'); //修改头部标题
    that.setData({
      navigateBarBgColor: app.globalData.navigateBarBgColor,
      level: options.level
    })
    let data = {
      supplier_id: app.globalData.store_id,
      level: that.data.level
    }
    common.post(`app.php?c=drp_ucenter&a=my_fx`, data, "myDistributor", that);
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

  },

  myDistributor: function(res) {
   let that=this
    if (res.err_code === 0 && res.err_msg) {
      that.setData({
        distributorList: res.err_msg
      })
    }else{
      that.setData({
        empty: true
      })
      wx.showToast({
        title: '暂无数据',
        icon: 'none',
        duration: 2000
      })
    }
  }
})