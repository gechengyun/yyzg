// pages/SHOPGOODS/pages/ems/ems.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    logistics: '',
    deliverystatus: ['','在途中','派件中','已签收','派送失败','揽收','退回','转单','疑难','退签','待清关','清关中','已清关','清关异常']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true,
      duration: 5000
    });
    if (options.id) {
      that.setData({
        id: options.id
      })
      common.wuliu ({data: {number: options.id,mobile: '13855198776'}, sCallback: function (res) {
        if (res.data) {
          if (Array.isArray(res.data.list)) {
            res.data.list.forEach(item => {
              item.date = item.time.split(' ')[0];
              item.timex = item.time.split(' ')[1];
            });
          }
          that.setData({
            logistics: res.data
          })
        } else {
          that.setData({
            logistics: ''
          })
        }
        wx.hideToast()
      }});
    }
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

  },
   // 复制
  orderCopy:function(e){
    console.log(e)
    let that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.ordernum,
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
})