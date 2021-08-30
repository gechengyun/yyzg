var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var app = getApp();
let page = 1;
Page({
    data: {
        scrollTop: {
            scroll_top: 0,
            goTopShow: false
        },
        productTop:"",
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
        currentTab: 0,
        productList: 0,
    },
    onLoad: function (e) {
        var that = this;
        if (e.store_id != undefined && e.store_id != '') {
          var store_id = e.store_id;
          app.globalData.store_id = e.store_id;
        } else if ((e.store_id == undefined || e.store_id == '') && app.globalData.store_id == '') {
          var store_id = common.store_id;
          app.globalData.store_id = store_id;
        }

        publicFun.setBarBgColor(app, that);// 设置导航条背景色
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      getApp().globalData.share_uid = e.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;
    },
    onReady: function(e) {
        var that = this;
        let url = '/pages/product/recommend';
        common.post('app.php?c=goods&a=recommend&store_id=' + app.globalData.store_id, '', "productListData", that);
        publicFun.setUrl(url);
        publicFun.height(that);
        publicFun.barTitle('推荐'); //修改头部标题
    },
    onPullDownRefresh() {
        common.post('app.php?c=goods&a=recommend&store_id=' + app.globalData.store_id, '', "productListData", this);
        setTimeout(wx.stopPullDownRefresh, 300)
    },
    onShow: function() {
        //=========================检测登录授权====================================
        publicFun.checkAuthorize({
            pageData: this.data.productListData,
            app: app,
            callbackFunc: '',
        })
        //=========================检测登录授权====================================
    },
    shoppingCatNum: function(result) {
        if (result.err_msg == 1) {
            this.setData({
                shoppingCatNum: true,
            })
        }
    },
    productListData: function(result) {
        var that = this;
        if (result.err_code == 0) {
          //若当前店铺已打烊，则跳向切换门店页面
          let wx_ticket = wx.getStorageSync('ticket');
          if (result.err_msg != undefined && result.err_msg == '已打烊' && wx_ticket != '') {
            publicFun.text({
              title: '打烊提示',
              content: '当前店铺已打烊，点击跳转切换门店',
              footer: '知道了'
            }, that)
          }

            common.post('app.php?c=cart&a=number&store_id=' + app.globalData.store_id, '', "shoppingCatNum", that); //判断购物袋数量
            this.setData({
                productListData: result.err_msg,
            })
        }
    },
    onReachBottom: function() {
        var that = this;
        if (that.data.productListData.next_page == false) {
            console.log('没有更多数据了');
            return
        }
        page++;
        let url = 'app.php?c=goods&a=recommend&store_id=' + app.globalData.store_id + '&page=' + page
        common.post(url, '', setPushData, '');

        function setPushData(result) {
            let list = that.data.productListData.product_list;
            for (var i = 0; i < result.err_msg.product_list.length; i++) {
                list.push(result.err_msg.product_list[i]);
            }
            that.setData({
                'productListData.product_list': list,
                'productListData.next_page': result.err_msg.next_page
            });
        }
    },
    onPageScroll: function (event) {
        var that = this;
        that.data.scrollTop.goTopShow = event.scrollTop > 300;
        that.data.scrollTop.scroll_top = event.scrollTop;
        that.setData({
            "scrollTop": that.data.scrollTop
        });
    },
    oppenShopping: function(e) { //加入购物袋
        var that = this
        publicFun.oppenShopping(e, that);
    },
    addImg: function (e) { //图片上传
        var that = this;
        let index = e.target.dataset.index;
        publicFun.addImgMessage(that, index);
    },
    plus: function() { //加
        var that = this;
        publicFun.plus(that);
    },
    reduce: function() { //减
        var that = this;
        publicFun.reduce(that);
    },
    shoppingBlur: function(e) { //输入框
        var that = this;
        publicFun.shoppingBlur(e, that)
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
    },
    goTopFun: function (e) { //回到顶部滚动条
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        }
    },
    closeShopping: function(e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    // onShareAppMessage: function() {
    //     var that = this;
    //     return {
    //         title: this.data.productListData.store.name,
    //         desc: '优质商品，汇聚一起，任你挑选',
    //       path: '/pages/product/recommend?store_id=' + app.globalData.store_id + "&share_uid=" + getApp().globalData.my_uid + "&shareType=1",
    //     }
    // },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        publicFun.formSubmit({
            e: e,
            that: that
        });
    },

})
