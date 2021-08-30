var _url = '../../';
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
var wxParse = require('../../../../../wxParse/wxParse.js');
var app = getApp();
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    if (e.rights) {
      this.setData({
        currentTab: e.rights,
        // order_no: 'PIG20170306091411248170'
      });
    }
    if (e.share_uid) {
      getApp().globalData.share_uid = e.share_uid
    }
    if(e.store_id){
      console.log(88888888888,e.store_id)
      app.globalData.store_id = e.store_id
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (e) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.height(that);
    publicFun.barTitle('我的店铺');
    let url = 'app.php?c=my&a=gift_micro_agent&app=app';
    let params = {
      store_id: app.globalData.store_id || common.store_id,
    }
    common.post(url, params, 'myShopData', that);
    that.setData({
      store_id:app.globalData.store_id || common.store_id,
    })
    // common.post('app.php?c=order&a=reservation&status=0', '', "orderlistData", that);
  },
  // 返回上一页
  goback: function () {
      console.log('正常返回')
      wx.switchTab({
        url: '/pages/USERS/pages/user/myshop/index'
      });
  },
  myShopData(res) {
    let that = this;
    if (res.err_code == 0) {
      let shopHomeData = res.err_msg;
      let my_account = shopHomeData.my_account;
      
      let custom_field_list = shopHomeData.custom_field_list;
      for (var i in custom_field_list) {
        if (custom_field_list[i].field_type == 'rich_text') { //模板富文本转化
          let rich_text = custom_field_list[i].content;
          if (rich_text != '' && rich_text != undefined) {
            rich_text = wxParse.wxParse(`shopHomeData.custom_field_list[${i}].content`, 'html', rich_text, that, 5);
          }
          custom_field_list[i].content = rich_text;
        }
        if (custom_field_list[i].field_type == 'image_ad2') { //图片广告
          for (let j = 0; j < custom_field_list[i].content.nav_list.length; j++) {
            custom_field_list[i].content.nav_list[j].type = publicFun.getType(custom_field_list[i].content.nav_list[j].url).type;
            custom_field_list[i].content.nav_list[j].url = publicFun.getType(custom_field_list[i].content.nav_list[j].url, 'home').url;
            //获取图片宽高的缓存，以免在onShow生命周期里面,image的bindLoad回调不执行，获取不到图片的真时宽高,导致的变形
          }
        }
        if (custom_field_list[i].field_type == 'cube') { //魔方
          for (let j = 0; j < custom_field_list[i].content.length; j++) {
            custom_field_list[i].content[j].type = publicFun.getType(custom_field_list[i].content[j].url).type;
            custom_field_list[i].content[j].url = publicFun.getType(custom_field_list[i].content[j].url).url;
          }
        }
        if (custom_field_list[i].field_type == 'image_nav') { //图片导航
          for (var j = 0; j < custom_field_list[i].content.length; j++) {
            custom_field_list[i].content[j].type = publicFun.getType(custom_field_list[i].content[j].url).type
            custom_field_list[i].content[j].url = publicFun.getType(custom_field_list[i].content[j].url).url;
          }
        }

        if (custom_field_list[i].field_type === 'cube') {
          //计算魔方的最大相对高度,防止魔方不满4行出现页面空白
          let maxHeight = custom_field_list[i].content.reduce((prev, next) => {
            return next.rowspan * 1 + next.y * 1 > prev ? next.rowspan * 1 + next.y * 1 : prev
          }, 0)
          custom_field_list[i].maxHeight = maxHeight * 750 / 4
        }
      }

      that.setData({
        shopHomeData,
        my_account
      });
    }
  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  //分享好友或群
  _shareGroup: function() {
    var that = this;
    wx.showShareMenu({
      withShareTicket: false
    });
  },
  onShareAppMessage: function () {
    return getApp().shareGetFans(``, ``, `pages/USERS/pages/user/myshop/index`, 2,``,``);
  },
  askButton() {
    let that = this;
    wx.showModal({
      title: '请申请代理商',
      content: '成为代理商可以查看店铺余额，提现账户等功能',
      success: function (sm) {
        console.log(666, sm);
        if (sm.confirm) {
          console.log(1)
          wx.navigateTo({
            url: '../../user/register/index?is_my_fx_store=' + that.data.shopHomeData.is_my_fx_store,
          })
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  myCountData(e) {
    let btnType = e.currentTarget.dataset.type;
    if(btnType == "balance"){//店铺余额
      wx.navigateTo({
        url: '/pages/SHOPGOODS/pages/user/balanceManage/balanceManage?type=balance'
      })
    }else if(btnType == "jifen"){//积分
      wx.navigateTo({
        url: '/pages/POINT/pages/details/details'
      })
    }else{
      wx.navigateTo({
        url: '/pages/user/myMoney/myMoney?giftaccunt=true'
      })
    }
  },
  getUserInfo() {
    wx.navigateTo({
      url: '../getUserInfo/index',
      success: (result) => { },
      fail: (res) => { },
      complete: (res) => { },
    })
  },
  swiperChange: function (e) {
    let {
      current
    } = e.detail
    let {
      bannerIndex
    } = e.currentTarget.dataset
    this.setData({
      [`shopHomeData.custom_field_list[${bannerIndex}].content.current_indicator_index`]: current
    })
  },
  // 计算图片广告2首张图片高度
  imgHeight: function (e) {
    let arrIndex = e.currentTarget.dataset.sindex;
    let oldImgW = e.detail.width;//原图的宽
    let oldImgH = e.detail.height;//原图的高
    let imgScale = oldImgW / oldImgH;//原图的宽高比
    let nowImgH = wx.getSystemInfoSync().windowWidth / imgScale;
    console.log(imgScale, '------', nowImgH, oldImgW);
    this.setData({
      ['nowImgH[' + arrIndex + ']']: nowImgH
    })
  },
  goDetail:function(e) {
    let that = this
    const {
      product_id
    } = e.currentTarget.dataset;
    console.log(e, product_id, "product_idproduct_idproduct_id")
    if (!app.isLoginFun(that)) {//判断用户是否登录
      common.setUserInfoFun(that, app);
      return false;
    }
  },
})