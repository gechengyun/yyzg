// pages/user/myMoney/myMoney.js
var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var app = getApp();
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
    time_type: 1, //默认月份
    btn_index: 0, //选项
    years,
    year: date.getFullYear(),
    months,
    month: 2,
    days,
    day: 2,
    start_time:'',
    end_time:'',
    value: [9999, 1, 1],
    chosedatestate: false,
    inOutIndex: 2, //1支出 2收入
    dateStartOrEnd: 'start', //时间选择
    listpage: 1,
    now_month:'',
    showDate:"",
    isOver:false,
    amount:0.00,
    accuntDetailShow:false,
    moneyCount:0,//防止多次重复提现
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('礼包分销进来的', options.giftaccunt)
    if (options.giftaccunt){
      this.setData({
        accuntDetailShow:true,
        btn_index:3
      })
      this.lookAccountDetail();
    }
    var that = this;
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
    // if (this.data.inOutIndex == 1) {
      this.getMoneyeDtails(1, 1);
    // } else {
      this.getMoneyList(1, 1);
    // }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    if(this.data.btn_index==2){
      this.getTxdetails();
    }else{
      this.getMoneyList(1, 1);
    }
    this.setData({
      isOver: false,
      listpage:1
    })
    setTimeout(function(){
      wx.hideNavigationBarLoading();
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if(this.data.next_page ==true){
      wx.showNavigationBarLoading()
      let listpage = this.data.listpage+1;
      if(this.data.inOutIndex ==1){
        this.getMoneyeDtails(listpage, 2);
      }else{
        this.getMoneyList(listpage, 2);
      }
      
      this.setData({
        listpage,
      })
      setTimeout(function () {
        wx.hideNavigationBarLoading();
      }, 1500)
    }else{
      this.setData({
        isOver:true
      })
    }
  },

 
  switchTab(e,checked_index) { //切换账户明细
    let index = checked_index!=undefined ?checked_index:e.currentTarget.dataset.index;
    this.setData({
      btn_index: index,
      chosedatestate: false,
      isOver:false,
      moneyCount:0
    })
    if (index == 2) { //提现
      this.getTxdetails();
    } else {
      this.getMoneyList(1, 1);
    }
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
  okTrue() { //确定时间选择
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
    if (this.data.inOutIndex == 1) {
      this.getMoneyeDtails(1, 1);
    } else {
      this.getMoneyList(1, 1);
    }
  },
  chooseDate() {
    this.setData({
      chosedatestate: true
    })
  },
  withDrawal() { //全部提现

    //绑定手机号
    wx.navigateTo({
      url: '/pages/user/myMoney/bindPhone/bindPhone',
    })
  },
  lookAccountDetail(){
    let url = 'app.php?c=drp_ucenter&a=get_account_overview';
    let that = this;
    common.post(url,'',function(res){
      console.log('账户概览',res)
      if (res.err_code == 0){
        that.setData({
          accountDetail:res.err_msg
        })
      }
    },'')
  },
  getMoneyList(page, pagetype) { //账户明细列表
    let start_time = this.data.start_time;
    let end_time = this.data.end_time;
    let now_month = this.data.now_month;
    let time_type = this.data.time_type;
    if (time_type==1){ //默认按月查询时；清空开始和结束时间
      start_time = "";
      end_time = "";
    }else{ //按时间查询清空月份
      now_month = '';
    }
    if (this.data.btn_index==1){  //  待入账时，其他条件清空
      start_time="";
      end_time="";
      now_month='';
      time_type=1;
    }
    let data = {
      page,
      time_type, //时间选择类型（1按月份查询 2按日期查询）
      start_time, //按日期查询-开始时间
      end_time, //按日期查询-结束时间
      time: now_month, //按月份查询-月份（2019-03）
      type: this.data.btn_index, //类型(0佣金明细 1待入账)
    }
    var that = this;
    let url = "app.php?c=drp_ucenter&a=details_of_commission";
    common.post(url, data, function callBack(res) {
      console.log('金额',res)
      if (res.err_code == 0) {
        let listData = that.data.listData||[];
        if (pagetype==1){
          listData = res.err_msg.financial_record_list
        }else{
          listData = listData.concat(res.err_msg.financial_record_list)
        }
        that.setData({
          expend_money: res.err_msg.expend_money, //收入总额
          pending_entry: res.err_msg.pending_entry,
          unbalance: res.err_msg.unbalance,
          listData,
          next_page: res.err_msg.next_page
        })
        wx.stopPullDownRefresh();
      }
    }, '')

  },
  changeInOut(e) {
    let inOutIndex = e.currentTarget.dataset.state;
    this.setData({
      inOutIndex
    })
    if (this.data.inOutIndex == 1) {
      this.getMoneyeDtails(1, 1);
    } else {
      this.getMoneyList(1, 1);
    }
  },
  getMoneyeDtails(page, pagetype) {
    let start_time = this.data.start_time;
    let end_time = this.data.end_time;
    let now_month = this.data.now_month;
    let time_type = this.data.time_type;
    if (time_type == 1) { //默认按月查询时；清空开始和结束时间
      start_time = "";
      end_time = "";
    } else { //按时间查询清空月份
      now_month = '';
    }
    if (this.data.btn_index == 1) {  //  待入账时，其他条件清空
      start_time = "";
      end_time = "";
      now_month = '';
      time_type = 1;
    }
    let data = {
      page,
      time_type, //时间选择类型（1按月份查询 2按日期查询）
      start_time, //按日期查询-开始时间
      end_time, //按日期查询-结束时间
      time: now_month, //按月份查询-月份（2019-03）
    }
    var that = this;
    let URL = "app.php?c=drp_ucenter&a=withdrawal_list";
    common.post(URL, data, function callBack(res) {
      let listDataOut = that.data.listDataOut || [];
      console.log('支出数据',res);
      if (res.err_code == 0) {
        that.setData({
          listDataOut: res.err_msg.store_withdrawal_list
        })
      }
    }, '')
  },
  bindDate(e) { //选择开始时间
    this.setData({
      dateStartOrEnd: e.currentTarget.dataset.type
    })
    console.log(e.currentTarget.dataset.type);
  },
  getTxdetails() {
    var that = this;
    let data = {
      withdrawal_type: "ucenter_withdrawl" //默认配置
    }
    common.post("app.php?c=drp_ucenter&a=withdrawal", data, function callBack(res) {
      console.log(res);
      if (res.err_code == 0) {
        let withdrawal_presentation = res.err_msg.store.withdrawal_presentation.split("<br>");
        that.setData({
          tiXianData: res.err_msg.store,
          withdrawal_presentation,
        })
        wx.stopPullDownRefresh();
      }
    }, '')
  },
  getAllcash(){ //全部提现
    this.setData({
      amount: Number(this.data.tiXianData.balance).toFixed(2),
    })
  },
  getMycash(){
    let that=this;
    this.data.amount = Number(this.data.amount).toFixed(2);
    this.data.tiXianData.balance = Number(this.data.tiXianData.balance).toFixed(2);
    let Balance = Number(this.data.tiXianData.balance);
    let Maxed = Number(this.data.tiXianData.drp_profit_checkout_max);
    let Mined = Number(this.data.tiXianData.drp_profit_checkout_min);

    if (Balance > Maxed){
      if (Number(this.data.amount) > Balance) {
        wx.showModal({
          title: '提示',
          content: '您输入的金额大于可提现金额~',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        });
        return false
      } else if (Number(this.data.amount) <= Balance && Number(this.data.amount) > Maxed) {
        wx.showModal({
          title: '提示',
          content: '申请提现最高不能多于' + this.data.tiXianData.drp_profit_checkout_max + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else if (Number(this.data.amount) < Mined){
        wx.showModal({
          title: '提示',
          content: '申请提现最低不少于' + this.data.tiXianData.drp_profit_checkout_min + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else {
        let data = {
          amount: this.data.amount
        }

        let moneyCount = this.data.moneyCount;
        moneyCount++;
        this.setData({
          moneyCount
        })
        //计算进入次数
        if (moneyCount > 1) {
          return;
        }
        common.post("app.php?c=drp_ucenter&a=apply_withdrawl", data, function callBack(res) {
          if (res.err_code == 0) {
            wx.showToast({
              title: '您已成功提现',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            })
            //跳到账目明细项
            that.switchTab('', 0)
          }

        }, '');
      }  
    } else if (Balance < Mined){
      wx.showModal({
        title: '提示',
        content: '您输入的金额小于可提现金额~',
        showCancel: false,
        confirmColor: '#fe6b31',
        confirmText: '知道了'
      });
      return false
    } else {
      if (Number(this.data.amount) > Maxed) {
        wx.showModal({
          title: '提示',
          content: '申请提现最高不能多于' + this.data.tiXianData.drp_profit_checkout_max + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else if (Number(this.data.amount) <= Maxed && Number(this.data.amount) > Balance) {
        wx.showModal({
          title: '提示',
          content: '您输入的金额大于可提现金额~',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        });
        return false
      } else if (Number(this.data.amount) < Mined) {
        wx.showModal({
          title: '提示',
          content: '申请提现最低不少于' + this.data.tiXianData.drp_profit_checkout_min + '元',
          showCancel: false,
          confirmColor: '#fe6b31',
          confirmText: '知道了'
        })
        return false
      } else {
        let data = {
          amount: this.data.amount
        }

        let moneyCount = this.data.moneyCount;
        moneyCount++;
        this.setData({
          moneyCount
        })
        //计算进入次数
        if (moneyCount > 1) {
          return;
        }
        common.post("app.php?c=drp_ucenter&a=apply_withdrawl", data, function callBack(res) {
          if (res.err_code == 0) {
            wx.showToast({
              title: '您已成功提现',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            })
            //跳到账目明细项
            that.switchTab('', 0)
          }

        }, '')
      }  
    }    
  },
  changeDateType(){ //切换选择类型
    this.setData({
      time_type: this.data.time_type==1?2:1,
    })
  },
  changeMoneyNum(e){
    this.setData({
      amount:e.detail.value
    })
  },
  goGetmoney(e){
    if (e.currentTarget.dataset.btnindex == 2){
      this.getTxdetails();
    }
    this.setData({
      btn_index: e.currentTarget.dataset.btnindex
    })
  },
  // 页面跳转
  goToCashPage(){
    wx.navigateTo({
      url: '/pages/distribution/apply_cash',
    })
  }
})