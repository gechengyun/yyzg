// pages/user/information/information.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '请选择',
    imgList: [],
    userData: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
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
    var that = this;
    let data = {
      // store_id: app.globalData.store_id
    }
    common.post('app.php?c=my&a=getPersonInfo', data, "userData", that , '', false);
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
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  addImg: function(e) { //图片上传
    var that = this;
    publicFun.addImg(that)
  },
  userData: function(result) {
    if (result.err_code == 0) {
      if (result.err_msg.birthday) {
        this.setData({
          date: result.err_msg.birthday
        })
      }
      this.setData({
        userData: result.err_msg
      })
    };
  },
  formSubmit(e) {
    var that = this;
    if (!e.detail.value.nickname){
      wx.showToast({
        title: '请填写用户名',
        icon: 'none',
      })
      return false
    }
    if (!e.detail.value.sex){
      wx.showToast({
        title: '请选择性别',
        icon: 'none',
      })
      return false
    }
    let avatar = that.data.imgList.length>0? that.data.imgList[0]:that.data.userData.avatar;
    let birthday = e.detail.value.birthday === '请选择'? '': e.detail.value.birthday;
    let data = {
      nickname: e.detail.value.nickname,
      avatar: avatar,
      sex: e.detail.value.sex,
      birthday: birthday
    }
    common.post('app.php?c=my&a=updatePersonInfo', data, "updateData", that,'' ,true);
  },
  updateData(res) {
    if (res.err_code === 0) {
      wx.showToast({
        title: res.err_msg,
        icon: 'none',
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/user/index',
        })
      }, 1000)
    } 
  }
})