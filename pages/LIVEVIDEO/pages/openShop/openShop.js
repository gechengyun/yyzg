// pages/LIVEVIDEO//pages/openShop/openShop.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRule: true,//是否同意规则
    isEdit: true,//是否禁止编辑
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录

    that.ruleFun();
  },
  // 协议
  ruleFun: function () {
    let that = this;
    let url = 'app.php?c=wxapp&a=get_agreement';
    let data = {
      store_id: app.globalData.store_id || common.store_id
    };
    common.post(url, data, 'ruleData', that, '')
  },
  ruleData: function (res) {
    var that = this;
    that.setData({
      ruleData: res.err_msg
    });
  },
  // 返回上一页
  goback: function () {
    wx.navigateBack({
      delta: 2
    })
  },
  // 编辑
  editName:function(){
    let that = this;
    that.setData({
      isEdit: false
    });
  },
  // 禁止编辑
  disEdit:function(){
    let that = this;
    that.setData({
      isEdit: true
    });
  },
  // 规则选择
  chooseRule: function () {
    let that = this;
    that.setData({
      isRule: !that.data.isRule
    });
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