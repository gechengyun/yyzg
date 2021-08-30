var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var wxParse = require('../../wxParse/wxParse.js');
var area = require('../../utils/area.js');
var app = getApp();
var canvasFun = require('../../utils/canvas-post.js');
var canvas = require('../../utils/canvas.js');
var start = new Date(); //用户访问时间
let it_timeout = null; //js截流定时器
let page = 1; //商品分页
let mode_index = -1; //最后一个模板索引
let cur_nav_index = 0; //当前模板选中商品分组索引
let is_repeat_msg = false;//是否多次点击发送
let creatingPost = false;
let discount_page = 1; //限时折扣分页
let timer;  //限时折扣定时器

/**
 * 百度的坐标系转换成腾讯的坐标系
 * @param bd_lat
 * @param bd_lon
 * @returns {Object}
 * @constructor
 */
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
Page({
  data: {
    localName: '合肥',
    groupmodalStatus: false,
    isDown: false,
    lafenImgurl: '', //海报图；链接
    ewmImgUrl: "", //二维码地址；
    shopImge: "", //商品地址；
    avaTarUrl: '', //头像本地地址
    commimgUrl: common.Url,
    haibaoCanvas: false, //海报
    lafenWindowsState: false, //拉粉弹窗
    scrollTop: {
      scroll_top: 0,
      goTopShow: false, // 返回顶部
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
    searchWrapObj: {}, // 搜索框相关
    currentTab: 0,
    productList: [],
    winWidth: 0,
    store_id: '',
    physical_id: '',
    callNumber: '',
    //自定义设置导航信息数据
    set_para: {
      multiple_num: 4, //默认显示滑块数量
      nav_check_id: 0, //导航选中id
      nav_to_menutop: 500, //初始菜单距离页面顶部距离
      need_fixed: false, //wxcss菜单吸顶
    },
    is_show_nav: false, //是否计算显示导航
    canvasIds: 'lafenCanvas',
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    groupWindowsShow: false,
    next_page: true, //商品分组是否还能继续翻页
    load_txt: '', //数据加载过程提示
    mode_tyle: '', //最后有一个展示模板
    make_fiex: false, //商品分组标题吸顶
    // default_index:0,//默认商品分组初次数据索引
    nowGrouperData: {},
    groupbuyData: '',
    playformType: '',//平台类型
    code: '',
    pcode: '',//手机号获取过期
    leader_id: '',//团长id
    live_list: ['','','',''],//直播组件list
    cur_page_id: 0,//当前页面id
    live_next_page: true,//直播组件默认开启加载分页
    live_page: 1,//直播组件分页页码

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
    videoSrc:[],//视频
    imgSrc: [],//图片
    imgSrc2: [],
    vthumb: '',//视频封面
    actionSheetHidden: true,//上传图片显示与否
    actionSheetVideo: true,  //上传视屏显示与否
    resetValue: '',
    codenum: 60,
    discount_next_page:false,
    discount_showOrHide:true,
  },
  watchBack: function (localName){
    console.log(localName)
    var that = this;
    that.setData({
      localName:localName
    })
  },
  onLoad: function (e) {
    var that = this;
    getApp().watch(that.watchBack)
    console.log('首页参数数据', e)
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
    page = 1;
    if (e.distance) {
      this.setData({
        distance: e.distance
      })
    }
    // console.log('app.globalData.navigateBarBgColor === ', app.globalData.navigateBarBgColor)
    app.updateThemeColor().then(function () {
      publicFun.setBarBgColor(app, that, 'white'); // 设置导航条背景色
    })
    var that = this;
    if (e.store_id != undefined && e.store_id != '') {
      app.globalData.store_id = e.store_id;
    } else if ((e.store_id == undefined || e.store_id == '') && app.globalData.store_id == '') {
      app.globalData.store_id = common.store_id;
    }
    if (e.leader_id) {
      this.setData({
        leader_id: e.leader_id
      });
      wx.removeStorageSync('leader_id');
      wx.setStorageSync(leader_id, leader_id)
    }
    if (e.share_uid) {
      getApp().globalData.share_uid = e.share_uid
    }
    let shareType = e.shareType || 2;
    // 首页扫码进入判断
    if (e.scene != undefined && e.scene != 'wxapp') { 
      var scene_id = decodeURIComponent(e.scene);
      var physical_id = 0;
      //console.log("扫码进入首页", scene_id);
      if (scene_id) {
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
         // console.log("解析二维码结果：",result);          
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id;
            getApp().globalData.share_uid = result.err_msg.share_uid;// 分享人uid
            that.setData({
              shareType : result.err_msg.shareType,
              physical_id :result.err_msg.physical_id,//门店ID
            }) 

            if (that.data.shareType == 'checkin') {  
              //console.log('签到页面扫码进入', that.data.shareType);
              physical_id = 0
              that.checkinFun(that.data.physical_id);
            }            
            if (that.data.physical_id) {
              physical_id = that.data.physical_id
            common.post('app.php?c=lbs&a=switch_substore&type=1', {
              physical_id
            }, function (result) {
              //console.log('扫描门店二维码', result);
              if (result.err_code == 0) {
                setTimeout(function () {
                  that.setData({
                    'shopHomeData.store.physical_title': result.err_msg.name
                  })
                }, 2000)
              }
            }, '');
          };
          }
        },'');  
      };
    }
    //拉粉注册分享人id  分享来源1商品 2本店推广；
    getApp().globalData.shareType = shareType || 2;
    //店铺id赋值
    this.setData({
      store_id: app.globalData.store_id
    })
    // 签到页面分享好友进入
    if (e.share_id) {
      that.checkinFun(e.share_id);
    }
    //分享到朋友圈-临时
    wx.showShareMenu({
      withShareTicket: false,
      menus: ['shareAppMessage', 'shareTimeline']
    })

    publicFun.setNavSize(this) // 通过获取系统信息计算导航栏高度

    //存储店铺分销类型(store_type 0传统 1礼包 2拉粉 3社区团购)
    let store_type = wx.getStorageSync('store_type');
    if (store_type != undefined) {
      this.setData({ store_type })
    }
    //拉粉、礼包、社区团购下需要判断用户是否有手机号
    if (store_type == 1 || store_type == 2 || store_type == 3) {
      app.getIphoneNum(this); //获取用户是否需要拉取手机号
      app.shareWidthPic(that);//是否展示分享图片
    }
    //社区团购模式下获取团长信息
    if (store_type == 3) {
      this.getLeaderlistStatus();
    }
    wx.login({
      success: res => {
        that.data.pcode = res.code;
      }
    })
  },
  onPullDownRefresh() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    page = 1;
    common.post('app.php?c=store&a=index&store_id=' + app.globalData.store_id, '', "shopHomeData", this);
    //setTimeout(wx.stopPullDownRefresh, 300)
  },
  onReady: function () {
    var that = this;

    publicFun.height(that);
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight,
        });
      }
    });


    clearTimeout(publicFun.timer);
    wx.showLoading({
      title: '加载中',
      mask: true,
    })

    common.post('app.php?c=store&a=index&store_id=' + app.globalData.store_id, '', "shopHomeData", that);


    app.isLoginFun(that, 1); // 判断用户是否登录
    var search = setInterval(function () {
      if (that.data.shopHomeData != undefined) {
        let custom_field_list = that.data.shopHomeData.custom_field_list;
        console.log(custom_field_list)
        clearInterval(search)
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
      }
    }, 500)
    this.dialog = that.selectComponent("#shareModalw");
    this.dialog = that.selectComponent("#shareModal");
  },
  onShow: function () {
    //获取用户上次打开小程序距这次的时间差,超过30分钟，重新获取地理位置
    // app.getTimeDifference();
    publicFun.getLocation();//获取经纬度定位
    // this.savaCurrentTime();
    //加载首页数据
    var that = this;
    //=========================检测登录授权====================================
    const { wxapp_ticket } = app.globalData;
    let wx_ticket = wxapp_ticket || wx.getStorageSync('ticket');
    if (wx_ticket) {
      if (this.data.shopHomeData != '') {
        publicFun.setUrl('')
      }

    } else {
      var config_data = publicFun.getCurrentPages();
      app.getUserInfo({
        pageThat: that,
        refreshConfig: config_data,
        callback: callbackFunc,
      });
    }

    // publicFun.checkAuthorize({ // (首页无法此种方式调用授权，原因未知)
    //     pageData: this.data.shopHomeData,
    //     app: app,
    //     callbackFunc: callbackFunc,
    // })

    function callbackFunc() { // 分销商刷新接口
      common.post('app.php?c=store&a=index&store_id=' + app.globalData.store_id, '', "shopHomeData", that);
    }
    //=========================检测登录授权====================================

    //用户uid
    this.setData({
      my_uid: getApp().globalData.my_uid
    })
    // 
    // that.getLeaderlistStatus();
    let _unlogin = wx.getStorageSync('unlogin') || getApp().globalData.unlogin;
    if (_unlogin != undefined) {
      if (_unlogin) {
        if (wx.getStorageSync('shopName')) {
          let shopName = wx.getStorageSync('shopName')
          that.setData({
            _unlogin: _unlogin,
            shopName: shopName
          })
        }

      }
    }
    this.setData({
      live_page: 1,
      live_next_page: true
    })
    //判断是否开启强制选择门店
    let open_physical_choose = wx.getStorageSync("open_physical_choose");
    if (open_physical_choose) {
      wx.reLaunch({
        url: '/pages/SHOPGOODS/pages/index/shopHomeList'
      })
    }
  },
  onHide: function () {
    clearTimeout(this.data.businessTimeInt);
    clearInterval(this.data.textScrollInterval);
    clearTimeout(this.noticeTimeout1)
    clearTimeout(this.noticeTimeout2)

    var end = new Date(); //用户离开时间
    var duration = end.getTime() - start.getTime();
    duration = duration / 1000; //单位秒
    const { wxapp_ticket } = app.globalData;
    var wx_ticket = wxapp_ticket || wx.getStorageSync('ticket');
    let that = this;
    wx.request({
      url: common.Url + "wap/visit.php" + '?request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + wx_ticket,
      data: {
        'visit_id': (that.data.shopHomeData ? that.data.shopHomeData.visit_id : 0) || 0,
        'duration': duration
      },
      header: {
        'Content-Type': 'application/json'
      },
      method: "POST"
    });

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
  shoppingCatNum: function (result) {
    if (result.err_msg == 1) {
      this.setData({
        shoppingCatNum: true,
      })
    }
  },
  shopHomeData: function (result) {
    // console.log('首页数据',result)    
    var that = this;
    if (result.err_code == 20000 || result.err_code == 10000) {
      that.onShow();
    }
    if (result.err_code == 0) {
      if (result.err_msg.store.store_id) {
        this.setData({
          newStoreId: result.err_msg.store.store_id
        })
      }
      // [bugID1006925]
      if (result.err_msg.store.physical_id) {
        wx.setStorageSync('physical_id', result.err_msg.store.physical_id);
      }



      wx.setStorageSync('orderlisttap', result.err_msg.show_index_img);
      // 后台切换门店
      if (app.globalData.userInfo !== null && app.globalData.switch_store === false && this.data.physical_id === '') {
        let data = {
          physical_id: result.err_msg.store.physical_id
        }
        common.post('app.php?c=lbs&a=switch_substore', data, shopHomeData, '');

        function shopHomeData(result) {
          if (result.err_code == 0) {
            app.globalData.switch_store = true;
            console.log('门店切换成功: ' + data.physical_id)
          }
        }
      }

      common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量

      let shopHomeData = result.err_msg;
      //获取当前门店数量
      let store_count = result.err_msg.store.physical_count;
      try {
        wx.setStorageSync('store_count', store_count)
      } catch (e) { }

      let custom_field_list = shopHomeData.custom_field_list;
      that.setData({
        last_mode_id: custom_field_list.length - 1
      })


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
            rich_text = wxParse.wxParse(`shopHomeData.custom_field_list[${i}].content`, 'html', rich_text, that, 5);
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
        if (custom_field_list[i].field_type == 'goods_group2') {
          //商品分组，每个模块对应的activetab应该区别改变
          let {
            productList
          } = that.data
          productList[i] = 0; //初始化每个activeTab为第0个
          that.setData({
            productList
          })
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
            query.select('.fiex-top-my').boundingClientRect()
            query.exec((res) => {
              if (res[0]) {
                // console.log('restop=========', res[0].top)
                this.setData({
                  menu_top: res[0].top,
                })
              }
              clearTimeout(st);
            })
          }, 500)

          // console.log("****", custom_field_list[i].content)
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
          console.log('ok')
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
              cur_page_id: result.err_msg.page_id,
              firstEnterLive: true,
              livePlayerData: arr_player,
              sort_type,
              is_show_colse: isShowColose,
              tagid: (tagid || -1)
            })
            // 加载直播组件数据
            let _params = this.getParam(channel, sort_type, tagid);
            this.loadLivePlayer(channel, _params, result.err_msg.page_id);

            //初始live-bar距菜单顶部距离
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
            }, 1000)
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
        if (custom_field_list[i].field_type == 'content_nav') { //导航数据
          // let nav_data = JSON.stringify(custom_field_list[i].content);
          // wx.setStorage({
          //   key: 'nav_data',
          //   data: nav_data,
          // })
          //导航

          let data = custom_field_list[i].content;
          console.log("11=>", data);
          let num = data.nav.length;
          const DEFAULT_NUM = 4; //默认显示滑块数量
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
        // 活动组件，标记活动状态
        if (activities_modules.includes(custom_field_list[i].field_type) && custom_field_list[i].activities) {
          for (let activity of custom_field_list[i].activities) {
            let statusClass = "activity-end"; //未开始和已结束的class都是这个（灰色）
            let {
              start_time,
              end_time
            } = activity
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

      let {
        open_index_show,
        live_code_title,
        live_code_description,
        live_code_logo
      } = shopHomeData.store
      let live_code_config = {
        open_index_show,
        live_code_title,
        live_code_description,
        live_code_logo
      }
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      this.setData({
        live_code_config,
        shopHomeData: shopHomeData
      })
      publicFun.barTitle(that.data.shopHomeData.title || that.data.shopHomeData.store.name, that);

      if (that.data.shopHomeData.store.physical_title == '') {
        var url = 'app.php?c=lbs&a=switch_substore'

        var location = {
          "location": wx.getStorageSync("latitude") + "," + wx.getStorageSync("longitude")
        };
        common.post(url, location, 'getStoreCB', that)
      } else {
        //【ID1001217】用户登录后，更新门店信息
        var _url = 'app.php?c=lbs&a=set_physical'
        common.post(_url, {}, 'upDataStore', that)
      }

      //若当前店铺已打烊，则跳向切换门店页面
      const { wxapp_ticket } = app.globalData;
      let wx_ticket = wxapp_ticket || wx.getStorageSync('ticket');
      if (that.data.shopHomeData.closing != undefined && that.data.shopHomeData.closing == '已打烊' && wx_ticket != '') {
        publicFun.text({
          title: '打烊提示',
          content: '当前店铺已打烊，点击跳转切换门店',
          footer: '知道了'
        }, that)
      }

      publicFun.storeNotice(that, null, shopHomeData.store.order_notice_open, shopHomeData.store.order_notice_time)


      this.setData({
        lafenWindowsState: false,
      })
      //首页团购展示

      wx.setStorageSync('comman', that.data.shopHomeData.show_head_type * 1);
      if (that.data.shopHomeData.show_head_type * 1 == 1) {
        let groupbuyUrl = "app.php?c=store&a=get_lead_config";
        common.post(groupbuyUrl, '', "showGroupbuy", that);
      }
      //首页分享弹窗开启；
      if (shopHomeData.open_dialog && shopHomeData.open_dialog == 1) { //弹
        let url = "app.php?c=goods&a=sharing_guidance";
        let sdata = {
          store_id: shopHomeData.store.store_id,
          share_uid: getApp().globalData.share_uid,
          pop_type: 1
        };
        common.post(url, sdata, "showWindows", that);
      } else { //不弹
        this.setData({
          lafenWindowsState: false,
        })
      }
    };
    wx.stopPullDownRefresh();
    wx.hideLoading();
  },
  // 获取位置
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log("经纬度===", res)
        let url = 'app.php?c=store&a=get_adress'
        let data = {
          lat: res.latitude,
          lng: res.longitude,
        }
        common.post(url, data, "getLocationFun", that)
      },
      fail: function (res) {
        publicFun.warning('定位失败，请稍后重试', that);
      }
    })
  },
  getLocationFun(res) {
    console.log('转义位置', res);
    let that = this;
    if (res.err_code == 0) {
      that.setData({
        positionName: res.err_msg
      });
    }
  },
// 去商品回放页面
goRecordvideo: function(e) {
  let that = this;
  if (!app.isLoginFun(that)) {//判断用户是否登录
    return false;
  }
  wx.navigateTo({
    url: `/pages/LIVEVIDEO/pages/liveVideo/goodsPlayback?product=${e.currentTarget.dataset.product}&live_id=${e.currentTarget.dataset.lived}&filesrc=${e.currentTarget.dataset.filesrc}&allrecord=${e.currentTarget.dataset.allrecord}&showStatus=${e.currentTarget.dataset.show_status}`
  })
  if(e.currentTarget.dataset.allrecord == 1){
      //更新回放次数
      let url = 'app.php?c=tencent_live&a=update_record_replay_num',
      data = {
        live_id: e.currentTarget.dataset.lived
      };
      common.post(url, data ,function(result){          
        if(result.err_code == 0){
          console.log(result)
        }
      },'');
    }  
},

  //获取团长信息及其是否有团长
  getLeaderlistStatus() {
    let that = this;
    let leader_id = wx.getStorageSync('leader_id');

    let lat = wx.getStorageSync('latitude');
    let lng = wx.getStorageSync('longitude');


    let url = 'app.php?c=store&a=get_leader_info',
      params = {
        lat: lat || '',
        lng: lng || '',
        leader_id: leader_id || this.data.leader_id
      };
    common.post(url, params, "getLeaderDataFun", that)
  },
  getLeaderDataFun(res) {
    let that = this;
    wx.setStorageSync("open_community_group", res.err_msg.open_community_group)
    if (res.err_code == 0 && res.err_msg.open_community_group == 1) {

      console.log('团长列表', res)
      that.setData({
        playformType: res.err_msg.open_community_group
      })
      if (res.err_msg.status == 1 && res.err_msg.leader_list.length <= 0 && !res.err_msg.now_leader) { //如果我是在申请团长中审核未通过，没有当前团长也没有团长列表
        wx.navigateTo({
          url: '/pages/groupbuying/applyform/applystatus'
        })
        return;
      }
      if (res.err_msg.status != 1 && (!res.err_msg.now_leader || res.err_msg.now_leader.length == 0)) { //我没有选择团长的情况去团长选择页面
        wx.navigateTo({
          url: '/pages/SHOPGOODS/pages/groupbuying/community'
        })
        return
      }
      if (res.err_msg.buy_list.length > 5) {
        res.err_msg.buy_list = res.err_msg.community_user.slice(0, 5);
      }
      wx.setStorageSync('physical_id', res.err_msg.now_leader.physical_id);
      that.setData({
        "nowGrouperData.leader": res.err_msg.now_leader,
        "nowGrouperData.buy_list": res.err_msg.buy_list,
        // playformType: res.err_msg.open_community_group
      })

      //或者团长id
      if (res.err_code == 0) {
        const { leader_id } = res.err_msg.now_leader;
        this.setData({
          leader_id
        })
      }
    }
  },
  //获取当前团长信息
  getNowleader() {
    let physical_id = wx.getStorageSync('physical_id');
    let url = 'app.php?c=store&a=get_current_community_info',
      params = {
        physical_id: physical_id,
        limit: 5,
        page: 1
      };
    common.post(url, params, function (res) {
      if (res.err_code == 0) {
        console.log('当前团长', res)
        if (result.err_msg.community_user.length > 5) {
          result.err_msg.community_user = result.err_msg.community_user.slice(0, 5);
        }
        that.setData({
          nowGrouperData: res.err_msg
        })
      }
    }, '')
  },
  showGroupbuy: function (res) {
    console.log('团购展示信息', res)
    if (res.err_code == 0) {
      this.setData({
        groupbuyData: res.err_msg
      })
      if (res.err_msg.community_first_show == 1) {
        this.setData({
          groupWindowsShow: true,
          groupbuyData: res.err_msg
        })
      }

    }
  },
  showWindows: function (res) { //弹窗数据
    console.log(this);
    if (res.err_code == 0) {
      let userImages = res.err_msg.logo;
      if (userImages.indexOf('http') > -1) {
        userImages = userImages
      } else {
        userImages = this.data.commimgUrl + 'upload/' + userImages;
      }

      this.setData({ //弹窗数据
        userImages, //弹窗头像
        windowsData: res.err_msg,
        lafenWindowsState: true //开启拉粉弹窗
      })


    }
  },
  hideTexBox: function () { // 关闭文本弹窗
    let that = this
    publicFun.hideTexBox(this);
    console.log(that.data.playformType, "that.data.get_leader_infothat.data.get_leader_info")
    if (that.data.playformType == 1) {
      wx.navigateTo({
        url: '/pages/SHOPGOODS/pages/groupbuying/community',
      })
    } else {
      wx.navigateTo({
        url: '/pages/SHOPGOODS/pages/index/shopHomeList',
      })
    }

  },


  getStoreCB: function (res) {
    var that = this
    if (res.err_msg != undefined) {
      that.data.shopHomeData.store.physical_title = res.err_msg.name
      that.data.shopHomeData.store.physical_id = res.err_msg.pigcms_id
      that.setData({
        'shopHomeData': that.data.shopHomeData,
      });
    }
  },
  oppenShopping: function (e) { //加入购物袋
    var that = this
    publicFun.oppenShopping(e, that);
  },
  addImg: function (e) { //图片上传
    var that = this;
    let index = e.target.dataset.index;
    publicFun.addImgMessage(that, index);
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
    let {
      current
    } = e.detail;
    let {
      t_index
    } = e.currentTarget.dataset
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
    that.setData({
      toView: 'product'
    });
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
    mode_index = dataset.t_index; //当前点击商品分组所在index模板索引
    let groupId = dataset.groupid; //组件id
    // console.log("groupId+++++++", groupId)
    //是最后一个模板且是商品分组
    // if (mode_index == this.data.last_mode_id){
    cur_nav_index = dataset.curindex; //当前分组导航索引
    page = 0; //重置分页页码
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
  //临时 分享朋友圈
  onShareTimeline: function (e) {
    console.log(this.data._barTitle)
    return {
      title: this.data._barTitle,
      imageUrl: this.data.shopHomeData.store.logo ? this.data.shopHomeData.store.logo : ''
    }
  },
  onShareAppMessage: function (e) {
    var that = this;
    let leader_id = this.data.leader_id;
    this.setData({
      haibaoCanvas: false,
      showSearch: false
    })
    var my_uid = this.data.my_uid;
    return getApp().shareGetFans(that.data.groupbuyData.share_title, '', '/pages/index/index', 2, '', '', leader_id);
  },
  onPageScroll: function (e) {
    var that = this;

    // 返回顶部
    if (e.scrollTop > 500) {
      that.data.scrollTop.goTopShow = true;
    } else {
      that.data.scrollTop.goTopShow = false;
    }

    // 搜索框置顶
    if (e.scrollTop > that.data.searchWrapObj.offTop) {
      that.data.searchWrapObj.className = 'fixedTop';
    } else {
      that.data.searchWrapObj.className = '';
    }
    that.setData({
      'searchWrapObj': that.data.searchWrapObj,
      'scrollTop': that.data.scrollTop
    })

    // 导航
    if (!this.data.is_show_nav) return;
    if (this.data.nav_data.line != 1) return;
    if (it_timeout) {
      clearTimeout(it_timeout);
    }

    it_timeout = setTimeout(() => {
      let nav_to_menutop = this.data.set_para.nav_to_menutop;
      let page_scroll = e.scrollTop;
      let need_fixed = 'set_para.need_fixed';
      if ((page_scroll - nav_to_menutop) < 0) {

        this.setData({
          [need_fixed]: false
        })
        return;
      } else {
        this.setData({
          [need_fixed]: true
        })
        // console.log(`distance:${page_scroll - nav_to_menutop}`)
      }
    }, 10)
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
    let {
      detail: {
        status,
        activityId,
        customFieldIndex
      }
    } = options
    let activityIndex = this.data.shopHomeData.custom_field_list[customFieldIndex].activities.findIndex(item => item.pigcms_id == activityId)
    let statusClasses = ['activity-unstart', '', 'activity-end']
    let keyName = `shopHomeData.custom_field_list[${customFieldIndex}].activities[${activityIndex}].statusClass`
    this.setData({
      [keyName]: statusClasses[status - 1]
    })
  },
  // 店铺电话
  callTel: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.tel,
      success: function () { },
      fail: function () {
        wx.showToast({
          title: '拨号失败！',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  goAdress: function (e) {
    var longitudeInfo = e.currentTarget.dataset.longitude;
    var latitudeInfo = e.currentTarget.dataset.latitude;
    let {
      lng,
      lat
    } = BdmapEncryptToMapabc(latitudeInfo, longitudeInfo);
    wx.getLocation({ //获取当前经纬度
      type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
      success: function (res) {
        wx.openLocation({ //​使用微信内置地图查看位置。
          latitude: lat, //要去的纬度-地址
          longitude: lng, //要去的经度-地址
          name: e.currentTarget.dataset.storename,
          address: e.currentTarget.dataset.province + e.currentTarget.dataset.city + e.currentTarget.dataset.area + e.currentTarget.dataset.address
        })
      }
    });
  },
  officialAccountError(error) {
    console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
    console.log({
      error
    });
    this.setData({
      applet_guide_subscribe: false
    })
  },
  swiperChange: function (e) {
    let {
      current
    } = e.detail
    let {
      bannerIndex
    } = e.currentTarget.dataset
    this.setData({
      [`shopHomeData.custom_field_list[${bannerIndex}].content.current_indicator_index`]: current
    })
  },
  //关闭拉粉弹窗
  closeLafenWindows() {
    this.setData({
      lafenWindowsState: false,
      showSearch: false
    })
  },
  //展示分享界面
  showShareOperation() {
    this.setData({
      lafenWindowsState: false,
      showOpertaion: true
    })
  },
  //询问保存
  saveHaobao() {
    wx.showShareMenu({
      withShareTicket: false
    })
  },

  // 海报生成
  showCanvasWind(e) {
    console.log(e);
    this.setData({
      showSearch: false
    })
    setTimeout(() => {
      wx.showLoading({
        title: '海报生成中...',
      })
    }, 1000)
    var that = this;
    let data = {
      store_id: getApp().globalData.store_id,
      leader_id: e.currentTarget.dataset.leader_id
    }
    //获取海报详情
    if (that.data.playformType == 0) {
      common.post("app.php?c=ucenter&a=get_share_info", data, callBack, "");
    } else {
      common.post("app.php?c=community_leader&a=get_share_info", data, callBack, "");
    }

    function callBack(res) {
      console.log(res);
      if (res.err_code == 0) {
        that.setData({
          haibaoData: res.err_msg
        })
        that.getEwmCode();
      } else {
        console.log(res);
      }
    }

    // this.setData({
    //   haibaoCanvas: true
    // })
  },
  save: function (o) {
    let that = this;
    canvas.canvasToTempFilePath(o).then(function (res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath,
        canvasImgState: true,
      })
      canvas.saveImageToPhotosAlbum(o).then(function (res) {
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              wx.previewImage({
                urls: [o.imgSrc],
                current: o.imgSrc
              })
            }
          }
        })
      }, function (err) {
        console.log('错误', err);
        wx.hideLoading();
        // that.setData({ 'dialog.dialogHidden': false })
        that.setData({
          showOpertaion: false
        })
      });
    }, function (err) {
      console.log(err);
    });
  },
  getEwmCode() { //获取二维码 
    var that = this;
    let data = {
      path: "pages/index/index",
      id: this.data.physical_id,
      uid: getApp().globalData.my_uid,
      share_uid: getApp().globalData.my_uid,
      shareType: 2
    }
    const { wxapp_ticket } = app.globalData;
    let ticket = wxapp_ticket || wx.getStorageSync('ticket');
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功', res);
        if (res.err_msg == "失败") {
          wx.hideLoading();
          that.setData({
            lafenWindowsState: false
          })
          return false
        }
        //异步下载图片资源
        let ewmImgUrlDownLoad = '';
        let avaTarUrlDownLoad = '';
        let shopImgeDownLoad = '';
        ewmImgUrlDownLoad = new Promise((resolve, reject) => { //下载二维码
          let url = res.data.err_msg
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  ewmImgUrl: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", url);
              wx.hideLoading();
              reject();
            }
          })
        })

        avaTarUrlDownLoad = new Promise((resolve, reject) => { //下载头像
          let url = that.data.haibaoData.avatar;
          if (url.indexOf("https") == -1) {
            url = that.data.commimgUrl + "upload/" + url;
          }
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  avaTarUrl: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", url);
              wx.hideLoading();
              reject();
            }
          })
        })

        shopImgeDownLoad = new Promise((resolve, reject) => { //下载商品
          let url = that.data.haibaoData.image;
          console.log(url);
          if (url.indexOf("https") == -1) {
            url = that.data.commimgUrl + "upload/" + url;
          }
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                console.log(res);
                that.setData({
                  shopImge: res.tempFilePath
                })
                resolve();
              }
            },
            fail: res => {
              console.log("下载失败", url);
              wx.hideLoading();
              reject();
            }
          })
        })

        let qCodeStatus = Promise.all([ewmImgUrlDownLoad, avaTarUrlDownLoad, shopImgeDownLoad]);
        qCodeStatus.then(() => {
          that.makeCanvas();
          setTimeout(function () {
            let w = that.data.canvasWidth;
            let h = that.data.canvasHeight;
            that.save({
              id: that.data.canvasIds,
              w: w,
              h: h,
              targetW: w * 4,
              targetH: h * 4
            });
          }, 300)
        }).catch((error) => {
          console.log(error);
          wx.hideLoading();
          wx.showModal({
            title: '提示信息',
            content: "海报生成失败，请重试...",
            confirmText: '知道了',
            showCancel: false,
            confirmColor: '#fe6b31',
            success: (result) => {
              wx.hideLoading();
              that.setData({
                haibaoCanvas: false,
              })
            }
          })
        })
      },
      fail: function (res) {
        console.log('获取二维码fail', res);
        wx.hideLoading();
        wx.showModal({
          title: '提示信息',
          content: "海报生成失败，请重试...",
          confirmText: '知道了',
          showCancel: false,
          confirmColor: '#fe6b31',
          success: (result) => {
            that.setData({
              haibaoCanvas: false,
            })
          }
        })
      }
    })
  },
  draw2(ctx, x, y, width, height, radius, color, type) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x, y);
    ctx[type + 'Style'] = color || params.color;
    ctx.closePath();
    ctx[type]();
  },
  drawcommon(ctx, x, y, width, height, radius, color, type, num) {
    let radiusBottom = radius;
    let radiusTop = radius;
    ctx.beginPath();
    if (num == 2) {
      radiusBottom = 0;
    }
    ctx.moveTo(x, y + radiusBottom);
    ctx.lineTo(x, y + height - radiusBottom);
    ctx.quadraticCurveTo(x, y + height, x + radiusBottom, y + height);
    ctx.lineTo(x + width - radiusBottom, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radiusBottom);
    if (num == 1) {
      radiusTop = 0;
    }
    ctx.lineTo(x + width, y + radiusTop);
    ctx.quadraticCurveTo(x + width, y, x + width - radiusTop, y);
    ctx.lineTo(x + radiusTop, y);
    ctx.quadraticCurveTo(x, y, x, y + radiusTop);
    ctx[type + 'Style'] = color || params.color;
    ctx.closePath();
    ctx[type]();
  },
  makeCanvas() {
    let that = this;
    let haibaoData = this.data.haibaoData;
    let title = haibaoData.nickname;
    // if (haibaoData.is_member == 0){
    //   title = "邀请" + haibaoData.num + "粉享" + haibaoData.degree_name;
    // }
    let name = haibaoData.name;
    let original_price = haibaoData.original_price ? haibaoData.original_price : 0;
    let price = haibaoData.price;
    let ratio_money = haibaoData.ratio_money; //赚多少；
    //canva绘制背景图要用本地图片
    let lafenBg = '/images/lafenbg.png';
    let canvasWidth = this.data.winWidth;
    let bili = canvasWidth / 635;
    let canvasHeight = 1100 * bili;
    this.setData({
      canvasWidth,
      canvasHeight
    })
    const context = wx.createCanvasContext('lafenCanvas');
    context.clearRect(0, 0, 635 * bili, 1100 * bili);
    //绘制背景
    context.drawImage(lafenBg, 0, 0, 635 * bili, 1100 * bili);

    context.save();

    context.beginPath();
    //先画个圆，前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
    context.arc(85 * bili, 100 * bili, 45 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.avaTarUrl, 40 * bili, 55 * bili, 90 * bili, 90 * bili);
    context.restore();
    context.closePath();
    context.save();
    // 谈话框
    // that.draw2(context, 140 * bili, 100 * bili, 460 * bili, 72 * bili, 36 * bili, "white", "fill");
    // 设置文字颜色
    context.setFontSize(30 * bili);
    context.fillStyle = "#fff";
    //显示标题
    context.fillText(title, 140 * bili, 120 * bili);
    context.setFontSize(28 * bili);
    context.fillStyle = "#000";
    // context.fillText("HI~ 我送你一个新人福利！", 180 * bili, 150 * bili);

    //绘制商品
    that.drawcommon(context, 40 * bili, 200 * bili, 560 * bili, 460 * bili, 8 * bili, "black", "fill", 2);
    context.clip();
    context.drawImage(this.data.shopImge, 40 * bili, 200 * bili, 560 * bili, 460 * bili);
    context.restore();
    context.closePath();
    context.save();
    // 绘制谈话框
    // 绘制文字盒子
    that.drawcommon(context, 40 * bili, 640 * bili, 560 * bili, 200 * bili, 8 * bili, "white", "fill", 1);
    context.save();

    //商品名称
    context.setFontSize(30 * bili);
    context.setFillStyle('#333');
    if (name.length > 16) { //商品名字长度兼容
      let name_a = name.slice(0, 16) + "...";
      // let name_a = name;
      // let name_b = name.slice(9, 17) + "...";
      context.fillText(name_a, 60 * bili, 710 * bili);
    } else {
      context.fillText(name, 60 * bili, 710 * bili);
    }

    //绘制金额；
    context.setFillStyle('#f62049');
    context.fillText("￥", 60 * bili, 770 * bili);
    context.setFontSize(40 * bili);
    context.fillText(price, 84 * bili, 770 * bili);
    if (price.length < 8) { //适配
      // context.drawImage('/images/price.png', (context.measureText(price).width + 160) * bili, 742 * bili, 121 * bili, 30 * bili);
      context.setFillStyle('#ffffff');
      context.setFontSize(18 * bili);
      // context.fillText("赚" + ratio_money, (context.measureText(price).width + 220) * bili, 765 * bili);
      // context.fillText("新人专享价", (context.measureText(price).width + 220) * bili, 765 * bili);
    }
    if (original_price != 0) { //没有划线价不显示；
      //原始金额
      context.setFontSize(24 * bili);
      context.setFillStyle('#e1e1e1');
      context.fillText("￥", 60 * bili, 810 * bili);
      context.fillText(original_price, 90 * bili, 810 * bili);
      //横线
      context.moveTo(60 * bili, 802 * bili);
      context.lineTo(164 * bili, 802 * bili);
      context.lineWidth = 1;
      context.strokeStyle = "#e1e1e1";
      context.stroke();
    }


    context.save();
    context.setFillStyle('#fff');
    context.setFontSize(24 * bili);
    context.fillText("长按扫码购买", 250 * bili, 1060 * bili);
    context.closePath();
    //绘制二维码
    context.moveTo(317 * bili, 948 * bili);
    context.beginPath();
    context.arc(320 * bili, 947 * bili, 68 * bili, 0, Math.PI * 2, false);
    context.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。
    context.drawImage(this.data.ewmImgUrl, 252 * bili, 880 * bili, 136 * bili, 136 * bili);
    context.restore();
    context.draw({
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvasId: 'lafenCanvas',
    }, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          width: this.data.canvasWidth,
          height: this.data.canvasHeight,
          canvasId: 'lafenCanvas',
          fileType: 'png',
          quality: 1.0,
          success: res => {
            let data = res.tempFilePath;
            wx.hideLoading();
          },
          fail: fail => {
            console.log(fail);
            wx.hideLoading();
            wx.showModal({
              title: '提示信息',
              content: "海报生成失败，请重试...",
              confirmText: '知道了',
              showCancel: false,
              confirmColor: '#fe6b31',
              success: (result) => {
                // this.setData({
                //   haibaoCanvas: false
                // })
              }
            })
          }
        })
      }, 1000)
    })
  },
  gotoNewPeople() {
    this.setData({
      lafenWindowsState: false,
    })
    wx.navigateTo({ //去新人列表
      url: '/pages/new_user/index',
    })
  },
  closeCanvas() {
    this.setData({
      showOpertaion: false,
      haibaoCanvas: false,
      showSearch: false
    })
  },
  xFshowWindows() { //点击悬浮打开  is_skip 0打开 1打开海报
    var that = this;
    if (this.data.shopHomeData.is_skip == 0) {
      // this.setData({
      //   lafenWindowsState:true
      // })
      let url = "app.php?c=goods&a=sharing_guidance";
      let sdata = {
        store_id: this.data.shopHomeData.store.store_id,
        share_uid: getApp().globalData.share_uid,
        pop_type: 0,
      };
      common.post(url, sdata, "showWindows", that);
    } else if (this.data.shopHomeData.is_skip == 1) {

      this.showShareOperation();
    }
  },
  touchStart(e) {
    console.log(e);
    this.setData({
      isTouch: true
    })
    let query = wx.createSelectorQuery();
    query.select('#homePage').boundingClientRect(rect => {
      console.log(rect);
      this.setData({
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top,
        isDown: true
      })
    }).exec();
  },
  touchMove(e) {
    if (this.data.isDown == false) {
      return;
    }
    this.setData({
      isTouch: true
    })
    var L = e.changedTouches[0].clientX - this.data.x;
    var T = e.changedTouches[0].clientY - this.data.y;
    let query = wx.createSelectorQuery();
    if (L < 10) {
      L = 0;
    } else if (L > this.data.winWidth - 100) {
      L = this.data.winWidth - 100;
    }

    if (T < 10) {
      T = 0;
    } else if (T > this.data.winHeight - 100) {
      T = this.data.winHeight - 100;
    }
    this.setData({
      Style: 'left:' + L + 'px;top:' + T + 'px;right:unset;bottom:unset;'
    })
  },
  touchEnd(e) {
    let Style = this.data.Style;
    this.setData({
      isDown: false,
      showSearch: '隐藏input'
    })

  },
  showgroupModal() {
    let data = {
      source: 0,
      product_id: '',

    };
    let group_black_code = '';
    let that = this;

    common.post("app.php?c=live_code&a=get_group_code_id", data, function callBack(res) {
      if (res.err_code == 0) {
        console.log('客服交流', res)
        group_black_code = res.err_msg;
        let group_title = res.err_dom;
        that.setData({
          groupmodalStatus: true,
          group_black_code: group_black_code,
          group_title: group_title
        })
      }
    }, "")
  },
  hidegroupModal() {
    this.setData({
      groupmodalStatus: false
    })
  },
  goinGroupnew() {
    console.log(11111);
  },
  closeGroupWindows() {
    this.setData({
      groupWindowsShow: false
    })
  },
  //上拉加载
  onReachBottom() {
    let that = this;
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
        let url = `app.php?c=goods&a=get_goods_by_group&store_id=${store_id}&group_type=${filed_type}&group_id=${group_id}&page=${page}`
        // console.log("url***>", url)
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
      else if (last_field_type == "live_player") {
        let live_fiex = false;
        let live_menu_top = this.data.live_menu_top;
        if (e.scrollTop > live_menu_top) {
          live_fiex = true;
        } else {
          live_fiex = false;
        }
        this.setData({
          live_fiex
        })
      }
      else if (last_field_type == "limited_module") {
        let discount_fiex = false;
        let discount_menu_top = this.data.discount_menu_top;
        // console.log(e.scrollTop)
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
  //【ID1001217】更新门店信息
  upDataStore: function (result) {
    if (result.err_code === 0) {
      const { name, pigcms_id } = result.err_msg;
      this.setData({
        'shopHomeData.store.physical_title': name,
        'shopHomeData.store.physical_id': pigcms_id
      })
    }
  },
  //isLogin登录

  isLogin: function (e) {
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
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
  // 扫码购
  ad_scan: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
    });
    wx.scanCode({
      success(res) {
        console.log('扫码结果', res);
        if (res.result) {
          that.setData({
            scanVal: res.result
          });
          that.scanSuccess();
          wx.hideLoading();
        }
      },
      fail(res) {
        wx.hideLoading();
        return publicFun.warning('扫码失败', that);
      }
    })
  },
  // 扫码成功
  scanSuccess: function () {
    let that = this;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      code: that.data.scanVal
    };
    common.post('app.php?c=store&a=discern_qrcode', data, function (res) {
      wx.navigateTo({
        url: '/pages/SHOPGOODS/pages/shoppingCat/scanBuy',
      })
    }, '');
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
  loadLivePlayer: function (_type, _params, page_id) {
    let that = this;
    let _url = `/app.php?c=tencent_live&a=get_live_list`;
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      tagid: that.data.tagid,
      keys: that.data.topicVal,
      page: 1
    };
    common.post(_url, data, `loadLivePlayerData`, this);
  },
  //加载直播组件--数据
  loadLivePlayerData: function (result) {
    console.log(`******直播数据展示>>`, result);
    if (result.err_code == 0) {
      const { list, next_page, subscribe_template_id } = result.err_msg;
      let data_live_list = this.data.live_page == 1 ? [] : (this.data.live_list || []);
      data_live_list = [...data_live_list, ...list];
      // data_live_list = [...list].slice(0,4);
      this.setData({
        live_list: data_live_list,
        live_next_page: next_page,
        live_page: this.data.live_page + 1,
        subscribe_template_id
      })




    }
  },
  //不可预约状态-预约
  appointed: function (e) {
    if (e) {
      const { status } = e.currentTarget.dataset;
      if (status == 1) {
        publicFun.warning('直播已开始，无法预约', this);
      } else {
        publicFun.warning('直播结束无法预约', this);
      }
    }

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

  //更改直播项
  swiperChangeChannel: function (event) {

    const { current, source } = event.detail;

    let arrChannel = this.data.livePlayerData;//频道数据

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
    console.log(imgScale, '------', nowImgH, oldImgW);
    this.setData({
      ['nowImgH[' + arrIndex + ']']: nowImgH
    })
  },
  // 积分统计
  checkinFun: function (share_id) {
    let that = this;
    let url = 'app.php?c=ucenter&a=get_point_by_share';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      share_id: share_id,
      physical_id: 0,
    };
    common.post(url, data, function (res) {
      console.log('积分统计', res)
    }, '')
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
        arr_shopHomeData[i].content[index].default_value = len;
      }
    }
    this.setData({
      shopHomeData: that.data.shopHomeData
    })
  },
  // 下拉框和单选
  selectChange: function (e) {
    let that = this;
    app.isLoginFun(this, 1);//判断用户是否登录
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
    // 上传图片/地址选择
    let imageName = e.detail.target.dataset.imagename;
    let videoName = e.detail.target.dataset.videoname;
    let areaName = e.detail.target.dataset.areaname;
    e.detail.value.area = that.data.country_name_arr[e.detail.value.area];
    e.detail.value.city = that.data.city_name_arr[e.detail.value.city];
    e.detail.value.province = that.data.province_name_arr[e.detail.value.province];
    e.detail.value[areaName] = e.detail.value.province + e.detail.value.city + e.detail.value.area+e.detail.value[areaName];
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
      path: 'pages/product/details',
      id: wx.getStorageSync("product_id"),
      share_uid: getApp().globalData.my_uid,
      shareType: "product",
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
      avatarPath: that.data.shopHomeData.user_avatar, // 用户头像
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
          title: "加载中...",
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
  },
  // 跳到分类
  navigateToClass() {
    wx.navigateTo({
      url: '/pages/goods_category/index'
    }) 
  },
  // 更多直播跳转
  gomoreLive() {
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoList'
    }) 
  }
})