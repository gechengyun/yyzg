// pages/LIVEVIDEO//pages/myActive/myActive.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topicVal:'',//搜索框的值
    isOver: false,//底部提示信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    publicFun.setNavSize(that) // 通过获取系统信息计算导航栏高度

    // that.myActiveFun(page);
  },
  // 我的活动列表
  myActiveFun:function(page){
    let that = this;
    // let url = 'app.php?c=my&a=live_comment_draw_detail';
    let url = 'app.php?c=my&a=get_live_lottery_prize_list';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      keyword: that.data.topicVal,
      page: page
    };
    common.post(url, data, function(res){
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            myActiveData: res.err_msg,
            next_page: res.err_msg.next_page
          });
        }else{
          var myActiveDataList = that.data.myActiveData.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            myActiveDataList.push(res.err_msg.list[i]);
          }
          that.setData({
            'myActiveData.list': myActiveDataList,
            next_page: res.err_msg.next_page
          });
        }        
      };
      // 回调成功后停止刷新
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, '',function(){
      // 回调成功后停止刷新
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    });
  },
  // 搜素
  // 监听输入框
  wxSearchInput: function (e) {
    let that = this;
    that.setData({
      topicVal: e.detail.value
    });
  },
  searchBtn:function(){
    this.onPullDownRefresh();
  },
  // 回车
  wxSearchFn: function () {
    this.onPullDownRefresh();
  },
  // 复制
  orderCopy:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.ordernum,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  // 添加收货地址
  addressGo: function(e) { //点击头部我的地址-出现选择地址列表
    let that = this;
    let aDressMes = that.data.myActiveData;
    let addressid = e.currentTarget.dataset.addressid;
    let live_id = e.currentTarget.dataset.liveid;
    let prizeid = e.currentTarget.dataset.prizeid
    if(aDressMes.user_address == 0){
      wx.navigateTo({
        url: '/pages/user/address/addressEdit',
      });
    }else{
      wx.navigateTo({
        url: '/pages/user/address/index?address=' + addressid + '&isLive= 1' + '&live_id=' + live_id + '&prizeid=' + prizeid,
      });
    }
  },
  // 领取优惠券
  getPrize (e) {
    wx.showModal({
      title: '提示',
      content: '确定领取优惠券么？',
      success: (res) => {
        if (res.confirm) {
          let rid = e.target.dataset.prizeid;
          let url = 'app.php?c=my&a=cash_prize';
          let data = {
              rid
          };
          common.post(url, data, (res)=>{
            if(res.err_code === 0) {
              wx.showToast({
                title: res.err_msg,
                icon: 'none',
                duration: 2000
              })
              setTimeout(() => {
                page = 1;
                this.setData({
                  myActiveData: []
                });
                this.myActiveFun(page);
              },1000)
              }
          }, '');
       
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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
    let that = this;
    page = 1;
    that.myActiveFun(page);
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
    wx.showNavigationBarLoading();
    page = 1;
    that.setData({
      isOver: false
    });
    that.myActiveFun(page);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.next_page ==true){
      wx.showNavigationBarLoading();
      that.myActiveFun(++page);
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