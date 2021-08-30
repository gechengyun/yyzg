// pages/SHOPKEEPER//pages/chat/chatList.js
var _url = '../../';
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var app = getApp();
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOver: false,//是否显示底部结束信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    setTimeout(function(){
      publicFun.setBarBgColor(app, that); // 设置导航条背景色 
    },500);
    publicFun.setNavSize(that); // 通过获取系统信息计算导航栏高度
    app.isLoginFun(that, 1);//判断用户是否登录
    if (options.society_id){      
      that.setData({
        society_id: options.society_id
      });
    };
    if(options.chatnum){
      publicFun.barTitle(options.chatnum + '条评论'); //修改头部标题
    }
    
    that.sayList(1)
  },

   // 评论列表
   sayList:function(page){
    let that = this;
    let url = 'app.php?c=society&a=comment_list',
      data = {
        society_id: that.data.society_id,
        page: page,
        pagesize: 10
      };
    common.post(url, data, function (res) {
      if(page == 1){
        that.setData({
          sayList: res.err_msg,
          next_page: res.err_msg.next_page
        });
      }else{
        var sayDataList = that.data.sayList.list;
        for (var i = 0; i < res.err_msg.list.length; i++) {
          sayDataList.push(res.err_msg.list[i]);
        }
        that.setData({
          'sayList.list': sayDataList,
          next_page: res.err_msg.next_page
        });
      }
      wx.stopPullDownRefresh();  
    }, '')
  },
  // 列表点赞
  listHeart:function(e){
    let that = this;
    let likeid = e.currentTarget.dataset.likeid;
    let idxs = e.currentTarget.dataset.idxs;
    let url = 'app.php?c=society&a=comment_like',//点赞
    data = {
      society_id: that.data.society_id,
      store_id: app.globalData.store_id || common.store_id,
      comment_id: likeid
    };
    common.post(url, data, function (res) {
      that.setData({
        ['sayList.list[' + idxs + '].ismylike']: res.err_msg.islike,
        ['sayList.list[' + idxs + '].likenumstr']: res.err_msg.likenumstr
      })
    },'');
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
    let that = this;
    page = 1;
    that.setData({
      isOver: false
    });
    that.sayList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.next_page ==true){
      that.sayList(++page);
    }else{
      that.setData({
        isOver:true
      });
    }    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})