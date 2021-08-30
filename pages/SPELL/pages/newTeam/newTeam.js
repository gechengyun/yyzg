// pages/SPELL/pages/newTeam/newTeam.js

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
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.barTitle('团队编辑'); //修改头部标题
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
    common.post(`app.php?c=drp_ucenter&a=drp_team`, "", "newUserTeam", that);
  },

  newUserTeam: function(res) {
    let that = this
    console.log(res)
    if (res.err_code == 0) {
      that.setData({
        newUserTeamData: res.err_msg
      })
    }
  },
  // 获取团队头像
  addFile: function() {
    let that = this;
    wx.chooseImage({ //图片上传控件
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        wx.showLoading({
          title: '头像正在上传中...',
          mask: true
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function(_res) {
          that.setData({
            [`newUserTeamData.team_logo`]: _res.err_msg,
          });
          wx.hideLoading();
        }, '')
      }
    })
  },
  additem: function(e) {
    let that = this
    console.log(e.detail.value)
    console.log(e.currentTarget.dataset.id)
    let itemName = e.currentTarget.dataset.id
    let itemVal = e.detail.value
    that.setData({
      [`${itemName}`]: itemVal
    })
    console.log(that.data)
  },
  sub: function(e) {
    let that = this
    console.log(app, that.data.newUserTeamData, "[[[")

    if (that.data.newUserTeamData.drp_level > 1) {
      wx.showToast({
        title: '团队创建者才能修改',
        icon: 'none',
        duration: 2000
      })
    } else {

      let data = {
        store_id: app.globalData.store_id,
        store_name: that.data.newUserTeamData.store_name,
        team_name: that.data.newUserTeamData.team_name,
        logo: that.data.newUserTeamData.team_logo,
        team_id: that.data.newUserTeamData.team_id,
        member_labels: that.data.newUserTeamData.team_lable,
        intro: that.data.newUserTeamData.intro
      }

      // url: '/pages/SPELL/pages/myTeam/myTeam'
      common.post(`app.php?c=drp_ucenter&a=edit_drp_team`, data, res => {
        console.log(res, "\\\\\\\\\\\\")
        if (res.err_code == 0) {
          wx.showToast({
            title: res.err_msg,
            icon: 'success',
            duration: 2000,
            success:function(){
                wx.navigateTo({ 
                  url: '/pages/distribution/index'
                })
            }
          })
        } else {
          wx.showToast({
            title: res.err_msg,
            icon: 'none',
            duration: 2000
          })
        }


      }, '');
    }

  }
})