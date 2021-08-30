// pages/SHOPGOODS//pages/user/myGoldCoin/myGoldCoin.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_index: 0, //选项（Tab选项卡。0：充值，1：账户明细）
    amount: '',//输入框默认数值
    isOver: false,//数据是否加载完
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('我的金币', options);
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    if (getApp().globalData.anchor_team_type){
      console.log('团队参数',getApp().globalData.anchor_team_type);
      that.setData({
        teamType: getApp().globalData.anchor_team_type*1
      });
    }
    if(options.btnIdx){
      that.setData({
        btn_index: options.btnIdx
      });
    }
    if (that.data.btn_index == 0) {//提现
      that.cashFun();
      that.cashList(page);
    }else if(that.data.btn_index == 1){//充值记录
      that.rechargeFun(page);
    }else if(that.data.btn_index == 2){//打赏记录
      that.rewardFun(page);
    }
  },
  // 提现配置项
  cashFun:function(){
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id
    }
    common.post("app.php?c=user_coin&a=coin_exchange", data, function(res) {
      if (res.err_code == 0) {
        that.setData({
          cashConfig: res.err_msg
        });
        publicFun.barTitle(res.err_msg.coin_name, that); //修改头部标题 
      }
    }, '');
  },
  // 兑换明细列表
  cashList:function(page){
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      page: page
    }
    common.post("app.php?c=user_coin&a=get_exchange_list", data, function(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            cashList: res.err_msg,
            next_page: res.err_msg.next_page
          });
        }else{
          var cashListList = that.data.cashList.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            cashListList.push(res.err_msg.list[i]);
          }
          that.setData({
            'cashList.list': cashListList,
            next_page: res.err_msg.next_page
          });
        }
      }
    }, '')
  },
  // 充值列表
  rechargeFun:function(page){
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      page: page
    }
    common.post("app.php?c=user_coin&a=get_recharge_record", data, function(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            rechargeList: res.err_msg,
            next_page: res.err_msg.next_page
          });
        }else{
          var rechargeListList = that.data.rechargeList.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            rechargeListList.push(res.err_msg.list[i]);
          }
          that.setData({
            'rechargeList.list': rechargeListList,
            next_page: res.err_msg.next_page
          });
        }
      }
    }, '')
  },
  // 打赏列表
  rewardFun:function(page){
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      page: page
    }
    common.post("app.php?c=user_coin&a=reward_record", data, function(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            rewardList: res.err_msg,
            next_page: res.err_msg.next_page
          });
        }else{
          var rewardListList = that.data.rewardList.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            rewardListList.push(res.err_msg.list[i]);
          }
          that.setData({
            'rewardList.list': rewardListList,
            next_page: res.err_msg.next_page
          });
        }
      }
    }, '')
  },
  // 顶部切换
  switchTab(e) { //切换账户明细
    let that = this;
    page = 1;
    let index = e.currentTarget.dataset.index;
    if(that.data.btn_index != index){
      that.setData({
        btn_index: index,
        isOver: false
      });
      if (index == 0) {//提现
        that.cashFun();
        that.cashList(page);
      }else if(index == 1){//充值记录
        that.rechargeFun(page);
      }else if(index == 2){//打赏记录
        that.rewardFun(page);
      }
    }
  },
  // 提现的输入框监听
  changeMoneyNum(e){
    let moneyIpt;
    if (/^(\d?)+(\.\d{0,0})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      moneyIpt = e.detail.value;
    } else {
      moneyIpt = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    let cashConfig = this.data.cashConfig;
    this.setData({
      amount:moneyIpt,
      giveAmount:moneyIpt * cashConfig.get_money/cashConfig.use_gold_coin
    });
  },
  // 兑换按钮
  getMycash(){
    let that=this;
    let data = {
      store_id:app.globalData.store_id || common.store_id,
      withdraw_num: that.data.amount
    }
    common.post("app.php?c=user_coin&a=coin_withdraw", data, function(res) {
      if (res.err_code == 0) {
        console.log(res);
        page = 1;
        wx.showToast({
          title: '您已兑换成功',
        });
        //清空输入金额
        that.setData({
          amount: '',
          giveAmount: ''
        });
        that.cashList(page);
      }
    }, '');
  },
  // 去直播收益页面
  goLiveMoney:function(){
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/liveMoney/liveMoney'
    });
  },
  // 复制
  orderCopy:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.ordernum,
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
    // let that = this;
    // page = 1;
    // let index = that.data.btn_index;
    // that.setData({
    //   btn_index: index,
    //   isOver: false
    // });
    // if (index == 0) {//提现
    //   that.cashFun();
    //   that.cashList(page);
    // }else if(index == 1){//充值记录
    //   that.rechargeFun(page);
    // }else if(index == 2){//打赏记录
    //   that.rewardFun(page);
    // }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.next_page == 1){//账户明细
      let index = that.data.btn_index;
      if (index == 0) {//提现
        that.cashList(++page);
      }else if(index == 1){//充值记录
        that.rechargeFun(++page);
      }else if(index == 2){//打赏记录
        that.rewardFun(++page);
      }
    }else{
      that.setData({
        isOver: true
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})