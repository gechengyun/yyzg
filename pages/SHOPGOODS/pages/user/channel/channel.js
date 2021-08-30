// pages/SHOPGOODS//pages/user/channel/channel.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    againbtn:false,
    group_detail: {},//表单提交数据
    second_level_channel_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    publicFun.barTitle('特权名称', that); //修改头部标题 
    publicFun.height(that);
    // 扫码进入判断
    if (e.scene != undefined && e.scene != 'wxapp') {
      var scene_id = decodeURIComponent(e.scene);
      console.log("渠道id", scene_id);
      if (scene_id) {
        // var scene_arr = scene.split(',');
        // //扫分享码进来的
        // this.setData({
        //   second_level_channel_id: scene_arr[2]
        // });
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          //console.log(result)
          if(result.err_code == 0){
            that.setData({
              second_level_channel_id: result.err_msg.second_level_channel_id
            });
          }
        },'');     

      };
    } 

    that.channelFun();
  },
  // 领券数据
  channelFun: function () {
    let that = this;
    let url = 'app.php?c=fans_channel&a=channel_qrocde_page',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        second_level_channel_id: that.data.second_level_channel_id
      };
    common.post(url, data, 'channelData', that, 'channelDataFail')
  },
  channelData: function (res) {
    var that = this;
    that.setData({
      channelData: res.err_msg,
      isEmpty: res.err_code
    });
  },
  channelDataFail: function (res){
    var that = this;
    that.setData({
      channelData: res.err_msg,
      isEmpty: res.err_code
    });
  },

  bindPas: function (e) {
    let that = this;
    that.setData({
      "group_detail.password": e.detail.value
    })
  },
  // 立即领取
  gainCoupon: function () {
    let that = this;
    if (!that.data.group_detail.password) {
      return publicFun.warning('请输入密码', that);
    };    
    if (that.data.againbtn){
      return publicFun.warning('您已经领取过啦，不要贪心哦', that);
    };   
    
    let params = {
      store_id: app.globalData.store_id || common.store_id,
      second_level_channel_id: that.data.second_level_channel_id,
      password: that.data.group_detail.password
    }
    let url = "app.php?c=fans_channel&a=channel_qrocde_receive";
    common.post(url, params, function (res) {
      console.log('领取成功', res)
      if (res.err_code == 0) {
        that.setData({
          againbtn: true
        });
        publicFun.warning(res.err_msg, that);
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/index/index',
          })
        }, 800);
      }
    }, '')
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})