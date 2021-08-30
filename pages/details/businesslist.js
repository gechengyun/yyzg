var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var utils = require('../../utils/util')
var app = getApp();
let page = 1;
Page({
  data: {
    productTop: "",
    keyword: '',
    sort: '',
    productList: 0,
    store_id: 0,//店铺名称
    wholesale_store_id: 0,//批发商店铺ID
    currentTab: 0,
  },
  onLoad: function (e) { // 页面渲染完成
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    let keyword = e.keyword ? e.keyword : ""
    let cid = e.cid ? e.cid : ""
    this.setData({
      keyword, cid
    });
    if (e.store_id) {
      this.setData({
        store_id: e.store_id,
        wholesale_store_id: e.wholesale_store_id
      })
    }
  },
  onReady: function (e) {
    var that = this;
    var store_id = this.data.store_id;
    var wholesale_id = this.data.wholesale_store_id;
    /**
     *  sort 排序==> time_desc 时间降序、  time_asc 时间升序、sales_desc  销量降序 、 sales_asc销量升序
      **/
    
    common.post('app.php?c=goods&a=store_wholesale_list&store_id=' + store_id + '&wholesale_store_id=' + wholesale_id + '&sort=time_desc', '', "productListData", that);
  },
  onPullDownRefresh() {
    let that = this
    var store_id = this.data.store_id;
    var wholesale_id = this.data.wholesale_store_id;
    this.setData({ no_data: '' })
    common.post('app.php?c=goods&a=store_wholesale_list&store_id=' + store_id + '&wholesale_store_id=' + wholesale_id + '&sort=time_desc', '', "productListData", that);
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
    if (this.data.productListData == '') {
      this.onReady(e);
    } else {
      publicFun.setUrl('')
    }
  },
  productListData: function (result) {
    let bus_name = ''
    if (result.err_code == 0) {
      this.setData({
        productListData: result.err_msg,
      })
      bus_name = result.err_msg.wholesale_store.name;
    }
    if (bus_name.length > 0) {
      wx.setNavigationBarTitle({
        title: bus_name,
      })
    }
    if (result.err_msg && result.err_msg.product_list&& result.err_msg.product_list.length==0){
      this.setData({no_data:''})
    }else{
      this.setData({ no_data: '没有更多数据了' })
    }

  },
  onReachBottom: function () {
    // console.log('到达底部');
    this.setData({ no_data: '加载中...' })
    var that = this;
    if (that.data.productListData.next_page == false) {
      // console.log('没有更多数据了');
      this.setData({ no_data:'没有更多数据了'})
      return
    }
    page++;
    let url = 'app.php?c=goods&a=store_wholesale_list' + '&sort=' + that.data.sort + '&page=' + page + '&wholesale_store_id=' + that.data.wholesale_store_id
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
  swichNav: function (e) { //产品筛选页面特殊切换
    var that = this;
    page = 1;
    var store_id = this.data.store_id;
    var wholesale_id = this.data.wholesale_store_id;
    publicFun.productSwichNavBar(that, e, store_id, wholesale_id);
    this.setData({
      sort: e.currentTarget.dataset.sort
    })
  },

  
})
