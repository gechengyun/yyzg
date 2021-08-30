var common = require('../../../../../utils/common.js');
var publicFun = require('../../../../../utils/public.js');
var app = getApp();
let page = 1;
Page({
  data: {
    orderlistData: '',
    scrollTop: 0,
    scrollHeight: 0,
    showList: 0, //1列表显示，0方块显示
    isSelect: false, //是否选中1：选中，0：未选中
    goodsArr:[],//商品id
    order_total_num: 0,//选择的商品数量
    ways: 0,//页面进入的方式
  },
  onLoad: function(e) {
    var that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色     
    publicFun.height(that);
    if (e.ways) {
      that.setData({
        ways: e.ways
      })
    }
    if (that.data.showList || that.data.ways == 0) {
      that.setData({
        scrollHeight: that.data.scrollHeight
      })
    } else {
      that.setData({
        scrollHeight: that.data.scrollHeight - 60
      })
    };    
  },
  onReady: function() {
    var that = this;
    page=1;
    common.post('app.php?c=my&a=collect&type=1', '', "orderlistData", that);
  },
  orderlistData: function(result) {
    let that = this;
    if (result.err_code == 0) {    
      for (var i = 0; i < result.err_msg.product_list.length; i++) {
        result.err_msg.product_list[i].isSelect = false;
      }  
      this.setData({
        orderlistData: result.err_msg
      });      
    };
  },
  bindDownLoad: function() { //滚动触发到底部
    var that = this;
    console.log(page)
    page++;
    let url = 'app.php?c=my&a=collect&type=1&page=' + page;
    if (that.data.orderlistData.next_page == false) {
      console.log('没有更多数据了');
      return
    }
    common.post(url, '', setPushData, '');

    function setPushData(result) { //添加数据
      let list = that.data.orderlistData.product_list;
      for (var i = 0; i < result.err_msg.product_list.length; i++) {
        result.err_msg.product_list[i].isSelect = false;
        list.push(result.err_msg.product_list[i]);
      }
      that.setData({
        'orderlistData.product_list': list,
        'orderlistData.next_page': result.err_msg.next_page
      });
    }
  },

  detailsGo: function(e) { //跳转详情页面
    publicFun.detailsGo(e)
  },
  completeOrder: function(e) { //完成订单
    var that = this;
    publicFun.completeOrder(e, that);
  },

  // 选择框
  selectList:function(e){
    let that = this;
    // 获取选中的radio索引
    var index = e.currentTarget.dataset.idx;
    // 获取到商品列表数据
    var product_list = that.data.orderlistData.product_list;
    // 循环数组数据，判断----选中/未选中[isSelect]
    product_list[index].isSelect = !product_list[index].isSelect;
    // 重新渲染数据
    that.setData({
      'orderlistData.product_list': product_list
    });
    that.count_num()
  },
  // 计算数量
  count_num(){
    let that = this;
    // 获取商品列表数据
    let product_list = that.data.orderlistData.product_list;
    // 声明一个变量接收数组列表id
    let total = 0;
    var goodsArrs = [];
    // 循环列表得到每个数据

    for (let i = 0; i < product_list.length; i++) {
      // 判断选中数量
      if (product_list[i].isSelect) {
        goodsArrs.push(product_list[i].product_id);
        //计算数量
        total++;
      }
    }
    // 最后赋值到data中渲染到页面
    this.setData({
      'orderlistData.product_list': product_list,
      goodsArr: goodsArrs,
      order_total_num: total
    });
  },

  // 返回上一页
  goBack:function(){
    let that = this;
    let pages = getCurrentPages(); //获取上一个页面信息栈(a页面)
    let prevPage = pages[pages.length - 2]; //给上一页面的tel赋值
    prevPage.setData({
      goods_ids: that.data.goodsArr
    });
    wx.navigateBack(); //关闭当前页面，返回上一个页面
  },
  // 我的收藏进入，点击进入详情
  addCart:function(){
    var that = this
    publicFun.oppenShopping(e, that);
  },
  // onShareAppMessage: function() {
  //     return {
  //         title: '自定义分享标题',
  //         desc: '自定义分享描述',
  //         path: '/page/user?id=123'
  //     }
  // }

})