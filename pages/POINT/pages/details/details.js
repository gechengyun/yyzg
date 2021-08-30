// pages/POINT/pages/details.js
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvasFun = require('../../../../utils/canvas-post.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    page: 1,
    user_points_list: [],
    next_page: true,
    user_point: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    app.updateThemeColor().then(function(res) {

      publicFun.setBarBgColor(app, that); // 设置导航条背景色
      that.setData({
        navigateBarBgColor: res.navigateBarBgColor
      })
    })
    that.index()
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
    let that = this;
    if (that.data.next_page) {
      let page = that.data.page+1
      that.setData({
        page: page
      })
      that.index()
    } else {
      wx.showToast({
        title: '暂无更多数据',
        icon: 'none',
        duration: 1000
      })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.next_page){
      let page = that.data.page+1
      that.setData({
        page: page
      })
      that.index()
    }else{
      wx.showToast({
        title: '暂无更多数据',
        icon: 'none',
        duration: 1000
      })  
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //积分明细接口
  index: function() {
    let that = this
    let url = 'app.php?c=ucenter&a=point_list'
    let data = {
      page: that.data.page
    }
    let next_page = that.data.next_page
    let user_points_list = that.data.user_points_list
    wx.showLoading({
      title: '加载中',
    })
    common.post(url, data, function(result) {
      if (result.err_code == 0) {
        console.log('扫描门店商品二维码', result);
        that.setData({
          user_points_list: user_points_list.concat(result.err_msg.user_points_list),
          user_point: result.err_msg.user_point,
          next_page: result.err_msg.next_page
        })
        wx.hideLoading()
      
      }

    }, '');

  }
})