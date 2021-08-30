// pages/SHOPGOODS//pages/user/balanceManage/balanceManage.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
const date = new Date()
const years = []
const months = []
const days = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i)
}
for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showHead: true,//是否显示头部
    time_type: 1, //默认月份(时间类型)
    btn_index: 0, //选项（Tab选项卡。0：充值，1：账户明细）
    years,//年
    months,//月
    days,//按日的天
    start_time:'',//按日的开始时间
    end_time:'',//按日的结束时间
    value: [9999, 1, 1],
    chosedatestate: false,//底部时间弹窗显示与否
    dateStartOrEnd: 'start', //时间选择（按日：选择是开始时间还是结束时间）
    listpage1: 1,//分页的data
    now_month:'',//（按月：输入）
    showDate:"",//账户明细显示本月还是显示选择后的日期
    isOver1:false,//底部提示信息
    isOver2:false,//底部提示信息
    amount:'',//提现金额
    cashIndex: 0,//提现方式0：银行卡，1：微信，2：支付宝
    cashConfig:{},//输入框数据
    balanceType: 0,//充值类型1:固定比例，2：区间赠送,0：无赠送类型
    modeIdx: -1,//充值档位选择
    balanceIdx: 1,//支付方式选择0：支付宝，1微信
    couponShowOrHide:false,
    couponList:[],
    couponsShowOrTrue:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('余额管理', options);
    let that = this;
    let value = this.data.value;
    publicFun.setBarBgColor(getApp(), that); // 设置导航条背景色
    let date = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
    value[1] = new Date().getMonth();
    value[2] = new Date().getDate()-1;
    console.log(date);
    let startTime = date + '-' + new Date().getDate();
    let endTime = date + '-' + new Date().getDate();
    let now_month = date;
    this.setData({
      start_time: startTime,
      end_time: endTime,
      value,
      now_month
    });
    if(options.type == 'balance'){
      // 我的店--店铺余额跳转到使用明细
      that.setData({
        btn_index: 1,
        showHead: false
      });
    }
    
    this.cashConfig();
    this.getMoneyList(1);
  },

  // 顶部切换
  switchTab(e,checked_index) { //切换账户明细
    let index = checked_index!=undefined ?checked_index:e.currentTarget.dataset.index;
    this.setData({
      btn_index: index,
      chosedatestate: false,
      listpage1: 1,//分页的data
      isOver1:false,
      isOver2:false
    })
    if (index == 0) {//充值
      this.cashConfig();
    }
    // 充值流水/使用明细
    this.getMoneyList(1);
  },
  //（xtype：1：充值流水,2：使用明细）
  getMoneyList(page) {
    let that = this;
    let start_time = that.data.start_time;
    let end_time = that.data.end_time;
    let now_month = that.data.now_month;
    let time_type = that.data.time_type;
    if (time_type==1){ //默认按月查询时；清空开始和结束时间
      start_time = "";
      end_time = "";
    }else{ //按时间查询清空月份
      now_month = '';
    }
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      page,
      time_type, //时间选择类型（1按月份查询 2按日期查询）
      start_time, //按日期查询-开始时间
      end_time, //按日期查询-结束时间
      starttime: now_month, //按月份查询-月份（2020-03）
    }
    if(this.data.btn_index==0){//充值
      data.xtype = 1 //充值流水
    }else if(this.data.btn_index==1){//使用明细
      data.xtype = 2 //使用明细
    }
    let url = "app.php?c=cash&a=statement";
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            listData: res.err_msg,
            next_page: res.err_msg.next_page
          });
        }else{
          var listDataList = that.data.listData.cash_list;
          for (var i = 0; i < res.err_msg.cash_list.length; i++) {
            listDataList.push(res.err_msg.cash_list[i]);
          }
          that.setData({
            'listData.cash_list': listDataList,
            next_page: res.err_msg.next_page
          });
        }
      }
    }, '')

  },
  // 充值配置
  cashConfig() {
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id
    }
    common.post("app.php?c=cash&a=get_recharge_set", data, function callBack(res) {
      if (res.err_code == 0) {
        that.setData({
          cashConfig: res.err_msg
        });
        if(res.err_msg.recharge_set.length>0){
          that.setData({
            cashConfigItem: res.err_msg.recharge_set[0],
            balanceType: res.err_msg.recharge_set[0].type*1
          });
        }
      }
    }, '')
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
  // 提现的输入框监听
  changeMoneyNum(e){
    let moneyIpt;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      moneyIpt = e.detail.value;
    } else {
      moneyIpt = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      amount:moneyIpt,
      modeIdx: -1,
      modeId: 0
    });
    if(this.data.cashConfigItem.per*1 > 0){
      this.setData({
        giveAmount: Math.floor(moneyIpt*this.data.cashConfigItem.per)/100
      });
    }
  },
  // 备注的输入框监听
  changeBak:function(e){
    this.setData({
      bak: e.detail.value
    });
  },
  // 提现按钮
  getMycash(){
    let that=this;
    console.log(that.data.balanceType);
    if(that.data.cashConfig.is_set_pwd*1 == 0){
      wx.navigateTo({
        url: '/pages/setPassword/index?setpas=1',
      })
      return;
    }
    let data = {
      store_id:app.globalData.store_id || common.store_id,
      type: 2,
      money: that.data.amount || that.data.modeAmount,
      cfrom: 1,
      cashitemid: that.data.modeId,
      openid: wx.getStorageSync('openId'),
      bak: that.data.bak
    }
    if(that.data.balanceIdx == 0){//支付宝
      data.pay_type = 'alipay'
    }else if(that.data.balanceIdx == 1){//微信
      data.pay_type = 'weixin'
    }
    common.post("app.php?c=cash&a=pay", data, function callBack(res) {
      if (res.err_code == 0) {
        console.log(res);
        let wx_data = res.err_msg.pay_info;
        let cash_id = res.data.cash_id;
        wx.requestPayment({
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function (res) {//支付成功
            if(that.data.balanceType==2){
              let parmas={cash_id:cash_id};
              common.post("app.php?c=cash&a=get_success_coupon",parmas, function callBack(res) {
                if(res.err_code == 0) {
                  let Rechargecount = res.data.count;
                  let couponSuccessList = res.data.coupon;
                  if(Rechargecount == '0') {
                    console.log('没有优惠券');               
                    setTimeout(() => {
                      wx.showToast({
                        title: '您已成功充值',
                        icon: 'success'
                      })
                    }, 500);
                  }
                  else {
                    that.setData({
                      Rechargecount,
                      couponSuccessList,
                      couponsType:'In',
                      couponsShowOrTrue:true,
                    })
                  }
                }
              }, '')
              that.cashConfig();
              that.getMoneyList(1);
              that.setData({
                amount: 0.00,
              })
            }
            else {
              wx.showToast({
                title: '您已成功充值',
              })
            //清空输入金额
            that.setData({
              amount: 0.00,
            });
            that.cashConfig();
            that.getMoneyList(1);
            }
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
  getMyApply(){
    let that=this;
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    if (this.data.btn_index == 0) {//充值
      this.cashConfig();
    }
    // 充值流水/使用明细
    this.getMoneyList(1);
    this.setData({
      isOver1: false,
      isOver2: false,
      listpage1:1
    });
    setTimeout(function(){
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.next_page ==true){//账户明细
      wx.showNavigationBarLoading()
      let listpage1 = this.data.listpage1+1;
      this.getMoneyList(listpage1);      
      this.setData({
        listpage1,
      });
      setTimeout(function () {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 1500)
    }else{
      if(this.data.btn_index == 0){
        this.setData({
          isOver1:true
        });
      }else if(this.data.btn_index == 1){
        this.setData({
          isOver2:true
        });
      }
    }
  },
  // 弹出底部
  chooseDate() {
    this.setData({
      chosedatestate: true
    })
  },
  bindChange(e) { //时间选择器
    const val = e.detail.value
    const time_type = this.data.time_type;
    if(time_type==1){ //按月选择
      let now_month = this.data.now_month;
      now_month = this.data.years[val[0]] + '-' + this.data.months[val[1]];
      this.setData({
        now_month
      })
    } else if (time_type == 2){//按日选择
      let start_time = this.data.start_time;
      let end_time = this.data.end_time;
      let date = this.data.years[val[0]] + '-' + this.data.months[val[1]] + '-' + this.data.days[val[2]];
      this.data.dateStartOrEnd == 'start' ? start_time = date : end_time = date;
      this.setData({
        start_time,
        end_time,
      })
    }
  },
  //切换选择类型（按日还是按月）
  changeDateType(){ 
    this.setData({
      time_type: this.data.time_type==1?2:1,
    })
  },
  //确定时间选择（完成按钮） 
  okTrue() { 
    let showDate = this.data.showDate;
    if(this.data.time_type==1){
      showDate = this.data.now_month;
    }else{
      showDate = this.data.start_time +' 至 '+this.data.end_time;
    }
    this.setData({
      chosedatestate: false,
      showDate
    })
    this.getMoneyList(1);
  },
  //按日选择是开始时间还是结束时间
  bindDate(e) {
    this.setData({
      dateStartOrEnd: e.currentTarget.dataset.type
    })
    console.log(e.currentTarget.dataset.type);
  },

  //充值模式选择
  balanceMode:function(e){
    let that = this;
    let modeIdx = e.currentTarget.dataset.idx;
    let coupon_count = e.currentTarget.dataset.coupon_count;
    let couponList = e.currentTarget.dataset.couponlist;
    if(coupon_count>0) {
      this.setData({
        couponShowOrHide: true,
        couponList:couponList,
        coupon_count
      })
    }
    else {
      that.setData({
        couponShowOrHide: false,
        couponList:[],
      })
    }
    // 先判断是否有优惠券，然后将当前优惠券的数组传到for循环中渲染，将优惠券模块显示出来
    that.setData({
      modeIdx: modeIdx,
      modeId: e.currentTarget.dataset.id,
      amount: '',
      modeAmount: that.data.cashConfig.recharge_set[modeIdx].money
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
  onShow:function(){
    let that = this;
    if(that.data.is_set_pwd == 1){
      that.setData({
        'cashConfig.is_set_pwd': that.data.is_set_pwd
      });
    }
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
  // 充值送券
    // 代理弹窗
  closeAgency() {
      console.log('关闭');
      this.setData({
        couponsType: 'Out'
      });
      setTimeout(() => {
        this.setData({
          couponsShowOrTrue:false
        });
      }, 1000);
  }
})