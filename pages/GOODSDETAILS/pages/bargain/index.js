var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    list:[],
    page:1,


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        publicFun.setBarBgColor(app);// 设置导航条背景色
        var that = this;
        publicFun.barTitle('全名砍价，低价拿商品'); //修改头部标题
        publicFun.height(that);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that=this;



  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    clearTimeout(publicFun.timer)
    that.getlist();
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

  getlist:function(){
    var that=this;
    var data={
      page:that.data.page,
      order:'desc'
    }
    common.post('app.php?c=bargain', data, "getlistCallBack", that);
  },
  getlistCallBack:function(res){
    var that=this;
    console.log(res)
    that.setData({
      list:that.data.list.concat(res.err_msg.list)
    })
  },

  goDetails:(e)=>{
    var that=this;

    var id=e.target.dataset.id
    wx.navigateTo({
      url: '/pages/GOODSDETAILS/pages/bargain/details?id='+id
    })

  },
  upper: function(e) {
      console.log(e)
    },
    lower: function(e) {
      let that=this;
      var i=that.data.page;
      i++;
      that.setData({
        page:i
      })
      that.getlist();
      console.log(that.data.page)
    },
    scroll: function(e) {
      console.log(e)
    },
    tap: function(e) {
      for (var i = 0; i < order.length; ++i) {
        if (order[i] === this.data.toView) {
          this.setData({
            toView: order[i + 1]
          })
          break
        }
      }
    },
    tapMove: function(e) {
      this.setData({
        scrollTop: this.data.scrollTop + 10
      })
    }


})