// pages/user/scancode/camera.js
var publicFun = require('../../../../../utils/public.js');
var common = require('../../../../../utils/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    drawCode:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
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
  // 扫码
  scancode(e){
    let res = e.detail.result;
    if(res!= undefined){
      wx.navigateTo({
        url: './scancode?orderno=' + res,
      });
    }        
  },
  // 订单号输入监听
  watchOrder: function (event) {
    let that = this;
    that.setData({
      drawCode: event.detail.value
    });
  },
  // 查询
  search: function () {
    let that = this;
    let res = that.data.drawCode;
    wx.navigateTo({
      url: './scancode?orderno=' + res,
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