var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var wxParse = require('../../wxParse/wxParse.js');
var app = getApp();
var canvasFun = require('../../utils/canvas-post.js');
var canvas = require('../../utils/canvas.js');
var start = new Date(); //用户访问时间
let it_timeout = null;//js截流定时器
let page = 1;//商品分页
let mode_index = -1;//最后一个模板索引
let cur_nav_index = 0;//当前模板选中商品分组索引
let is_repeat_msg = false;//是否多次点击发送
let creatingPost = false;
let discount_page = 1; //限时折扣分页
let timer;  //限时折扣定时器
function BdmapEncryptToMapabc(bd_lat, bd_lon) {
  var point = new Object();
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = new Number(bd_lon - 0.0065);
  var y = new Number(bd_lat - 0.006);
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  var Mars_lon = z * Math.cos(theta);
  var Mars_lat = z * Math.sin(theta);
  point.lng = Mars_lon;
  point.lat = Mars_lat;
  return point;
}
/**
 * 微页面也要支持活动模块
 */
Page({
  data: {
    scrollTop: {
      scroll_top: 0,
      goTop_show: false
    },
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
    searchWrapObj: {},
    currentTab: 0,
    productList: [],
    //自定义设置导航信息数据
    set_para: {
      multiple_num: 4,//默认显示滑块数量
      nav_check_id: 0,//导航选中id
      nav_to_menutop: 500,//初始菜单距离页面顶部距离
      need_fixed: false,//wxcss菜单吸顶
    },
    is_show_nav: false,//是否计算显示导航

    groupWindowsShow: false,
    next_page: true,//商品分组是否还能继续翻页
    load_txt: '',//数据加载过程提示
    mode_tyle: '',//最后有一个展示模板
    make_fiex: false,//商品分组标题吸顶
    // default_index:0,//默认商品分组初次数据索引
    nowGrouperData: {},
    scrollHeights: 0,
    playIndex: null,//用于记录当前播放的视频的索引值
    live_list: [],//直播组件list
    live_next_page: true,//直播组件默认开启加载分页
    live_page: 1,//直播组件分页页码
    pcode: '',//手机号获取过期
    // 表单组件测试要用的data
    user_address: {},
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
    videoSrc: [],//视频
    imgSrc: [],//图片
    imgSrc2: [],
    vthumb: '',//视频封面
    actionSheetHidden: true,//上传图片显示与否
    actionSheetVideo: true,  //上传视屏显示与否
    resetValue: '',
    codenum: 60,
    discount_next_page:false,
    discount_showOrHide:true,
    firstShow: true
  },

  onLoad: function (e) {
    var that = this;
    // 2020-7-14
    let addId = e.addid ? e.addid : 0;
    this.setData({
      addId
    })
    if (e.order_no != '' && e.order_no != undefined) {
      that.setData({
        order_no: e.order_no,
        address: e.address,
        paymentPostage: e.paymentPostage
      })
      console.log("order_no==", that.data.order_no)
    }
    publicFun.addressEditGO(that, addId);
    // 2020-7-14
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.height(that);
    var page_id = '';
    var preview = 0;

    if (e.scene != undefined) { // 预览模式
      that.setData({
        firstShow: false
      });
      var scene_id = decodeURIComponent(e.scene);
      if (scene_id) {
        let url = 'app.php?c=store&a=get_share_data',
        data = {
        scene_id: scene_id
        };
        common.post(url, data ,function(result){
          console.log("微页面先",result);
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id;
            app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid  
            page_id =  result.err_msg.page_id;
            preview = 1;
            that.setData({
              preview: preview,
              page_id: result.err_msg.page_id
          })
          that.pageData();
          }
        },'');
      }
    } else { // 正常模式
      page_id = e.page_id;
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;
    }
    if (e.page_type) {
      that.setData({
        page_type: e.page_type
      })
    }
    if (page_id) {
      that.setData({
        page_id: page_id
      })
    }
    that.setData({
      preview: preview,
      scrollHeights: that.data.scrollHeight - 68,
    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth
        });
      }
    });

    let get_check_id = e.check_id;
    if (get_check_id) {
      // let _url = target.dataset.url;
      let check_id = 'set_para.nav_check_id';
      // let check_url = 'set_para._url';
      this.setData({
        [check_id]: get_check_id,
        // [check_url]: _url
      });
    }


    //是否展示分享图片
    app.shareWidthPic(that);
    if(that.data.firstShow){
      that.pageData();
  }
    wx.login({
      success: res => {
        that.data.pcode = res.code;
      }
    })
  },
  pageData: function () {
    let that = this;
    common.post('app.php?c=store&a=page&page_id=' + that.data.page_id + '&preview=' + that.data.preview + '&page_type=' + that.data.page_type, '', "shopHomeData", that);
  },
  onReady: function () {
    var that = this;
    let url = '/pages/index/index';
    publicFun.setUrl(url);
    publicFun.height(that);
    this.dialog = that.selectComponent("#shareModal");
  },
  onShow: function () {
    var that = this;
    if (this.data.shopHomeData != '') {
      publicFun.setUrl('')
    }

    page = 1;
    app.isLoginFun(that, 1); // 判断用户是否登录

    publicFun.checkAuthorize({
      pageData: this.data.shopHomeData,
      app: app,
      callbackFunc: callbackFunc,
    })
    function callbackFunc() { // 分销商刷新接口
      common.post('app.php?c=store&a=page&page_id=' + that.data.page_id + '&preview=' + that.data.preview, '', "shopHomeData", that);
    }
    //=========================检测登录授权====================================
  },
  onHide: function () {
    clearTimeout(this.data.businessTimeInt)
  },
  shoppingCatNum: function (result) {
    if (result.err_msg == 1) {
      this.setData({
        shoppingCatNum: true,
      })
    }
  },
  addNavCheck: function (e) {
    let target = e.currentTarget;
    let id = target.dataset.id;
    //获取导航对应跳转地址
    let _url = target.dataset.url;
    let check_id = 'set_para.nav_check_id';
    let check_url = 'set_para._url';
    this.setData({
      [check_id]: id,
      [check_url]: _url
    });
    console.log(2, _url)
    wx.navigateTo({
      url: `${_url}&check_id=${id}`,
    })
  },

  //商品导航tab切换
  groupListSwichNav: function (e) {
    var that = this;
    publicFun.productListSwichNav(e, that);
    that.setData({
      toView: 'product'
    });
    let dataset = e.currentTarget.dataset;
    // console.log("eee", e.currentTarget.dataset)
    mode_index = dataset.t_index;//当前点击商品分组所在index模板索引
    let groupId = dataset.groupid;//组件id
    // console.log("groupId+++++++", groupId)
    //是最后一个模板且是商品分组
    // if (mode_index == this.data.last_mode_id){
    cur_nav_index = dataset.curindex;//当前分组导航索引
    page = 0;//重置分页页码
    //重置翻页
    that.setData({
      next_page: true
    });
    wx.showLoading({
      title: '加载中...',
    })
    this.loadGoodsGroup(groupId, mode_index, that);

    // }

  },
  shopHomeData: function (result) {
    var that = this
    if (result.err_code == 0) {
      common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量
      let shopHomeData = result.err_msg;
      if (result.err_msg.store.store_id) {
        this.setData({
          newStoreId: result.err_msg.store.store_id
        })
      }

      //publicFun.business(that, that.data.shopHomeData.store.order_notice_time); //订单提醒
      //publicFun.textScroll(that); //公告文字
      let custom_field_list = shopHomeData.custom_field_list;
      console.log(custom_field_list,6666666)
      for (var i in custom_field_list) {
        if (custom_field_list[i].field_type == 'search') { // 获取搜索框offset.top值
          if (custom_field_list[i].is_top == 1) {
            wx.createSelectorQuery().select('.editProductSearchPa').boundingClientRect(function (res) {
              if (res) {
                that.data.searchWrapObj.offTop = res.top;
                that.data.searchWrapObj.bgcolor = that.data.shopHomeData.bgcolor;
                that.setData({
                  'searchWrapObj': that.data.searchWrapObj,
                });
                // console.log(that.data.searchWrapObj)
              }
            }).exec();
          }
        }
        if(custom_field_list[i].field_type=='limited_module') {
          let goodsLists = custom_field_list[i].content.goodsLists;
          console.log(goodsLists)
          let activities = custom_field_list[i].content.activities
          let discount_index = custom_field_list[i].content.nowKey;
          let discount_tabid = activities[discount_index].id;
          // custom_field_list[i].content.activity = 'activity'+discount_index;
          wx.setStorageSync('discount_tabid', discount_tabid);
          let discount_next_page = custom_field_list[i].content.next_page;
          that.timeShowLimit(goodsLists);
          that.setData({
            discount_next_page:discount_next_page,
            cuwer: 'activity' + discount_index
          })
        }
      }
      //最后一个模板type
      if (custom_field_list) {
        this.setData({
          last_filed_type: custom_field_list[custom_field_list.length - 1].field_type
        })
      }
      const activities_modules = ['presale_module', 'bargain_module', 'tuan_module', 'seckill_module']
      for (var i in custom_field_list) {
        if (custom_field_list[i].field_type == 'rich_text') { //模板富文本转化
          let rich_text = custom_field_list[i].content;
          if (rich_text != '' && rich_text != undefined) {
            rich_text = rich_text.replace(/&nbsp;/g, '\xa0');
            rich_text = wxParse.wxParse('rich_text', 'html', rich_text, that, 5);
          }

          custom_field_list[i].content = rich_text;
        }
        if (custom_field_list[i].field_type == 'image_ad') { //图片广告
          for (var j = 0; j < custom_field_list[i].content.nav_list.length; j++) {
            custom_field_list[i].content.nav_list[j].type = publicFun.getType(custom_field_list[i].content.nav_list[j].url).type;
            custom_field_list[i].content.nav_list[j].url = publicFun.getType(custom_field_list[i].content.nav_list[j].url).url;
            custom_field_list[i].content.max_height = parseInt(custom_field_list[i].content.max_height)
            //获取图片宽高的缓存，以免在onShow生命周期里面,image的bindLoad回调不执行，获取不到图片的真时宽高,导致的变形
            let imageSize = publicFun.getImageSize({
              src: custom_field_list[i].content.nav_list[j].image
            })
            if (imageSize) {
              custom_field_list[i].content.nav_list[j].width = imageSize.w;
              custom_field_list[i].content.nav_list[j].height = imageSize.h;
              if (!custom_field_list[i].content.swiperHeight) {
                custom_field_list[i].content.swiperHeight = 0
              }
              if (custom_field_list[i].content.swiperHeight < imageSize.h) {
                custom_field_list[i].content.swiperHeight = imageSize.h
              }
            }
          }
          custom_field_list[i].content.dpr = app.globalData.dpr;
        }
        if (custom_field_list[i].field_type == 'image_ad2') { //图片广告
          for (let j = 0; j < custom_field_list[i].content.nav_list.length; j++) {
            custom_field_list[i].content.nav_list[j].type = publicFun.getType(custom_field_list[i].content.nav_list[j].url).type;
            custom_field_list[i].content.nav_list[j].url = publicFun.getType(custom_field_list[i].content.nav_list[j].url, 'home').url;
            //获取图片宽高的缓存，以免在onShow生命周期里面,image的bindLoad回调不执行，获取不到图片的真时宽高,导致的变形
          }
        }
        if (custom_field_list[i].field_type == 'cube') { //魔方
          for (let j = 0; j < custom_field_list[i].content.length; j++) {
            custom_field_list[i].content[j].type = publicFun.getType(custom_field_list[i].content[j].url).type;
            custom_field_list[i].content[j].url = publicFun.getType(custom_field_list[i].content[j].url).url;
          }
        }
        if (custom_field_list[i].field_type == 'image_nav') { //图片导航
          for (var j = 0; j < custom_field_list[i].content.length; j++) {
            custom_field_list[i].content[j].type = publicFun.getType(custom_field_list[i].content[j].url).type
            custom_field_list[i].content[j].url = publicFun.getType(custom_field_list[i].content[j].url).url;
          }
        }
        if (custom_field_list[i].field_type == 'article') {
          that.data.article_id = i;
          that.setData({
            article_id: i
          })
        }
        if (custom_field_list[i].field_type == 'search') { // 获取搜索框offset.top值
          if (custom_field_list[i].is_top == 1) {
            setTimeout(function () {
              wx.createSelectorQuery().select('.editProductSearchPa').boundingClientRect(function (res) {
                console.log(res)
                if (res) {
                  that.setData({
                    searchWrapTopValue: res.top
                  })
                }
              }).exec();
            }, 100)
          }
        }
        if (custom_field_list[i].field_type == 'goods_group2') {
          //商品分组，每个模块对应的activetab应该区别改变
          let { productList } = that.data
          productList[i] = 0;//初始化每个activeTab为第0个
          that.setData({ productList })
        }

        if (custom_field_list[i].field_type == 'goods_group4') {
          //商品分组，每个模块对应的activetab应该区别改变
          let {
            productList
          } = that.data
          productList[i] = 0; //初始化每个activeTab为第0个
          that.setData({
            productList
          })
          //数组最后一个组件
          if (i == custom_field_list.length - 1) {
            that.setData({ last_index: i })
          } else {
            that.setData({ last_index: -1 })
          }
          //初始nav-bar距菜单顶部距离
          let st = setTimeout(() => {
            var query = wx.createSelectorQuery()
            query.select('.fiex-top-my').boundingClientRect()
            query.exec((res) => {
              if (res[0]) {
                this.setData({
                  menu_top: res[0].top,
                })
              }
              clearTimeout(st);
            })
          }, 500)

        }
                // 限时折扣
                if (custom_field_list[i].field_type == 'limited_module') {
                  console.log('ok')
                  //商品分组，每个模块对应的activetab应该区别改变
                  let {
                    productList
                  } = that.data
                  productList[i] = 0; //初始化每个activeTab为第0个
        
                  that.setData({
                    productList
                  })
                  //数组最后一个组件
                  if (i == custom_field_list.length - 1) {
                    that.setData({
                      last_index: i
                    })
                  } else {
                    that.setData({
                      last_index: -1
                    })
                  }
                  //初始nav-bar距菜单顶部距离
                  let st = setTimeout(() => {
                    var query = wx.createSelectorQuery()
                    query.select('.discount_timeContainer').boundingClientRect()
                    query.exec((res) => {
                      if (res[0]) {
                        console.log('restop=========', res[0].top)
                        this.setData({
                          discount_menu_top: res[0].top,
                        })
                      }
                      clearTimeout(st);
                    })
                  }, 500)
        
                  // console.log("****", custom_field_list[i].content)
                }
        // 直播组件
        if (custom_field_list[i].field_type === 'live_player') {

          const { arrChannel, isShowColose } = custom_field_list[i].content;
          if (arrChannel) {
            let channel = '', sort_type = '', tagid = '';
            for (var n in arrChannel) {
              if (arrChannel[n].is_checked == 1) {
                channel = arrChannel[n].channel;
                if (channel == 'livetag') {
                  tagid = arrChannel[n].tagid || '-1';
                }
                else if (channel == 'hot1' || channel == 'hot2') {
                  sort_type = arrChannel[n].sort_type;
                }

                break;
              }
            }

            let palyer_data = custom_field_list[i].content.arrChannel;
            let arr_player = [];
            for (var n in palyer_data) {
              if (palyer_data[n].is_checked == 1) {
                arr_player.push(palyer_data[n]);
              }
            }
            //首次显示选中项
            this.setData({
              currentChannel: channel,
              firstEnterLive: true,
              livePlayerData: arr_player,
              sort_type,
              is_show_colse: isShowColose,
              tagid: (tagid || -1)
            })
            // 加载直播组件数据
            let _params = this.getParam(channel, sort_type, tagid);
            this.loadLivePlayer(channel, _params, result.err_msg.page_id);
          }


        }
        if (custom_field_list[i].field_type === 'cube') {
          //计算魔方的最大相对高度,防止魔方不满4行出现页面空白
          let maxHeight = custom_field_list[i].content.reduce((prev, next) => {
            return next.rowspan * 1 + next.y * 1 > prev ? next.rowspan * 1 + next.y * 1 : prev
          }, 0)
          custom_field_list[i].maxHeight = maxHeight * 750 / 4
        }
        //导航数据
        if (custom_field_list[i].field_type == 'content_nav') {//导航数据
          // let nav_data = JSON.stringify(custom_field_list[i].content);
          // wx.setStorage({
          //   key: 'nav_data',
          //   data: nav_data,
          // })
          //导航

          let data = custom_field_list[i].content;
          console.log("11=>", data);
          let num = data.nav.length;
          const DEFAULT_NUM = 4;//默认显示滑块数量
          num = num <= DEFAULT_NUM ? num : DEFAULT_NUM;
          console.log("11-num=>", num);
          let set_default_num = 'set_para.multiple_num';
          //获取导航对应跳转地址
          var arr_temp = data.nav;
          for (var j in arr_temp) {
            arr_temp[j].url = publicFun.getType(arr_temp[j].url).url;
          }
          // console.log(55, arr_temp)
          data.nav = arr_temp;
          let _url = arr_temp[0].url;
          console.log(77, data)
          console.log(88, custom_field_list[i].content)

          let check_url = 'set_para._url';
          that.setData({
            [set_default_num]: num,
            [check_url]: _url,
            nav_data: data,
            is_show_nav: true

          })
        }
        if (activities_modules.includes(custom_field_list[i].field_type) && custom_field_list[i].activities) {
          for (let activity of custom_field_list[i].activities) {
            let statusClass = "activity-end";//未开始和已结束的class都是这个（灰色）
            let { start_time, end_time } = activity
            start_time = start_time * 1000
            end_time = end_time * 1000
            let currentDate = Date.now()
            if (start_time < currentDate && end_time > currentDate) {
              statusClass = ""
            }
            activity.statusClass = statusClass
          }
        }

      }

      that.data.searchWrapObj.bgcolor = shopHomeData.bgcolor;
      that.setData({
        'shopHomeData': shopHomeData,
        'searchWrapObj': that.data.searchWrapObj,
      });
      publicFun.barTitle(shopHomeData.title || shopHomeData.store.name, that);

    }
  },
  oppenShopping: function (e) { //加入购物袋
    var that = this
    publicFun.oppenShopping(e, that);
  },
  plus: function () { //加
    var that = this;
    publicFun.plus(that);
  },
  reduce: function () { //减
    var that = this;
    publicFun.reduce(that);
  },
  shoppingBlur: function (e) { //输入框
    var that = this;
    publicFun.shoppingBlur(e, that)
  },
  shoppingVid: function (e) { //选择商品规格
    var that = this;
    publicFun.shoppingVid(e, that);
  },
  messageInput: function (e) { //留言内容
    var that = this;
    let index = e.target.dataset.index;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
    this.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  /**
   * 主页活动组件轮播图改变事件监听函数
   * @param e
   */
  onActivitySwiperChange(e) {
    let { current } = e.detail;
    let { t_index } = e.currentTarget.dataset
    this.setData({
      [`shopHomeData.custom_field_list[${t_index}].config.current_indicate_index`]: current
    })
  },
  bindDateChange: function (e) { //选择日期
    var that = this;
    let index = e.target.dataset.index;
    let date = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].date = date;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  bindTimeChange: function (e) { //选择时间
    var that = this;
    let index = e.target.dataset.index;
    let time = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].time = time;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  payment: function (e) { //下一步,去支付
    var that = this;
    publicFun.payment(that, e)
  },
  goTopFun: function (e) { //回到顶部滚动条
    // var that = this;
    // publicFun.goTopFun(e, that)
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  closeShopping: function (e) { //关闭提示框遮罩层
    var that = this;
    publicFun.closeShopping(that);
  },
  swichNav: function (e) {
    var that = this;
    publicFun.swichNav(e, that);
  },
  productListSwichNav: function (e) {
    var that = this;
    publicFun.productListSwichNav(e, that);
  },
  wxSearchFn: function (e) {
    var that = this;
    var page = 'page';
    publicFun.wxSearchFn(that, e, page);
  },
  wxSearchInput: function (e) {
    var that = this;
    publicFun.wxSearchInput(that, e)
  },

  collect: function (e) { //收藏动态
    var that = this;
    publicFun.shopcollect(that, e);

  },
  collectShop: function (e) { //收藏店铺
    var that = this;
    publicFun.collectShop(that, e);

  },
  mapData: function (e) {
    var that = this;
    publicFun.mapData(that, e);

  },
  imageLoad: function (e) { //设置图片广告图片宽高
    var that = this
    publicFun.imageLoad(e, that);
  },
  onShareAppMessage: function () {
    let that = this;
    if (that.data.shopHomeData.share_data.title) {
      return getApp().shareGetFans(this.data.shopHomeData.share_data.title, ' ', '/pages/index/page', 2, this.data.shopHomeData.share_data.image, `&page_id=${that.data.page_id}`);
    } else {
      return getApp().shareGetFans(this.data.shopHomeData.store.name, '', '/pages/index/page', 2, '', `&page_id=${that.data.page_id}`);
    }

    // return {
    //     title: this.data.shopHomeData.store.name,
    //     desc: '没有就写这里发现一个好店铺，速度围观',
    //   path: '/pages/index/page?page_id=' + that.data.page_id  + "&share_uid=" + getApp().globalData.my_uid + "&shareType=2"
    // }
  },
  onPageScroll: function (e) {
    var that = this;
    // 返回顶部
    if (e.scrollTop > 300) {
      that.data.scrollTop.goTopShow = true;
    } else {
      that.data.scrollTop.goTopShow = false;
    }
    // 搜索框置顶处理
    if (e.scrollTop >= that.data.searchWrapTopValue) {
      that.data.searchWrapObj.className = ' fixedTop ';
    } else {
      that.data.searchWrapObj.className = ' '
    }
    that.setData({
      'searchWrapObj': that.data.searchWrapObj,
      'scrollTop': that.data.scrollTop
    })
  },
  formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
    var that = this;
    publicFun.formSubmit({
      e: e,
      that: that
    });
  },
  /**
   * 活动结束时候的回调
   * @param options 1:未开始，灰色，3:已结束:灰色,宽度：100rpx
   */
  _onActivityStatusChange: function (options) {
    let { detail: { status, activityId, customFieldIndex } } = options
    let activityIndex = this.data.shopHomeData.custom_field_list[customFieldIndex].activities.findIndex(item => item.pigcms_id == activityId)
    if (status === 1) {
      this.setData({
        [`shopHomeData.custom_field_list[${customFieldIndex}].activities[${activityIndex}].statusClass`]: "activity-unstart"
      })
    } else if (status === 2) {
      this.setData({
        [`shopHomeData.custom_field_list[${customFieldIndex}].activities[${activityIndex}].statusClass`]: ""
      })
    }
    else if (status === 3) {
      this.setData({
        [`shopHomeData.custom_field_list[${customFieldIndex}].activities[${activityIndex}].statusClass`]: "activity-end"
      })
    }
  },
  // 店铺电话
  callTel: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel,
      success: function () {
      },
      fail: function () {
        wx.showToast({
          title: '拨号失败！',
          icon: 'fail',
          duration: 2000
        })
      }
    })
  },
  goAdress: function (e) {
    var longitudeInfo = e.currentTarget.dataset.longitude;
    var latitudeInfo = e.currentTarget.dataset.latitude;
    let { lng, lat } = BdmapEncryptToMapabc(latitudeInfo, longitudeInfo);
    wx.getLocation({//获取当前经纬度
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
      success: function (res) {
        wx.openLocation({//​使用微信内置地图查看位置。
          latitude: lat,//要去的纬度-地址
          longitude: lng,//要去的经度-地址
          name: e.currentTarget.dataset.storename,
          address: e.currentTarget.dataset.province + e.currentTarget.dataset.city + e.currentTarget.dataset.area + e.currentTarget.dataset.address
        })
      }
    });
  },
  swiperChange: function (e) {
    let { current } = e.detail
    let { bannerIndex } = e.currentTarget.dataset
    let custom_field_list = this.data.shopHomeData.custom_field_list
    let currentBanner = custom_field_list[bannerIndex]
    currentBanner.content.current_indicator_index = current
    this.setData({
      'shopHomeData.custom_field_list': custom_field_list
    })
  },
  //上拉加载
  onReachBottom() {
    let that = this;
    // this.loadGoodsGroup();
    let custom_field_list = this.data.shopHomeData.custom_field_list;
    if (custom_field_list) {
      let last_field_type = custom_field_list[custom_field_list.length - 1].field_type;

      if (last_field_type == "goods_group4") {
        this.loadGoodsGroup();
      }
      else if (last_field_type == "live_player") {
        let channel = this.data.currentChannel;
        let tagid = this.data.tagid;
        let sort_type = this.data.sort_type;
        if (this.data.live_next_page == false) {
          return;
        }
        var _params = {};
        if (channel == 'hot1' || channel == 'hot2') {
          _params.sort_type = sort_type || 1;
        }
        else if (channel == 'livetag') {
          _params.tagid = tagid;
        }


        this.loadLivePlayer(channel, _params);//获取选中频道数据
      }
      else if (last_field_type == "limited_module") {
        console.log(that.data.discount_next_page)
        if(that.data.discount_next_page == true) {
          console.log('有下一页');
          discount_page++;
          wx.showToast({
            title: "加载中..",
            icon: "loading"
          });
          let url = 'app.php?c=store&a=activities_product';
          let tabid =  wx.getStorageSync('discount_tabid');
          let params = {
            p:discount_page,
            activitiesId:tabid,
            page_id:that.data.shopHomeData.page_id
          }
          var currentGoodsLists;
          var discount_next_page;
          common.post(url,params,function(res){
            console.log('限时特卖导航',res)
            if(res.err_code == 0){
              that.setData({
                discount_showOrHide:false
              })
              currentGoodsLists = res.data.goodsLists;
              discount_next_page = res.data.goods_page;
              console.log(discount_next_page,666);
              let currentAllList;
              for(var i=0;i<custom_field_list.length;i++) {
                if(custom_field_list[i].field_type=='limited_module') {
                  custom_field_list[i].content.goodsLists = [...custom_field_list[i].content.goodsLists,...currentGoodsLists];
                  currentAllList = custom_field_list[i].content.goodsLists;
                }
              }
              wx.showToast({
                title: "加载中..",
                icon: "loading",
                duration: 2000
              });
              that.setData({
                shopHomeData:that.data.shopHomeData,
                discount_next_page
              })
              setTimeout(() => {
                that.setData({
                  discount_showOrHide:true
                })
              }, 2000);
              that.timeShowLimit(currentAllList);
            };
          },'');
        }
        if(that.data.discount_next_page == false) {
          console.log('没有下一页')
        }
      }
    }
  },
  //加载商品组件
  loadGoodsGroup(groupId, mode_index, that) {
    // console.log("mode_index", mode_index, mode_index == null, mode_index?'yes':'no')
    that = that ? that : this;
    let store_id = that.data.newStoreId; //店铺id
    let group_list = that.data.shopHomeData.custom_field_list; //所有商品分组
    let page_id = that.data.page_id
    let filed_type = '';
    if (mode_index != null) {
      filed_type = group_list ? group_list[mode_index].field_type : ''; //单击商品分组类型
    } else {
      filed_type = group_list ? group_list[group_list.length - 1].field_type : ''; //最后一个商品分组类型
    }
    let last_file_type = group_list ? group_list[group_list.length - 1].field_type : ''; //最后一个商品分组类型
    let group_id = -1; //商品分组id
    that.setData({
      mode_tyle: group_list[group_list.length - 1].field_type
    })
    if (filed_type != "goods_group4") return; //如果页面最后一个组件或者单击标题不是商品分组，则不请求数据
    let last_mode_id = group_list.length - 1; //最后一个模板索引
    let size = 0; //商品展示类型
    // let default_index = that.data.default_index ? that.data.default_index : 0;//数据分组加载索引
    mode_index = mode_index != null ? mode_index : last_mode_id;
    if (group_list[mode_index].content) {
      let last_group_list = [];
      if (mode_index != null) {
        last_group_list = group_list[mode_index].content; //最后一组商品分组里的分组商品集合
      } else {
        last_group_list = group_list[group_list.length - 1].content; //最后一组商品分组里的分组商品集合
      }
      if (last_group_list.goods_group_list) {
        let list = []
        list = last_group_list.goods_group_list;
        group_id = groupId ? groupId : list[cur_nav_index].group_id; //第一个商品组id;
        // console.log("77777777", last_group_list);
        size = last_group_list.size ? last_group_list.size : 0; //商品展示类型赋值

        //分组数据请求
        if (mode_index == last_mode_id && page >= 1 && size == 5) {
          that.setData({
            mode_tyle: '滑动模式'
          })
          return; //横向滑动模式下不加载
        }
        if (!that.data.next_page) return; //如果不能翻页，则返回
        // console.log("没有更多数据了")
        that.setData({
          load_txt: (size == 5) ? '' : '加载中...', //加载状态提示
          mode_tyle: last_file_type, //最后一组模板类型
          size,
          last_mode_id
        })
        page++;
        //【bug51479】【商品分组3 分页】切换分组，在切换回来，商品展示重复->（阻止切换列表项时同事触发上拉，导致数据还没之前多次请求）
        that.setData({
          next_page: false
        })
        let url = `app.php?c=goods&a=get_goods_by_group&store_id=${store_id}&group_type=${filed_type}&group_id=${group_id}&page=${page}&from=1&page_id=${page_id}`
        common.post(url, '', getGoodsData, '');
        //分页返回数据
        function getGoodsData(result) {
          wx.hideLoading();
          if (result.err_code == 0) {

            let next_page = result.err_msg.next_page ? result.err_msg.next_page : false; //是否可以继续翻页
            let get_data = result.err_msg.product_list ? result.err_msg.product_list : []; //商品数据
            list.forEach((val, index) => {

              if (val.group_id == group_id) {
                if (page == 1) {
                  val.product_list = [];

                }
                if (!val.product_list) {
                  val.product_list = [];
                }
                val.product_list = val.product_list.concat(get_data);
              }
            });
            that.setData({
              'shopHomeData.custom_field_list': group_list, //得到数据
              next_page: next_page //是否翻页
            })
            if (!next_page) {
              that.setData({
                load_txt: (size == 5) ? '' : '没有更多数据了' //加载状态提示
              })
            }

          } else {
            that.setData({
              load_txt: '没有更多数据了' //加载状态提示
            })
          }
        }
      }
    }

  },
  showNewgiftvip() {
    wx.navigateTo({
      url: "/pages/giftMember/giftVip/vip",
    })
  },
  goGroupList: function (e) {
    const {
      fieldid,
      name
    } = e.currentTarget.dataset;
    if (!fieldid) {
      wx.showToast({
        title: '没有获取到更多分组信息',
        icon: 'none'
      })
      return;
    }
    let _data = {};

    wx.navigateTo({
      url: `/pages/CLIST/pages/group/groupList?field_id=${fieldid}&name=${name}`,
    })
  },
  //吸顶菜单
  onPageScroll: function (e) {
    let custom_field_list = this.data.shopHomeData.custom_field_list;
    if (custom_field_list) {
      let last_field_type = custom_field_list[custom_field_list.length - 1].field_type;
      if (last_field_type == "goods_group4") {
        let menu_top = this.data.menu_top;
        let make_fiex = false;
        // console.log(`e.scrollTop====${e.scrollTop}==========menu_top=${menu_top}`)
        if (e.scrollTop > menu_top) {
          make_fiex = true;
        } else {
          make_fiex = false;
        }
        this.setData({
          make_fiex
        })
      }
      // else if (last_field_type == "live_player") {
      //   let live_fiex = false;

      //   let live_menu_top = this.data.live_menu_top;
      //   // console.log(`e.scrollTop====${e.scrollTop}==========live_menu_top=${live_menu_top}`)
      //   if (e.scrollTop > live_menu_top) {
      //     live_fiex = true;
      //   } else {
      //     live_fiex = false;
      //   }
      //   this.setData({
      //     live_fiex
      //   })
      // }
      else if (last_field_type == "limited_module") {
        let discount_fiex = false;
        let discount_menu_top = this.data.discount_menu_top;
        console.log(e.scrollTop)
        if (e.scrollTop > discount_menu_top) {
          discount_fiex = true;
        } else {
          discount_fiex = false;
        }
        this.setData({
          discount_fiex
        })
      }
    }



  },
  //商品分组页面跳转
  goGroupList: function (e) {
    // console.log("eeeeeee",e)
    const {
      fieldid,
      name
    } = e.currentTarget.dataset;
    console.log("eeeeeee", fieldid, name);
    if (!fieldid) {
      wx.showToast({
        title: '没有获取到更多分组信息',
        icon: 'none'
      })
      return;
    }
    let _data = {};

    wx.navigateTo({
      url: `/pages/CLIST/pages/group/groupList?field_id=${fieldid}&name=${name}`,
    })
  },
  // /积分商品分组页面跳转
  goGroupListp: function (e) {
    // console.log("eeeeeee",e)
    let that = this
    // if (!app.isLoginFun(that)) {//判断用户是否登录
    //   common.setUserInfoFun(that, app);
    //   return false;
    // }
    // 判断用户是否登录
    const {
      fieldid,
      name
    } = e.currentTarget.dataset;
    console.log("eeeeeee", fieldid, name);
    if (!fieldid) {
      wx.showToast({
        title: '没有获取到更多分组信息',
        icon: 'none'
      })
      return;
    }
    let _data = {};

    wx.navigateTo({
      url: `/pages/POINT/pages/group/groupList?field_id=${fieldid}&name=${name}`,
    })
  },
  // 一键复制
  copyBtn: function (e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.shopHomeData.store.name + ',' + that.data.shopHomeData.store.physical_title,
      success: function (res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data)
          }
        })
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  //手动拉取登录验证
  userLogin: function (e) {
    let that = this;
    app.isLoginFun(that);
    console.log(e);
    let golist = e.currentTarget.dataset.golist;
    if (golist * 1 == 1) {//不允许领取了,跳转页面
      wx.navigateTo({
        // url: '/pages/USERS/pages/coupons/coupons'
        url: '/pages/index/coupons'
      })
    } else if (golist * 1 == 0) {//领取优惠券
      let tempidx = e.currentTarget.dataset.tempidx;
      let idx = e.currentTarget.dataset.idx;
      let coupon_id = e.currentTarget.dataset.couponid;
      console.log(tempidx, idx, coupon_id);
      common.post('app.php?c=coupon&a=collect&coupon_id=' + coupon_id, '', coupontsData, '');
      function coupontsData(result) {
        if (result.err_code == 0) {
          publicFun.warning('领取成功', that);
          if (result.err_msg.is_my_get_over * 1 == 1) {
            that.setData({
              ['shopHomeData.custom_field_list[' + tempidx + '].content[' + idx + '].is_my_get_over']: 1
            });
          }
        }
      }
    }
  },
  // 视频暂停
  videoPlay: function (e) {
    publicFun.videoPlay(this, e);
  },

  goDetails: function (e) {
    let that = this
    const {
      product_id
    } = e.currentTarget.dataset;
    console.log(e, product_id, "product_idproduct_idproduct_id")
    if (!app.isLoginFun(that)) {//判断用户是否登录
      common.setUserInfoFun(that, app);
      return false;
    }

    let url = '/pages/POINT/pages/product/details?product_id=' + product_id
    wx.navigateTo({
      url: url
    })
  },
  goDetail:function(e) {
    let that = this
    const {
      product_id
    } = e.currentTarget.dataset;
    console.log(e, product_id, "product_idproduct_idproduct_id")
    if (!app.isLoginFun(that)) {//判断用户是否登录
      common.setUserInfoFun(that, app);
      return false;
    }
  },
  //商品分组标签跳转
  goGroupListT: function (e) {
    // console.log("eeeeeee",e)
    const {
      groupid,
      name
    } = e.currentTarget.dataset;
    console.log("eeeeeee", groupid, name);
    if (!groupid) {
      wx.showToast({
        title: '没有获取到更多分组信息',
        icon: 'none'
      })
      return;
    }
    let _data = {};

    wx.navigateTo({
      url: `/pages/CLIST/pages/group/groupTips?groupid=${groupid}&name=${name}`,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
          console.log(data)
        },
        someEvent: function (data) {
          console.log(data)
        }

      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
      }
    })
  },
  //切换直播组件标题
  changeChannel: function (e) {
    let channel_name = '';
    if (e) {
      /**
	   * channel-频道
	   * sort_type-热门下排序方式
	   * tagid-标签频道下标签id
	   */
      const { channel, sort_type, tagid } = e.currentTarget.dataset;
      //如果选中频道和原来的是同一个频道则不执行
      if ((channel == 'livetag' && tagid == this.data.tagid) || (channel == this.data.currentChannel && channel != 'livetag')) return;
      //swiper对应的索引
      let arrChannel = this.data.livePlayerData;
      let tabindex = 0;
      for (var i in arrChannel) {
        if (arrChannel[i].channel == channel) {
          tabindex = i;
        }
      }

      this.setData({
        currentChannel: channel,//当前频道
        live_page: 1,//直播组件页码
        tagid,//直播间标签id
        live_next_page: true,//是否有分页
        firstEnterLive: false,//是否更新组件标题位置判断
        swiperCurIndex: tabindex,
        sort_type
      })
      let _params = this.getParam(channel, sort_type, tagid);
      this.loadLivePlayer(channel, _params);//获取选中频道数据
    }
  },

  //判断加载参数
  getParam: function (channel, sort_type, tagid) {
    var _params = {};
    if (channel == 'hot1' || channel == 'hot2') {
      _params.sort_type = sort_type || 1;
    }
    else if (channel == 'livetag') {
      _params.tagid = tagid;
    }
    return _params;
  },

  //加载直播组件
  loadLivePlayer: function (_type, _params) {

    let _url = `/app.php?c=tencent_live&a=live_component_data`;
    let params = {};
    params.channel = _type;//请求频道类型
    params.page_id = this.data.page_id;//页面id
    params.page = this.data.live_page;//页码
    params.is_show_colse = this.data.is_show_colse;//是否显示关闭
    if (_params) {
      params = { ...params, ..._params };
    }
    common.post(_url, params, `loadLivePlayerData`, this);
  },
  //加载直播组件--数据
  loadLivePlayerData: function (result) {
    console.log(`******直播数据展示>>`, result);
    if (result.err_code == 0) {
      const { list, next_page, subscribe_template_id } = result.err_msg;
      let data_live_list = this.data.live_page == 1 ? [] : (this.data.live_list || []);
      data_live_list = [...data_live_list, ...list];

      this.setData({
        live_list: data_live_list,
        live_next_page: next_page,
        live_page: this.data.live_page + 1,
        subscribe_template_id
      })

      //初始live-bar距菜单顶部距离
      if (this.data.firstEnterLive) {
        let st = setTimeout(() => {
          var query = wx.createSelectorQuery()
          query.select('.fiex-top-live').boundingClientRect()
          query.exec((res) => {
            if (res[0]) {
              // console.log('restop=========', res[0].top)
              this.setData({
                live_menu_top: res[0].top,
              })
            }
            clearTimeout(st);
          })
        }, 200)
      }


    }
  },
  //不可预约状态-预约
  appointed: function () {
    publicFun.warning('直播结束无法预约', this);
  },
  //可预约-预约
  appointClick: function (e) {
    let that = this;
    let tabIndex = that.data.tabIndex;
    let appointIndex = e.currentTarget.dataset.liveindex;
    let advanceTotal = e.currentTarget.dataset.advancetotal * 1 + 1;
    // let is_advance = e.currentTarget.dataset.is_advance;
    const { liveindex, is_advance } = e.currentTarget.dataset;
    that.setData({
      appointIndex: appointIndex,
      advanceTotal: advanceTotal
    });
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    // if (that.data.videoListData.list[appointIndex].is_advance == 0) {
    if (is_advance == 0) {
      wx.requestSubscribeMessage({
        tmplIds: that.data.subscribe_template_id,
        success(res) {
          console.log(res);
          if (res[that.data.subscribe_template_id] == "accept") { //点击确定授权
            publicFun.warning('订阅成功', that);
          } else if (res[that.data.subscribe_template_id] == "ban") {
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          } else { //点击取消授权
            publicFun.warning('取消订阅', that);
          }
        },
        fail(res) {
          publicFun.warning('请开启订阅消息方便接收消息提醒', that);
        },
        complete(res) {
          if (that.data.currentChannel == 'livetag' && that.data.tagid == 'applet') {
            //官方小程序直播
            let roomId = e.currentTarget.dataset.roomid;
            that.officialFollowFun(roomId);
          } else {
            //原生小程序直播
            let liveId = e.currentTarget.dataset.liveid;
            that.appointFun(liveId);
          }
        }
      })
    } else if (is_advance == 1) {//that.data.videoListData.list[appointIndex].
      publicFun.warning('已预约', that);
    } else {
      publicFun.warning('已发送', that);
    }
  },
  // 小程序官方直播预约函数
  officialFollowFun: function (roomId, liveIndex) {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addAppletLiveTips',
      data = {
        roomid: roomId,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'officialFollowData', that, '', true)
  },
  officialFollowData: function (res) {
    let that = this;
    let appointIndex = that.data.appointIndex;//当前预约索引
    let isAdvance = 'live_list[' + appointIndex + '].is_advance';
    let advanceTotal = 'live_list[' + appointIndex + '].advance_total';
    that.setData({
      [isAdvance]: 1,
      [advanceTotal]: that.data.advanceTotal
    });
  },
  // 原生预约函数
  appointFun: function (liveId) {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addPrepareTips',
      data = {
        live_id: liveId,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'appointData', that)
  },
  appointData: function (res) {
    var that = this;
    let appointIndex = that.data.appointIndex;
    let isAdvance = 'live_list[' + appointIndex + '].is_advance';
    let advanceTotal = 'live_list[' + appointIndex + '].advance_total';
    that.setData({
      [isAdvance]: 1,
      [advanceTotal]: that.data.advanceTotal
    });
  },
  // 跳转详情
  goLiveDetail: function (e) {
    let that = this;
    let tabIndex = that.data.tabIndex;
    let liveId = e.currentTarget.dataset.liveid;
    let imgsrc = e.currentTarget.dataset.imgsrc;
    let status = e.currentTarget.dataset.status;
    let liveIndex = e.currentTarget.dataset.liveindex;
    that.setData({
      liveId: liveId,
      liveIndex: liveIndex
    })
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }

    //关注频道,推荐频道,热门,热门2下的列表点击跳转
    let currentChannel = this.data.currentChannel;//当前频道
    if (currentChannel == "subscribe" || currentChannel == "recommaned" || currentChannel == "hot1" || currentChannel == "hot2" || currentChannel == "livetag") {
      // 其他直播
      if (this.data.tagid != "applet") {
        wx.navigateTo({
          url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status
        })

      }
      // 小程序直播
      else if (currentChannel == "livetag" && this.data.tagid == 'applet') {
        const { pageurl } = e.currentTarget.dataset;
        if (pageurl) {
          wx.navigateTo({
            url: pageurl,
          })
        }

      }
    }
  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that, that.data.pcode);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            that.data.code = res.code;
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
  //更改直播项
  swiperChangeChannel: function (event) {

    const { current, source } = event.detail;

    let arrChannel = this.data.livePlayerData;//频道数据

    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>arrChannel", current, arrChannel);

    if (source == "touch" && arrChannel && arrChannel.length > 0) {
      let channel = arrChannel[current].channel;//当前频道
      let sort_type = arrChannel[current].sort_type || 1;//热门排序
      let tagid = arrChannel[current].tagid || 1;////直播间标签下频道id

      this.setData({
        currentChannel: channel,
        tagid: tagid,
        live_page: 1,
        live_next_page: true,
        swiperCurIndex: current
      })

      let _params = this.getParam(channel, sort_type, tagid);
      this.loadLivePlayer(channel, _params);//获取选中频道数据


    }

  },

  // 计算图片广告2首张图片高度
  imgHeight: function (e) {
    console.log(666888, e, e.detail.height);
    let arrIndex = e.currentTarget.dataset.sindex;
    let oldImgW = e.detail.width;//原图的宽
    let oldImgH = e.detail.height;//原图的高
    let imgScale = oldImgW / oldImgH;//原图的宽高比
    let nowImgH = wx.getSystemInfoSync().windowWidth / imgScale;
    console.log(imgScale, '------', nowImgH);
    this.setData({
      ['nowImgH[' + arrIndex + ']']: nowImgH
    })
  },
  // 2020-7-15 表单组件
  //获取输入框的值
  savaValue: function (e) {
    let that = this;
    let txt_value = e.detail.value.trim();
    let required = e.currentTarget.dataset.required;
  },
  pickerProvince: function (e, p_index) { //省份选择
    var that = this;
    publicFun.pickerProvince(that, e, p_index)
  },

  pickerCity: function (e, c_index) { //市级选择
    var that = this;
    publicFun.pickerCity(that, e, c_index)
  },

  pickerCountry: function (e) { //县区
    var that = this;
    app.isLoginFun(this, 1);//判断用户是否登录
    publicFun.pickerCountry(that, e)
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  // 选择上传图片类型
  chooseStyle: function () {
    let that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  // 选择上传视频类型
  chooseVideo: function () {
    let that = this;
    that.setData({
      actionSheetVideo: !this.data.actionSheetVideo,
    });
  },
  actionSheetbindchange: function () {
    let that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetBindVideo: function () {
    let that = this;
    that.setData({
      actionSheetVideo: !this.data.actionSheetVideo
    })
  },
  // 添加视频
  addVideo: function (e) {
    var that = this;
    let videoMax = e.currentTarget.dataset.max;
    that.setData({
      actionSheetVideo: !this.data.actionSheetVideo
    });
    if (that.data.videoSrc.length > videoMax) {
      return publicFun.warning('最多可以上传' + videoMax + '个视频', that);
    }
    // if (that.data.imgSrc.length > 0) {
    //   return publicFun.warning('视频与图片不能同时上传', that);
    // }
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        console.log(res);
        let videoSrcLise = that.data.videoSrc || [];
        if (res.duration > 300) {
          return publicFun.warning('视频长度不超过5分钟', that);
        }
        if (res.size > 1024 * 1024 * 25) {
          return publicFun.warning('视频大小不超过25M', that);
        }
        // 视频、图片上传
        wx.showLoading({
          title: '视频正在上传中...',
          mask: true
        })
        var tempFilePathsed = res.tempFilePath;
        let videoUrl = 'app.php?c=attachment&a=file_upload';
        that.upload_file_video(videoUrl, that, tempFilePathsed);
      }
    })
  },
  // 添加图片
  addImage: function (e) {
    var that = this;
    console.log(e);
    let imageMax = e.currentTarget.dataset.max;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
    // if (that.data.videoSrc.length > 0) {
    //   return publicFun.warning('视频与图片不能同时上传', that);
    // }
    wx.chooseImage({
      count: imageMax,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const imgList = res.tempFilePaths;//上传的图片数据
        const imageList = that.data.imgSrc || [];//原始的图片数据
        let nowLenght = imgList.length;//当前上传的图片数量
        let imageLenght = imageList.length;//原来的图片数量  
        let data = {
          store_id: app.globalData.store_id || common.store_id,
        };
        if (nowLenght > imageMax) {
          return publicFun.warning('最多上传' + imageMax + '张图片', that);
        }
        if (imageLenght == imageMax) {
          return publicFun.warning('数量已经有' + imageMax + '张，请删除在添加...', that);
        }
        if (imageLenght < imageMax) {
          let imgPath = [];
          let residue = imageMax - imageLenght;//获取缺少的图片张数
          if (residue >= nowLenght) {//如果缺少的张数大于当前的的张数
            imgPath = imageList.concat(imgList);
          } else {
            imgPath = imageList.concat(imgList.slice(0, residue));
          }
          that.setData({
            imgSrc2: imgPath
          });
        }
        // 调用上传
        wx.showLoading({
          title: '图片正在上传中...',
          mask: true
        })
        let imgUrl = 'app.php?c=attachment&a=upload';
        var imgSrc2 = that.data.imgSrc2;
        for (var i in imgSrc2) {
          that.upload_file_server(imgUrl, that, imgSrc2, i);
        }
        console.log(that.data.imgSrc2)
      },
    })
  },
  // 上传视频
  upload_file_video: function (videoUrl, that, tempFilePathsed) {
    const upload_video_fun = common.uploadFile(videoUrl, tempFilePathsed, function (_res) {
      console.log(_res.err_msg);
      let videoSrcLise = that.data.videoSrc || [];
      let videoInfo = {};
      videoInfo['furl'] = _res.err_msg.url;
      videoInfo['vthumb'] = _res.err_msg.vthumb;
      videoInfo['sort'] = 0;
      videoSrcLise.push(videoInfo);
      that.setData({
        videoSrc: videoSrcLise
      });
      wx.hideLoading();
    }, '');
  },
  // 上传图片方法
  upload_file_server: function (imgUrl, that, imgSrc2, i) {
    const upload_img_fun = common.uploadFile(imgUrl, imgSrc2[i], function (_res) {
      var filename = _res.err_msg;
      imgSrc2[i] = filename
      that.setData({
        imgSrc: imgSrc2
      })
      that.testImgFun(imgSrc2[i]);
      wx.hideLoading();
    }, '');
  },
  // 图片校验
  testImgFun: function (testImg) {
    let that = this;
    let url = 'app.php?c=society&a=imgSecCheck',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        imgSec: testImg
      };
    common.post(url, data, 'testImgData', that)
  },
  testImgData: function (res) {
    let that = this;
    console.log(res);
    that.setData({
      testImgData: res.err_msg,
      testImgCode: res.err_msg.errcode
    });
    if (res.err_msg.errcode == 87014) {
      return publicFun.warning('图片涉及敏感内容，请重新上传', that, 'red');
    }
  },
  // 删除上传图片 或者视频
  delFile(e) {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除吗？',
      success(res) {
        if (res.confirm) {
          let delNum = e.currentTarget.dataset.index,
            delType = e.currentTarget.dataset.type,
            imgSrc = that.data.imgSrc,
            videoSrc = that.data.videoSrc;
          if (delType == 'image') {
            imgSrc.splice(delNum, 1)
            that.setData({
              imgSrc: imgSrc
            })
          } else if (delType == 'video') {
            videoSrc.splice(delNum, 1)
            that.setData({
              videoSrc: videoSrc
            })
          } else if (delType == 'vthumb') {
            that.setData({
              vthumb: '',
              ['videoSrc[' + 0 + '].vthumb']: ''
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 文本域表单事件
  saveAreas(e) {
    let that = this;
    // 获取输入框的值
    var value = e.detail.value.trim();
    // 获取长度
    var len = parseInt(value.length);
    let index = e.currentTarget.dataset.index;
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        arr_shopHomeData[i].content[index].a = len;
        arr_shopHomeData[i].content[index].group_value = value;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData,
    })
  },
  // 点击显示textarea文本框
  showTextarea: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        arr_shopHomeData[i].content[index].textareaShow = true;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData,
    })
  },
  hideTextarea: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        arr_shopHomeData[i].content[index].textareaShow = false;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData,
    })
  },
  // 点击文本按钮判断登录
  loginAreas(e) {
    let that = this;
  },
  // 多选框展示更多
  showMore: function (e) {
    let that = this;
    console.log(e);
    var len = e.currentTarget.dataset.defaultvalue;
    let index = e.currentTarget.dataset.index;
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        arr_shopHomeData[i].content[index].a = true;
        arr_shopHomeData[i].content[index].default_value = len;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData
    })
  },
  // 多选框隐藏更多
  hideMore: function (e) {
    let that = this;
    console.log(e)
    var len = e.currentTarget.dataset.defaultvalue;
    console.log(len)
    let index = e.currentTarget.dataset.index;
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        arr_shopHomeData[i].content[index].default_value = len;
        arr_shopHomeData[i].content[index].a = false;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData
    })
  },
  // 复选框
  checkboxChange: function (e) {
    let that = this;
    let count = 0
    let index = e.currentTarget.dataset.index;
    var len = e.detail.value;
    console.log(len, '---选中的项');
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        let optionArr = arr_shopHomeData[i].content[index].optionArr;
        arr_shopHomeData[i].content[index].default_value = len;
        count++
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData
    })
  },
  // 下拉框和单选
  selectChange: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    var len = parseInt(e.detail.value);
    console.log(len)
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        let optionArr = arr_shopHomeData[i].content[index].optionArr;
        arr_shopHomeData[i].content[index].default_value[0] = optionArr[len].name;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData
    })
  },
  bindTel: function (e) {//手机号
    this.setData({
      "group_detail.tel": e.detail.value
    })
  },
  focusTel(e) {
    let that = this;
  },
  bindCode: function (e) {//验证码
    let that = this;
    console.log(e.detail.value);
    if (e.detail.value == '') {
      return publicFun.warning('请输入验证码', that);
    }
  },
  // 获取验证码
  getTelcode: function () {
    let that = this;
    let phone_no = this.data.group_detail.tel;
    if (!(/^1[23456789]\d{9}$/.test(phone_no))) {
      return publicFun.warning('手机号码格式不正确', that);
    }
    let datas = {
      phone: phone_no
    };
    let url = 'app.php?c=form&a=sentMsg';
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
  // 保存
  inputSubmit: function (e) {
    var that = this;
    console.log(e)
    if (is_repeat_msg) {//多次重复发送
      wx.showToast({
        title: '1秒内不可重复提交多次',
        icon: 'none'
      })
      return;
    }
    is_repeat_msg = true;
    let st_out_repeat = setTimeout(() => {
      is_repeat_msg = false;
      clearTimeout(st_out_repeat);
    }, 1000);
    console.log('ok')
    // 上传图片/地址选择
    let imageName = e.detail.target.dataset.imagename;
    let videoName = e.detail.target.dataset.videoname;
    let areaName = e.detail.target.dataset.areaname;
    e.detail.value.area = that.data.country_name_arr[e.detail.value.area];
    e.detail.value.city = that.data.city_name_arr[e.detail.value.city];
    e.detail.value.province = that.data.province_name_arr[e.detail.value.province];
    e.detail.value[areaName] = e.detail.value.province + e.detail.value.city + e.detail.value.area + e.detail.value[areaName];
    let image_arr = that.data.imgSrc;
    e.detail.value[imageName] = image_arr;
    let video_arr = that.data.videoSrc.map((v, i) => { return v.furl });
    e.detail.value[videoName] = video_arr;
    e.detail.value.form_id = e.detail.target.dataset.form_id;
    var params = e.detail.value;
    // 验证
    let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
    for (let i = 0; i < arr_shopHomeData.length; i++) {
      if (arr_shopHomeData[i].field_type == 'inputModule') {
        let contentArr = arr_shopHomeData[i].content;
        for (let j = 0; j < contentArr.length; j++) {
          if (contentArr[j].required == true) {
            let titleData = contentArr[j].title;
            let nameData = contentArr[j].name;
            let regData = contentArr[j].reg;
            // 判断某项必填项未填
            if (params[nameData] == '') {
              return publicFun.warning('请输入' + titleData, that);
            }
            // 必填项的正则验证
            if (params[nameData]) {
              if (regData == 'phone') {
                if (!(/^1[23456789]\d{9}$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '格式输入不正确', that);
                }
              }
              if (regData == 'email') {
                if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '格式输入不正确', that);
                }
              }
              if (regData == 'url') {
                if (!(/^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '格式输入不正确', that);
                }
              }
              if (regData == 'number') {
                if (!(/^[0-9]*$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '请输入纯数字', that);
                }
              }
              if (regData == 'english') {
                if (!(/^[A-Za-z]+$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '请输入纯英文', that);
                }
              }
              if (regData == 'chinese') {
                if (!(/^[\u4e00-\u9fa5]+$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '请输入纯汉字', that);
                }
              }
              if (regData == 'numberAndEnglish') {
                if (!(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,25}$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '请输入数字和字母', that);
                }
              }
              if (regData == 'backCard') {
                if (!(/^([1-9]{1})(\d{15}|\d{16}|\d{18})$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '输入格式不正确', that);
                }
              }
              if (regData == 'userName') {
                if (!(/^[a-zA-Z0-9_-]+$/.test(params[nameData]))) {
                  return publicFun.warning(titleData + '输入格式应为字母，数字，下划线，减号', that);
                }
              }
            }
          }
          if (contentArr[j].required == false) {
            let titleData = contentArr[j].title;
            let nameData = contentArr[j].name;
            let regData = contentArr[j].reg;
            // 判断某项必填项未填
            if (params[nameData] != '') {
              // 必填项的正则验证
              if (params[nameData]) {
                if (regData == 'phone') {
                  if (!(/^1[23456789]\d{9}$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '格式输入不正确', that);
                  }
                }
                if (regData == 'email') {
                  if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '格式输入不正确', that);
                  }
                }
                if (regData == 'url') {
                  if (!(/^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '格式输入不正确', that);
                  }
                }
                if (regData == 'number') {
                  if (!(/^[0-9]*$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '请输入纯数字', that);
                  }
                }
                if (regData == 'english') {
                  if (!(/^[A-Za-z]+$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '请输入纯英文', that);
                  }
                }
                if (regData == 'chinese') {
                  if (!(/^[\u4e00-\u9fa5]+$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '请输入纯汉字', that);
                  }
                }
                if (regData == 'numberAndEnglish') {
                  if (!(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,25}$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '请输入数字和字母', that);
                  }
                }
                if (regData == 'backCard') {
                  if (!(/^([1-9]{1})(\d{15}|\d{16}|\d{18})$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '输入格式不正确', that);
                  }
                }
                if (regData == 'userName') {
                  if (!(/^[a-zA-Z0-9_-]+$/.test(params[nameData]))) {
                    return publicFun.warning(titleData + '输入格式应为字母，数字，下划线，减号', that);
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(params);
    // 验证成功后
    let url = "app.php?c=form&a=add";
    common.post(url, params, function (res) {
      console.log('提交成功', res)
      if (res.err_code == 0) {
        publicFun.warning(res.err_msg, that);
        let arr_shopHomeData = that.data.shopHomeData.custom_field_list;
        for (let i = 0; i < arr_shopHomeData.length; i++) {
          if (arr_shopHomeData[i].field_type == 'inputModule') {
            let contentArr = arr_shopHomeData[i].content;
            for (let j = 0; j < contentArr.length; j++) {
              if (contentArr[j].hasOwnProperty('group_value')) {
                contentArr[j].group_value = '';
                contentArr[j].a = 0;
              }
            }
          }
        }
        that.setData({
          shopHomeData: that.data.shopHomeData,
        })
        setTimeout(function () {
          that.setData({
            imgSrc: [],
            imgSrc2: [],
            videoSrc: [],
            province_index: 0,
            city_index: 0,
            country_index: 0,
            resetValue: '',
            sendcodeStatus: false
          })
        }, 800);
      }
      else {
        publicFun.warning(res.err_msg, that);
      }
    }, '')
  },
     // ----------2020-8-1 限时折扣-------------
  // 时间
  timeShowLimit: function (list) {
    let that = this;
    clearInterval(timer);
    timer = setInterval(() => {
      let targetTime = new Date();
      targetTime = Math.round(targetTime/ 1000);
      for(var i=0;i<list.length;i++) {
        var startTime = list[i].start_time;
        var endTime = list[i].end_time;
        var delta_T;
        if(targetTime<startTime) {
          var delta_T = startTime - targetTime;
        }
        if(targetTime>=startTime&&targetTime<endTime) {
           delta_T = endTime - targetTime;
        }
        if(targetTime>=endTime) {
  
        }
        var total_days = delta_T / (24 * 60 * 60);//总天数
        list[i].total_show = Math.floor(total_days); //实际显示的天数
        var total_hours = (total_days - list[i].total_show) * 24;//剩余小时
        list[i].hours_show = Math.floor(total_hours);//实际显示的小时数
        var total_minutes = (total_hours - list[i].hours_show) * 60; //剩余的分钟数
        list[i].minutes_show = Math.floor(total_minutes); //实际显示的分钟数
        var total_seconds = (total_minutes - list[i].minutes_show) * 60;//剩余的分钟数
        list[i].seconds_show = Math.floor(total_seconds); //实际显示的秒数
        if(list[i].total_show == 0) {
          list[i].total_show = '';
        }
        if (list[i].hours_show < 10) {
          list[i].hours_show = "0" + list[i].hours_show;
        }
        if (list[i].minutes_show < 10) {
          list[i].minutes_show = "0" + list[i].minutes_show;
        }
        if (list[i].seconds_show < 10) {
          list[i].seconds_show = "0" + list[i].seconds_show;
        }
      }
      that.setData({
        shopHomeData:that.data.shopHomeData
      })
    }, 1000);
  },
   //显示对话框
   shareTap: function(e) {
    var that = this;
    if (!app.isLoginFun(this)) { //判断用户是否登录
        common.setUserInfoFun(this, app);
        return false;
    }
    var product_id = e.currentTarget.dataset.product_id;
    var product_index = e.currentTarget.dataset.index;
    wx.setStorageSync('product_id', product_id);
    wx.setStorageSync('product_index', product_index);
    that.dialog.showDialog();
},
  //取消事件
  _cancelEvent: function () {
    var that = this;
    console.log('你点击了取消');
    try {
      clearInterval(loopDownloadTimer); // 清除检测downloadFile是否全部执行完的计时器
    } catch (e) {

    }
    // 修改画布执行状态
    if (that.data.canvasData) {
      that.data.canvasData.status = false;
    }
    that.setData({
      canvasData: that.data.canvasData
    })
    wx.hideLoading();
    that.dialog.hideDialog();
    that.setData({
      canvasImgState: false
    })
  },
  //分享好友或群
  _shareGroup: function () {
    var that = this;
    console.log('分享好友或群');
    wx.showShareMenu({
      withShareTicket: false
    })
  },
  //分享朋友圈
  _shareFriendsCircle: function (e) {
    var that = this;
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/index/index',
      id: wx.getStorageSync("product_id"),
      share_uid: getApp().globalData.my_uid,
      shareType: 1,
      leader_id: wx.getStorageSync("leader_id") || app.globalData.leader_id
    }
    // if(creatingPost){
    //     return false
    // }
    creatingPost = true
    wx.showLoading({
      title: '正在准备颜料...',
      mask: true
    })
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
            })
            // 处理canvas
            wx.showLoading({
              title: '海报生成中...',
              mask: true
            })
            that.creatPost();
            // 处理canvas
          } else if (res.data.err_code == 1000) {
            wx.hideLoading();
            creatingPost = false
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function (res) {
                that.dialog.hideDialog();
              }
            });
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
        creatingPost = false
      }
    })
  },
  // 生成分享海报
  creatPost: function () {
    let that = this;
    let custom_field_list = that.data.shopHomeData.custom_field_list;
    let product_index = wx.getStorageSync('product_index');
    console.log(product_index)
    var product_name;
    var product_price;
    var product_img;
   for(var i=0;i<custom_field_list.length;i++) {
    if(custom_field_list[i].field_type == 'limited_module') {
      // 1 设置画布数据
      product_name = custom_field_list[i].content.goodsLists[product_index].name;
      product_price = custom_field_list[i].content.goodsLists[product_index].now_money;
      product_img = custom_field_list[i].content.goodsLists[product_index].limited_discount_img
    }
   }

    let canvasData = { // 画布数据
      status: true,
      canvasId: 'productPost',
      // canvasWidth: 500,
      // canvasHeight: 680,
      // paddingLeft: that.data.winWidth * 0.15,
      // paddingTop: that.data.winWidth * 0.15,
      canvasWidth: 750,
      canvasHeight: 960 + 290,
      paddingLeft: 0,
      paddingTop: 0,
      radius: 10,
      bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
      bgPath: '../../images/white_bg.png', // 海报背景图
      whiteBg: '../../images/white_bg.png',
      heartPath: '../../images/heart.png', // 爱心图标
      product_name: product_name, // 活动名称
      product_price: product_price,
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方文字
      loadFailTapStatus: false, // 下载失败处理函数是否已执行
      // 图片数据
      avatarPath: that.data.shopHomeData.drp_data.avatar, // 用户头像
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      productImage: 'https://' + product_img.split('://')[1], // 商品首图
    };
    let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['productImage', 'qrcodePath', 'avatarPath']
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
      })
      that.drawCanvas();
      setTimeout(function () {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        that.save({
          id: that.data.canvasData.canvasId,
          w: w,
          h: h,
          targetW: w * 4,
          targetH: h * 4
        });
      }, 300)
    }).catch(err => {
      console.log(err);
      creatingPost = false
    })
  },

  // 画图 20-08-03 created by cms_ssa
  drawCanvas: function () {
    let that = this;
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部商品图片偏移量
    let innerLeft = 60;
    // 内部商品图片高度
    let imgH = w - (left + innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 80;
    let positionY = 0;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);

    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: left,
      y: top,
      w: w - left * 2,
      h: h - top * 2,
      r: 0,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });

    // 绘制头像
    positionY = top + 47;
    canvas.circleImg({
      ctx: ctx,
      img: that.data.canvasData.avatarPath,
      r: head_r,
      x: left + 68,
      y: positionY,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制头像右侧多行文字
    canvas.drawMultiText({
      ctx: ctx,
      text: '我看上了这款商品\n帮我看看咋样啊~\n比心~     ~',
      x: left + head_r * 2 + 113,
      y: top + 41,
      fontSize: 30,
      gap: 12
    });

    ctx.font = '30px PingFang-SC-Bold'
    let textW = ctx.measureText('比心~ ').width;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.heartPath,
      x: left + head_r * 2 + 113 + textW,
      y: top + 41 + (30 + 12) * 2,
      w: 30,
      h: 30
    });

    // 绘制中间容器
    positionY = positionY + head_r * 2 + 39;
    canvas.roundImg({
      ctx: ctx,
      x: left + innerLeft,
      y: positionY,
      img: that.data.canvasData.productImage,
      w: imgH,
      h: imgH,
      r: 14,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });

    let product_name_text = that.data.canvasData.product_name;
    // 绘制中间容器,商品名称,超出19个字显示两行，多两行，显示省略号
    if (product_name_text.length > 20) {
      if (product_name_text.length > 40) {
        product_name_text = product_name_text.slice(0, 20) + '\n' + product_name_text.slice(20, 39) + "...";
      } else {
        product_name_text = product_name_text.slice(0, 20) + '\n' + product_name_text.slice(20, product_name_text.length);
      }
      canvas.drawMultiText({
        ctx,
        gap: 5,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH + 5,
        fontSize: 30
      })
    } else {
      canvas.drawText({
        ctx: ctx,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH + 22,
        fontSize: 30
      });
    }

    // 绘制中间容器,商品价格
    // 右对齐的文字是以x的距离右对齐
    canvas.drawText({
      ctx: ctx,
      text: '¥' + that.data.canvasData.product_price,
      x: left + innerLeft,
      y: positionY + imgH + 100,
      fontSize: 50,
      color: '#b4282d',
      align: 'left'
    });

    console.log("====");
    console.log(that.data.canvasData.qrcodePath);

    //绘制分割线
    canvas.roundBorderRect({
      ctx, x: left + innerLeft, y: positionY + imgH + 190, h: 0.1, w: imgH, r: 0, border: "#eeeeee"
    })

    // 绘制二维码
    positionY = positionY + 466 + 24;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x: left + innerLeft + 10,
      y: positionY + 370,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码右侧文字
    canvas.drawText({
      ctx: ctx,
      text: '长按识别小程序码 即可查看~',
      x: left + innerLeft + qrode_r * 2 + 41,
      y: positionY + qrode_r + 375,
      fontSize: 30,
      baseline: 'middle',
      color: '#030000'
    });

    // 最终绘出画布
    ctx.draw();
  },

  // 画图 20-08-03 created by cms_ssa
  save: function (o) {
    let that = this;
    canvas.canvasToTempFilePath(o).then(function (res) {
      // console.log(res);
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath,
        canvasImgState: true,
      })
      canvas.saveImageToPhotosAlbum(o).then(function (res) {
        // console.log(res);
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              that.dialog.hideDialog();
              wx.previewImage({
                urls: [o.imgSrc],
                current: o.imgSrc
              })
              creatingPost = false
            }
          }
        })
      }, function (err) {
        console.log(err);
        wx.hideLoading();
        that.setData({ 'dialog.dialogHidden': false })
        creatingPost = false
      });
    }, function (err) {
      console.log(err);
    });
  },
  // tab切换
  tabSelect: function (e) {//仅原生/都有
    let that = this;
    discount_page = 1;
    that.setData({
      discount_showOrHide:false
    })
    let tabIndex = e.currentTarget.dataset.tabinx;
    let tabid = e.currentTarget.dataset.tabid;
    wx.setStorageSync('discount_tabid', tabid);
    let pageid = e.currentTarget.dataset.pageid;
    let params = {
      p:discount_page,
      activitiesId:tabid,
      page_id:pageid
    }
    let url = 'app.php?c=store&a=activities_product';
    let currentGoodsLists;
    let discount_next_page;
    common.post(url,params,function(res){
      console.log('限时特卖导航',res)
      if(res.err_code == 0){
        currentGoodsLists = res.data.goodsLists;
        discount_next_page = res.data.goods_page;
        console.log(currentGoodsLists);
        var custom_field_list = that.data.shopHomeData.custom_field_list;
        for(var i=0;i<custom_field_list.length;i++) {
          if(custom_field_list[i].field_type=='limited_module') {
            custom_field_list[i].content.nowKey = tabIndex;
            custom_field_list[i].content.goodsLists = currentGoodsLists;
          }
        }
        wx.showToast({
          title: "加载中..",
          icon: "loading",
          duration: 1500
        });
        that.setData({
          shopHomeData:that.data.shopHomeData,
          discount_next_page
        })
        setTimeout(() => {
          that.setData({
            discount_showOrHide:true
          })
        }, 1500);
        that.timeShowLimit(currentGoodsLists);
      };
    },'');
  }
})