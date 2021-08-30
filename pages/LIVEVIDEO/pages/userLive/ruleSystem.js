// pages/LIVEVIDEO//pages/userLive/ruleSystem.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleType: 0,//默认是0，制度类型
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    if (options.stype){
      that.setData({
        ruleType: options.stype
      });   
      that.pageFun();   
    }
    if(options.protocol_id){
      that.setData({
        protocol_id: options.protocol_id
      });
      that.pageFun(); 
    }
    if(options.ruleContent){
      wxParse.wxParse('pageDataContent', 'html', that.data.pageData.content, that, 5);
      publicFun.barTitle(options.ruleName, that); //修改头部标题
    }    
  },
  // 基础
  pageFun: function (result) {
    let that = this;
    let url = 'app.php?c=wxapp&a=get_agreement';
    let data = {
      store_id: app.globalData.store_id || common.store_id
    };
    if(that.data.protocol_id){
      data.protocol_id = that.data.protocol_id
    }
    common.post(url, data, 'pageData', that, '')
  },
  pageData: function (res) {
    let that = this;
    let ruleType = that.data.ruleType;
    that.setData({
      pageData: res.err_msg[ruleType]
    });
    if (that.data.pageData.content){
      wxParse.wxParse('pageDataContent', 'html', that.data.pageData.content, that, 5);
    }
    publicFun.barTitle(that.data.pageData.name, that); //修改头部标题
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