// pages/SHOPGOODS//pages/user/recharge/recharge.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    amount:'',//输入的额度
    modeIdx: -1,//充值档位选择
    balanceIdx: 1,//支付方式选择0：支付宝，1微信
    isRule: true,//是否同意规则
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('金币充值', options);
    let that = this;
    publicFun.setBarBgColor(getApp(), that); // 设置导航条背景色


    that.cashConfig();
  },

  // 充值配置
  cashConfig() {
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id
    }
    common.post("app.php?c=user_coin&a=get_recharge_level", data, function callBack(res) {
      if (res.err_code == 0) {
        that.setData({
          cashConfig: res.err_msg
        });
      }
    }, '')
  },
  //充值模式选择
  balanceMode:function(e){
    let that = this;
    let modeIdx = e.currentTarget.dataset.idx;
    that.setData({
      modeIdx: modeIdx,
      amount: '',
      modeAmount: that.data.cashConfig.recharge_list[modeIdx].recharge_money
    });
  },
  // 提现的输入框监听
  changeMoneyNum(e){
    let moneyIpt;
    if (/^(\d?)+(\.\d{0,0})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      moneyIpt = e.detail.value;
    } else {
      moneyIpt = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      amount:moneyIpt,
      modeIdx: -1,
      modeAmount: moneyIpt
    });
  },
  // 支付方式选择
  balanceTypes:function(e){
    let that = this;
    that.setData({
      balanceIdx: e.currentTarget.dataset.idx
    });
    if(that.data.balanceIdx != 1){
      publicFun.warning('小程序暂不支持其他支付', that);
      that.setData({
        balanceIdx: 1
      });
    }
  },
  // 充值支付按钮
  getMycash(){
    let that=this;
    // if (!that.data.isRule) {//不同意规则的提示
    //   return publicFun.warning('请勾选同意协议', that);
    // }
    if (that.data.modeAmount*1 > 20000) {//单次充值限额2W
      return publicFun.warning('单次充值不能超过2W', that);
    }
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      type: 0,
      recharge_money: that.data.modeAmount
    };
    if(that.data.modeIdx != -1){//固定金额
      data.type = 0
    }else{//自定义金额
      data.type = 1
    }
    if(that.data.balanceIdx == 0){//支付宝
      data.pay_type = 'alipay'
    }else if(that.data.balanceIdx == 1){//微信
      data.pay_type = 'weixin'
    }
    common.post("app.php?c=user_coin&a=recharge_coin", data, function callBack(res) {
      if (res.err_code == 0) {
        console.log(res);
        let wx_data = res.err_msg;
        wx.requestPayment({
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function (res) {//支付成功
            wx.showToast({
              title: '您已成功充值',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            });
            this.cashConfig();
            that.getMoneyList(1);
          },
          'fail': function (res) {
            wx.showModal({
              title: '提示信息',
              content: '您取消了支付',
              confirmText: '知道了',
              showCancel: false,
              success: function (res) {}
            })
          }
        });
      }else if(result.err_code == 30002){
        that.setData({
          showgetPhone: true
        });
      }
    }, '')
  },
  // 规则选择
  chooseRule: function () {
    let that = this;
    that.setData({
      isRule: !that.data.isRule
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
  //获取手机号
  getPhoneNumber(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
})