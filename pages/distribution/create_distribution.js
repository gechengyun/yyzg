// create_distribution.js
var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: true,
    shopName: '',
    userTel: '',
    userName:'',
    agree: false,
    showAgreement: false,
    goPage:true,
    codenum: 60,//验证码倒计时
    sendcodeStatus:false,//验证码状态
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      wx.showLoading({
        title: '加载中...',
      })
      publicFun.setBarBgColor(app, this);// 设置导航条背景色
      this.setData({
          themeColor:app.globalData.navigateBarBgColor
      })
    if (options.code){
      this.setData({
        goPage:false
      })
    }
     
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
        var that = this;
        let url = '/pages/distribution/create_distribution';
        publicFun.setUrl(url);
        common.post('app.php?c=drp&app=app&a=index', '', "shopData", that);
        wx.hideLoading();
        app.isLoginFun(this, 1);//判断用户是否登录
        if(that.data._unlogin){
          return;
        }
        if (common.is_fx && that.data.goPage) {
          wx.reLaunch({
            url: '/pages/distribution/index'
          })
        }

        
  },
  /**
   * 请求数据
   */
  shopData: function (result) {
        var that = this;
        if (result.err_code == 0) {
                that.setData({
                        'shopData': result.err_msg,
                        'err_code': 1
                })
                publicFun.barTitle(that.data.shopData.store_data.supplier_store_name, that);
        }
  },
  /**
   * 设置店铺名称
   */
  shopNameBlur: function (e) {
        this.setData({
                'shopName': e.detail.value
        })
  },
  /**
   * 设置手机号
   */
  userTelBlur: function (e) {
        this.setData({
                'userTel': e.detail.value
        })
  },
  /**
   * 设置用户昵称
   */
  userNameBlur: function (e) {
        this.setData({
                'userName': e.detail.value
        })
  },
  /**
   * 勾选协议
   */
  agreeEvent: function (e) {
        e.currentTarget.dataset.active = !e.currentTarget.dataset.active;
        this.setData({
                'agree': e.currentTarget.dataset.active
        })
  },
  /**
   * 显示协议内容
   */
  showAgreementEvent: function(e) {
        var that = this;
        let type = e.currentTarget.dataset.status;
        if (type == 'open') {
                that.setData({
                        'showAgreement': true
                })
        } else {
                that.setData({
                        'showAgreement': false
                })
        }
  },
  /**
   * 申请分销商
   */
  createShop: function (e) {
        var that = this;
        var telReg = /^\d{11}$/;//校验手机号码
        var QQReg = new RegExp('^[1-9]\\d{4,10}$'); //校验QQ号
        if (that.data.shopName == '' ) {
            that.data.shopName = that.data.shopData.store_data.root_store_name;
        }
        if (that.data.userTel == '' ) {
                return publicFun.warning('请填写手机号码！', that)
        }
        if (!telReg.test(that.data.userTel)) {
                return publicFun.warning('请输入合格手机号!', that)
        }
        if ((that.data.veriCode=="" || that.data.veriCode == undefined) && that.data.shopData.sms_open*1 == 1) {
                return publicFun.warning('请输入验证码!', that)
        }
        if (that.data.userName == '' ) {
                return publicFun.warning('用户昵称不能为空!', that)
        }
        if (!that.data.agree) {
                return publicFun.warning('您还没有勾选' + that.data.shopData.diy_fx_name + '协议!', that)
        }
        var dataPost = {
                name: that.data.shopName,
                tel: that.data.userTel,
                linkname: that.data.userName,
                // qq: scope.userQQ
        };
        if(that.data.shopData.sms_open*1){
                dataPost.sms_code = that.data.veriCode
        }
        // console.log(dataPost);
        common.post('app.php?c=drp&app=app&a=register', dataPost, creatShopFun, '');
        function creatShopFun(result) {
                if (result.err_code == 0) {
                        wx.showModal({
                                title: '提示',
                                content: result.err_msg,
                                showCancel: false,
                                success: function (res) {
                                        if (res.confirm) {
                                                wx.redirectTo({
                                                    url: '/pages/user/index'
                                                })
                                        } else if (res.cancel) {
                                                console.log('用户点击取消')
                                        }
                                }
                        })
                }
        }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /*
  发送验证码
   */
  getVerificatCode:function(){
        let that=this;
        let {userTel,sendcodeStatus,codenum}=that.data;
        //校验手机号，手机号通过得到验证码
        if(userTel){ 
                if(codenum<60){return};
                var telReg = /^\d{11}$/;//校验手机号码
                if (!telReg.test(userTel)) {
                        return publicFun.warning('请输入合格手机号!', that)
                } 
                let param={}
                param.phone=userTel;
                common.post('app.php?c=wxapp&a=sentMsg', param, "getVerificatCodeData", that);
                let interTime = setInterval(function () {
                        that.setData({
                                codenum: --codenum,
                                sendcodeStatus:true
                        });
                        if (codenum <= 0) {
                                clearInterval(interTime);
                                that.setData({ sendcodeStatus: false,codenum:60 })
                        }
                }, 1000)
        }else{
                wx.showToast({
                  title: '请输入手机号',
                  icon:'none'
                })
        }
  },
  /**
   * 
   *获取验证码
   */
  getVerificatCodeData:function(data){
        console.log("data==",data)
  },
  /**
   * 输入验证码
   */
  inputVeriCode:function(e){
        const {value}=e.detail;
        this.setData({
                veriCode:value.trim()
        })
  }

})
