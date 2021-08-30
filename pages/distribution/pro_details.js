// pages/distribution/pro_details.js
var common = require('../../utils/common.js');
var wxCharts = require('../../utils/wxcharts.js');
var publicFun = require('../../utils/public.js');
var app = getApp(); 
Page({ 
  /**
   * 页面的初始数据
   */
  data: {
    proInfo:'',
    store_logo:'',
    store_name:'',
    phone:''
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色  
    publicFun.barTitle('店铺资料'); 
    //获取系统信息  
    wx.getSystemInfo({
      //获取系统信息成功----系统窗口的宽高 
      success: function (res) {
        that.width = res.windowWidth
        that.setData({
          'width': res.windowWidth,
          'height': res.windowHeight,
        })
      }
    });  
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    common.post('app.php?c=drp_ucenter&a=drp_store_info', '', "supplyShow", that); 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {  
  },
  supplyShow:function(res){
    if (res.err_code==0){
      this.setData({
        proInfo: res.err_msg,
        store_logo: res.err_msg.store_logo,
        store_name: res.err_msg.store_name,
        phone: res.err_msg.phone
      })
    } 
  },
  // 修改头像
  changePhoto:function(e){ 
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有  
      success: res=> {
        var tempFilePaths = res.tempFilePaths 
        common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], res2=>{ 
          console.log(res2.err_msg)  
          this.setData({
            store_logo: res2.err_msg
          }) 
        },'') 
       } 
      })   
  }, 

  stroeNameBlur: function (e) { 
    console.log(e) 
    var that = this;
    let a = e.detail.value;  
    that.setData({
      store_name: e.detail.value  
    }); 
    return true;
  },
  telBlur: function (e) {  
    var that = this; 
    let a = e.detail.value; 
    that.setData({
      phone: e.detail.value
    });
    return true;
  },
  
  //保存  
  btnKeep:function(e){  
    var that = this;    
    let url = 'app.php?c=drp_ucenter&a=edit_store_info&name=' + that.data.store_name + "&phone=" + that.data.phone + "&store_logo=" + encodeURI         (that.data.store_logo);  
    common.post(url, '', "keepShow", that);  
  },
  keepShow:function(res){
    var that = this;    
    if (res.err_code==0){ 
      wx.showModal({
        title: '提示',
        content: res.err_msg,
        showCancel:false,
        success(res) {
           wx.navigateTo({
              url: '/pages/distribution/index',
            })  
        }
      })  
      this.setData({
        store_logo: that.data.store_logo,
        store_name: that.data.store_name,
        phone: that.data.phone
      }) 
    } 
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
})