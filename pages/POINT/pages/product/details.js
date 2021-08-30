var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvasFun = require('../../../../utils/canvas-post.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();
let page = 1;
let i = 0;
let creatingPost = false;
Page({
    data: {
      canvasImgState:false,
      canvasData:{},
      canvasImg:"",
      selected: true,
      selected1: false,
      scrollTop: {
          scroll_top: 0,
          goTopShow: false
      },
      scrollTopView:"",//值应为某子元素id（id不能以数字开头）。设置哪个方向可滚动，则在哪个方向滚动到该元素，防止设置页面scrollTop带来的页面抖动
      shoppingData: {
          shoppingShow: false,
          shoppingCatData: '',
          deliver_date_index:0,
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
          date: '2016-09-01',
          time: '12:00',
      },
      currentTab: 0,
      productList: 0,
      tab: 'HAO',
      type: 0,
      businessTimeInt: '',
      productListSwichNav: [],
      insideShow: false, //内部价提示控制
      common_list_index: 0, //评论列表所在下标
      showBigPic: false,
      substoreList:[],
      oppenShopList:false,
      dialog:{
          dialogHidden:true,
          titleMsg:"海报图保存失败，用户取消或未开启保存到相册权限",
          determineBtnTxt:"去开启"
      },
      total_show: '00',
      hours_show: '00',
      minutes_show: '00',
      seconds_show: '00',
      instant: new Date(),
      isScroll:true,
      comman: '',
      more_show: false,
      pcode:'',//code是否过期
    },

    onLoad: function (e) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        var product_id = '';
        var preview = 0;
        if (e.scene != undefined) {
            var scene_id = decodeURIComponent(e.scene);
            console.log("积分页面二维码",scene_id);
            if (scene_id) { // 预览模式
            //     product_id = scene.split(',')[1];
            //     preview = 1;
            //     //scene.split(',')[0]
            //   app.globalData.store_id = scene.split(',')[0];
            //     var physical_id = scene.split(',')[2];
            //     app.globalData.share_uid = scene.split(',')[3];
            //     if(physical_id){
            //         this.setData({
            //             physical_id:physical_id
            //         })
            //         //融合的 type=1为切换门店，否则是查找最近的店铺
            //         common.post('app.php?c=lbs&a=switch_substore&type=1', {physical_id}, function (result) {
            //             console.log('扫描门店商品二维码',result);
            //         }, '');
            //     }
                let url = 'app.php?c=store&a=get_share_data',
                data = {
                scene_id: scene_id
                };
                //仿商品详情页  不要参数要去除
                common.post(url, data ,function(result){
                    console.log("123",result);
                    if(result.err_code == 0){
                      product_id = result.err_msg.product_id;
                      console.log('详情页product_id',product_id);
                      preview = 1;
                      app.globalData.store_id = result.err_msg.store_id;
                      physical_id = result.err_msg.physical_id;
                      app.globalData.share_uid = result.err_msg.share_uid;// 分享人uid  
                      //app.globalData.leader_id =  result.err_msg.leader_id;
                      console.log('store_id',app.globalData.store_id);
                      that.setData({
                        product_id: product_id,
                        preview: preview,
                    });
                     // wx.removeStorageSync('leader_id');
                     // wx.setStorageSync('leader_id', result.err_msg.leader_id);
                        if(physical_id){
                          that.setData({
                              physical_id:physical_id,
                              leader_id: result.err_msg.leader_id 
                          })
                          //融合的 type=1为切换门店，否则是查找最近的店铺
                          common.post('app.php?c=lbs&a=switch_substore&type=1', {physical_id}, function (result) {
                              console.log('扫描门店商品二维码',result);
                          }, '');
                      }   
                      //that.readyOn(e);         
                    }
                  },''); 
            }
        } else { // 正常模式
            if (e.store_id != undefined && e.store_id != '') {
                app.globalData.store_id = e.store_id;
            } else if ((e.store_id == undefined || e.store_id == '') && app.globalData.store_id == '') {
                app.globalData.store_id = common.store_id;
            }
            product_id = e.product_id;

            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
            getApp().globalData.shareType = e.shareType || 1;
            
            console.log('商品id', product_id)
            wx.setStorageSync("product_id", product_id);

        }
        wx.setStorageSync("product_id", product_id);
        
        this.setData({
            product_id: product_id,
            preview: preview,
            comman: wx.getStorageSync('comman')
        });

      //是否展示分享图片
      app.shareWidthPic(that);
      
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      // getApp().globalData.share_uid = e.share_uid || '';
      // getApp().globalData.shareType = e.shareType || 1;
      wx.login({
        success: res => {
          that.data.pcode = res.code;
        }
      })
    },
    onReady: function (e) {
        var that = this;
        let url = '/pages/POINT/pages/product/details?product_id=' + that.data.product_id;
        publicFun.setUrl(url);
      common.post('app.php?c=goods&a=index&app=app&store_id=' + app.globalData.store_id + '&id=' + that.data.product_id + '&preview=' + that.data.preview +'&from_point_shop=1', '', "productData", that);

        // 获得dialog组件
        that.dialog = that.selectComponent("#shareModal");
        console.log('获得dialog组件2', that.dialog)
        //=========================检测登录授权====================================
        publicFun.checkAuthorize({
            pageData: this.data.productData,
            app: app,
            callbackFunc: '',
        })
        //=========================检测登录授权====================================
        publicFun.height(that);
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    imageHeight: res.windowWidth,
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            },
        })

    },
    onShow: function () {
        //获取用户上次打开小程序距重新获取地理位置
        app.getTimeDifference();
        if (this.data.productData == '') {
            this.onReady(e);
        } else {
          this.setData({
            instant: Date.now()
          })
            publicFun.setUrl('')
        }
    },
    onHide: function () {
        clearTimeout(this.data.businessTimeInt)
        clearTimeout(this.noticeTimeout1)
        clearTimeout(this.noticeTimeout2)
    },
    shoppingCatNum: function (result) {
        if (result.err_msg == 1) {
            this.setData({
                shoppingCatNum: true,
            })
        }
    },
    soldOutProduct(){
        let that = this;
      const { BASE_IMG_URL}=that.data;
        // 商品售罄处理
        if (that.data.productData.product.quantity == 0) {
            if(that.data.productData.product.all_physical_quantity * 1 == 0){
                return publicFun.soldOutBox({
                  img_url: `${BASE_IMG_URL}images/soldout_bg.png`,
                    msg: '商品已售罄',
                    btn_txt: '返回首页',
                    url: '/pages/index/index',
                    open_type: 'navigateBack',
                    delta:1
                }, that)
            }
            let apiUrl = 'app.php?c=goods&a=get_physical_list'
            let param = {
                lng:wx.getStorageSync('longitude'),
                lat:wx.getStorageSync('latitude'),
                store_id:common.store_id,
                product_id:that.data.productData.product.product_id
            }
            common.post(apiUrl,param,function (res) {
                console.log('商品的，门店列表');
                let substoreList = res.err_msg
                that.setData({
                    oppenShopList:true,
                    substoreList
                })
            },'')
        }
    },
    productData: function (result) {
      console.log('商品',result)
        var that = this;
        if (result.err_code == 0) {
            //判断购物袋数量
            common.post('app.php?c=cart&a=number&store_id=' + app.globalData.store_id, '', "shoppingCatNum", that);
            if (result.err_msg.activites != undefined && result.err_msg.activites.length > 0) {
                let activites = result.err_msg.activites;
                for (let i = 0; i < activites.length; i++) {
                    var url = activites[i].url;
                    activites[i].path = publicFun.getType(activites[i].url)
                    // console.log(activites[i].path.url)
                }
            }

            let {open_good_show: open_index_show, live_code_title, live_code_description, live_code_logo} = result.err_msg.store_config_show
            let live_code_config = {open_index_show, live_code_title, live_code_description, live_code_logo,product_id: result.err_msg.product.product_id}
          if (result.err_msg.community_user && result.err_msg.community_user.length>5){
            result.err_msg.community_user = result.err_msg.community_user.slice(0,5);
          }
            this.setData({
                productData: result.err_msg,
                live_code_config
            })
          if (this.data.productData.community_activity){
            this.timeShow()
          }
            
            this.soldOutProduct()
            //活动价格计算
            if (that.data.productData.community_activity){
              let min = '';
              let  max = '';
              let community_activity_prices = Object.values(that.data.productData.community_activity.prices);
              community_activity_prices.sort(function(x,y){
                return x-y;
              });
              for (var i = 0; i < community_activity_prices.length;i++){
                if(i == 0){
                  min = community_activity_prices[i]
                }
                if (i == (community_activity_prices.length-1)) {
                  max = community_activity_prices[i]
                }
              }
              let activity_price = (min==max)? max: min + '~' + max;
              if (!max) {
                activity_price = min
              }
              this.setData({
                activity_price: activity_price
              })
              
            }
            // 商品价格处理
            let product_price = publicFun.productPrice(that.data.productData.product.min_price, that.data.productData.product.max_price);
            // 运费、库存、销量、喜欢数据过万处理 
            let postInfo = publicFun.formateNumber(result.err_msg.product.postage);
            let salesInfo = publicFun.formateNumber(result.err_msg.product.sales);
            let quantityInfo = publicFun.formateNumber(result.err_msg.product.quantity);
            let collectInfo = publicFun.formateNumber(result.err_msg.product.collect);
            this.data.productData.product.postage = postInfo;
            this.data.productData.product.sales = salesInfo;
            this.data.productData.product.quantity = quantityInfo;
            this.data.productData.product.collect = collectInfo;
            // 商品详情控制项
            let config_obj = result.err_msg.store_config_show;
            let config_show = 0;
            if (config_obj.product_info_show * 1 != 0) {
                config_show = 0;
            } else if (config_obj.buy_record_show * 1 != 0) {
                config_show = 1;
            } else if (config_obj.comment_show * 1 != 0) {
                config_show = 2;
            } else if (config_obj.relation_product_show * 1 != 0) {
                config_show = 3;
            }
            this.setData({
                'currentTab': config_show
            })
            //修改头部标题
            publicFun.barTitle(this.data.productData.product.name);
            //模板富文本转化
            let info = this.data.productData.product.info;
            for (var i = 0; i < that.data.productData.discount_arr.length; i++) {
                that.data.productData.discount_arr[i].msg = that.data.productData.discount_arr[i].msg.replace(/<[^>]+>/g, "")
            }
            if (info != '' && info != undefined) {
                wxParse.wxParse('info', 'html', info, that, 5);
            }
            this.data.productData.product.info = info;
            //好评率处理
            let perfect_rate = result.err_msg.comment_data.t3 * 100 / result.err_msg.comment_data.total * 1;
            perfect_rate = perfect_rate.toFixed(2) + '%';
            this.setData({
                'productData': that.data.productData,
                'perfect_rate': perfect_rate,
                'product_price': product_price
            });
            publicFun.postage(that); //邮费计算
            publicFun.credit_arr(that); //特权计算
            //publicFun.business(that, that.data.productData.store.order_notice_time); //订单提醒
            //悬浮提醒
            publicFun.storeNotice(that,result.err_msg.product.product_id,result.err_msg.store.order_notice_open,result.err_msg.store.order_notice_time)

        }
    },
    oppenShopList(){
      this.setData({
          oppenShopList:false
      })
    },
    oppenShopping: function (e) { //加入购物袋
        var that = this
        publicFun.oppenShoppingP(e, that);
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
    selectDeliverDate: function(e){
        let {index} = e.currentTarget.dataset;
        this.setData({
            "shoppingData.deliver_date_index":index
        })
    },
    payment: function (e) { //下一步,去支付
        var that = this;
        publicFun.paymentP(that, e,"goodsDetail")
    },
    messageInput: function (e) { //留言内容
        var that = this;
        let index = e.target.dataset.index;
        that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
        this.setData({
            'shoppingData': that.data.shoppingData
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
    addImg: function (e) { //图片上传
        var that = this;
        let index = e.target.dataset.index;
        publicFun.addImgMessage(that, index);
    },
    goTopFun: function (e) { //回到顶部滚动条
        this.setData({
            scrollTopView:"scrollTopView"
        })
    },

    // onPageScroll: function (e) {
    //     var that = this;
    //     // 返回顶部
    //   if (e.detail){
    //     if (e.detail.scrollTop > 300) {
    //       that.data.scrollTop.goTopShow = true;
    //     } else {
    //       that.data.scrollTop.goTopShow = false;
    //     }
    //     that.data.scrollTop.scroll_top = e.detail.scrollTop;
    //     that.setData({
    //       'scrollTop': that.data.scrollTop
    //     })
    //   }
      
        
    // },
    closeShopping: function (e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    swichNav: function (e) {
        var that = this;
        let page = 1;
        let current = e.target.dataset.current;
        if (current == 1) {
            common.post('app.php?c=goods&a=buy_list&store_id=' + app.globalData.store_id + '&product_id=' + that.data.productData.product.product_id, '', recordData, ''); //购买记录
            function recordData(result) {
                if (result.err_code == 0) {
                    that.setData({
                        'recordData': result.err_msg
                    })
                }
            }
        }
        if (current == 2) {
            common.post('app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.productData.product.product_id + '&tab=' + that.data.tab, '', commentData, ''); //购买记录
            function commentData(result) {
                if (result.err_code == 0) {
                    that.setData({
                        'commentData': result.err_msg
                    })
                }
            }
        }
        publicFun.swichNav(e, that); //图文详情切换
    },
    bindDownLoad: function () {
        var that = this;
        if (that.data.currentTab == 1) {
            if (that.data.recordData.next_page == false) {
                console.log('没有更多数据了');
                return
            }
            page++;
            let url = 'app.php?c=goods&a=buy_list&store_id=' + app.globalData.store_id + '&product_id=' + that.data.productData.product.product_id + '&page=' + page
            common.post(url, '', setPushData, '');

            function setPushData(result) {
                let list = that.data.recordData.order_list;
                for (var i = 0; i < result.err_msg.order_list.length; i++) {
                    list.push(result.err_msg.order_list[i]);
                }
                that.setData({
                    'recordData.order_list': list,
                    'recordData.next_page': result.err_msg.next_page
                });
            }

        }
        if (that.data.currentTab == 2) {
            if (that.data.commentData.next_page == false) {
                console.log('没有更多数据了');
                return
            }
            page++;
            let url = 'app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.productData.product.product_id + '&tab=' + that.data.tab + '&page=' + page
            common.post(url, '', setPushData, '');

            function setPushData(result) {
                let list = that.data.commentData.order_list;
                for (var i = 0; i < result.err_msg.comment_list.length; i++) {
                    list.push(result.err_msg.order_list[i]);
                }
                that.setData({
                    'commentData.comment_list': list,
                    'commentData.next_page': result.err_msg.next_page
                });
            }

        }
    },
    //切换评论的tab
    productListSwichNav: function (e) {
        page = 1;
        var that = this;
        var tab = e.target.dataset.tab;
        if (that.data.productListSwichNav.indexOf(tab) != -1) {
            that.data.productListSwichNav.push(tab)
        }
        i++;
        if(tab == that.data.tab)return false;
        that.setData({
            'tab': tab
        })
        common.post('app.php?c=comment&app=app&a=comment_list&type=PRODUCT&store_id=' + app.globalData.store_id + '&data_id=' + that.data.productData.product.product_id + '&tab=' + that.data.tab, '', commentData, ''); //购买记录
        function commentData(result) {
            if (result.err_code == 0) {
                that.setData({
                    'commentData': result.err_msg
                })
            }
            console.log(that.data);
        }
    },
    productListSwichSubStore(e){
        console.log(e);
        let {physicalid} = e.target.dataset
        let that = this;
        setTimeout(function(){
            let data = {
                physical_id: physicalid
            }
            common.post('app.php?c=lbs&a=switch_substore&type=1', data, function (res) {
                if(res.err_code == 0){
                    wx.redirectTo({
                        url: '/pages/POINT/pages/product/details?product_id=' + that.data.productData.product.product_id,
                    })
                }else{
                    console.log(res);
                }
            }, '');
        }, 100)
    },



    scroll: function (event) {
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },
    collect: function (e) {
        var that = this;
        publicFun.collect(that, e)
    },
    calling: function () { //拨打电话
        let num = this.data.productData.store.tel;
        publicFun.calling(num)
    },
    onShareAppMessage: function () {

      const { product } = this.data.productData;
      return getApp().shareGetFans(product.name, `${product.name},物美价廉，购物必选`,`/pages/POINT/pages/product/details`, 1, product.image,`&product_id=${this.data.product_id}`)
      
        // return {
        //     title: this.data.productData.product.name,
        //     desc: this.data.productData.product.name + '，物美价廉，购物必选',
        //   path: '/pages/POINT/pages/product/details?product_id=' + this.data.product_id + '&store_id=' + app.globalData.store_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1",
        //     imageUrl: this.data.productData.product.image
        // }
    },
    insideShow: function (e) { //内部价
        var that = this;
        that.setData({
            'insideShow': !that.data.insideShow
        })
    },
    showBigPic: function (e) {// 查看大图
        var that = this;
        that.setData({
            'common_list_index': e.target.dataset.index,
            'showBigPic': true
        })
    },
    hideBigPic: function () {// 隐藏大图
        var that = this;
        that.setData({
            'showBigPic': false
        })
    },
    hideSoldOutBox: function () { // 关闭售罄弹窗
        publicFun.hideSoldOutBox(this);
        wx.navigateTo({
          url: '/pages/SHOPGOODS/pages/index/shopHomeList',
        })
    },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        publicFun.formSubmit({
            e: e,
            that: that
        });
    },
    /*
    *
    **分享对话框 shareModal start
    *
    */

    //显示对话框
    shareTap: function () {
        var that = this;
        if (!app.isLoginFun(this)) {//判断用户是否登录
          return false;
        }
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
          canvasImgState:false
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
    _shareFriendsCircle: function () {
        var that = this;
        console.log('分享朋友圈');
        let ticket = wx.getStorageSync('ticket');
        let data = {
            path: 'pages/product/details',
            id: that.data.productData.product.product_id,
            share_uid: getApp().globalData.my_uid,
            shareType: "product",
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
    /*
    *
    **分享对话框 shareModal end
    *
    */
    // 生成分享海报
    creatPost: function () {
        let that = this;
        // 1 设置画布数据
        let product_name = that.data.productData.product.name;
        let product_price = that.data.productData.product.is_fx && that.data.productData.product.is_fx == '1' && that.data.productData.product.retail_price ? that.data.productData.product.retail_price : that.data.product_price;
        
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
            avatarPath: that.data.productData.user.avatar, // 用户头像
            qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
            productImage: 'https://' + that.data.productData.product.image.split('://')[1], // 商品首图
        };
        let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
        that.setData({
            canvasData: canvasData,
            canvasPosition: obj
        })
        let task = []
        let filePaths = ['productImage','qrcodePath','avatarPath']
        for (let j = 0; j < filePaths.length; j++) {
            const filePath = filePaths[j];
            task.push(canvasFun.loadImageFileByUrl(that.data.canvasData[filePath]))
        }

        Promise.all(task).then(resultList=>{
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

    // 画图 18-04-24 created by cms_ssa
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
        if(product_name_text.length > 20){
            if(product_name_text.length > 40){
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,39)+"...";
            }else{
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,product_name_text.length);
            }
            canvas.drawMultiText({
                ctx,
                gap:5,
                text: product_name_text,
                x: left + innerLeft,
                y: positionY + imgH + 5,
                fontSize: 30
            })
        }else{
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
            ctx,x:left + innerLeft, y:positionY + imgH + 190, h:0.1, w:imgH, r:0,border:"#eeeeee"
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

    // 画图 18-04-24 created by cms_ssa
    save: function (o) {
        let that = this;
        canvas.canvasToTempFilePath(o).then(function (res) {
            // console.log(res);
            wx.hideLoading();
            o.imgSrc = res.tempFilePath;
            that.setData({
              canvasImg: res.tempFilePath,
              canvasImgState:true,
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
                                urls:[o.imgSrc],
                                current:o.imgSrc
                            })
                            creatingPost = false
                        }
                    }
                })
            }, function (err) {
                console.log(err);
                wx.hideLoading();
                that.setData({'dialog.dialogHidden':false})
                creatingPost = false
            });
        }, function (err) {
            console.log(err);
        });
    },
    // 视频 图片切换
    selected: function (e) {
        this.setData({
            selected1: false,
            selected: true
        })
    },
    selected1: function (e) {
        this.setData({
            selected: false,
            selected1: true
        })
    },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({error});
        this.setData({
            applet_guide_subscribe: false
        })
    },
    gotoMember(){
      wx.navigateTo({
        url: '/pages/user/vip/vip',
      })
    },
    gotoMemberGift(){
      wx.navigateTo({
        url: "/pages/giftMember/giftuser/user",
      })
    },
    showgroupModal() {
      let data = {
        source: 2,
        product_id: this.data.product_id,

      };
      let group_black_code = '';
      let that = this;
      common.post("app.php?c=live_code&a=get_group_code_id", data, function callBack(res) {
        if (res.err_code == 0) {
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
    timeShow: function () {
      var that = this;
      var endtime = new Date(that.data.productData.community_activity.end_time * 1000); //结束时间
      var today = new Date((new Date().getTime() - new Date(that.data.instant).getTime()) + new Date(that.data.productData.community_activity.now_time * 1000).getTime()); //当前时间

      var delta_T = endtime.getTime() - today.getTime(); //时间间隔
      if (delta_T < 0) {
        //clearInterval(auto);
        //$(".header .Places i").text(0);
        console.log("活动已经结束啦");
        return;
      }
      publicFun.timer = setTimeout(that.timeShow, 1000);
      var total_days = delta_T / (24 * 60 * 60 * 1000), //总天数
        total_show = Math.floor(total_days), //实际显示的天数
        total_hours = (total_days - total_show) * 24,//剩余小时
        hours_show = Math.floor(total_hours), //实际显示的小时数
        total_minutes = (total_hours - hours_show) * 60, //剩余的分钟数
        minutes_show = Math.floor(total_minutes), //实际显示的分钟数
        total_seconds = (total_minutes - minutes_show) * 60, //剩余的分钟数
        seconds_show = Math.floor(total_seconds); //实际显示的秒数
      if (total_show <= 15) {
      }
      if (total_show < 10) {
        total_show = String(total_show);
        total_show = "0" + total_show;
      }
      if (hours_show < 10) {
        hours_show = "0" + hours_show;
      }
      if (minutes_show < 10) {
        minutes_show = "0" + minutes_show;
      }
      if (seconds_show < 10) {
        seconds_show = "0" + seconds_show;
      }
      that.setData({
        total_show: total_show,
        hours_show: hours_show,
        minutes_show: minutes_show,
        seconds_show: seconds_show
      })
    },
    showbackMoney(){
      this.setData({
        backMoneyStatus:true
      })
    },
    hidebackMoney() {
      this.setData({
        backMoneyStatus: false
      })
    },
    // 显示更多
    showMore: function () {
      let that = this;
      that.setData({
        more_show: !that.data.more_show,
      });
    },

  // onPageScroll: function (e) {
  //   console.log(e);
  //   var that=this;
  //   if (e.detail.scrollTop>0){
  //     that.setData({
  //       isScroll: false
  //     })
  //   } if (e.detail.scrollTop ==0){
  //     that.setData({
  //       isScroll: true
  //     })
  //   }
  // },

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
            that.data.pcode = res.code;
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
})

