// pages/LIVEVIDEO//pages/liveMoney/liveMoney.js// pages/user/myMoney/myMoney.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
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
    time_type: 1, //默认月份(时间类型)
    btn_index: 0, //选项（Tab选项卡。0：账户明细，1：提现）
    years,//年
    months,//月
    days,//按日的天
    start_time:'',//按日的开始时间
    end_time:'',//按日的结束时间
    value: [9999, 1, 1],
    chosedatestate: false,//底部时间弹窗显示与否
    dateStartOrEnd: 'start', //时间选择（按日：选择是开始时间还是结束时间）
    listpage1: 1,//分页的data
    listpage2: 1,//分页的data
    now_month:'',//（按月：输入）
    showDate:"",//账户明细显示本月还是显示选择后的日期
    isOver1:false,//底部提示信息
    isOver2:false,//底部提示信息
    amount:'',//提现金额
    goldAmount:'',//提现金币
    cashIndex: 0,//提现方式0：银行卡，1：微信，2：支付宝
    cashConfig:{},//输入框数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('直播收益', options);
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
    })
    this.getMoneyList(1);
  },

  // 顶部切换
  switchTab(e,checked_index) { //切换账户明细
    let index = checked_index!=undefined ?checked_index:e.currentTarget.dataset.index;
    if(this.data.btn_index != index){
      this.setData({
        btn_index: index,
        chosedatestate: false,
        listpage1: 1,//分页的data
        listpage2: 1,//分页的data
        isOver1:false,
        isOver2:false
      })
      if (index == 1) { //提现
        this.getTxdetails();
        this.cashList(1);
      } else if(index == 0) {//账户明细列表
        this.getMoneyList(1);
      }else if(index == 2){//我的金币
  
      }
    }
  },
  //账户明细列表
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
      time: now_month, //按月份查询-月份（2020-03）
    }
    let url = "app.php?c=team&a=profit_list";
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            listData: res.err_msg,
            next_page1: res.err_msg.next_page
          });
        }else{
          var listDataList = that.data.listData.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            listDataList.push(res.err_msg.list[i]);
          }
          that.setData({
            'listData.list': listDataList,
            next_page1: res.err_msg.next_page
          });
        }
      }
    }, '')

  },
  // 提现数据
  getTxdetails() {
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id
    }
    common.post("app.php?c=team&a=withdraw", data, function callBack(res) {
      if (res.err_code == 0) {
        let tixianDes = res.err_msg.desc.split("<br>");
        that.setData({
          tiXianData: res.err_msg,
          tixianDes:tixianDes,
          cashConfig: res.err_msg.withdraw_config
        });
      }
    }, '')
  },
  // 提现列表
  cashList(page) {
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      page:page
    }
    common.post("app.php?c=team&a=withdraw_list", data, function callBack(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            cashList: res.err_msg,
            next_page2: res.err_msg.next_page
          });
        }else{
          var cashListList = that.data.cashList.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            cashListList.push(res.err_msg.list[i]);
          }
          that.setData({
            'cashList.list': cashListList,
            next_page2: res.err_msg.next_page
          });
        }
      }
    }, '')
  },
  // 复制
  orderCopy:function(e){
    let that = this;
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
  getAllcash(){ //全部提现
    this.setData({
      amount: Number(this.data.tiXianData.balance).toFixed(2),
    })
  },
  // 提现的输入框监听
  changeMoneyNum(e){
    var moneyIpt;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      moneyIpt = e.detail.value;
    } else {
      moneyIpt = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      amount:moneyIpt
    })
  },
  // 提现方式
  cashType:function(e){
    let that = this;
    that.setData({
      cashIndex: e.currentTarget.dataset.cashtype
    });
  },
  // 银行卡号监听
  cardNum:function(e){
    this.setData({
      'cashConfig.bank_card':e.detail.value
    });
  },
  // 银行人监听
  cardName:function(e){
    this.setData({
      'cashConfig.bank_user_name':e.detail.value
    });
  },
  // 开户行监听
  cardBank:function(e){
    this.setData({
      'cashConfig.opening_bank':e.detail.value
    });
  },
  // 微信监听
  wxNum:function(e){
    this.setData({
      'cashConfig.wechat':e.detail.value
    });
  },
  // 支付宝监听
  zfbNum:function(e){
    this.setData({
      'cashConfig.alipay_account':e.detail.value
    });
  },
  // 提现按钮
  getMycash(){
    let that=this;
    let allMoney = Number(that.data.tiXianData.balance);//可提现金额
    let cashMoney = Number(that.data.amount);//提现金额
    let maxAmount = Number(that.data.tiXianData.max_amount);//限制最大提现金额
    let minAmount = Number(that.data.tiXianData.min_amount);//限制最少提现金额
    let cashTypeData = that.data.cashIndex;//提现方式
    // 校验
    if(cashTypeData == 0){//银行卡
      let bankcoed = /^[0-9]*$/;//银行卡
      if (!that.data.cashConfig.bank_card || !bankcoed.test(that.data.cashConfig.bank_card)) {
        return publicFun.warning('银行卡号码不能为空或错误', that);
      }
      if (!that.data.cashConfig.bank_user_name) {
        return publicFun.warning('请输入持卡人姓名', that);
      }
      if (!that.data.cashConfig.opening_bank) {
        return publicFun.warning('请输入开户行', that);
      }
    }else if(cashTypeData == 1){//微信
      //let wxreg = /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/;//微信
      if (!that.data.cashConfig.wechat) {
        return publicFun.warning('微信号码不能为空或错误', that);
      }
    }else if(cashTypeData == 2){//支付宝
      let zfbreg = /^(?:1[3-9]\d{9}|[a-zA-Z\d._-]*\@[a-zA-Z\d.-]{1,10}\.[a-zA-Z\d]{1,20})$/;//支付宝（邮箱和手机号）
      if (!that.data.cashConfig.alipay_account || !zfbreg.test(that.data.cashConfig.alipay_account)) {
        return publicFun.warning('支付宝号码不能为空或错误', that);
      }
    }
    if (allMoney > maxAmount){
      if (cashMoney > allMoney) {
        wx.showModal({
          title: '提示',
          content: '您输入的金额大于可提现金额~',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        });
        return false
      } else if (cashMoney <= allMoney && cashMoney > maxAmount) {
        wx.showModal({
          title: '提示',
          content: '申请提现最高不能多于' + maxAmount + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else if (cashMoney < minAmount){
        wx.showModal({
          title: '提示',
          content: '申请提现最低不少于' + minAmount + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else {
        let data = {
          store_id:app.globalData.store_id || common.store_id,
          amount: that.data.amount,
          account_type:cashTypeData
        }
        if(cashTypeData == 0){//银行卡
          data.bank_card = that.data.cashConfig.bank_card,
          data.bank_user_name = that.data.cashConfig.bank_user_name,
          data.opening_bank = that.data.cashConfig.opening_bank
        }else if(cashTypeData == 1){//微信
          data.wechat = that.data.cashConfig.wechat
        }else if(cashTypeData == 2){//支付宝
          data.alipay_account = that.data.cashConfig.alipay_account
        }
        common.post("app.php?c=team&a=apply_withdraw", data, function callBack(res) {
          if (res.err_code == 0) {
            wx.showToast({
              title: '您已成功提现',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            });
            that.cashList(1);
          }
        }, '');
      }  
    } else if (allMoney < minAmount){
      wx.showModal({
        title: '提示',
        content: '账户余额小于可提现金额~',
        showCancel: false,
        confirmColor: '#fe6b31',
        confirmText: '知道了'
      });
      return false
    } else {
      if (cashMoney > maxAmount) {
        wx.showModal({
          title: '提示',
          content: '申请提现最高不能多于' + maxAmount + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else if (cashMoney <= maxAmount && cashMoney > allMoney) {
        wx.showModal({
          title: '提示',
          content: '您输入的金额大于可提现金额~',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        });
        return false
      } else if (cashMoney < minAmount) {
        wx.showModal({
          title: '提示',
          content: '申请提现最低不少于' + minAmount + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else {
        let data = {
          store_id:app.globalData.store_id || common.store_id,
          amount: that.data.amount,
          account_type:cashTypeData
        }
        if(cashTypeData == 0){//银行卡
          data.bank_card = that.data.cashConfig.bank_card,
          data.bank_user_name = that.data.cashConfig.bank_user_name,
          data.opening_bank = that.data.cashConfig.opening_bank
        }else if(cashTypeData == 1){//微信
          data.wechat = that.data.cashConfig.wechat
        }else if(cashTypeData == 2){//支付宝
          data.alipay_account = that.data.cashConfig.alipay_account
        }
        common.post("app.php?c=team&a=apply_withdraw", data, function callBack(res) {
          if (res.err_code == 0) {
            wx.showToast({
              title: '您已成功提现',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            });
            that.cashList(1);
          }
        }, '')
      }  
    }    
  },
  // 自动提现
  getMycash1:function(){
    let that = this;
    let data = {
      store_id:app.globalData.store_id || common.store_id,
      amount: that.data.amount
    }
    common.post("app.php?c=team&a=apply_withdraw", data, function callBack(res) {
      if (res.err_code == 0) {
        wx.showToast({
          title: '您已成功提现',
        })
        //清空输入金额
        that.setData({
          amount: 0.00
        });
        that.cashList(1);
      }
    }, '')
  },
  // 页面跳转（手工提现）
  goToCashPage(){
    wx.navigateTo({
      url: '/pages/distribution/apply_cash',
    })
  },

  // 我的金币
  // 金币的输入框监听
  changeGoldNum(e){
    var goldIpt;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
      goldIpt = e.detail.value;
    } else {
      goldIpt = e.detail.value.substring(0, e.detail.value.length - 1);
    }
    this.setData({
      goldAmount:goldIpt,
      giveAmount:goldIpt//兑换金额，后期用真数据换算
    });
    // if(this.data.cashConfigItem.per*1 > 0){
    //   this.setData({
    //     giveAmount: Math.floor(goldIpt*this.data.cashConfigItem.per)/100
    //   });
    // }
  },
  // 金币兑换按钮
  getMygold:function(){
    let that = this;
    let data = {
      store_id:app.globalData.store_id || common.store_id,
      amount: that.data.goldAmount
    }
    common.post("app.php?c=team&a=apply_withdraw", data, function callBack(res) {
      if (res.err_code == 0) {
        wx.showToast({
          title: '您已成功提现',
        })
        //清空输入金额
        that.setData({
          amount: 0.00
        });
        that.cashList(1);
      }
    }, '')
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    if(this.data.btn_index==1){//提现
      this.getTxdetails();
      this.cashList(1);
    }else if(this.data.btn_index==0){//账户明细
      this.getMoneyList(1);
    }else if(this.data.btn_index==2){//我的金币

    }
    this.setData({
      isOver1: false,
      isOver2: false,
      listpage1:1,
      listpage2:1
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
    if(this.data.btn_index == 0 && this.data.next_page1 ==true){//账户明细
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
    }else if(this.data.btn_index == 1 && this.data.next_page2 ==true){//体现列表
      wx.showNavigationBarLoading()
      let listpage2 = this.data.listpage2+1;
      this.cashList(listpage2);      
      this.setData({
        listpage2,
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
    console.log(e.detail);
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
})