var publicFun = require('../../../../utils/public.js');
var common = require('../../../../utils/common.js');
var app = getApp();
let page = 2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollHeight:0,
    nowGrouperDataList:'',
    no_more:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let physical_id = wx.getStorageSync('physical_id');
      let that = this,
      url = 'app.php?c=store&a=get_current_community_info',
      params = {
        physical_id: physical_id,
        limit:6,
        page: 1
      };
      common.post(url,params,function(res){
        console.log('点击展示',res)
        if(res.err_code == 0){
          that.setData({
            nowGrouperData: res.err_msg,
            nowGrouperDataList: res.err_msg.buy_list
          })
        }
      }, '');
    publicFun.setBarBgColor(app, that); // 设置导航条背景色 
    publicFun.height(that);
  },

  // 上拉滚动触发到底部
  bindDownLoad: function () { //滚动触发到底部
    var that = this;
    let physical_ids = wx.getStorageSync('physical_id');
    let url = 'app.php?c=store&a=get_current_community_info&physical_id=' + physical_ids + '&limit=' + 6 + '&page=' + page;
    that.orderPushData(page++, that, url)
  },
  // 上拉加载方法
  orderPushData: function (page, that, url) {
    //订单相关页面下拉加载
    if (that.data.nowGrouperData.next_page == false) {
      that.setData({
        no_more:true
      })
      return;
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    common.post(url, '', setPushData, '');
    function setPushData(result) {
      //添加数据
      console.log(result)
      var list = that.data.nowGrouperData.buy_list;
      for (var i = 0; i < result.err_msg.buy_list.length; i++) {
        list.push(result.err_msg.buy_list[i]);
      }
      that.setData({
        nowGrouperDataList: list,
        'nowGrouperData.next_page': result.err_msg.next_page
      });

      wx.hideToast();
    }
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
    page = 2
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
  oppeMap: function (e) {
    console.log(e)
    let latitude = parseFloat(e.target.dataset.lat)
    let longitude = parseFloat(e.target.dataset.long)

    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  calling: function (e) { //拨打电话
    let num = e.target.dataset.num;
    publicFun.calling(num)
  },
})