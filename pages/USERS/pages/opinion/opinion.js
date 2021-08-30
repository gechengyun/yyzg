// pages/USERS/pages/opinion/opinion.js
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
    opinionList: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    let url = "api/product/feedback/getQuestionType";
    common.ajax1(url, 'GET',{}, 'questionType', that, '', false)
  },
  questionType(res) {
    if (res.err_code === '200') {
      this.setData({
        opinionList: res.data
      })
    } else {
      wx.showToast({
        title: res.err_msg,
        icon: 'none',
        duration: 2000
      })
      
    }
    console.log(this.data.opinionList)
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
  addImg: function(e) { //图片上传
    var that = this;
    let imgList = that.data.imgList;
    if (imgList.length >= 1) {
      wx.showToast({
        title: '只能传一张图片',
        icon: 'none',
      })
      return false
    }
    publicFun.addImg(that)
  },
   // 删除上传图片
  deleteImg(e) {
    let index = e.target.dataset.index;
    let data = this.data.imgList.splice(index, 1);
    this.setData({
      'imgList': this.data.imgList
    })
  },
  formSubmit(e) {
    if (!e.detail.value.questionType){
      wx.showToast({
        title: '请选择问题类型',
        icon: 'none',
      })
      return false
    }
    if (!e.detail.value.content){
      wx.showToast({
        title: '请填写详情描述',
        icon: 'none',
      })
      return false
    }
    let phone_no = e.detail.value.phone
    if (e.detail.value.phone && !(/^1[23456789]\d{9}$/.test(phone_no))) {//手机号
      wx.showToast({
        title: '请填写正确的手机号',
        icon: 'none',
      })
      return false
    }
    let img = this.data.imgList.length>0? this.data.imgList.join(","):'';
    let data = {
      questionType: e.detail.value.questionType,
      img: img,
      content: e.detail.value.content,
      phone: e.detail.value.phone,
    }
    console.log(data);
    let url = "api/product/feedback/save?questionType="+e.detail.value.questionType+"&img="+img+"&content="+e.detail.value.content+"&phone="+e.detail.value.phone;
    common.ajax1(url, 'POST',data, 'saveQuestion', this, '', false)
  },
  saveQuestion(res) {
    if (res.err_code === '200') {
      wx.showToast({
        title: res.data,
        icon: 'none',
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/user/index',
        })
      }, 100);
    } else {
      wx.showToast({
        title: res.err_msg,
        icon: 'none',
      })
    }
  }
})