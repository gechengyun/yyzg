// pages/user/scancode/scancode.js
var publicFun = require('../../../../../utils/public.js');
var common = require('../../../../../utils/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    drawCode:'',
    orderList:'',
    orderId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.barTitle('扫码核销'); //修改头部标题
    if (options.orderno){
      that.setData({
        drawCode: options.orderno
      });
      that.searchData();
      wx.hideLoading();
    }
  },
  searchData:function(){
    let that = this;
    let data = {
      order_no: that.data.drawCode,
      store_id: app.globalData.store_id,
      uid: app.globalData.my_uid,
      source: 1
    };
    let url = 'app.php?c=order&a=selffetch_order_info';
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        that.setData({
          orderList: res.err_msg.order_list,
          drawCode: res.err_msg.order_list.order_no,
          orderId: res.err_msg.order_list.order_id
        })
      }
    }, "");
  },
  // 点击扫码
  scancode:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    });
    wx.scanCode({
      success(res) {
        console.log('扫码结果',res);
        if (res.result){
          console.log(res.result);
          let orderno = res.result;
          that.setData({
            drawCode: orderno
          })
          that.searchData();
          wx.hideLoading();
        }
      }
    })
  },
  // 订单号输入监听
  watchOrder: function (event){
    let that = this;
    that.setData({
      drawCode: event.detail.value
    });
  },
  // 查询
  search:function(){
    let that = this;
    that.searchData();
  },
  // 确认自提
  draw:function(){
    let that = this;
    let data = {
      order_id: that.data.orderId,
      uid: app.globalData.my_uid,  
      store_id: app.globalData.store_id
    };
    let url = 'app.php?&c=order&a=confirm_selffetch';
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {//订单核销成功
        wx.showModal({
          title: '提示',
          content: res.err_msg,
          confirmText: '好的',
          confirmColor:'#ff7800',
          showCancel: false,
          success: function (res) {
            wx.navigateTo({
              url: '/pages/SHOPGOODS/pages/groupbuying/ordermanagement?orderno=' + that.data.drawCode,
            });
          }
        });
      }
    }, "",function(res){
      let orderno = that.data.drawCode;
      if (res.err_code!= 1011 ){//订单已核销
        wx.navigateTo({
          url: '/pages/SHOPGOODS/pages/groupbuying/ordermanagement?orderno=' + that.data.drawCode,
        });
      }
    })
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