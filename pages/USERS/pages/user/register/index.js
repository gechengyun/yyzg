// pages/LIVEVIDEO//pages/userLive/register.js
var app = getApp();
var _url='../../';
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
var canvasFun = require(_url + '../../../utils/canvas-post.js');
var canvas = require(_url + '../../../utils/canvas.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRule: true,//是否同意规则
    group_detail: {},
    isTeam: true,//是否团队结算 true：团队结算；false：邀请付费
    user_address: {},//盛放省市区
    codenum: 60,//验证码倒计时
    upImgSrc1:'',//身份证正面
    upImgSrc2:'',//身份证反面
    isGrade: 0,//礼包选择0：初级，1：中级，2：高级
    gradeImg: ['grade_lower', 'grade_middle','grade_height'],
    stepidx: 0,//认证步骤
    hasPhone: false,//是否有手机号
    canSubmit: false,//是否可以提交信息，按钮置灰
    pick_index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('页面间参数传递',options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that);//判断用户是否登录
    // 申请代理进入
    if(options.is_my_fx_store == '0') {
      console.log('ok');
    }
    // 加载省市区数据
    let addId = 0;
    publicFun.addressEditGO(that, addId);
    that.pageFun();
  },
  // 基础配置项
  pageFun: function() {
    let that = this;
    let url = 'app.php?c=drp&a=get_agent_page_info';
    let data = {
        store_id: app.globalData.store_id || common.store_id,
      };
    common.post(url, data, 'pageData', that,'')
  },
  pageData: function (res) {
    var that = this;
    var ruleData = res.err_msg.protocol;
    var apply_info = res.err_msg.apply_info;
    console.log(apply_info)
    if(apply_info) {
      that.setData({
        apply_info:apply_info
      })
    }else{
      that.setData({
        'apply_info.status':-1
      })
    }
    that.setData({
      pageData: res.err_msg,
      ruleData
    });
    console.log(res.err_msg)
    // if(res.err_msg.bak){//返回提示信息
    //   let richbak = res.err_msg.bak.replace(/\\n/g, '\n');
    //   that.setData({
    //     richbak: richbak
    //   });
    // };
    // if(!that.data.isTeam){//邀请付费
    //   if(res.err_msg.invite_code && res.err_msg.invite_code != ''){
    //     that.setData({
    //       "group_detail.icoed": res.err_msg.invite_code,
    //       haveCode: true
    //     });
    //   }
    // }
    // if(res.err_msg.has_phone && res.err_msg.has_phone*1 == 1){//判断是否有手机号（0：没手机号，分两步；1：有手机号）
    //   that.setData({
    //     hasPhone: true,
    //     canSubmit: true,
    //     stepidx: 1,
    //     "group_detail.tel": res.err_msg.phone
    //   });
    // }
  },
  // 返回上一页
  goback:function(){
    if(app.globalData.share_uid){//通过分享进来
      console.log('分享返回');
      wx.redirectTo({
        url: '/pages/user/index'
      });
    }else{
      console.log('正常返回')
      wx.navigateBack({
        delta: 1
      });
    }
  },
  // 认证步骤
  nextStep:function(e){
    let that = this;
    // console.log(e)
    if(e.currentTarget.dataset.stepidxs == 1){
      let phone_no = that.data.group_detail.tel || that.data.phoneNumber;
      if(!phone_no){
        return publicFun.warning('手机号不能为空', that);
      }
      if (!(/^1[23456789]\d{9}$/.test(phone_no))) {//手机号
        return publicFun.warning('手机号码格式不正确', that);
      }
      if (!that.data.group_detail.code || !(/^\d{4}$/.test(that.data.group_detail.code))) {
        return publicFun.warning('验证码只有4位', that);
      }
      let params = {
        phone: that.data.group_detail.tel || that.data.phoneNumber,
        sms_code: that.data.group_detail.code,
        type: 1
      }
      let url = "app.php?c=ucenter&a=save_phone"
      common.post(url, params, function (res) {
        if(res.err_code == 0){
          that.setData({
            stepidx: e.currentTarget.dataset.stepidxs,
            canSubmit: true
          });
        }
        if (res.err_code == 0 && Object.keys(res.err_msg.update_user_info).length>0) {
          console.log('提交成功');
          wx.removeStorageSync('ticket');
          wx.setStorageSync('ticket', res.err_msg.update_user_info.wxapp_ticket);
          app.globalData.my_uid = res.err_msg.update_user_info.uid;
        }
      }, '')
    }else{
      that.setData({
        stepidx: e.currentTarget.dataset.stepidx
      });
    }    
  },
  // 数据绑定
  bindIcoed: function (e) {//邀请码（邀请付费）
    this.setData({
      "group_detail.icoed": e.detail.value
    })
  },
  bindName: function (e) {//姓名
    this.setData({
      "group_detail.name": e.detail.value
    })
  },
  bindTel: function (e) {//手机号
    this.setData({
      "group_detail.tel": e.detail.value
    })
  },
  bindCode: function (e) {//验证码
    this.setData({
      "group_detail.code": e.detail.value
    })
  },
  // 地址
  pickerProvince: function (e, p_index) { //省份选择
    let that = this;
    publicFun.pickerProvince(that, e, p_index);
  },
  pickerCity: function (e, c_index) { //市级选择
    let that = this;
    publicFun.pickerCity(that, e, c_index);
  },
  pickerCountry: function (e) { //县区
    let that = this;
    publicFun.pickerCountry(that, e);
  },
  bindAdress: function (e) {//地址
    this.setData({
      "group_detail.adress": e.detail.value
    })
  },
  bindBanknum: function (e) {//银行卡
    this.setData({
      "group_detail.banknum": e.detail.value
    })
  },
  bindPickerChange(e) {
    console.log(e.detail.value);
    let that = this;
    var pick_index = e.detail.value;
    this.setData({
      pick_index,
      "group_detail.agent":that.data.pageData.member_roles[pick_index]
    })
  },
  bindOpenBank: function (e) {//开户行
    this.setData({
      "group_detail.openBank": e.detail.value
    })
  },
  bindOpenBankName:function(e) {//开户人姓名
    this.setData({
      "group_detail.openBankName": e.detail.value
    })
  },
  bindIdnum: function (e) {//身份证
    this.setData({
      "group_detail.idnum": e.detail.value
    })
  },
  // 提交申请
  grouperSave:function(){
    console.log('你点击了提交')
    let that = this;
    let pageConfig = that.data.pageData.require_field
    
    if(!that.data.group_detail.agent) {
      return publicFun.warning('请选择代理类型', that);
    }
    if (!that.data.group_detail.name && pageConfig.show_user_name * 1) {
      return publicFun.warning('请填写姓名', that);
    }
    if(!that.data.group_detail.adress && pageConfig.show_address*1){
      return publicFun.warning('请填写详细地址', that);
    }
    let bankcoed = /^[0-9]*$/;//银行卡
    if ((!that.data.group_detail.banknum || !bankcoed.test(that.data.group_detail.banknum)) && pageConfig.show_bank_card * 1) {
      return publicFun.warning('银行卡号码为空或错误', that);
    }
    if (!that.data.group_detail.openBank && pageConfig.show_id_card * 1) {
      return publicFun.warning('请填写开户行', that);
    }
    let codereg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//身份证
    if ((!that.data.group_detail.idnum || !codereg.test(that.data.group_detail.idnum)) && pageConfig.show_id_card * 1) {
      return publicFun.warning('身份证号码不能为空或错误', that);
    }
    if ((that.data.upImgSrc1 == '' || that.data.upImgSrc2 == '') && pageConfig.show_id_card_pic * 1) {
      return publicFun.warning('请上传身份证图片', that);
    }
    if(!that.data.group_detail.openBankName && pageConfig.show_id_card*1) {
      return publicFun.warning('请输入开户人姓名', that);
    }
     else {
      let imgSrc = [];
      imgSrc.push(that.data.upImgSrc1);
      imgSrc.push(that.data.upImgSrc2);
      that.setData({
        "group_detail.imgSrc": imgSrc
      });
      console.log(that.data.group_detail.imgSrc)
    }
    if (!that.data.isRule) {//不同意规则的提示
      return publicFun.warning('请同意勾选协议', that);
    }
    let params = {
      store_id: app.globalData.store_id || common.store_id,
      name: that.data.group_detail.name,
      phone: that.data.group_detail.tel || that.data.phoneNumber,
      sms_code: that.data.group_detail.code,
      id_card: that.data.group_detail.idnum,
      id_card_pic: that.data.group_detail.imgSrc,
      bank_card: that.data.group_detail.banknum,
      bank_name: that.data.group_detail.openBank,
      province: this.data.province_code_arr[this.data.province_index],
      city: this.data.city_code_arr[this.data.city_index],
      area: this.data.country_code_arr[this.data.country_index],
      bank_open_name:that.data.group_detail.openBankName,
      address:that.data.group_detail.adress,
      apply_rule_level:that.data.group_detail.agent.level
    }
    var url = "app.php?c=drp&a=save_agent"
    common.post(url, params, function (res) {
      if (res.err_code == 0) {
        that.setData({
          'apply_info.status': 0
        });
        wx.showToast({
          title: '提交成功，等待审核',
          icon: 'success'
        })
        that.setData({
          canSubmit:false
        })
      }
    }, '')
  },
  // 校验邀请码
  testCode:function(){
    let that = this;
    if (!that.data.group_detail.icoed && !that.data.isTeam) {//邀请付费
      return publicFun.warning('请填写邀请码', that);
    }
    let url = 'app.php?c=drp&a=check_code',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        code: that.data.group_detail.icoed
      };
    common.post(url, data, function(res){
      publicFun.warning('校验成功', that);
      that.setData({
        gradeData: res.err_msg,
        fxId: res.err_dom
      });
    }, '');
  },
  // 获取验证码
  getTelcode: function () {
    let that = this;
    let phone_no = this.data.group_detail.tel || this.data.phoneNumber;
    if (!(/^1[23456789]\d{9}$/.test(phone_no))) {
      return publicFun.warning('手机号码格式不正确', that);
    }
    let datas = {
      phone: phone_no
    };
    let url = 'app.php?c=community_leader&a=sentMsg';
    common.post(url, datas, function (res) {
      that.setData({
        sendcodeStatus: true
      })
      let codenum = 60;
      let interTime = setInterval(function () {
        that.setData({
          codenum: --codenum
        });
        if (codenum == 0) {
          codenum = 0;
          clearInterval(interTime);
          that.setData({ sendcodeStatus: false })
        }
      }, 1000)
      console.log('验证码', res)
    }, '')
  },
  // 上传身份证
  upImg:function(e){
    let that = this;
    let imgtype = e.currentTarget.dataset.imgtype;
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
          if (imgtype == 'upImgSrc1') {
            that.setData({
              upImgSrc1: _res.err_msg
            })
          } else {
            that.setData({
              upImgSrc2: _res.err_msg
            })
          }
          wx.hideLoading();
        }, '')
      }
    })
  },
  // 规则选择
  chooseRule: function () {
    let that = this;
    that.setData({
      isRule: !that.data.isRule
    });
  },
  // 礼包选择(等级)
  chooseGrade:function(e){
    let that = this;
    let gradeStep = e.currentTarget.dataset.grade
    that.setData({
      isGrade: gradeStep
    });
  },
  // 礼包跳转详情
  goDetail:function(e){
    let that = this;
    let productid = e.currentTarget.dataset.productid
    wx.navigateTo({
      url: '/pages/product/details?product_id=' + productid
    });
  },
  // 付费开通添加订单
  orderFun:function(){
    let that = this;
    let pageConfig = that.data.pageData.require_field
    if (!that.data.group_detail.icoed && !that.data.isTeam) {//邀请付费
      return publicFun.warning('请填写邀请码', that);
    }
    if (!that.data.group_detail.name && pageConfig.show_user_name * 1) {
      return publicFun.warning('请填写姓名', that);
    }
    let bankcoed = /^[0-9]*$/;//银行卡
    if ((!that.data.group_detail.banknum || !bankcoed.test(that.data.group_detail.banknum)) && pageConfig.show_bank_card * 1) {
      return publicFun.warning('银行卡号码不能为空或错误', that);
    }
    if (!that.data.group_detail.openBank && pageConfig.show_bank_card * 1) {
      return publicFun.warning('请填写开户行', that);
    }
    let codereg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//身份证
    if ((!that.data.group_detail.idnum || !codereg.test(that.data.group_detail.idnum)) && pageConfig.show_id_card * 1) {
      return publicFun.warning('身份证号码不能为空或错误', that);
    }
    if ((that.data.upImgSrc1 == '' || that.data.upImgSrc2 == '') && pageConfig.show_id_card_pic * 1) {
      return publicFun.warning('请上传身份证图片', that);
    } else {
      let imgSrc = [];
      imgSrc.push(that.data.upImgSrc1);
      imgSrc.push(that.data.upImgSrc2);
      that.setData({
        "group_detail.imgSrc": imgSrc
      });
      console.log(that.data.group_detail.imgSrc)
    }
    if (!that.data.isRule) {//不同意规则的提示
      return publicFun.warning('请同意勾选协议', that);
    }
    var giftStep;
    if (that.data.gradeData){
      giftStep = that.data.gradeData[that.data.isGrade];
    }else{
      return;
    }  
    let url = 'app.php?c=drp&a=add_order',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      fx_store_id: that.data.fxId,
      product_id: giftStep.product_id,
      phone: that.data.group_detail.tel || that.data.phoneNumber
    };
    common.post(url, data, 'orderData', that, '')
  },
  orderData: function (res) {
    let that = this;
    that.setData({
      orderData: res.err_msg
    });
    that.payFun();
  },
  // 微信支付
  payFun:function(){
    // 调用微信支付
    let that = this;
    let payData = that.data.orderData;
    let data = {
      orderNo: payData.orderNo,
      selffetch_date: payData.selffetch_date,
      selffetch_id: payData.selffetch_id,
      selffetch_name: payData.selffetch_name,
      selffetch_time: payData.selffetch_time,
      shipping_method: payData.shipping_method,
      selffetch_phone: that.data.group_detail.tel || that.data.phoneNumber,
      payType: 'weixin',
      is_app: 'store_wxapp',
    }
    common.post('app.php?c=order&a=save&payType=weixin' + '&is_app=wxapp', data, paymentPay, '');
    function paymentPay(result) {
      if (result.err_code == 0) {
        var wx_data = result.err_msg;
        wx.requestPayment({
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function (res) {//支付成功
            that.grouperSave();
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
        })
      }
    }
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
    let that = this;
    // 获取微信胶囊数据
    var data = wx.getMenuButtonBoundingClientRect();
    that.setData({
      boundHeight: data.height,
      boundtop: data.top
    });
    console.log(that.data.boundtop, that.data.boundHeight);
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
  // 分享
  shareFun:function(e){
    let that = this;
    const {type}=e.currentTarget.dataset;
    if(type=="share-link"){ //分享好友
      
    }else if(type=="share-haibao"){ //生成海报
      that.shareFriendsCircle();
    }
  },
  //分享朋友圈（分享海报图）
  shareFriendsCircle: function () {
    var that = this;
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/LIVEVIDEO/pages/userLive/register',
      store_id: app.globalData.store_id || common.store_id,
      uid: getApp().globalData.my_uid
    }
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    })
    // that.creatPost();
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功')
        if (res.statusCode == 200) {
          if (res.data.err_code == 0) {
            that.setData({
              qrcodePath: res.data.err_msg
            });
            // 处理canvas
            wx.showLoading({
              title: '海报生成中...',
              mask: true
            });
            that.creatPost();
            // 处理canvas    
          } else if (res.data.err_code == 1000) {
            console.log('未发布，暂不支持分享');
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function (res) {
                
              }
            });
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
      }
    })
  },
  // 生成分享海报
  creatPost: function() {
    let that = this;
    // 1 设置画布数据
    let pageData = that.data.pageData;
    let canvasData = { // 画布数据
      canvasId: 'productPost',
      canvasWidth: 750,
      canvasHeight: 1030,
      paddingLeft: 0,
      innerLeft: 30,
      paddingTop: 0,      
      whProportion: 0.8,
      titleName: '期待您的加入', //主播名称
      shopName: pageData.store_name, // 店铺名称
      text_qrcode_btm: '长按二维码进入直播', // 二维码下方文字
      // 图片数据
      store_logo: pageData.store_logo, //店铺logo
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      // qrcodePath: pageData.page_image, // 二维码
      coverImage: pageData.page_image, // 背景图
    };
    let obj = canvas.px2rpx({
      w: canvasData.canvasWidth,
      h: canvasData.canvasHeight
    });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['coverImage', 'qrcodePath', 'store_logo']
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j];
      task.push(canvasFun.loadImageFileByUrl(that.data.canvasData[filePath]))
    }

    Promise.all(task).then(resultList => {
      for (let filePathIndex = 0; filePathIndex < resultList.length; filePathIndex++) {
        let resultListElement = resultList[filePathIndex];
        that.data.canvasData[filePaths[filePathIndex]] = resultListElement.tempFilePath
      }
      that.setData({
        canvasData: that.data.canvasData
      });
      // that.drawCanvas();
      that.getImageMes();
      setTimeout(function() {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        that.save({
          id: that.data.canvasData.canvasId,
          w: w,
          h: h
        });
      }, 300)
    }).catch(err => {
      console.log(err);
    })
  },
  // 画图海报
  drawCanvas: function() {
    let that = this;
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部偏移量
    let innerLeft = that.data.canvasData.innerLeft;
    let innerTop = 100;
    // 内部商品图片高度
    let imgH = (w - 2*innerLeft) * 0.8;
    // 店铺logo半径
    let shop_r = 30;
    // 二维码半径
    let qrode_r = 80;
    let positionY = 0;

    let titleName = that.data.canvasData.titleName;
    let shopName = that.data.canvasData.shopName;
    let text_qrcode_btm = that.data.canvasData.text_qrcode_btm;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: left,
      y: top,
      w: w,
      h: h,
      r: 20,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });
    // 绘制标题
    canvas.drawText({
      ctx: ctx,
      text: titleName,
      x: w / 2 - 100,
      y: 50,
      fontSize: 36,
      baseline: 'middle',
      color: '#030000'
    });

    var sx = that.data.sx,
      sy = that.data.sy,
      sw = that.data.sw,
      sh = that.data.sh;
    console.log(sx, "*************", sy, "*************", sw, "*************", sh);
    canvas.roundImg({
      ctx: ctx,
      x: left + innerLeft,
      sx: sx,
      y: top + innerTop,
      sy: sy,
      img: that.data.canvasData.coverImage,
      w: w - 2*innerLeft,
      sw: sw,
      h: imgH,
      sh: sh,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });
    // 绘制店铺名称    
    imgH = imgH + 100;
    if (shopName.length > 15) {
      // 绘制店铺logo
      canvas.circleImg({
        ctx: ctx,
        img: that.data.canvasData.store_logo,
        r: shop_r,
        x: w / 2 - 300 - shop_r-10,
        y: imgH + 25,
        w: shop_r * 2,
        h: shop_r * 2
      });

      shopName = shopName.slice(0, 15) + '\n' + shopName.slice(20, 29) + "...";
      canvas.drawText({
        ctx: ctx,
        text: shopName,
        x: w / 2 - 300 + shop_r,
        y: imgH + 46,
        fontSize: 32
      });      
    } else {
      let name_r = shopName.length*40/2
      // 绘制店铺logo
      canvas.circleImg({
        ctx: ctx,
        img: that.data.canvasData.store_logo,
        r: shop_r,
        x: w / 2 - name_r - shop_r-10,
        y: imgH + 25,
        w: shop_r * 2,
        h: shop_r * 2
      });

      canvas.drawText({
        ctx: ctx,
        text: shopName,
        x: w / 2 - name_r + shop_r ,
        y: imgH + 46,
        fontSize: 32
      });
    }
    // 绘制二维码
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x: (w - qrode_r * 2) / 2,
      y: imgH + shop_r * 2 + 60,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码下面文字
    canvas.drawText({
      ctx: ctx,
      text: text_qrcode_btm,
      x: w / 2 - 130,
      y: imgH + shop_r * 2 + qrode_r * 2 + 100,
      fontSize: 30,
      baseline: 'middle',
      color: '#030000'
    });
    // 最终绘出画布
    ctx.draw();
  },

  // 保存到相册
  save: function(o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function(res) {
      // console.log(res);
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      // saveImageToPhotosAlbum图片保存到本地相册
      canvas.saveImageToPhotosAlbum(o).then(function(res) {
        // console.log(res);
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              if (that.data.isShowShare) {
                that.hideDialog();
              }
              wx.previewImage({
                urls: [o.imgSrc],
                current: o.imgSrc
              })
            }
          }
        })
      }, function(err) {
        console.log(err);
        wx.hideLoading();
      });
    }, function(err) {
      console.log(err);
    });
  },
  getImageMes: function () {
    let that = this;
    var sx, sy, sw, sh;
    wx.getImageInfo({
      src: that.data.canvasData.coverImage,
      success(res) {
        var imgw = res.width,
            imgh = res.height,
            whProportion = that.data.canvasData.whProportion,
            dimgw = that.data.canvasData.canvasWidth - 2*that.data.canvasData.innerLeft,
            dimgh = dimgw*whProportion;
        console.log(imgw, "--------------",dimgw);
        console.log(imgh, "--------------",dimgh);
        console.log(that.data.canvasData.whProportion, "--------------");
        if(imgw > imgh){//宽图
          console.log('宽图');
          sx = 0;
          sy = (imgh - imgw*dimgh/dimgw)/2;
          sw = imgw;
          sh = imgw*dimgh/dimgw
        }else if(imgw < imgh){//长图
          console.log('长图');
          sx = (dimgw -  dimgw*dimgh/imgh)/2  - that.data.canvasData.innerLeft;
          sy = 0;
          sw = imgh*dimgw/dimgh;
          sh = imgh
        }else{//方图
          console.log('方图');
          sx = (dimgw -  dimgw*dimgh/imgh)/2  - that.data.canvasData.innerLeft;
          sy = 0;
          sw = imgh*dimgw/dimgh;
          sh = imgh
        }
        that.setData({
          sx: sx,
          sy: sy,
          sw: sw,
          sh: sh
        });
        that.drawCanvas();
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    let pageData = that.data.pageData;
    return getApp().shareGetFans(pageData.page_title, ` `, `pages/LIVEVIDEO/pages/userLive/register`, 1, pageData.page_image, `&teamstyle=${that.data.teamstyle}`); 
  },
  // 获取图片的高
  imgHeight:function(e){
    console.log(666888,e,e.detail.height);
    let oldImgW = e.detail.width;//原图的宽
    let oldImgH = e.detail.height;//原图的高
    let imgScale = oldImgW/oldImgH;//原图的宽高比
    let nowImgH = wx.getSystemInfoSync().windowWidth*2/imgScale;

    console.log(imgScale,'------',oldImgW,oldImgH,nowImgH);
    if(oldImgW > wx.getSystemInfoSync().windowWidth*2){
      this.setData({
        nowImgH:nowImgH
      })
    }    
  },
})