// pages/SEALS//pages/website/website.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    webDatas:'',
    playIndex: null,//用于记录当前播放的视频的索引值
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    publicFun.setBarBgColor(app, that);//修改头部颜色
    // publicFun.barTitle(that.data.webDatas.title || that.data.webDatas.store.name, that);//修改头部标题

    // let url = `app.php?c=goods&a=get_goods_by_group&group_type=goods_group1&group_id=${groupId}&page=${page}&from=1`
    // common.post(url, '', "webData", this);
  },
  webData: function (result){
    let that = this;
    that.setData({
      webDatas: result.err_msg
    })
  },

  // 视频暂停
  videoPlay: function (e) {
    publicFun.videoPlay(this, e);
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