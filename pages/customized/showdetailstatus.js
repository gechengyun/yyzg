var publicFun = require('../../utils/public.js');
var common = require('../../utils/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeReal:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.barTitle('实名认证'); //修改头部标题
    that.setData({
      themeColor: app.globalData.navigateBarBgColor
    })
    if (options.addimg){
      this.setData({
        addimgStatus:true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },
  getRelnameList:function(){
    let url = "app.php?c=foreign_trade&a=attestation_list";
    let that = this;
    common.post(url,'',function(res){
      console.log('列表',res);
      that.setData({
        relnamePerson: res.err_msg ? res.err_msg:[]
      })
    },'')
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getRelnameList();
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
  setdefault(e){
    console.log(e.currentTarget.dataset.value)
    let obj = e.currentTarget.dataset.value;
    let that = this;
    let url = 'app.php?c=foreign_trade&a=attestation_default';
    let params = {
      id: obj.id
    }
    common.post(url, params, function (res) {
      console.log('设置默认结果', res)
      if (res.err_code == 1) {
        that.getRelnameList();
      }
    }, '')
  },
  deleteRelname(e){
    let that = this;
    let obj = e.currentTarget.dataset.value;
    let url = 'app.php?c=foreign_trade&a=attestation_del';
    let params = {
      id: obj.id
    }
    wx.showModal({
      title: '提示',
      content: '确认要删除该实名认证信息吗？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          common.post(url,params,function(res){
            console.log('删除结果',res)
            if(res.err_code == 0){
              that.getRelnameList();
            }
          },'')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }

      
    })
    
  }
})