// pages/SPELL/pages/myTeam/myTeam.js
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
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
  onLoad: function(options) {
    let that = this
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.barTitle('我的团队'); //修改头部标题
    that.setData({
      navigateBarBgColor: app.globalData.navigateBarBgColor
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
    let that = this
    if (!app.isLoginFun(this)) {//判断用户是否登录
      common.setUserInfoFun(this, app);
      return false;
    }
    that.index()

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

  index: function() {
    // c = drp_ucenter & a=user_team
    let that = this
    common.post(`app.php?c=drp_ucenter&a=user_team`, "", "userTeam", that);
  },

  userTeam: function(res) {
    let that = this
    console.log(res)
    if (res.err_code == 0) {
      if (res.err_msg.status == 0){
        //未审核
        publicFun.warning('需要管理员审核通过，请及时联系管理员', that);
        setTimeout(function(){
          wx.navigateTo({
            url: '/pages/distribution/index'
          })
        },1500)
      }
      that.setData({
        userTeamData: res.err_msg,
        isData: true
      })
      
    } else if ((res.err_code == 1010 && res.err_dom.drp_level == 1) ) {
      //没存成功
      publicFun.warning('当前保存失败，请重新提交', that);
    } else {
      that.setData({
        isData: false
      })
    }
  },
  editTeam:function(){
    wx.navigateTo({
      url:'/pages/SPELL/pages/newTeam/newTeam',
    })
  }
})