// pages/SHOPGOODS/pages/evaluate/evaluate.js
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var app = getApp();
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: '',
    comment_list: [],
    productListSwichNav: [],
    product_id: '',
    next_page: '',
    flag: false,
    showBigPic: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    publicFun.setBarBgColor(app, this);// 设置导航条背景色
    that.setData({
      product_id: e.id
    })
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      let that = this;
      that.setData({
        comment_data: data.data
      })
    })
    common.post('app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.product_id + '&tab=' + that.data.tab, '', 'commentData', that, '', false); 
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
  lower(e) {
    var that = this;
    if (that.data.next_page) {
      page++;
      let data = {
        page
      };
      common.post('app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.product_id + '&tab=' + that.data.tab , data, 'commentData', that, '', false); 
    }
  },
  //切换评论的tab
  productListSwichNav (e) {
    var that = this;
    var tab = e.target.dataset.tab;
    page =1;
    if(tab == that.data.tab)return false;
    that.setData({
      'tab': tab
    })
    let data = {
      page
    };
    common.post('app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.product_id + '&tab=' + that.data.tab , data, 'commentDataNav', that, '', false); 
  },
  commentDataNav(result) {
    let that = this;
    if (result.err_code == 0) {
      that.setData({
        comment_list: result.err_msg.comment_list,
        next_page: result.err_msg.next_page,
        flag: true
      })
    }
  },
  commentData(result) {
    var that = this;
    let comment_list = that.data.comment_list;
    if (result.err_code == 0) {
      for(let item of result.err_msg.comment_list) {
        comment_list.push(item)
        console.log(item)
      }
      that.setData({
        comment_list,
        next_page: result.err_msg.next_page,
        flag: true
      })
    }
  },
  showBigPic: function (e) {// 查看大图
    var that = this;
    console.log(e.target.dataset, 'eda')
    that.setData({
      'pindex':e.target.dataset.pindex,
      'common_list_index': e.target.dataset.index,
      'showBigPic': true
    })
  },
  hideBigPic: function () {// 隐藏大图
      var that = this;
      that.setData({
          'showBigPic': false
      })
  },
})