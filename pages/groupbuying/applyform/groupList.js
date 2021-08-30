// pages/groupbuying/applyform/groupList.js
var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchTrue:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    that.setData({
      "county": options.county,
    })
    // const eventChannel = this.getOpenerEventChannel()
    // // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    // eventChannel.on('acceptDataFromOpenerPage', function(data) {
    //   console.log(data, data.data.province_code_arr, "province_code_arrprovince_code_arr")
    //   that.setData({
    //     "province_code_arr": data.data.province_code_arr,
    //     "province_index": data.data.province_index,
    //     "city_code_arr": data.data.city_code_arr,
    //     "city_index": data.data.city_index,
    //     "country_code_arr": data.data.country_code_arr,
    //     "country_index": data.data.country_index
    //   })
    // })
  
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
  let that=this
    that.resolutionAddress()
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
  resolutionAddress: function() { //显示已创建的未关联团长的自提点门店 （和原来逻辑一样显示对应选中的区/县一级的门店）
    let that = this
    let params = {
      county: that.data.county,
    }
    wx.showLoading({
      title: '加载中',
    })

    let url = 'app.php?c=community_leader&a=get_physical_list';
    common.post(url, params, function(res) {
      console.log('解析地址', res);
      let physica_list_arr = [];
      wx.hideLoading()
      for (var i in res.err_msg.physica_list) {
        physica_list_arr.push(res.err_msg.physica_list[i].name)
      }
      that.setData({
        physica_list_arr: physica_list_arr,
        community_name_arr: res.err_msg.physica_list,
        community_index: 0
      })
     
    }, '')

  },
  wxSearchFn: function() { //可模糊搜索   
    wx.showLoading({
      title: '加载中',
    })
    let that = this
    let params = {
      county: that.data.county,
      physical_name: that.data.physical_name,
    }
    let url = 'app.php?c=community_leader&a=get_physical_list';
    common.post(url, params, function(res) {
      console.log('解析地址', res);
      wx.hideLoading()
      let physica_list_arr = [];
      for (var i in res.err_msg.physica_list) {
        physica_list_arr.push(res.err_msg.physica_list[i].name)
      }
      that.setData({
        physica_list_arr: physica_list_arr,
        community_name_arr: res.err_msg.physica_list,
        community_index: 0,
        searchTrue:true
      })
    }, '')
  },
  searchInput: function(e) { //模糊搜索输入
    let that = this
    console.log(e.detail.value)
    that.setData({
      physical_name: e.detail.value
    })
  },
  goBack:function(e){//返回申请团长页
    let that=this;
    let physical_name = e.currentTarget.dataset.physicalname
    let physicalid = e.currentTarget.dataset.physicalid
    //将用户选择或者创建的社区名用缓存保存
    try {
      wx.setStorageSync('physical_name', physical_name)
      wx.setStorageSync('physicalid', physicalid)
    } catch (e) { }
    console.log(e.currentTarget.dataset.physicalname)
    wx.navigateBack({
      delta: 1,
    })
  }
})