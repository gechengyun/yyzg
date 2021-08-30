// pages/webview/index.js
var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   console.log(options);
  //   if(options.url){
  //     options.url = decodeURIComponent(options.url)
  //   }
  //   this.setData({options})
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("webview打开：：");
    console.log(options.url)
    publicFun.onLoad(app,this);
    if (!getApp().isLoginFun(this)) {//判断用户是否登录
      common.setUserInfoFun(this, app);
      this.setData({
        showWebView: false
      })
      return false;
    }

    let baseoption = decodeURIComponent(options.url).split('?wxapp_ticket=')
    let base_url = baseoption[0];
    let base_options = baseoption[1];
    let base_options_arr = base_options.split('#/intMall/');
    let wxapp_ticket = wx.getStorageSync('ticket');
    console.log("kitet---------", wxapp_ticket)
    let store_id = base_options_arr[1];
    console.log('base_url-->' + base_url, '--base_options_arr[0]--', base_options_arr[0], '--[1]--', base_options_arr[1])

    console.log('强制更换：', 'https://d.pigcms.com/webapp/wapindex/#/intMall/11941?wxapp_ticket=');
    options.url = base_url + '#/intMall/' + store_id + '&request_from=wxapp&wxapp_ticket=' + wxapp_ticket + '&store_id=' + store_id;
    console.log('强制更换之后：', options.url);
    // if(options.url){
    //   options.url = decodeURIComponent(options.url)
    // }
    this.setData({
      options,
      showWebView: true
    })
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

  }
})