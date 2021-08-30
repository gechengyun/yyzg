// pages/SHOPKEEPER//pages/userPage/userList.js
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
    tabIndex: 0,//Tab的索引
    isFollow: 0,//是否关注
    isOver: false,//底部提示信息,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    if(options.tabIndex){
      that.setData({
        tabIndex: options.tabIndex
      })
    };

    that.listFun(page);
  },
  // 列表数据
  listFun:function(page){
    let that = this;
    let url = 'app.php?c=society&a=subscribe_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        xtype: that.data.tabIndex,
        page: page
      };
    common.post(url, data, 'listData', that)
  },
  listData: function(res){
    var that = this;
    publicFun.barTitle(res.err_msg.mynickname); //修改头部标题
    if(page == 1){
      that.setData({
        listData: res.err_msg,
        next_page: res.err_msg.next_page
      });
    }else{
      var listDataList = that.data.listData.list;
      for (var i = 0; i < res.err_msg.list.length; i++) {
        listDataList.push(res.err_msg.list[i]);
      }
      that.setData({
        'listData.list': listDataList,
        next_page: res.err_msg.next_page
      });
    }
  },
  // Tab切换
  switchTab:function(e){
    let that = this;
    page = 1;
    console.log(e);
    let tabIndex = e.target.dataset.tabindex;
    if(that.data.tabIndex != tabIndex){
      that.setData({
        tabIndex: tabIndex,
        isOver: false,
      });
      that.listFun(page);
    }
  },
  // 关注/取消关注
  aboutClick:function(e){
    let that = this;
    let listIdx = e.currentTarget.dataset.index;
    let listData = that.data.listData;
    let ismutual = e.currentTarget.dataset.ismutual;
    let url = 'app.php?c=society&a=subscribe',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        uid: e.currentTarget.dataset.uid
      };
      if(that.data.tabIndex == 0){//关注列表，点击取消
        data.status = 0
      }else if(that.data.tabIndex == 1){//粉絲列表
        if(ismutual*1 == 1){//互相關注，点击取消关注
          data.status = 0
        }if(ismutual*1 == 0){//未关注，点击关注
          data.status = 1
        }
      }
    common.post(url, data, function(){
      if(that.data.tabIndex == 0){//取消关注
        publicFun.warning('已取消关注', that);
        listData.list.splice(listIdx, 1)
        that.setData({
          'listData.list': listData.list,
          'listData.subscribecount': --listData.subscribecount
        })
      }else if(that.data.tabIndex == 1){
        if(ismutual*1 == 1){//互相关注，点击取消关注
          publicFun.warning('已取消关注', that);
          that.setData({
            ['listData.list[' + listIdx + '].ismutual']: 0,
            'listData.subscribecount': --listData.subscribecount
          })
        }if(ismutual*1 == 0){//未关注，点击关注
          publicFun.warning('关注成功', that);
          that.setData({
            ['listData.list[' + listIdx + '].ismutual']: 1,
            'listData.subscribecount': ++listData.subscribecount
          })
        }
      }
    }, '', '', true)
  },
  // 点击头像跳转对应主页
  goPage:function(e){
    let that = this;
    console.log(e);
    let isanchor = e.currentTarget.dataset.isanchor;
    let otheruid = e.currentTarget.dataset.uid;
    otheruid = otheruid == 0? '-1': otheruid;
    if(isanchor == 0){//非主播
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userPage?otheruid=' + otheruid,
      })
    }else if(isanchor == 1){//主播
      wx.navigateTo({
        url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + otheruid,
      })
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
    that.listFun(page);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.next_page ==true){
      wx.showNavigationBarLoading();
      that.listFun(++page);
      setTimeout(function(){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 1500)
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