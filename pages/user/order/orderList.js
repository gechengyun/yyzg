var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var app = getApp();
let page = 1;
let i = 0;
var product_id;
Page({
  data: {
    currentTab: 'all',
    currentTabShop: 0,
    orderlistData: '',
    scrollTop: 0,
    scrollHeight: 0,
    type: 'all',
    swichNav: [],
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    tuan_share_data: null,
  },
  onLoad: function(e) { // 页面渲染完成
    // console.log(e)
    let orderlisttap = wx.getStorageSync('orderlisttap');
    var that = this;
    var currentTab = 'all',
      currentTabShop = 0;
    if (e && e.currentTab != '' && e.currentTab != undefined) currentTab = e.currentTab;
    if (e && e.currentTabShop != '' && e.currentTabShop != undefined) currentTabShop = e.currentTabShop;
    that.setData({
      currentTab: currentTab,
      currentTabShop: currentTabShop,
    });

    if (e.cfrom) {
      this.setData({
        cfrom: e.cfrom
      })
    }
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.height(that);

    //是否展示分享图片
    app.shareWidthPic(that);
  },

  //跳转详情刷新
  onUnload: function() {
    var product_id = wx.getStorageSync("product_id");
    wx.redirectTo({
      url: '../product/details?product_id=' + product_id, //指定界面
    })
  },
  onReady: function(e) {
    // 获得dialog组件
    var that = this;
    that.dialog = that.selectComponent("#shareModal");
  },
  //跳转详情刷新
  onUnload: function() {
    if (this.data.cfrom == "goodsDetail") {
      var product_id = wx.getStorageSync("product_id");
      wx.redirectTo({
        url: '../product/details?product_id=' + product_id, //指定界面
      })
    }

  },
  onShow: function(e) {
    var that = this;
    let typeTab = (that.data.currentTab && that.data.currentTab != "undefined") ? that.data.currentTab : "all";
    page = 1;
    if (that.data.currentTabShop == 1) {
      common.post('app.php?c=order&a=user_all&type=' + typeTab + '&all_store_id=' + app.globalData.root_store_id, '', "orderlistData", that);
    } else {
      common.post('app.php?c=order&a=user_all&type=' + typeTab + '&page=1', '', "orderlistData", that);
      page++;
    }
  },
  orderlistData: function(result) {
    var that = this;
    if (result.err_code == 0) {
      this.setData({
        orderlistData: result.err_msg
      })
      let list = that.data.orderlistData.order_list;
      for (var i in list) {
        if (list[i].type * 1 == 10) {
          list[i].custom_reservation_name = list[i].custom_reservation_name ? list[i].custom_reservation_name : '预约';
          list[i].typeTxt = list[i].custom_reservation_name;
        } else {
          list[i].typeTxt = publicFun.orderType(list[i]);
        }

        if (list[i].status == '7') {
          for (var j in list[i].order_product_list) {
            if (list[i].order_product_list[j].has_return) {
              list[i].has_return = true;
              this.setData({
                orderlistData: that.data.orderlistData,
              });
              continue
            } else {
              list[i].has_return = false;
              this.setData({
                orderlistData: that.data.orderlistData,
              });

            }
          }
        }
      }
      this.setData({
        orderlistData: that.data.orderlistData
      })

      publicFun.barTitle('我的订单')
    };
  },
  swichNav: function(e) {
    var that = this;
    page = 1;
    let currentTabShop = that.data.currentTabShop;
    publicFun.swichNav(e, that);
    let currentTab = e.currentTarget.dataset.current;

    if (currentTabShop == 1) {
      common.post('app.php?c=order&a=user_all&type=' + currentTab + '&all_store_id=' + app.globalData.root_store_id, '', "orderlistData", that);
    } else {
      common.post('app.php?c=order&a=user_all&type=' + currentTab, '', "orderlistData", that);
    }
  },
  swichNavShop: function(e) {
    var that = this;
    let currentTab = that.data.currentTab;
    if (that.data.currentTabShop === e.currentTarget.dataset.current_shop) {
      return false;
    } else {
      that.setData({
        currentTabShop: e.currentTarget.dataset.current_shop
      })

      let currentTabShop = e.currentTarget.dataset.current_shop;


      if (currentTabShop == 1) {
        common.post('app.php?c=order&a=user_all&type=' + currentTab + '&all_store_id=' + app.globalData.root_store_id, '', "orderlistData", that);
      } else {
        common.post('app.php?c=order&a=user_all&type=' + currentTab, '', "orderlistData", that);
      }
    }

  },
  bindDownLoad: function() { //滚动触发到底部
    var that = this;
    let typeTab = (that.data.currentTab && that.data.currentTab != "undefined") ? that.data.currentTab : "all";
    // console.log("=======================", typeTab, "=======", page)
    let url = 'app.php?c=order&a=user_all&type=' + typeTab + '&page=' + page;
    publicFun.orderPushData(page++, that, url)
  },
  scroll: function(event) { //滚动函数
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  cancelOrder: function(e) { //取消订单
    var that = this;
    let order_no = e.target.dataset.order;
    let index = e.target.dataset.index;
    publicFun.cancelOrder(that, order_no, index, callback);

    function callback() {
      if (that.data.currentTabShop == 1) {
        common.post('app.php?c=order&a=user_all&type=' + that.data.currentTab + '&all_store_id=' + app.globalData.root_store_id, '', "orderlistData", that);
      } else {
        common.post('app.php?c=order&a=user_all&type=' + that.data.currentTab, '', "orderlistData", that);
      }
    }
  },
  paymentGo: function(e) { //去支付
    let order_no = e.currentTarget.dataset.order;
    // console.log(order_no);
    wx.navigateTo({
      url: '/pages/payment/index?order_no=' + order_no + '&paystatus=waitpay'
    });
  },
  completeOrder: function(e) { //交易完成
    var that = this;
    let order_no = e.target.dataset.order;
    let index = e.target.dataset.index;
    publicFun.completeOrder(order_no, that, index);
  },
  completeReceipt: function(e) { //确认收货
    var that = this;
    let order_no = e.target.dataset.order;
    let index = e.target.dataset.index;
    console.log(order_no, index);
    publicFun.completeReceipt(order_no, that, index);
  },
  orderGo: function(e) { //跳转详情页面
    publicFun.orderGo(e)
  },
  applyRefundGo: function(e) { //跳转申请退货页面
    publicFun.applyRefundGo(e)
  },
  returnGo: function(e) { //跳转查看退货页面
    publicFun.returnGo(e)
  },
  formSubmit: function(e) { // 生成下发模板消息所需的formId存于服务器
    var that = this;
    publicFun.formSubmit({
      e: e,
      that: that
    });
  },
  finalPayment: function(e) { // 支付尾款
    var that = this;
    let order_no = that.data.orderlistData.order_list[e.currentTarget.dataset.index].order_id;
    var data = {
      order_id: order_no
    }
    common.post('app.php?c=order&a=presale_add', data, "getOrder", that);
  },
  getOrder: function(res) { // 支付尾款回调
    var that = this;
    wx.navigateTo({
      url: '/pages/payment/index?order_no=' + res.err_msg,
    })
  },
  /*
   *
   **分享对话框 shareModal start
   *
   */

  //显示对话框
  shareTap: function(e) {
    var that = this;
    this.setData({
      tuan_share_data: {
        ...e.currentTarget.dataset,
        type: 1
      }
    })
    that.dialog.showDialog();
  },
  onShareAppMessage() {
    let {
      tuan_share_data
    } = this.data;
    const {
      show_share_img,
      share_img
    } = app.globalData;
    let shareInfo = {}
    if (tuan_share_data) {
      //未支付
      if (tuan_share_data.order_status < 2) {
        shareInfo = {
          title: '邀请您参团~' + tuan_share_data.name,
          desc: '小伙伴快来参团~',
          path: `/pages/GOODSDETAILS/pages/details/index?tuan_id=${tuan_share_data.tuan_id}&share_uid=${getApp().globalData.my_uid}&shareType=2&store_id=${app.globalData.store_id}`,
          imageUrl: show_share_img == 1 ? (share_img) : (tuan_share_data.image || '')
        }
      } else {
        //已支付
        shareInfo = {
          title: '邀请您参团~' + tuan_share_data.name,
          desc: '小伙伴快来参团~',
          path: '/pages/GOODSDETAILS/pages/join/index?' + `tuan_id=${tuan_share_data.tuan_id}&team_id=${tuan_share_data.team_id}&item_id=${tuan_share_data.item_id}&type=1&share_uid=${getApp().globalData.my_uid}&shareType=2&store_id=${app.globalData.store_id}`,
          imageUrl: show_share_img == 1 ? (share_img) : (tuan_share_data.image || '')
        }
      }
    } else {
      let shareTitle = '';
      if (this.data.orderlistData && this.data.orderlistData.order_list && this.data.orderlistData.order_list[0].store) {
        shareTitle = this.data.orderlistData.order_list[0].store;
      }
      return getApp().shareGetFans(shareTitle, '', '/pages/index/index', 2);
    }
    return shareInfo

  },

  //取消事件
  _cancelEvent: function() {
    var that = this;
    console.log('你点击了取消');
    try {
      clearInterval(loopDownloadTimer); // 清除检测downloadFile是否全部执行完的计时器
    } catch (e) {

    }
    // 修改画布执行状态
    if (that.data.canvasData) {
      that.data.canvasData.status = false;
    }
    that.setData({
      canvasData: that.data.canvasData
    })
    wx.hideLoading();
    that.dialog.hideDialog();
  },
  //分享好友或群
  _shareGroup: function() {
    var that = this;
    console.log('分享好友或群');
    wx.showShareMenu({
      withShareTicket: false
    })
  },
  selffetch: function(e) { //自提二维码
    var that = this;
    let verify=e.currentTarget.dataset.verify;
    let text=e.currentTarget.dataset.text;
    let type=e.currentTarget.dataset.type;
    let flag;
    if(type==1) {
      flag = true;
    }
    else{
      flag = false;
    }
    console.log(verify);
    if (that.data.selffetch) {
      that.setData({
        selffetch: false,
        verify,
        text,
        flag
      })
      return
    }
    that.setData({
      selffetch: true,
      verify,
      text,
      flag
    })
  },
  copyText: function (e) {
       console.log(e)
        wx.setClipboardData({
          data: e.currentTarget.dataset.text,
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
  }
})