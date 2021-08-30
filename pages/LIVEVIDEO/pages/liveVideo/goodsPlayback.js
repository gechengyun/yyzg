// pages/LIVEVIDEO/pages/liveVideo/goodsPlayback.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var log = require(_url + '../../utils/log.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    live_id: '',//直播id
    product:"",//商品id
    filesrc:"",//mp4地址
    liveVideoData: {
      couponShow: false,//优惠券
      goodsListShow: false,//商品列表
      shoppingShow: false//商品规格
    },
    goodsData: [],//商品列表
    pcode:'',//code是否过期
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,"optionsoptionsoptions")
    let that=this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    that.setData(
      options
    )
    // 获取菜单按钮的信息(单位px)；
    var data = wx.getMenuButtonBoundingClientRect();
    that.setData({
      boundHeight: data.height,
      boundtop: data.top,
      allrecord:options.allrecord
    });
    wx.login({
      success: res => {
        that.data.pcode = res.code;
      }
    });
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
    this.goodsFun()
    this.liveVideoFun()
    // wx.showLoading({
    //   title: '加载中',
    // })
    //全屏显示
    // this.videoContext = wx.createVideoContext('myvideo', this);
    // this.videoContext.requestFullScreen({ direction: 0 });
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
  // 商品的按钮点击显示商品列表
  goodsListShow: function (e) {
    let that = this;
   
    let goodsLength = e.currentTarget.dataset.goodslength;
    console.log(e,"sssssssssssssssss")
    if (goodsLength == 0) {
      publicFun.warning('暂无商品', that);
    } else {
      that.setData({
        'liveVideoData.goodsListShow': true,
        screenBtnShow: false
      });
    }
  },
  // 商品数据
  goodsFun: function () {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_goods_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'goodsData', that, '', true)
  },
  goodsData: function (res) {
    var that = this;
    that.setData({
      goodsData: res.err_msg
    });
  },
  goback:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  // 直播详情数据
  liveVideoFun: function () {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_live_info',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'liveVideoData', that)
  },
  liveVideoData: function (res) {
    var that = this;
    console.log(res,"resresres")
    that.setData({
      liveVideoData: res.err_msg
    });
  },
  // 关注
  followClick: function () {
    let that = this;
    that.followFun();
    // if (that.data.liveVideoData.subscribe == 0) {
    //   that.setData({
    //     isFollow: 1
    //   });
    //   console.log(222)
    //   // 点击关注授权模板消息
    //   wx.requestSubscribeMessage({
    //     tmplIds: that.data.liveVideoData.subscribe_template_id,
    //     success(res) {
    //       console.log(res);
    //       if (res[that.data.liveVideoData.subscribe_template_id] == "accept") {//点击确定授权
    //         that.followFun();
    //       } else {//点击取消授权
    //         publicFun.warning('预约失败', that);
    //       }
    //     }
    //   })
    // } else {
    //   that.setData({
    //     isFollow: 0
    //   });
    //   that.followFun();
    // }
  },
  // 关注函数
  followFun: function () {
    let that = this;
    let url = 'app.php?c=tencent_live&a=subscribe',
      data = {
        live_id: that.data.live_id,
        anchor_id: that.data.liveVideoData.anchor_id,
        status: that.data.isFollow,
        phone: that.data.phoneNumber
      };
    common.post(url, data, 'followData', that, '', true)
  },
  followData: function (res) {
    let that = this;
    console.log(res);
    if (that.data.liveVideoData.subscribe == 0) {
      that.setData({
        'liveVideoData.subscribe': 1
      });
      publicFun.warning('关注成功', that);
    } else {
      that.setData({
        'liveVideoData.subscribe': 0
      });
      publicFun.warning('已取消关注', that);
    }
  },
  bindloadedmetadata:function(){
    wx.hideLoading()
  },
    // 关闭商品列表
  goodsListClose: function () {
    let that = this;
    that.setData({
      'liveVideoData.goodsListShow': false,
      screenBtnShow: true,
      canvasShow: true
    });
  },
  // 点击弹出商品规格
  openShop: function (e) {
    var that = this;
    that.setData({
      'liveVideoData.goodsListShow': false,
      'liveVideoData.shoppingShow': true,
      screenBtnShow: false,
      canvasShow: false
    });
    publicFun.oppenShopping(e, that);
  },
  // 入购物袋
  addCartBtn: function (e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      screenBtnShow: true
    });
    publicFun.oppenShopping(e, that);
  },
  // 立即购买
  payment: function (e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      screenBtnShow: true
    });
    publicFun.payment(that, e)
  },
  plus: function () { //加
    var that = this;
    publicFun.plus(that);
  },
  reduce: function () { //减
    var that = this;
    publicFun.reduce(that);
  },
  // 点击聚焦商品数量输入框
  shoppingFocus: function () {
    var that = this;
    that.setData({
      shoppingInputFocus: true
    });
  },
  //关闭购物袋规格选择框遮罩层
  closeShopping: function (e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      'shoppingData.shoppingShow': false,
      screenBtnShow: true,
      canvasShow: true
    });
  },
  shoppingBlur: function (e) { //输入框失去焦点
    var that = this;
    publicFun.shoppingBlur(e, that)
  },
  shoppingFocus: function (e) {//输入框聚焦
    let that = this;
    that.setData({
      'shoppingData.shoppingNum': e.detail.value
    })
  },
  shoppingChange: function (e) {//输入框输入
    let that = this;
    that.setData({
      'shoppingData.shoppingNum': e.detail.value
    })
  },
  shoppingVid: function (e) { //选择商品规格
    var that = this;
    publicFun.shoppingVid(e, that);
  },
  selectDeliverDate: function (e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      "shoppingData.deliver_date_index": index
    })
  },
  messageInput: function (e) { //留言内容
    var that = this;
    let index = e.target.dataset.index;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
    this.setData({
      'shoppingData': that.data.shoppingData
    })
  },

  bindDateChange: function (e) { //选择日期
    var that = this;
    let index = e.target.dataset.index;
    let date = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].date = date;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  bindTimeChange: function (e) { //选择时间
    var that = this;
    let index = e.target.dataset.index;
    let time = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].time = time;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  addImg: function (e) { //图片上传
    var that = this;
    let index = e.target.dataset.index;
    publicFun.addImgMessage(that, index);
  },
  // 去商品回放页面
  goRecordvideo: function (e) {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    wx.redirectTo({
      url: `/pages/LIVEVIDEO/pages/liveVideo/goodsPlayback?product=${e.currentTarget.dataset.product}&live_id=${that.data.live_id}&filesrc=${e.currentTarget.dataset.filesrc}&allrecord=${e.currentTarget.dataset.allrecord}&showStatus=${e.currentTarget.dataset.show_status}`
    })
    if(e.currentTarget.dataset.allrecord == 1){
        //更新回放次数
        let url = 'app.php?c=tencent_live&a=update_record_replay_num',
        data = {
          live_id: that.data.live_id
        };
        common.post(url, data ,function(result){          
          if(result.err_code == 0){
            console.log(result)
          }
        },'');
      }  
  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that, that.data.pcode);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            that.data.pcode = res.code;
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
})