var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var area = require('../../utils/area.js');
var app = getApp();
Page({
  data: {
    dialog: {
      dialogHidden: true,
      titleMsg: "为了您的正常使用，请在设置plus页允许小程序使用您的通讯地址",
      determineBtnTxt: "去开启",
      openType: "openSetting"
    },
    order_no: '',
    customMessage: '', //客户留言
    point: 0, //使用积分
    integralpointPage: 0, //使用积分
    rewardPrice: 0, //满减金额
    integralPricePage: 0, //抵换积分金额
    discountPrice: 0, //折扣价格
    productPrice: 0, //自营商品价格
    couponMoneysSelf: 0, //自营优惠券
    presaleReducePrice: 0, // 预售定金减免金额
    presaleDingjin:0,
    currentTab: 0,
    couponTab: 220,
    paymentData: '',
    user_address: {},
    pay_page: "pay_page",
    address_id: 0,
    postageData: '',
    index: 0,
    paymentPostage: 'express',
    order_post: 0,
    addressEditData: '',
    province_name_arr: [],
    province_code_arr: [],
    province_index: 0,
    province_code: 0,
    city_name_arr: ['请选择'],
    city_code_arr: [],
    city_index: 0,
    city_code: 0,
    country_name_arr: ['请选择'],
    country_code_arr: [],
    country_index: 0,
    country_code: 0,
    postage: true,
    integral: '',
    oppenShopList: false,
    open_local_physical_list: false,
    oppenCoupon: false,
    oppenCouponTxt: [],
    oppenCouponMoney: [],
    oppenCouponId: [],
    couponMoney: 0,
    paymentMoney: 0,
    date: '2016-09-01',
    time: '12:01',
    positionError: false,
    flag: true,
    flags: true,
    no_postage_text: "该地区不支持配送，请选择其它区域",
    showMessage: false, // 查看留言信息
    passwordInputShow: false,
    inputPassword: "",
    passwordInputFocus: true,
    currentAccountRemainMoney: "",
    no_password: 0,
    can_click: true,
    giveMsg:'',
    freight_stauts: '',//添加运费请求之前提交订单是否可点击判断post
    //上门服务
    homeservicetime:'',
    objectMultiShow: [],
    objectMultiArray: [],
    multiArray: [],
    multiIndex: [],
    multiIndex: [0, 0],//默认显示的内容
    serviceShow:0,
    disabledTime:false,
    isTrue:false,//是否选择金豆
    open_community_group:0,//是否是社区团购模式订单
    checkPay:'',//选择支付方式
    goodsType:'',//商品模式（预售，预约。。。）
  },

  
  onLoad: function(e) { // 页面渲染完成
    var that = this;
    console.log("eeee",e, that.data)
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    if (e.paystatus =='waitpay'){
      this.setData({
        paystatus: e.paystatus,
        freight_stauts:'get_price'
      })
    }
    this.setData({
      order_no: e.order_no,
      api_url: common.Url,
      can_click: false
    });
    if(e.goodsType){
      that.setData({
        goodsType: e.goodsType
      });
    }
    if(e.joinGroup){
      that.setData({
        joinGroup: e.joinGroup
      });
    }
    // 取消不可支付
    var st_out = setTimeout(() => {
      that.setData({
        can_click: true
      })
      clearTimeout(st_out);
    }, 1500)
    
    //读取跳转前参数
    if (e.cfrom){
      this.setData({ cfrom: e.cfrom})
    }
  },
  onShow(){
    //获取用户上次打开小程序距重新获取地理位置
    app.getTimeDifference();
    
    let that=this;
    common.post('app.php?c=order&a=pay&order_no=' + that.data.order_no, '', "paymentData", that);

    console.log(that.data.paymentData.name)
    that.getTomorrow()
    //判断是否是社区团购模式
    publicFun.open_community_group(that); //判断是否是社区团购模式
    //重置支付方式选择
    that.setData({
      checkPay:''
    })
  },
  onlaunch: function (e) {
    var that=this;
  },
  //获取明天时间
  getTomorrow:function(){
    var that=this;
    var nowDay=new Date();
    var tomorrow = new Date(nowDay.getTime() + 24 * 60 * 60 * 1000);
    var year = tomorrow.getFullYear();
    var month = tomorrow.getMonth() + 1;
    var day = tomorrow.getDate();
    let tomorrowDate = year + "-" + month + "-" + day;
    console.log(tomorrowDate,"tomorrowDate")
    that.setData({
      tomorrowDate: tomorrowDate
    })
  },
  //跳转详情刷新
  onUnload: function () {
    let that=this
    if (this.data.cfrom == "goodsDetail" && !this.data.readyGo){
      var product_id = wx.getStorageSync("product_id");
      console.log(that.data, that.data.paymentData, that.data.paymentData.product_list[0].point_exchange_num,"/////////")
      if (that.data.paymentData.product_list[0].point_exchange_num!=0){
        wx.redirectTo({
          url: '/pages/POINT/pages/product/details?product_id=' + product_id,//指定界面积分
        })
      }else{
        wx.redirectTo({
          url: '/pages/product/details?product_id=' + product_id,//指定界面
        })
      }

      
    }
    
  },
  setPasswordInputShow() {
    let that = this;
    that.setData({
      passwordInputShow: !this.data.passwordInputShow,
      inputPassword: "",
      checkPay:''
    });
    publicFun.unPay(that);
  },
  passwordInput(e) {
    let that = this;
    let {
      value
    } = e.detail
    that.setData({
      inputPassword: e.detail.value
    })
    if (value.length === 6) {
      that.setData({
        passwordInputShow: false,
        checkPay:''
      })
      //完成密码输入，模拟点击支付
      publicFun.paymentButton(that, {
        target: {
          dataset: {
            type: "balance",
            no_password: 0
          }
        }
      });
      if(that.data.goodsType != '' && that.data.canPay){//预售/预约商品
        publicFun.alreadyPay(that);
      }
    }
  },
  focusPassword() {
    this.setData({
      passwordInputFocus: true
    })
  },
  defaultAddress: function(e) { //修改默认地址
    var that = this;
    publicFun.defaultAddress(e, that, '', 'go');
  },
  addressEditGO: function(e) { //编辑新添地址
    var that = this;
    let addId = e.target.dataset.addid;
    publicFun.addressEditGO(that, addId);
  },
  closeAddress: function(e) { //关闭地址弹框
    var that = this;
    publicFun.closeAddress(that);
  },
  paymentData: function(result) {
    var that = this;
    // 取消不可支付
    var st_out = setTimeout(() => {
      that.setData({
        can_click: true
      })
      clearTimeout(st_out);
    }, 1000)
    if (result.err_code == 0) {
      let isVspallinpay = true
      for (var i = 0; i < result.err_msg.pay_list.length;i++){
        if (result.err_msg.pay_list[i].type =="vspallinpay"){
          isVspallinpay=false
        }
      }

      this.setData({
        paymentData: result.err_msg,
        rewardPrice: 0,
        nowPhysical: result.err_msg.now_physical,
        integralPricePage: 0 ,
        isVspallinpay: isVspallinpay,
        currentAccountRemainMoney:result.err_msg.balance_cash 
      })

      let datas = that.data.paymentData;
      var locals = that.data.paymentData.product_list[0].special_product_type;
      let poiTotalList = datas.daytimedatas;
      // 上门服务 给picker读取
      var daytimedatas=that.data.paymentData.daytimedatas;
      if (that.data.paymentData.is_have_home_service==1){
        if (daytimedatas && daytimedatas.length > 0) {
          var wheels = new Array();
          wheels[0] = new Array();
          wheels[1] = new Array();
          for (var i = 0; i < daytimedatas.length; i++) {
            wheels[0].push({
              id: i,
              name: daytimedatas[i].datename + " " + daytimedatas[i].weekhz,
            });
            for (var j = 0; j < daytimedatas[i].timedata.length; j++) {

              wheels[1].push({
                id: j,
                name: daytimedatas[i].timedata[j],
                parentId: i,
              });
            }
          }
          let data = {
            objectMultiShow: that.data.objectMultiShow,
            objectMultiArray: that.data.objectMultiArray,
            multiArray: that.data.multiArray,
            multiIndex: that.data.multiIndex,
          }
          data.objectMultiArray = wheels;
          data.objectMultiShow = data.objectMultiArray.map((item, index) => {
            if (index > 0) {
              item = item.filter(i => i.parentId === data.objectMultiArray[index - 1][0].id)
            }
            return item
          })
          data.multiArray = data.objectMultiShow.map(item => {
            item = item.map(i => i.name)
            return item
          })
          console.log(data.multiIndex)
          // 数据更新
          that.setData(data)
          that.setData({
            is_door_servce: true
          })
        } else {
          wx.showModal({
            title: '',
            content: '商铺暂未开通服务时间',
            showCancel: false,
            confirmText: '知道了'
          })
          that.setData({
            is_door_servce:false
          })
          return;
        }
      }
      
      // 上门服务end


      // // 是否折叠商品列表
      if (datas.product_list.length<5){
        that.setData({
          NUM: datas.product_list.length,
          slide:'down',
          slide_txt: '收起'
        })
      }else{
        that.setData({
          NUM: 5,
          slide: 'up',
          slide_txt: '展开全部'
        })
      }
      let address_id = this.data.paymentData.wxapp_address.address_id;
      // 预售定金单、尾款单
      let presale_type = '';
      if (datas.presale_tip) {
        presale_type = datas.presale_tip.presale_type;
      };
      that.setData({
        presale_type: presale_type
      })
      if (presale_type == 'presale_second_pay') {
        //预付款参数
        that.setData({
          presaleReducePrice: datas.presale_info.privileged_cash, 
          presaleDingjin: datas.presale_info.dingjin
        })
      }
      //上门自提
      if ((datas.logistic_list[0] && datas.logistic_list[0].type == 'selffetch') || that.data.paymentPostage == 'selffetch')       {
        datas.shopData = datas.now_physical;
        datas.order.postage=0;
      }
     
      // && data.now_physical.weight_delivery_fee != 1
      //(下面if里的条件)  && this.data.paymentData.logistic_list[0].type != 'local'
      if ((datas.order.status * 1 == 0) && (address_id != '') && (address_id != undefined) && (datas.order.type * 1 != 10) && that.data.presale_type != 'presale_first_pay' && datas.logistic_list[0] && that.data.postage != false && datas.logistic_list[0].type != 'selffetch') {
        console.log("freight1-----------")
        publicFun.freight(that, address_id);//查询物流运费信息
      }
      if (datas.order.type * 1 == 10 || datas.logistic_list[0]&&datas.logistic_list[0].type == 'selffetch') {
        that.setData({
          paymentPostage:'selffetch'
        })
      }
      if (datas.selffetch_list != undefined && datas.selffetch_list != '') {
        for (var i = 0; i < datas.selffetch_list.length; i++) {
          let juli = publicFun.expressDistance(datas.selffetch_list[i].lat, datas.selffetch_list[i].lon);
          datas.selffetch_list[i].juli = juli;
        }
        //    到店自提，如果只有一个可用门店，则自动切换门店
        let validStoreIndex = 0;
        let invalidSelffetchCount = Object.keys(datas.selffetch_list).reduce((pre, cur) => {
          let curStore = datas.selffetch_list[cur]
          if (curStore.is_valid == 1) {
            validStoreIndex = cur;
          }
          return pre + parseInt(curStore.is_valid)
        }, 0)
        if (invalidSelffetchCount === 1) {
          datas.shopData = datas.selffetch_list[validStoreIndex];
          datas.order.postage = 0;
          that.setData({
            'paymentData': datas
          })
          publicFun.paymentMoney(that);
        }
      }
      for (var i = 0; i < datas.reward_list.length; i++) {
        datas.reward_list[i].reward_content = (datas.reward_list[i].reward_content).replace(/<[^>]+>/g, "")
      }
      that.data.couponMoney = that.data.couponMoney*1;
      //待支付订单
      if (datas.order.status == '1') {
        if (datas.user_coupon_list != '') {
          that.data.couponMoney=0;
          for (var i = 0; i < datas.user_coupon_list.length; i++) {
            that.data.couponMoney += datas.user_coupon_list[i].face_money * 1;
          }
        }
        if (typeof datas.order_point !== 'undefined') {
          that.data.integralPricePage = datas.order_point.money
        }
        that.setData({
          integralPricePage: that.data.integralPricePage,
          couponMoney: publicFun.toDecimal(that.data.couponMoney)
        })
      }
      if (datas.order.shipping_method == 'selffetch') {
        datas.shopData = datas.user_address;
        datas.shopData.logo = datas.store.logo;

        that.setData({
          paymentPostage: 'selffetch',
          oppenShopList: false
        })
      }
      datas.order.add_time_txt = publicFun.setDate(datas.order.add_time)
      publicFun.paymentMoney(that)
      publicFun.product_list(that); //计算直营商品价格以及折扣

      // 预约信息
      if (datas.user_address) {
        datas.name = datas.user_address.name;
        datas.tel = datas.user_address.tel;
      }
      this.setData({
        paymentData: datas
      })
      publicFun.getNowFormatDate(that) //获取当前时间日期
      publicFun.integral(that); //积分计算
      //如果没有查运费方法、积分计算后要重新计算金额
      if (datas.logistic_list && datas.logistic_list.length==0){
        publicFun.paymentMoney(that)
      }
       //同城配送
       if ((datas.logistic_list[0] && datas.logistic_list[0].type == 'local') || that.data.paymentPostage=='local') {
        that.setData({
          paymentPostage: 'local',
          postage: false
        })
        // publicFun.integral(that); //积分计算
        // publicFun.product_list(that); //计算直营商品价格以及折扣
        // publicFun.paymentMoney(that);
        publicFun.localExpress(that);

      }

    };
  },
  paymentButton: function(e) { // 微信支付
    var that = this;
    that.setData({
      readyGo:true
    })
    if (that.data.can_click == false) return;
    
    if(e){
      const {type} =e.currentTarget.dataset;
      let paytype=type;
      let currentReMoney=that.data.currentAccountRemainMoney*1;//当前余额
      paytype = (type=='balance' && currentReMoney<that.data.paymentMoney*1)? '' : paytype;//可用余额为0的时候不选中
      this.setData({
        checkPay:paytype
      })
      //余额支付下是否需要填写密码
      if(type=="balance"){
        const {ispwd}=e.currentTarget.dataset;
        // 如果支付金额为0，直接跳转支付
        if(that.data.paymentMoney*1==0){
          publicFun.paymentButton(that, e);
          return;
        }
        // 支付验证
        if(ispwd===0){
          wx.navigateTo({
            url: '/pages/setPassword/index',
          })
          return;
        }else{
            //余额为0的情况下不显示弹窗
            if(currentReMoney===0 || currentReMoney===""){           
              publicFun.warning("当前可用余额为0，请选择其他支付方式", that);
              return;
            }
            else if(currentReMoney<that.data.paymentMoney*1){
              publicFun.warning("余额不足，请选择其他支付方式", that);
              return;
            }
            //弹出支付密码
            that.setData({
              passwordInputShow:true,//展示支付密码弹窗
              show_pay_list:false,//关闭支付选项弹窗
            })
        }
      }else{
        //其他支付方式
        publicFun.paymentButton(that, e)
      }
    }
  
    
    
  },
  // 支付按钮置灰点击的提示信息
  unpaymentbtn:function(){
    let that = this
    publicFun.warning(that.data.paymentData.channel.privilege_name+'余额不足', that);
  },
  addressGo: function(e) { //点击头部我的地址-出现选择地址列表
    var that = this;
    let addId = e.currentTarget.dataset.addid;
    let count = this.data.paymentData.wxapp_address.list_count;
    if (count == 0) { //判断是否有地址列表
      // publicFun.addressEditGO(that, e, 'payment') //添加新地址
      // wx.navigateTo({ url: '/pages/user/address/addressEdit?addid=' + addId+'&comFrom=payment' })
      wx.navigateTo({
        url: '/pages/user/address/addressEdit?paymentPostage=' + that.data.paymentPostage,
      })

    } else {
      wx.navigateTo({
        url: '/pages/user/address/index?order_no=' + that.data.paymentData.order.order_no_txt + '&address=' + that.data.paymentData.wxapp_address.address_id + '&paymentPostage=' + that.data.paymentPostage,
      })
    }



    // var that = this;
    // let addid = e.target.dataset.addid;
    // if (that.data.order_no) {
    //   wx.navigateTo({
    //     url: '/pages/user/address/addressEdit?addid=' + addid + '&order_no=' + that.data.order_no + '&address=' + that.data.address
    //   })
    // } else {
    //   wx.navigateTo({ url: '/pages/user/address/addressEdit?addid=' + addid })
    // }



  },
  pickerProvince: function(e, p_index) { //省份选择
    var that = this;
    publicFun.pickerProvince(that, e, p_index)
  },

  pickerCity: function(e, c_index) { //市级选择
    var that = this;
    publicFun.pickerCity(that, e, c_index)
  },

  pickerCountry: function(e) { //县区
    var that = this;
    publicFun.pickerCountry(that, e)
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  addressSave: function(e) {
    var that = this;
    publicFun.addressSave(that, e, 'go')
  },
  integral: function (e) { //选择积分
    var that = this;
    let integral = '';
    let integralPricePage = 0;
    let integralpointPage = 0;
    if (that.data.integral == '') {
      integral = 'active';
      integralPricePage = that.data.integralPrice;
      integralpointPage = that.data.point;
    }
    that.setData({
      integral,
      integralPricePage,
      integralpointPage
    });
    if (that.data.paymentPostage == 'local') {
      publicFun.localExpress(that,'inteChanged');
    }
    publicFun.paymentMoney(that)
  }, 
  // integral: function (e) { //选择积分
  //   var that = this;
  //   if (that.data.integral == '') {
  //     that.data.integral = 'active';
  //     that.data.integralPricePage = that.data.integralPrice;
  //     that.data.integralpointPage = that.data.point;
  //   } else {
  //     that.data.integral = '';
  //     that.data.integralPricePage = 0;
  //     that.data.integralpointPage = 0;
  //   }
  //   if (that.data.paymentPostage == 'local') {
  //     publicFun.localExpress(that)
  //   }
  //   publicFun.paymentMoney(that)
  //   that.setData({
  //     integral: that.data.integral,
  //     integralPricePage: that.data.integralPricePage,
  //     integralpointPage: that.data.integralpointPage
  //   })
  // },
  productListSwichNav: function(e) { //门店选择
    var that = this;
    let index = e.target.dataset.index;
    that.data.paymentData.shopData = that.data.paymentData.selffetch_list[index];
    that.setData({
      paymentData: that.data.paymentData
    })
    setTimeout(function() {
      that.oppenShopList();
    }, 300)
    publicFun.productListSwichNav(e, that);
  },
  CouponSwichNav: function(e) { //选取优惠券
    var that = this;
    //配送方式为同城配送计算当前位置
    let paymentPost = this.data.paymentPostage;
    if (paymentPost =='local'){
      publicFun.getLocation(this);
    }
    publicFun.CouponSwichNavTab(that, e);
    if (this.data.paymentPostage == "local") {
      publicFun.localExpress(that);
      if(that.data.postage != false){
        let address_id = that.data.paymentData.wxapp_address.address_id;
        console.log("freight-2-----------")
        publicFun.freight(that,address_id)
      }
    }

    publicFun.paymentMoney(that);
  },
  paymentPostage: function(e) { //到店自提和物流快递
    console.log(e.target.dataset.paymentpostage)
    var that = this;
    let address_id = this.data.paymentData.wxapp_address.address_id;
    //新tab项切换时，已选积分重置为0，重新计算
    that.setData({
      integralPricePage:0
    })
    console.log("----------", this.data.integral);
    if (that.data.paymentData.order.status * 1 == 1) {
      return
    }
    that.setData({
      can_click: false
    }); //是否可以立即支付标识
    // 取消不可支付
    var st_out = setTimeout(() => {
      that.setData({
        can_click: true
      })
      clearTimeout(st_out);
    }, 1000)
    if (e.target.dataset.paymentpostage == 'express') {//快递物流
      that.setData({ //从同城配送过来的时候还需设置TRUE
        postage: true,
        paymentPostage: 'express'
      })
      that.data.paymentData.order.postage = that.data.order_post;
      publicFun.paymentMoney(that);
    }
    //重置postage和no_postage_text
    that.setData({
      no_postage_text: "该地区不支持配送，请选择其它区域",
      postage: true
    })
    if (e.target.dataset.paymentpostage == 'selffetch') { //上门自提
      that.setData({
        paymentPostage: 'selffetch'
      })
      that.data.paymentData.shopData = that.data.paymentData.now_physical;
      
      // console.log("-----", that.data.order_post)
      // that.oppenShopList()//上门自提取消门店选择
      that.data.paymentData.order.postage = 0;
      that.setData({
        paymentData: that.data.paymentData
      })
      
      publicFun.paymentMoney(that);
    }
    if (e.target.dataset.paymentpostage == 'local') {//同城配送
      that.setData({
        paymentPostage: 'local'
      })
      publicFun.integral(that);
      publicFun.localExpress(that);//选择同城配送相关逻辑处理
      that.setData({
        'paymentData': that.data.paymentData
      })
      if (!that.data.postage) {
        return wx.showModal({
          title: '',
          content: that.data.no_postage_text,
          showCancel:false,
          confirmText:'知道了',
          confirmColor:that.data.themeColorValue
        })
      }
      publicFun.paymentMoney(that); 
    }
    //查询物流运费信息-上门自提不计算运费 
    // 11.26tc同城配送修改
    // if (e.target.dataset.paymentpostage == 'express' || e.target.dataset.paymentpostage == 'local') {
      if (e.target.dataset.paymentpostage == 'express' ) {
      // weight_delivery_fee   重量计算 已算好的配送费
      // localfeetype 1表示是重量计算
      // if (e.target.dataset.paymentpostage == 'local' && this.data.paymentData.now_physical.localfeetype==1){
        //同城配送下的重量计算也不重新取运费数据
      // }else{
        // console.log("freight-3-----------")
        // publicFun.freight(that, address_id, e.target.dataset.paymentpostage);
      // }
      publicFun.freight(that, address_id, e.target.dataset.paymentpostage);
      
    }
    //积分计算
    publicFun.integral(that);

    //如入口=上门自提进入，积分计算完毕，最后执行价格计算，更新dom
    if (e.target.dataset.paymentpostage == 'selffetch'){
      publicFun.paymentMoney(that);
    }
      
  },
  oppenShopList: function(e) { //店铺门店选择
    var that = this;
    that.data.paymentData.order.postage = 0;
    that.setData({
      'paymentData': that.data.paymentData
    })
    publicFun.paymentMoney(that);
    if (that.data.oppenShopList == true) {
      that.data.oppenShopList = false
    } else {
      that.data.oppenShopList = true;
    }
    that.setData({
      'oppenShopList': that.data.oppenShopList
    })
  },
  //显示当前门店信息
  // showShopInfo:function(){
  //   let data = this.data.paymentData;
  //   if (data){
  //     this.setData({
  //       nowPhysical: data.now_physical
  //     })
  //   }
  // },
  toggleLocalPhysicalList: function() {
    this.setData({
      open_local_physical_list: !this.data.open_local_physical_list,
    })
  },
  switchLocalPhysical: function(e) {
    let index = e.currentTarget.dataset.index
    let physical = this.data.paymentData.local_physical_list[index];
    let now_physical = this.data.paymentData.now_physical;
    if (!this.data.paymentData.now_physical) {
      wx.showModal({
        title: '提示',
        content: '该店家不支持同城配送',
      })

    }
    if (physical.pigcms_id == now_physical.pigcms_id) {
      this.toggleLocalPhysicalList()
      return false
    } else {

      console.log(physical);
      this.setData({
        'paymentData.now_physical': physical,
        postage: true
      })
      this.toggleLocalPhysicalList()
      publicFun.localExpress(this)
      publicFun.paymentMoney(this);
    }
  },
  oppenCoupon: function(e) { //选择优惠券
    var that = this;
    let flag =true;
    if(e){
      flag = e.currentTarget.dataset.flag ? true : false
    }
    if (typeof e !== 'undefined' && (!flag)) {
      let index = e.target.dataset.index;
      that.data.paymentData.user_coupon = that.data.paymentData.user_coupon_list[index];
      that.setData({
        paymentData: that.data.paymentData,
        cuponIndex: index
      })
    }
    if (that.data.oppenCoupon == true) {
      that.data.oppenCoupon = false
    } else {
      that.data.oppenCoupon = true;
    }
    that.setData({
      'oppenCoupon': that.data.oppenCoupon
    })
  },
  calling: function(e) { //拨打电话
    let num = e.target.dataset.num;
    publicFun.calling(num)
  },
  bindAppointmentName: function(e) { //设置预约人姓名
    var that = this;
    let name = e.detail.value;
    if (name == '' || name == undefined) {
      publicFun.warning('请填写姓名', that);
    }
    this.setData({
      'paymentData.name': name,
      'flags': true
    })

  },
  bindAppointmentTel: function(e) { //设置预约人电话
    var that = this;
    let num = e.detail.value;
    if (num == '' || num == undefined) {
      publicFun.warning('请填写手机号', that);
    }
    if (!(num).match(/\d{11}/)) {
      publicFun.warning('请填写合法手机号', that);
      return false;
    }

    this.setData({
      'paymentData.tel': num,
      'flags': true
    })
  },
  bindDateChange: function(e) { //选择日期
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function(e) { //选择时间
    this.setData({
      time: e.detail.value
    })
  },
  swichNav: function(e) {
    var that = this;
    publicFun.swichNav(e, that)
  },
  customMessage: function(e) {
    this.setData({
      customMessage: e.detail.value
    })
  },
  showMessage: function(e) { //查看留言
    var that = this;
    that.setData({
      'showMessage': true
    })
  },
  showPayment: function(e) { //查看订单(留言弹窗内)
    var that = this;
    that.setData({
      'showMessage': false
    })
  },
  chooseWXAddress: function() { // 一键使用微信收货地址
    var that = this;
    publicFun.chooseWXAddress({
      that: that,
      go: 'go'
    });
  },
  chooseLocation: function(e) {
    publicFun.chooseLocation(this, function(res) {})
  },
  //提交按钮
  readySubmit: function(e) {
    let that = this;

    var address_id = that.data.paymentData.wxapp_address.address_id;
    var address = that.data.paymentData.wxapp_address.address;
    let payType = e.target.dataset.type || e.currentTarget.dataset.type;
    if (that.data.paymentData.product_list[0].special_product_type == '95') {
      if (that.data.homeservicetime == "" && that.data.paymentData.order.homeservicetime == "") {
        that.setData({
          flags: true,
        });
        return publicFun.warning('请选择服务时间', that)
      }
      if (that.data.paymentData.order.homeservicetime != "" && that.data.homeservicetime == "") {
        that.data.homeservicetime = that.data.paymentData.order.homeservicetime;
  
      }
    }
    if (that.data.paymentPostage == 'express' && !address_id && !address && that.data.paymentData.order.virtual_goods_order*1 != 1) {
      that.setData({
        flags: true
      });
      return publicFun.warning('请选择收货地址', that)
    }
    if (typeof that.data.paymentData.shopData === 'undefined' && that.data.paymentPostage == 'selffetch') {
      that.setData({
        flags: true
      })
      return publicFun.warning('请选择上门自提门店', that);
    }
    // 到店自提
    if (typeof that.data.paymentData.shopData !== 'undefined' && that.data.paymentPostage == 'selffetch') {
      if (that.data.paymentData.order.type != 10 && that.data.paymentData.order.product_coupon != 1) {
        let data = {
          selffetch_id: that.data.paymentData.shopData.pigcms_id,
          selffetch_name: that.data.paymentData.name,
          selffetch_phone: that.data.paymentData.tel,
          selffetch_date: that.data.date,
          selffetch_time: that.data.time,
          orderNo: that.data.order_no,
          shipping_method: 'selffetch',
          msg: that.data.customMessage,
          user_coupon_id: that.data.oppenCouponId,
          payType: payType,
          point: that.data.integralpointPage,
          point_money: that.data.integralPricePage,
          is_app: 'store_wxapp',
        }
        if (data.selffetch_name == '' || data.selffetch_name == undefined) {
          that.setData({
            flags: true
          });
          return publicFun.warning('请填写姓名', that);
        }
        if (data.selffetch_phone == '' || data.selffetch_phone == undefined) {
          that.setData({
            flags: true
          });
          return publicFun.warning('请填写手机号', that);
        }
        if (!(data.selffetch_phone).match(/\d{11}/)) {
          that.setData({
            flags: true
          });
          return publicFun.warning('请填写合法手机号', that);
        }
      }
    }
    //同城配送
    if (!that.data.paymentData.now_physical.pigcms_id && that.data.paymentPostage == 'local') {
      that.setData({
        flags: true
      });
      return publicFun.warning('请选择收货地址', that)
      // 这里需要填用户选择的门店id)
    }

    //数据还在请求中不给提交
    console.log('paystatus===========', that.data.paystatus,that.data.paymentPostage)
    let url = 'app.php?c=subscribe_message&a=get_message',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        uid: getApp().globalData.my_uid
      };
      if(that.data.paymentPostage == 'selffetch' && that.data.joinGroup != 'joinGroup' && that.data.goodsType != 'presale' && that.data.goodsType != 'appoint'){//自提
        data.event = 'self_fetch'
      }else if(that.data.joinGroup == 'joinGroup'){//拼团
        data.event = 'tuan'
      }else if(that.data.goodsType == 'presale'){//预售
        data.event = 'final_payment'
      }else if(that.data.goodsType == 'appoint'){//预约
        data.event = 'booking'
      }else{//普通订单
        data.event = 'order_submit'
      }
    common.post(url, data, function (result) {
      if(result.err_code == 0){
        let tmpid = result.err_msg;
        if(tmpid && tmpid[0] && tmpid[0].length>0){
          wx.requestSubscribeMessage({
            tmplIds: tmpid[0],
            success(res) {
              let _state = null;
              tmpid[0].map(function(item,index){
                if(res[item] == "accept"){
                  _state = "accept";
                  if(tmpid[1] && tmpid[1].length>0){
                    if(item == tmpid[1][0]){
                      that.setData({
                        canPay: true
                      });
                    }
                  }
                }else if(res[item] == "ban"){
                  _state = "ban"
                }
              });
              if(_state == "accept"){
                publicFun.warning('授权成功', that);              
              }else if(_state == "ban"){
                publicFun.warning('请开启订阅消息方便接收消息提醒', that);
              } else { //点击取消授权
                publicFun.warning('授权失败', that);
              }
            },
            fail(res) {
              publicFun.warning('请开启订阅消息方便接收消息提醒', that);
            },
            complete(res){
              that.showPay();
            }
          })
        }else{
          that.showPay();
        }
      } 
    }, '',function(){
      that.showPay();
    })
  },
  showPay:function(){
    let that = this;
    if (that.data.freight_stauts=='post'){
      return;
    }
    if (that.data.is_door_servce == false) {
      wx.showModal({
        title: '',
        content: '商铺暂未开通服务时间',
        showCancel:false,
        confirmText:'知道了'
      })
      return;
    }    
    //显示支付按钮列表&收件人地址不可以再更改
    that.setData({
      show_pay_list: true,
      forbidChangeAddress:true
    }); 
  },

  //取消显示提交订单列表&取消禁止修改收件人地址
  hidePayList: function() {
    let that = this;
    that.setData({
      show_pay_list: false,
      forbidChangeAddress:false,
      checkPay:''
    });
    publicFun.unPay(that);
  },
  //显示展开商品列表
  showList:function(){
    let slide = this.data.slide;
    let datas = this.data.paymentData;
    let len_goods = datas.product_list.length;
    // 是否折叠商品列表
    let NUM=5;
    if (slide=='up'){
      this.setData({
        slide:'down',
        NUM: len_goods,
        slide_txt:'收起'
      })
    }else{
      this.setData({
        slide: 'up',
        NUM: 5,
        slide_txt: '展开全部'
      })
    }
  },
  // 点击展示商品留言
  showDialogMsg:function(){
    let that=this;
    this.setData({
      showModal: true
    })
  },
  //取消留言
  onCancel:function(){
    this.setData({
      showModal:false,
      customMessage:''
    })
  },
  //输入留言信息
  inputChange:function(e){ 
    let value = e.detail.value.trim()
    this.setData({
      customMessage: value
    })
  },
  onConfirm:function(){
    //获取留言参数
    let giveMsg = this.data.customMessage ? this.data.customMessage:'';
    //清空输入框值&隐藏
    this.setData({
      showModal: false
    })
  },

  //上门服务
  bindMultiPickerChange: function (e) {
    var that=this;
    // console.log('picker发送选择改变，携带值为', e.detail.value,)
    var dates = that.data.objectMultiShow[0][e.detail.value[0]].name.split(' ')[0];//取年月日
    var time= that.data.objectMultiShow[1][e.detail.value[1]].name;//取时间段
    var subDate = dates + " " + time;//2019-07-20 15:00格式
    var mdates = that.data.objectMultiShow[0][e.detail.value[0]].name;
    var msubDate = mdates + " " + time;
   
    console.log(subDate,"subDatesubDate")
    that.setData({
      multiIndex: e.detail.value,
      homeservicetime: subDate,
      serviceShow:1,
      msubDate: msubDate,
    })
  },
  bindMultiPickerColumnChange: function (e) {
    var that=this;
    // console.log('修改的列为', e.detail.column, '，值为', e.detail.value,e);
    // 初始化数据
    var data = {
      objectMultiShow: that.data.objectMultiShow,
      multiArray: that.data.multiArray,
      multiIndex: that.data.multiIndex
    };

    // 改变第i列数据之后，后几列选择第0个选项（重置）
    data.multiIndex[e.detail.column] = e.detail.value;
    for (let i = e.detail.column; i < data.multiIndex.length - 1; i++) {
      data.multiIndex[i + 1] = 0
    }
    let arry = that.data.objectMultiArray
    for (let i = e.detail.column; i < data.multiIndex.length - 1; i++) {
      data.objectMultiShow[i + 1] = arry[i + 1].filter(item => item.parentId === data.objectMultiShow[i][data.multiIndex[i]].id)
      data.multiArray[i + 1] = data.objectMultiShow[i + 1].map(item => item.name)
    }
    // 数据更新
    that.setData(data);
    console.log(data, "datadatadata")
  },

  // 金豆选择
  goldenBeans:function(){
    let that = this;
    that.setData({
      isTrue: !that.data.isTrue
    })
  },
  oppeMap: function (e) {
    console.log(e)
    let latitude = parseFloat(e.currentTarget.dataset.lat)
    let longitude = parseFloat(e.currentTarget.dataset.long)

    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  saveRealName(e) {
    let url = 'app.php?c=foreign_trade&a=attestationAdd';
    if (!this.data.formArr.realname) {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'error',
      })
      return
    }
    let codereg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!this.data.formArr.code || !codereg.test(this.data.formArr.code)) {
      wx.showToast({
        title: '身份证号码错误',
        icon: 'error',
      })
      return
    }
    let telreg = /^1[34578]\d{9}$/;
    if (!this.data.formArr.phone || !telreg.test(this.data.formArr.phone)) {
      wx.showToast({
        title: '手机号错误',
        icon: 'error',
      })
      return
    }
    let params = {
      id: this.data.formArr.id,
      name: this.data.formArr.realname,
      phone: this.data.formArr.phone,
      id_card: this.data.formArr.code,
      id_card_a: '',
      id_card_b: '',
    }
    let that = this;
    common.post(url, params, function (res) {
      console.log('jieguo', res);
      that.closeRealname();
      publicFun.paymentButton(that, e)
    }, '')
  },
  closeRealname() {
    this.setData({
      playmanStatus: false
    })
  }
})
