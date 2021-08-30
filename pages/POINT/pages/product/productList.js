var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var utils = require('../../../../utils/util')
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
        keyword: '',
        sort: '',
        productList: 0
    },
    onLoad: function (e) { // 页面渲染完成
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        let keyword = e.keyword?e.keyword:""
        let cid = e.cid?e.cid:""
        this.setData({
            keyword,cid
        });
    },
    onReady: function (e) {
        var that = this;
        let url = '/pages/product/productList';
        common.post('app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword +(that.data.cid?('&cid='+that.data.cid):''), '', "productListData", that);
        common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量

        publicFun.setUrl(url);
        publicFun.height(that);
        publicFun.barTitle('商品列表'); //修改头部标题
    },
    onPullDownRefresh(){
      let that = this;
      page = 1;
      that.setData({
        currentTab: 0,
        priceTab: '',
        sort: ''
      })
      try {
        wx.removeStorageSync('product_list_price_sort');
      } catch (e) { }

        common.post('app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + (that.data.cid ? ('&cid=' + that.data.cid) : ''), '', "productListData", that);
        common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量
        setTimeout(wx.stopPullDownRefresh, 300)
    },
    shoppingCatNum: function (result) {
        if (result.err_msg == 1) {
            this.setData({
                shoppingCatNum: true,
            })
        }
    },
    onShow: function () {
        page=1;
        if (this.data.productListData == '') {
            this.onReady(e);
        } else {
            publicFun.setUrl('')
        }
    },
    productListData: function (result) {
        if (result.err_code == 0) {
            this.setData({
                productListData: result.err_msg,
            })
        }
    },
    onReachBottom: function () {
      // console.log('到达底部', this.data.productListData.next_page);
        var that = this;

        if (that.data.productListData.next_page == false) {
          that.setData({
            no_more_data: '^_^我是有底线的^_^'
          })
          wx.hideLoading()
            return
        }
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
       page++;
      try {
        let product_list_price_sort = wx.getStorageSync('product_list_price_sort')
        if (product_list_price_sort) {
          that.data.sort = product_list_price_sort;
        }
      } catch (e) { }
      console.log("========page", page)
        let url = 'app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + '&page=' + page+(that.data.cid?('&cid='+that.data.cid):'')
        common.post(url, '', setPushData, '');

        function setPushData(result) {
          wx.hideLoading();
          wx.showToast({
            title: '往下滑动看更多',
            icon: 'success',
            duration: 1000
          })
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

    //防抖函数，避免频繁触发scroll事件执行setData
    onPageScroll: function (event) {
        var that = this;
        that.data.scrollTop.goTopShow = event.scrollTop > 300;
        that.data.scrollTop.scroll_top = event.scrollTop;
        that.setData({
            "scrollTop": that.data.scrollTop
        });
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
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        }
    },
    closeShopping: function (e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    swichNav: function (e) { //产品筛选页面特殊切换
        var that = this;
        page = 1;
        publicFun.productSwichNav(that, e);
        this.setData({
            sort:e.currentTarget.dataset.sort
        })
    },

    wxSearchFn: function (e) {
        var that = this
        publicFun.wxSearchFn(that);
    },
    wxSearchInput: function (e) {
        var that = this
        publicFun.wxSearchInput(that, e);
    },
    cancelSearch: function (e) {
        var that = this
        publicFun.cancelSearch(that, e);
    },
    productTable: function (e) {
        if (this.data.productTable == 'size_3') {
            this.setData({
                productTable: ''
            })
            return
        }
        this.setData({
            productTable: 'size_3'
        })
    },
    priceTab: function (e) {

    },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        publicFun.formSubmit({
            e: e,
            that: that
        });
    },
})
