// pages/LIVEVIDEO//pages/registerShop/registerShop.js
// pages/LIVEVIDEO//pages/userLive/register.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRule: true,//是否同意规则
    group_detail: {},
    isTeam: true,//是否团队结算 true：团队结算；false：邀请付费
    user_address: {},//盛放省市区
    upImgSrc1:'',//身份证正面
    upImgSrc2:'',//身份证反面
    upImgSrc3:'',//营业执照正面
    upImgSrc4:'',//营业执照反面
    typeArr:[],//主营类目
    typeIndex: [0, 0],//类目索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    // 加载省市区数据
    let addId = 0;
    publicFun.addressEditGO(that, addId);

    that.pageFun();
    that.categoryFun();
  },
  // 基础配置项
  pageFun: function(result) {
    let that = this;
    let url = 'app.php?c=team&a=get_store_config';
    let data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, 'pageData', that,'')
  },
  pageData: function (res) {
    var that = this;
    that.setData({
      pageData: res.err_msg
    });
    if(res.err_msg.apply_info){
      let apyinfo = res.err_msg.apply_info;
      that.setData({
        "group_detail.shopName": apyinfo.store_name,
        "group_detail.adress": apyinfo.address,
        "group_detail.name": apyinfo.bank_user,
        "group_detail.banknum": apyinfo.bank,
        "group_detail.openBank": apyinfo.open_bank,
        "group_detail.idnum": apyinfo.id_card,
        "group_detail.licnumber": apyinfo.license_code,
        upImgSrc1: apyinfo.id_card_pic[0],
        upImgSrc2: apyinfo.id_card_pic[1],
        upImgSrc3: apyinfo.license_pic[0],
        ['province_name_arr[' + 0 + ']']: apyinfo.province_txt,
        ['city_name_arr[' + 0 + ']']: apyinfo.city_txt,
        ['country_name_arr[' + 0 + ']']: apyinfo.area_txt,
        ['typeArr[' + 0 + '][' + 0 + ']']: apyinfo.fcategory,
        ['typeArr[' + 1 + '][' + 0 + ']']: apyinfo.category,
      });      
    }
  },
  // 店铺类目
  categoryFun:function(){
    let that = this;
    let url = 'app.php?c=team&a=get_store_category';
    let data = {
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, 'categoryData', that,'')
  },
  categoryData: function (res) {
    var that = this;
    if(res.err_code == 0){
      that.setData({
        categoryData: res.err_msg
      });
      let typeArr=[],oneArr=[],twoArr=[];
      for(let i of res.err_msg){
        oneArr.push(i.name);      
      }
      typeArr.push(oneArr)
      for(let j of res.err_msg[0].children){
        twoArr.push(j.name);
      }
      typeArr.push(twoArr);
      that.setData({
        typeArr:typeArr
      });
      console.log(typeArr);  
    }
  },
  // 返回上一页
  goback:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  // 数据绑定
  bindShopName: function (e) {//店铺名称
    this.setData({
      "group_detail.shopName": e.detail.value
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
  bindName: function (e) {//持卡人姓名
    this.setData({
      "group_detail.name": e.detail.value
    })
  },
  bindBanknum: function (e) {//银行卡
    this.setData({
      "group_detail.banknum": e.detail.value
    })
  },
  bindOpenBank: function (e) {//开户行
    this.setData({
      "group_detail.openBank": e.detail.value
    })
  },
  bindIdnum: function (e) {//身份证
    this.setData({
      "group_detail.idnum": e.detail.value
    })
  },
  bindlicnum: function (e) {//营业执照
    this.setData({
      "group_detail.licnumber": e.detail.value
    })
  },
  // 主营类目
  pickerType:function(e){
    this.setData({
      typeIndex: e.detail.value
    })
  },
  pickerColumnType:function(e){
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      typeArr: this.data.typeArr,
      typeIndex: this.data.typeIndex
    };
    data.typeIndex[e.detail.column] = e.detail.value;
    if(e.detail.column == 0){
      let twoArr = [];
      for(let j of this.data.categoryData[data.typeIndex[0]].children){
        twoArr.push(j.name);
      }
      data.typeArr[1] = twoArr;
      data.typeIndex[1] = 0;
    }
    this.setData(data);
  },
  // 提交申请
  grouperSave:function(){
    let that = this;
    let pageConfig = that.data.pageData.required_field;
    if (!that.data.group_detail.shopName && pageConfig.show_store_name * 1) {
      return publicFun.warning('请填写店铺名称', that);
    }
    if (!that.data.group_detail.adress && pageConfig.show_store_location * 1) {
      return publicFun.warning('请填写详细地址', that);
    }
    if (!that.data.group_detail.name && pageConfig.show_bank_user * 1) {
      return publicFun.warning('请填写开卡人姓名', that);
    }
    let bankcoed = /^[0-9]*$/;//银行卡
    if ((!that.data.group_detail.banknum || !bankcoed.test(that.data.group_detail.banknum)) && pageConfig.show_bank * 1) {
      return publicFun.warning('银行卡号码不能为空或错误', that);
    }
    if (!that.data.group_detail.openBank && pageConfig.show_open_bank * 1) {
      return publicFun.warning('请填写开户行', that);
    }
    let codereg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//身份证
    if ((!that.data.group_detail.idnum || !codereg.test(that.data.group_detail.idnum)) && pageConfig.show_id_card * 1) {
      return publicFun.warning('身份证号码不能为空或错误', that);
    }
    if ((that.data.upImgSrc1 == '' || that.data.upImgSrc2 == '') && pageConfig.show_id_card_pic * 1) {
      return publicFun.warning('请上传身份证图片', that);
    } else if(pageConfig.show_id_card_pic * 1) {
      let imgSrc = [];
      imgSrc.push(that.data.upImgSrc1);
      imgSrc.push(that.data.upImgSrc2);
      that.setData({
        "group_detail.imgSrc": imgSrc
      });
      console.log(that.data.group_detail.imgSrc)
    }
    // let licreg = /(^(?:(?![IOZSV])[\dA-Z]){2}\d{6}(?:(?![IOZSV])[\dA-Z]){10}$)|(^\d{15}$)/;//营业执照
    // if ((!that.data.group_detail.licnumber || !licreg.test(that.data.group_detail.licnumber)) && pageConfig.show_license_code * 1) {
    //   return publicFun.warning('营业执照号码不能为空或错误', that);
    // }
    if (!that.data.group_detail.licnumber && pageConfig.show_license_code * 1) {
      return publicFun.warning('营业执照号码不能为空', that);
    }
    if (that.data.upImgSrc3 == '' && pageConfig.show_license_pic * 1) {
      return publicFun.warning('请上传营业执照图片', that);
    } else if(pageConfig.show_license_pic * 1) {
      let imgSrc1 = [];
      imgSrc1.push(that.data.upImgSrc3);
      that.setData({
        "group_detail.imgSrc1": imgSrc1
      });
      console.log(that.data.group_detail.imgSrc)
    }
    if (!that.data.isRule) {//不同意规则的提示
      return publicFun.warning('请同意勾选协议', that);
    }
    let typeIndex = that.data.typeIndex;
    let params = {
      store_id: app.globalData.store_id || common.store_id,
      store_name: that.data.group_detail.shopName,
      province: this.data.province_code_arr[this.data.province_index],
      city: this.data.city_code_arr[this.data.city_index],
      area: this.data.country_code_arr[this.data.country_index],
      address: that.data.group_detail.adress,
      open_bank: that.data.group_detail.openBank,
      bank: that.data.group_detail.banknum,
      bank_user: that.data.group_detail.name,
      id_card: that.data.group_detail.idnum,
      id_card_pic: that.data.group_detail.imgSrc,
      license_code: that.data.group_detail.licnumber,
      license_pic: that.data.group_detail.imgSrc1
    }
    if(that.data.categoryData){
      params.sale_category_fid = that.data.categoryData[typeIndex[0]].cat_id
      if(that.data.categoryData[typeIndex[0]].children.length > 0){
        params.sale_category_id = that.data.categoryData[typeIndex[0]].children[typeIndex[1]].cat_id
      }
    }
    let url = "app.php?c=team&a=create_store";
    common.post(url, params, function (res) {
      if (res.err_code == 0) {
        publicFun.warning('提交成功', that);
        that.setData({
          'pageData.apply_status': 2
        });
        console.log('提交成功');
      }
    }, '')
  },
  // 上传身份证/营业执照
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
          if (imgtype == 'upImgSrc1') {//身份证正面
            that.setData({
              upImgSrc1: _res.err_msg
            })
          } else if(imgtype == 'upImgSrc2') {//身份证反面
            that.setData({
              upImgSrc2: _res.err_msg
            })
          } else if(imgtype == 'upImgSrc3') {//营业执照正面
            that.setData({
              upImgSrc3: _res.err_msg
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
  // 付费开通添加订单
  orderFun:function(){
    let that = this;
    let url = 'app.php?c=drp&a=add_order',
    data = {
      store_id: app.globalData.store_id || common.store_id
    };
    common.post(url, data, function(){
      that.setData({
        orderData: res.err_msg
      });
      that.payFun();
    }, '')
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 获取图片的高
  imgHeight:function(e){
    publicFun.imgHeight(e,this);
  }
})