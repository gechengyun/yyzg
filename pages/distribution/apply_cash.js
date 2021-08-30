// apply_cash.js
var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
let is_repeat_msg = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModalStatus: false, //模态框显示状态
        bankChecked: false, //选择银行标识
        bank_id: '',
        bank_card: '', //银行卡号
        bank_card_user: '', // 持卡人姓名
        opening_bank: '', //开户行名称
        bank_name: '', //发卡银行名字
        applyMoney: '', //申请提现金额
        storeData: '', //用户默认信息
        bankList: [], //获取银行卡列表
        applySuc: false,
        cashIndex:0,//提现方式
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.barTitle('申请提现');
    },
    onShow:function(){
        let alipay_account=wx.getStorageSync('alipay_account');
        if(alipay_account){
            this.setData({
                alipay_account
            })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        let url = '/pages/distribution/apply_cash';
        publicFun.setUrl(url);
        common.post('app.php?c=drp_ucenter&a=withdrawal', '', initData, '');
        function initData(res) {
            if (res.err_code == 0) {
                that.setData({
                    'storeData': res.err_msg
                })
                if (that.data.storeData.store.bank_name != '') {
                    that.setData({
                        'bank_name': that.data.storeData.store.bank_name,
                        'bank_card': that.data.storeData.store.bank_card,
                        'bank_card_user': that.data.storeData.store.bank_card_user,
                        'opening_bank': that.data.storeData.store.opening_bank,
                        'bank_id': that.data.storeData.store.bank_id,
                    })
                }
            }
        }
    },

    //银行卡简单校验
    verifyBankCard: function(e) {
        var that = this;
        let bank_card = e.detail.value;
        let reg = /^([0-9]{16}|[0-9]{19})$/;
        if (bank_card == '' || bank_card == undefined) {
            //   publicFun.warning('请填写银行卡号', that);
            return false;
        }
        if (!reg.test(bank_card)) {
            //   publicFun.warning('请填写合法银行卡号', that);
            that.setData({
                bank_card: bank_card,
            });
            return false;
        }
        that.setData({
            bank_card: bank_card,
        });
    },
    // 上传银行卡（银行卡 OCR 识别）
    chooseImg:function(){
      let that = this;
      wx.chooseImage({ //图片上传控件
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          wx.showLoading({
            title: '正在上传中...',
            mask: true
          })
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function (_res) {
            that.setData({
              bank_card:  _res.err_msg,
            });
            wx.hideLoading();
          }, '')
        }
      })
    },
    //持卡人校验
    verifyBankCardUser: function (e) {
        var that = this;
        let a = e.detail.value;
        if (a == '' || a == undefined) {
            //   publicFun.warning('请填写持卡人姓名', that);
            return false;
        }
        that.setData({
            bank_card_user: a,
        });
        return true;
    },
    //开户行校验
    verifyOpeningBank: function (e) {
        var that = this;
        let a = e.detail.value;
        if (a == '' || a == undefined) {
            //   publicFun.warning('请填写开户行', that);
            return false;
        }
        that.setData({
            opening_bank: a,
        });
        return true;
    },
    //提现金额校验
    verifyApplyMoney: function (e) {
        var that = this;
        let a = e.detail.value;
        //【ID1007155】
        let regbank_card = /^\d+$|^\d*\.\d+$/g;
        if (a == '' || a == undefined) {
            //   publicFun.warning('请输入提现金额', that);
            return false;
        }
        if (!regbank_card.test(a)) {
            publicFun.warning('请输入合法的金额格式', that);
            that.setData({
                applyMoney: '',
            });
            return false;
        }
        that.setData({
            applyMoney: a,
        });
    },
    //自定义弹窗控制
    modalControl: function (e) {
        var that = this;
        var currentStatu = e.currentTarget.dataset.statu;
        this.controlDeatail(currentStatu);
        if (currentStatu == 'open') {
            common.post('app.php?c=drp_ucenter&a=withdrawal_account', '', initData, '');
            function initData(res) {
                if (res.err_code == 0) {
                    that.setData({
                        'bankList': res.err_msg.bank_list
                    })
                    console.log(that.data.bankList)
                }
            }
        }
    },
    //弹窗事件
    controlDeatail: function (currentStatu) {
        /* 动画部分 */
        // 第1步：创建动画实例 
        var animation = wx.createAnimation({
            duration: 200, //动画时长 
            timingFunction: "linear", //线性 
            delay: 0 //0则不延迟 
        });

        // 第2步：这个动画实例赋给当前的动画实例 
        this.animation = animation;

        // 第3步：执行第一组动画 
        animation.opacity(0).rotateX(-100).step();

        // 第4步：导出动画对象赋给数据对象储存 
        this.setData({
            animationData: animation.export()
        })

        // 第5步：设置定时器到指定时候后，执行第二组动画 
        setTimeout(function () {
        // 执行第二组动画 
            animation.opacity(1).rotateX(0).step();
            // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
            this.setData({
                animationData: animation
            })

            //关闭 
            if (currentStatu == "close") {
                this.setData(
                {
                    showModalStatus: false
                }
                );
            }
        }.bind(this), 200)

        // 显示 
        if (currentStatu == "open") {
            this.setData({
                showModalStatus: true
            });
        }
    },
    //选择银行事件
    bankChoose: function(e) {
        var that = this;
        let bank_id = e.detail.value;
        let bank_list = that.data.bankList;
        for (let i = 0; i < bank_list.length; i++) {
            if (bank_list[i].bank_id == bank_id) {
                that.data.bank_name = bank_list[i].name
            }
        }
        that.setData({
            bank_id: bank_id,
            bank_name: that.data.bank_name
        })
    },
    //申请提现事件
    applyButtonEvent: function() {
        var that = this;
        var isCanApply = that.data.storeData.store.balance*1 > 0;
        if (isCanApply) {
            // 当前选择支付方式：0银行卡，2支付宝
            let cashIndex=that.data.cashIndex;

            let regbank_card = /^([0-9]{16,20})$/;
             //【ID1007155】
            let regapply_money = /^\d+$|^\d*\.\d+$/g;

            if(cashIndex==0){//银行卡付款
                if (that.data.bank_card == '' || that.data.bank_card == undefined) {
                    publicFun.warning('请填写银行卡号', that);
                    return false;
                }
                if (!regbank_card.test(that.data.bank_card)) {
                    publicFun.warning('请填写合法银行卡号', that);
                    return false;
                }
                if (that.data.bank_card_user == '' || that.data.bank_card_user == undefined) {
                    publicFun.warning('请填写持卡人姓名', that);
                    return false
                }
                if (that.data.opening_bank == '' || that.data.opening_bank == undefined) {
                    publicFun.warning('请填写开户行', that);
                    return false
                }
                if (that.data.bank_id == '' || that.data.bank_id == undefined || that.data.bank_id == 0) {
                    publicFun.warning('请选择发卡银行', that);
                    return false
                }
            }else if(cashIndex==2){
                //检验支付宝支付
                let zfbreg = /^(?:1[3-9]\d{9}|[a-zA-Z\d._-]*\@[a-zA-Z\d.-]{1,10}\.[a-zA-Z\d]{1,20})$/;//支付宝（邮箱和手机号）
                if (!that.data.alipay_account || !zfbreg.test(that.data.alipay_account)) {
                    return publicFun.warning('支付宝号码不能为空或错误', that);
                }
            }
            
            if (that.data.applyMoney == '' || that.data.applyMoney == undefined) {
                publicFun.warning('请输入提现金额', that);
                return false
            }
            if (!regapply_money.test(that.data.applyMoney)) {
                publicFun.warning('请输入合法金额', that);
                return false;
            }
            if (that.data.applyMoney * 1 < that.data.storeData.store.withdrawal_min_amount * 1) {
                publicFun.warning('最低提现金额为' + that.data.storeData.store.withdrawal_min_amount + '元,请重新输入', that);
                return false;
            }
            if (that.data.applyMoney * 1 > that.data.storeData.store.balance * 1) {
                publicFun.warning('您最高可提现' + that.data.storeData.store.balance + '元，请重新输入', that);
                return false;
            }
            let postData = {};
            if(cashIndex==0){//银行卡支付
                if (is_repeat_msg) {//防止重复点击提现
                    return publicFun.warning('提现中，请稍等！', that);
                }
                is_repeat_msg = true;
                postData = {
                    action: 'submit',
                    bank_id: that.data.bank_id,
                    bank_card: that.data.bank_card,
                    bank_card_user: that.data.bank_card_user,
                    opening_bank: that.data.opening_bank
                }
                common.post('app.php?c=drp_ucenter&a=withdrawal_account', postData, setBank, '');
            }else if(cashIndex==2){//支付宝支付
                if (is_repeat_msg) {//防止重复点击提现
                    return publicFun.warning('提现中，请稍等！', that);
                }
                is_repeat_msg = true;
                setBank();//支付宝直接去支付
            }
        } else {
            publicFun.warning('您当前没有可提现的佣金哦', that)
        }

        // 设置提现账号
        function setBank(res) {
            let postData = {
                action: 'submit',
                amount: that.data.applyMoney
            }
            if (res && res.err_code == 0) {
                publicFun.warning('操作完成，正在提现', that)
                if(that.data.cashIndex==0){//银行卡支付
                    postData.account_type=0;
                } 
            }else{
                if(that.data.cashIndex==2){//支付宝支付
                    postData.account_type=2;
                    postData.alipay_account=that.data.alipay_account
                }    
                
            }
            postData.remark=that.data.remark;//说明
            applyCash(postData);
        }
        
        // 申请提现
        function applyCash(postData) {
            console.log(postData);
            common.post('app.php?c=drp_ucenter&a=withdrawal', postData, callBackFun, '');
        }

        // 提现回调
        function callBackFun(res) {
            console.log(res)
            if (res.err_code == 0) {
                that.setData({
                    'applySuc': true
                });
                is_repeat_msg = false;//防止重复点击提现
                 //提现成功存储支付宝账号
                if(that.data.cashIndex==2){
                    wx.setStorageSync('alipay_account', that.data.alipay_account)
                }   
            }
           

        }
    },
    /**
     * 切换支付方式
     */
  cashType:function(e){
    let that = this;
    console.log(e.currentTarget.dataset.cashtype)
    that.setData({
      cashIndex: e.currentTarget.dataset.cashtype
    });
  },
  /**
   * /支付宝监听
   */
  zfbNum:function(e){
    this.setData({
        alipay_account:e.detail.value
    });
  },
  /**
   * 暂无说明
   */
  remarkValueFun:function(e){
      this.setData({
          remark:e.detail.value.trim()
      })
  }
    
})