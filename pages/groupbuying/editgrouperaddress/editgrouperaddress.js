var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    edit_Address:{},
    province_name_arr: ['请选择'],
    province_code_arr: [],
    province_index: 0,
    province_code: 0,
    city_name_arr: ['请选择'],
    city_code_arr: [],
    city_index: 0,
    city_code: 0,
    country_name_arr: ['请选择'],
    country_code_arr: [],
    country_index: 0,
    country_code: 0,
    community_name_arr: ['请选择'],
    community_index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '修改自提地址',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    let addId = 0;
    publicFun.addressEditGO(that, addId);
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
  saveDetailAddress:function(e){
    this.setData({
      "edit_Address.detail":e.detail.value
    })
  },
  chooseAddress:function(){
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log('选择的地址', res)
        that.setData({
          "edit_Address.position": res

        })
      },
    })
  },
  // 地址
  pickerProvince: function (e, p_index) { //省份选择
    var that = this;
    publicFun.pickerProvince(that, e, p_index, true)

  },
  pickerCity: function (e, c_index) { //市级选择
    var that = this;
    publicFun.pickerCity(that, e, c_index, true)
  },

  pickerCountry: function (e) { //县区
    var that = this;
    publicFun.pickerCountry(that, e, true)
  },
  editAddressFun:function(){
    let that = this;
    if (!this.data.edit_Address.position){
      return publicFun.warning('地址不能为空', that);
    }
    if (this.data.edit_Address.detail){
      return publicFun.warning('详细地址不能为空', that);
    }
    let url = "app.php?c=community_leader&a=edit_leader_address";
    let params = {
      leader_id: wx.getStorageSync("leader_id"),
      province: this.data.province_code_arr[this.data.province_index],
      city: this.data.city_code_arr[this.data.city_index],
      county: this.data.country_code_arr[this.data.country_index],
      address: this.data.edit_Address.position.name,
      lat: this.data.edit_Address.position.latitude,
      lng: this.data.edit_Address.position.longitude
    };
    common.post(url,params,function(res){
      console.log('地址修改',res)
      if(res.err_code == 0){
        wx.navigateBack({
          delta: 1
        })
      }
    },'')
  },

})