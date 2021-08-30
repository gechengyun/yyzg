var publicFun = require('../../../../utils/public.js');
var common = require('../../../../utils/common.js');
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
  onLoad: function (options) {
    var that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLocation();
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
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        // console.log('获取位置信息', res);
        let url = 'app.php?c=store&a=get_adress'
        let data = {
          lat: res.latitude,
          lng: res.longitude,
        }
        that.getGrouperData(res.latitude, res.longitude,1)
        common.post(url, data, function (res) {
          console.log('转义位置',res);
          if(res.err_code == 0){
            that.setData({
              positionName: res.err_msg

            })
          }
        },'')
      },
      fail: function (res) {
        publicFun.warning('定位失败，请稍后重试', that);
      }
    })
  },
  getGrouperData:function(lat,lng,page){
    let url = "app.php?c=community_leader&a=community_leader_list";
    let datas = {
      page: page,
      lat: lat,
      lng: lng
    }
    let that = this;
    common.post(url,datas,function(res){
      console.log('当前团长信息',res)
      if(res.err_code == 0){
        that.setData({
          grouperData: res.err_msg
        })
      }
      
    },'')
  },
  chooseLocation: function (e) {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log('选择的地址', res)
        that.setData({
          positionName:res.name
        })
        that.getGrouperData(res.latitude, res.longitude, 1)
      },

    })
  },
  chooseGrouper:function(e){
    console.log(e.currentTarget.dataset.value)
    let grouperData = e.currentTarget.dataset.value;
    let url ="app.php?c=community_leader&a=switch_leader";
    let params = {
      physical_id: grouperData.physical_id,
      fx_store_id: grouperData.fx_store_id,
    };
    common.post(url,params,function(res){
      console.log('切换团长信息',res)
      wx.setStorageSync('physical_id', grouperData.physical_id);
      if(res.err_code == 0){
        wx.removeStorageSync('leader_id');
        wx.setStorageSync('leader_id', res.err_msg.leader_id);
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
    },'')

  },
  oppeMap: function (e) {
    console.log(e)
    let latitude = parseFloat(e.currentTarget.dataset.lat)
    let longitude = parseFloat(e.currentTarget.dataset.long)

    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  }
})