var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp()
let page = 1;
Page({
  data: {
    confirmShow: false,
    shoppingData: {
      shoppingShow: false,
      shoppingCatData: '',
      specList: [{
        'vid': 1
      }, {
        'vid': 1
      }, {
        'vid': 1
      }],
      value: '',
      sku_id: '',
      shoppingNum: 1,
    },
    duration: 0,
    shoppingCatMoney: 0.00,
    shoppingCatNum: 0,
    shoppingCatTotalNum: 0,
    isActive: '',
    isActive1: '',
    isActive2: '',
    clickable: true, //购物袋是否能点击
    editCartText: '管理', // 编辑购物袋文案
    isEditActive: '', // 是否被选中编辑
    isEditActive1: '', // 是否被选中编辑
    isEditActive2: '', // 是否被选中编辑
    isLoadding: true, //结算状态提示
    isFormLoadding: true, //表单提交状态判断
    isforeignProductType: 0, //选中商品判断
    overseasList: [], //跨界商品列表
    hasforeign_product:false,
    hascommon_product:false,
    recommendedHomeList:'',
    next_page:'flase',
  },
  onLoad: function(e) {
    var that = this;
    //获取门店id[bugID1006925]
    let physical_id=wx.getStorageSync('physical_id');
    if(physical_id){
      this.setData({
        physical_id
      })
    }
    publicFun.setBarBgColor(app, that, 'white'); // 设置导航条背景色
    let url = '/pages/shoppingCat/index'
    publicFun.setUrl(url);
    wx.showLoading({
      title: '加载中',
    });
    var stout = setTimeout(() => {
      wx.hideLoading();
      clearTimeout(stout);
    }, 1000 * 5)
    
    // 新授权方式下锁粉新增
    if (e.scene != undefined) { // 预览模式
      var scene = decodeURIComponent(e.scene);
      if (scene) {
        app.globalData.store_id = scene.split(',')[0];
        app.globalData.share_uid = scene.split(',')[3];
      }
    } else { // 正常模式
      getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;
    }
    // 以上新增

    app.isLoginFun(this, 1); //判断用户是否登录
    if (that.data._unlogin) {
      return;
    }
    
  },
  onReady: function() {

  },
  onShow: function() {
    //获取用户上次打开小程序距重新获取地理位置
    app.getTimeDifference();

    wx.setNavigationBarTitle({
      title: '购物袋',
    });
    var that = this;
    let windowWidth = wx.getSystemInfoSync().windowWidth; //屏幕宽度

    //请求购物袋列表
    let params={};
    params.physical_id=this.data.physical_id;
    common.post('app.php?c=cart&a=cart_list', params, "shoppingCatData", that);
    //页面跳转回来时购物袋选中效果重置
    this.setData({
      isActive1:'',//重置商品选择状态
      shoppingCatMoney:0,//商品合计总价
      shoppingCatNum:0//去结算数量
    })
  },
  shoppingCatData: function(result) {
    var that = this;
    wx.hideLoading();
    if (result.err_code == 0) {
      this.setData({
        shoppingCatData: result.err_msg,
        isActive: '', //准备全选判断
        isActive1:'',
        isEditActive1:'',
        shoppingCatMoney:0,//商品合计总价
        shoppingCatNum:0//去结算数量        
      })
      //判断商品列表是否有？跨境含税是否有？
      //只有商品列表
      //只有跨境列表
      //既有商品也有框架
      var now_physical_product_list = that.data.shoppingCatData.now_physical_product_list
      console.log(now_physical_product_list.some(item => item.foreign_product != 2), "=================")
      that.setData({
        hascommon_product: now_physical_product_list.some(item => item.foreign_product != "2"),
        hasforeign_product: now_physical_product_list.some(item => item.foreign_product == "2")
      })
      //数据加载后进来默认全不选
      // publicFun.choiceShoppingNew(that, '', '');
      // var cart_list = that.data.shoppingCatData.cart_list;
      // for (var i = 0; i < cart_list.length; i++) {
      //     cart_list[i].isActive = 0;
      // }
      // publicFun.shoppingMoney(that);
      
      // if (that.data.shoppingCatData.cart_list.length==0) {
      //   page = 1;
      //   let url = 'app.php?c=goods&a=recommend'+ '&page=' + page + '&cfrom=cart';
      //   common.post(url, '', setCartRecommendData, '');
      // }
      // function setCartRecommendData(result) {
      //   if(result.err_code==0){
      //     let recommendedHomeList = result.err_msg.product_list;
      //     let next_page = result.next_page;
      //     that.setData({
      //       recommendedHomeList,
      //       next_page
      //     })
      //   }else {
      //     console.log('数据出现问题');
      //   }
      // }
     
      wx.createSelectorQuery().select('#txt1').boundingClientRect(function(rect) {
        if (that.data.shoppingCatData.cart_notice && that.data.shoppingCatData.cart_notice.length > 28) {
          let duration = rect.width * 0.03; //滚动文字时间,滚动速度为0.03s/px
          that.setData({
            duration: duration
          })
        }

      }).exec()
    }
  },
  oppenShopping: function(e) { //加入购物袋
    var that = this
    publicFun.oppenShopping(e, that);
    setTimeout(() => {
      let params={};
      params.physical_id=this.data.physical_id;
      common.post('app.php?c=cart&a=cart_list', params, "shoppingCatData", this);
    }, 500);
  },
  plus: function(e) { //加
    console.log(111)
    var that = this;
    if(e.currentTarget.dataset.special ==1) {
      var that = this;
      publicFun.plus(that);
    }else {
      // if(that.data.clickable){
      //   that.setData({
      //     clickable: false
      //   });
      //   publicFun.operation(that, e, 'plus');
      // }
      publicFun.operation(that, e, 'plus');
    }
  },
  reduce: function(e) { //减
    var that = this;
    if (e.currentTarget.dataset.num && e.currentTarget.dataset.num == 1) {
      wx.showModal({
        title: '',
        content: '商品不能再减少了哦',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: that.data.themeColorValue
      })
      return;
    }
    if(e.currentTarget.dataset.special ==1) {
      var that = this;
      publicFun.reduce(that);
    }else {
      if(that.data.clickable){
        that.setData({
          clickable: false
        })
        publicFun.operation(that, e, 'reduce');
      }
    }
  },
  shoppingBlur: function(e) { //输入框
    var that = this;
    publicFun.operation(that, e, 'input');
  },
  shoppingVid: function(e) { //选择商品规格
    var that = this;
    publicFun.shoppingVid(e, that);
  },
  messageInput: function(e) { //留言内容
    var that = this;
    let index = e.target.dataset.index;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
    this.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  bindDateChange: function(e) { //选择日期
    var that = this;
    let index = e.target.dataset.index;
    let date = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].date = date;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  bindTimeChange: function(e) { //选择时间
    var that = this;
    let index = e.target.dataset.index;
    let time = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].time = time;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  payment: function(e) { //下一步,去支付
    var that = this;
    publicFun.payment(that, e)
    if(e.currentTarget.dataset.special == 1) {
      setTimeout(() => {
        let params={};
        params.physical_id=this.data.physical_id;
        common.post('app.php?c=cart&a=cart_list', params, "shoppingCatData", this);
      }, 500);
    }
  },
  goTopFun: function(e) { //回到顶部滚动条
    var that = this;
    publicFun.goTopFun(e, that)
  },
  closeShopping: function(e) { //关闭提示框遮罩层
    var that = this;
    publicFun.closeShopping(that);
  },
  choiceShopping: function(e) { //选择购物袋按钮
    var that = this;
    if (that.data.editCartText == '完成') {
      publicFun.choiceShoppingNew(that, e);
      // publicFun.editChoiceShopping(that, e);
    } else {
      publicFun.choiceShoppingNew(that, e);
    }

  },
 
  forbidShopping: function(e) { //其他门店下商品禁止选择购买只给编辑删除
    console.log('ee', e)
    console.log('ee', this.data.editCartText)
    if (this.data.editCartText == '完成') {
      publicFun.editChoiceShopping(this, e);
    }
  },
  showMsg: (e) => { //不可购买原因
    let color = e.currentTarget.dataset.color ? e.currentTarget.dataset.color : '#353535';
    console.log()
    wx.showModal({
      title: '门店无库存商品',
      content: '当前待下单门店，此部分商品没有库存，无法下单，请切换其他门店下单。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: color
    })
  },
  settlement: function(e) {
    //结算购物袋
    if (!this.data.isLoadding) return;
    this.setData({
      isLoadding: false
    })
    wx.showLoading({
      title: '正在加载中...',
    })

    var that = this;
    var catId = '';
    var cart_list = that.data.shoppingCatData.now_physical_product_list;
    for (var i = 0; i < cart_list.length; i++) {
      if (cart_list[i].isActive == 1) {
        catId += cart_list[i].pigcms_id + ',';
      }
    }
    if (catId == '') {
      this.setData({
        isLoadding: true
      })
      wx.hideLoading();
      return publicFun.warning('请选择要购买的商品', that);
    }
    catId = catId.substring(0, catId.length - 1);

    var st = setTimeout(() => {
      wx.hideLoading();
      this.setData({
        isLoadding: true
      });
      clearTimeout(st);
    }, 1000 * 5)
    common.post('app.php?c=cart&a=pay&cart_id=' + catId, '', shoppingCatData, '');

    function shoppingCatData(result) {
      // publicFun.paymentGo(result.err_msg)
      let order_no = result.err_msg;
      if (result.err_code === 0) {
        wx.navigateTo({
        url: '/pages/payment/index?order_no=' + order_no + '&cfrom=shoppingcat'
        });
      } else {
        wx.hideLoading();
        return publicFun.warning(order_no, that);
      }
      
    }

  },
  settlementDel: function(e) { // 删除选中商品
    var that = this;
    var catId = '';
    var cart_list = that.data.shoppingCatData.now_physical_product_list;
    console.log(cart_list)
    for (var i in cart_list) {
      if (cart_list[i].isActive == 1) {
        catId += cart_list[i].pigcms_id + ',';
      }
    }
    catId = catId.substring(0, catId.length - 1);
    if (catId == "") {
      wx.showModal({
        title: '',
        content: '请选择要删除的商品',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: that.data.themeColorValue
      })
      return;
    }
    // 确认框
    that.setData({
      catId:catId,
      confirmShow: true
    })
  },
  // 确认框关闭
  cancelhandle(e) {
    if (e.currentTarget.dataset.type === 'delete') {
      this.setData({
        confirmShow: false
      })
    } else {
      this.setData({
        clearconfirmShow: false
      })
    }
  },
  // 清空失效商品
  clearbind() {
    this.setData({
      clearconfirmShow: true
    })
  },
  // 确认框确认
  confirmhandle(e) {
    console.log(e.currentTarget.dataset.type)
    var that = this;
    if (e.currentTarget.dataset.type == 'delete') {
      let catId = that.data.catId;
      common.post('app.php?c=cart&a=delete&cart_id=' + catId, '', shoppingNum, '');
      function shoppingNum(result) {
        let data = that.data.shoppingCatData;
        //当前门店
        data.now_physical_product_list = data.now_physical_product_list.filter(function(item) {
          return item.isActive != 1;
        });
        //当前门店不可选
        data.now_physical_unable_list = data.now_physical_unable_list.filter(function(item) {
          return item.isEditActive != 1;
        });
        //其他门店
        data.other_physical_product_list = data.other_physical_product_list.filter(function(item) {
          return item.isEditActive != 1;
        });
        that.data.shoppingCatData.cart_list = that.data.shoppingCatData.cart_list.filter(function(item) {
          return item.isEditActive != 1;
        });
        publicFun.shoppingMoney(that);
        that.setData({
          'shoppingCatData': that.data.shoppingCatData,
          confirmShow: false
        })
        var now_physical_product_list = that.data.shoppingCatData.now_physical_product_list
        that.setData({
          hascommon_product: now_physical_product_list.some(item => item.foreign_product != "2"),
          hasforeign_product: now_physical_product_list.some(item => item.foreign_product == "2")
        })
      }
    } else {
      // 清空失效宝贝
      let uncatId = '';
      let cart_list = that.data.shoppingCatData.now_physical_unable_list;
      for (let i in cart_list) {
        uncatId += cart_list[i].pigcms_id + ',';
      }
      uncatId = uncatId.substring(0, uncatId.length - 1);
      common.post('app.php?c=cart&a=delete&cart_id=' + uncatId, '', shoppingNumClear, '');
      function shoppingNumClear(result) {
        let data = that.data.shoppingCatData;
        //当前门店不可选
        data.now_physical_unable_list = []
        that.setData({
          'shoppingCatData': that.data.shoppingCatData,
          clearconfirmShow: false
        })

      }
    }
  },
  editCart: function(e) { //编辑购物袋
    var that = this;
    var data = that.data.shoppingCatData;
   
    if (that.data.editCartText == '管理') {
      that.data.isActive = '';
      that.data.isActive1 = '';
      that.data.isActive2 = '';
      that.data.shoppingCatMoney = 0;
      that.data.shoppingCatNum = 0;
      //当前门店
      // var cart_list = data.now_physical_product_list;
      // for (var i in cart_list) {
      //   if (cart_list[i] != '') {
      //     cart_list[i].isActive = 0;
      //   }
      // }
      //当前门店不可选
      // for (var i in data.now_physical_unable_list) {
      //   if (data.now_physical_unable_list[i]) {
      //     data.now_physical_unable_list[i].isActive = 0;
      //   }
      // }
      //其他门店
      // for (var i in data.other_physical_product_list) {
      //   if (data.other_physical_product_list[i]) {
      //     data.other_physical_product_list[i].isActive = 0;
      //   }
      // }
      //所有商品列表
      // for (var i in data.cart_list) {
      //   if (data.cart_list[i]) {
      //     data.cart_list[i].isActive = 0;
      //   }
      // }

      // that.setData({
      //   'shoppingCatData': that.data.shoppingCatData,
      //   'isActive': that.data.isActive,
      //   'isActive1': that.data.isActive1,
      //   'isActive2': that.data.isActive2,
      //   'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
      //   'shoppingCatNum': that.data.shoppingCatNum,
      //   'editCartText': '完成',
      //   'isforeignProductType':0
      // })
      that.setData({
        'editCartText': '完成',
      })
    } else if (that.data.editCartText == '完成') {
      that.data.isEditActive = '';
      that.data.isEditActive1 = '';
      that.data.isEditActive2 = '';
      //当前门店
      var cart_list = data.now_physical_product_list;
      for (var i in cart_list) {
        if (cart_list[i] != '') {
          cart_list[i].isEditActive = 0;
        }
      }
      //当前门店不可选
      for (var i in data.now_physical_unable_list) {
        if (data.now_physical_unable_list[i]) {
          data.now_physical_unable_list[i].isEditActive = 0;
        }
      }
      //其他门店
      for (var i in data.other_physical_product_list) {
        if (data.other_physical_product_list[i]) {
          data.other_physical_product_list[i].isEditActive = 0;
        }
      }
      //所有商品列表
      for (var i in data.cart_list) {
        if (data.cart_list[i]) {
          data.cart_list[i].isEditActive = 0;
        }
      }

      // that.setData({
      //   'shoppingCatData': that.data.shoppingCatData,
      //   'isEditActive': that.data.isEditActive,
      //   'isEditActive1': that.data.isEditActive1,
      //   'isEditActive2': that.data.isEditActive2,
      //   'editCartText': '管理',
      // })
      that.setData({
        'editCartText': '管理',
      })
      //获取商品价格
      // publicFun.shoppingMoney(that);

    }
  },
  formSubmit: function(e) { // 生成下发模板消息所需的formId存于服务器
    var that = this;
    if (!that.data.isFormLoadding) return;
    this.setData({
      isFormLoadding: false
    })
    var st = setTimeout(() => {
      this.setData({
        isFormLoadding: true
      });
      clearTimeout(st);
    }, 1000 * 5)
    publicFun.formSubmit({
      e: e,
      that: that
    });
  },
  //下拉刷新页面
  onPullDownRefresh: function(e) {
    let params={};
    params.physical_id=this.data.physical_id;
    common.post('app.php?c=cart&a=cart_list', params, "shoppingCatData", this);
    let stop_fresh = setTimeout(() => {
      wx.stopPullDownRefresh();
      clearTimeout(stop_fresh)
    }, 2000)
  },
  // 上拉加载
  onReachBottom(){
    // let that = this;
    // if(this.data.shoppingCatData.cart_list.length>0||this.data.next_page==false){
    //   console.log('不用发送请求')
    // }
    // else {
    //     page++
    //     wx.showToast({
    //       title: "加载中..",
    //       icon: "loading"
    //     });
    //     console.log(page);
    //     let url = 'app.php?c=goods&a=recommend'+ '&page=' + page + '&cfrom=cart';
    //     common.post(url, '', setCartRecommendData, ''); 
    //   function setCartRecommendData(result) {
    //     if(result.err_code==0){
    //       let recommendedHomeList = result.err_msg.product_list;
    //       let next_page = result.next_page;
    //       that.setData({
    //         next_page,
    //         recommendedHomeList:[...that.data.recommendedHomeList,...recommendedHomeList]
    //       })
    //     }else {
    //       console.log('数据出现问题');
    //     }
    //   }
    // }
  },
  //切换门店
  changeStore: function(e) {
    console.log("ee", e);
    wx.navigateTo({
      url: '/pages/SHOPGOODS/pages/index/shopHomeList?rounter=shopcat',
    })
  }, //isLogin登录

  isLogin: function(e) {
    if (!app.isLoginFun(this)) { //判断用户是否登录
      return false;
    }
  },
})