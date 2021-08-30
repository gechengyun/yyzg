let publicFun = require('../../utils/public.js');
const app = getApp()
let common = require('../../utils/common')
var utils = require('../../utils/util')

let page = 1;
let tipsShow=1
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: {
      scroll_top: 0,
      goTopShow: false
    },
    topCates: [],
    currentSubCats: [],
    activeIndex: 0,
    searchKeyWord: "",
    tipsShow: true,
    activeIndexTips: 0,
    model: 1,
    productListDataNew: {},
    keyword:'',
    sort:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(111)
    let that=this
    // publicFun.barTitle('商品分类');
    // publicFun.setBarBgColor(app, this) // 设置导航条背景色
    common.post(`app.php?c=category&a=store_category`, '', 'getCategories', this)
    // this.setData({
    //   themeColor: app.globalData.navigateBarBgColor
    // })
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.shareDate.share_title,
      desc: '这里发现一个好店铺，速度围观',
      path: '/pages/index/index',
      imageUrl: this.data.shareDate.share_image
    }
  },

  wxSearchInput() {},
  wxSearchFn() {

  },

  getCategories(data) {

    let that = this
    if (data.err_code != 0) {
      return wx.showToast({
        title: data.err_msg ? data.err_msg : '加载分类失败!',
        icon: 'none',
      })
     
    }
    that.setData({
      ccid: data.err_msg.cat_list[0].cat_id
    })
    let categories = data.err_msg.cat_list;
    let ARR = []
    for (let property in categories) {
      ARR.push(categories[property])
    }
    // let topCates =  Object.keys(categories).map(key => categories[key]);
    let topCates = ARR;
    let currentSubCats = topCates[0] ? topCates[0] : []

    var cid = '';
    if (currentSubCats.cat_list.length > 0){
      cid = currentSubCats.cat_list[0].cat_id
    }else{
      cid = ''
    }
    this.setData({
      topCates,
      currentSubCats,
      cid
    },function(){
      that.getBanner()

    })

    common.post('app.php?c=goods&a=search_in_store&cid=' + that.data.cid, '', "productListData", that);
  },

  /**
   * 切换顶级分类
   */
  switchTopCate(event) {
    let that = this
    let {
      tabindex: tabIndex
    } = event.currentTarget.dataset
    let {
      topCates,
      activeIndex
    } = this.data

    if (tabIndex === activeIndex) return false
    var scid = '';
    if (topCates[tabIndex].cat_list.length > 0){
      scid= topCates[tabIndex].cat_list[0].cat_id;
    }else{
      scid = '';
    }
    this.setData({
      currentSubCats: topCates[tabIndex],
      activeIndex: tabIndex,
      activeIndexTips:0,
      cid: scid,
      ccid: topCates[tabIndex].cat_id,
      no_more_data:'',
      "scrollTop.scroll_top":0
    })
    page=1
    common.post('app.php?c=goods&a=search_in_store&cid=' + that.data.cid, '', "productListData", that);
    that.getBanner()
  },

  /**
   * 点击分类跳转到详情页面
   */
  clickCate1(event) {
    let that = this
    let id = event.currentTarget.dataset.id
    let activeIndexTips = event.currentTarget.dataset.activeindextips
    wx.navigateTo({
        url: `/pages/product/productList?cid=${id}`
    })


  },
  clickCate(event) {
    let that = this
    let id = event.currentTarget.dataset.id 
    let activeIndexTips = event.currentTarget.dataset.activeindextips
    // wx.navigateTo({
    //     url: `/pages/product/productList?cid=${id}`
    // })

    that.setData({
      cid: id,
      activeIndexTips,
      no_more_data:"",
      "scrollTop.scroll_top": 0,
      tipsShow: true
    })
    common.post('app.php?c=goods&a=search_in_store&cid=' + that.data.cid, '', "productListData", that);

    common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量

  },
  closeBg:function(){
    let that = this
    that.setData({
      tipsShow: true
    })
  },
  clickCateScroll(id, activeIndexTips) {
    let that = this
    that.setData({
      cid: id,
      activeIndexTips,
      no_more_data: "",
      "scrollTop.scroll_top": 0
    })
    tipsShow=1
    common.post('app.php?c=goods&a=search_in_store&cid=' + that.data.cid, '', "productListData", that);

    common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量

  },
  /**
   * 搜索商品
   */
  bindSearchGoods() {
    let {
      searchKeyWord
    } = this.data
    if (!searchKeyWord) return wx.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    })
    wx.navigateTo({
      url: `/pages/product/productList?keyword=${searchKeyWord}`
    })
  },

  inputKeyWord(event) {
    let {
      detail: {
        value,
        cursor
      }
    } = event
    this.setData({
      searchKeyWord: value.slice(0, 20)
    })
    if (cursor > 20) return value.slice(0, 20)
  },

  backToHome() {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },



  onPullDownRefresh() {
    let that = this
    that.setData({
      currentTab: 0,
      priceTab: '',
      sort: ''
    })
    try {
      wx.removeStorageSync('product_list_price_sort');
    } catch (e) {}
    common.post('app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + (that.data.cid ? ('&cid=' + that.data.cid) : ''), '', "productListData", that);
    common.post('app.php?c=cart&a=number', '', "shoppingCatNum", that); //判断购物袋数量
    setTimeout(wx.stopPullDownRefresh, 300)
  },
  onReachBottom: function() {

  },

  shoppingCatNum: function(result) {
    if (result.err_msg == 1) {
      this.setData({
        shoppingCatNum: true,
      })
    }
  },
  productListData: function(result) {
    let that = this;
    if (result.err_code == 0) {

      this.setData({
        productListData: result.err_msg,
      }, function() {

        that.categorySet()
      })
    }
  },
  //防抖函数，避免频繁触发scroll事件执行setData
  onPageScroll: function(event) {
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
  addImg: function(e) { //图片上传
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
  goTopFun: function(e) { //回到顶部滚动条
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        "scrollTop.scroll_top": 0
      })
    }
  },
  closeShopping: function(e) { //关闭提示框遮罩层
    var that = this;
    publicFun.closeShopping(that);
  },
  swichNav: function(e) { //产品筛选页面特殊切换
    var that = this;
    page = 1;
    publicFun.productSwichNav(that, e);
    this.setData({
      sort: e.currentTarget.dataset.sort
    })
  },

  wxSearchFn: function(e) {
    var that = this
    publicFun.wxSearchFn(that);
  },
  wxSearchInput: function(e) {
    var that = this
    publicFun.wxSearchInput(that, e);
  },
  cancelSearch: function(e) {
    var that = this
    publicFun.cancelSearch(that, e);
  },
  productTable: function(e) {
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
  priceTab: function(e) {

  },
  formSubmit: function(e) { // 生成下发模板消息所需的formId存于服务器
    var that = this;
    publicFun.formSubmit({
      e: e,
      that: that
    });
  },
  tipsOpen: function(e) {

    let that = this
    let tipsShow = e.currentTarget.dataset.show
    that.setData({
      tipsShow: !tipsShow
    })
  },
  bindscrolltolower: function() {

    var that = this;
    if (that.data.productListData.next_page == false) {
      //商品分类优化，滑到底部没有下一页时候，判断是否还有改分类还没是否还有分类，如果有分类就跳转到下一个分类
      let activeIndexTips = that.data.activeIndexTips 
      let cat_list = that.data.currentSubCats.cat_list
      //二级标签下标小于数组长度
      if ((activeIndexTips+1) < cat_list.length){

        that.setData({
          no_more_data: '上拉查看下一分类 ⇧'
        })
        tipsShow++
        activeIndexTips++
        let activeIndexId =cat_list[activeIndexTips].cat_id

        if (tipsShow>3){
          that.clickCateScroll(activeIndexId, activeIndexTips)
        }
        
        
      }else{
        that.setData({
          no_more_data: '^_^我是有底线的^_^'
        })
      }
      console.log('没有更多数据了');
      return
    }
    page++;
    try {
      let product_list_price_sort = wx.getStorageSync('product_list_price_sort')
      if (product_list_price_sort) {
        that.data.sort = product_list_price_sort;
      }
    } catch (e) {}
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let url = 'app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + '&page=' + page + (that.data.cid ? ('&cid=' + that.data.cid) : '')
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
  //获取分类配置信息
  categorySet: function(e) {
    let that = this
    common.post('app.php?c=category&a=category_set', {}, res => {
      that.setData({
        customField: res.err_msg.customField,
        modelContent: res.err_msg.customField[0].content,
        shareDate:res.err_msg.page
      })
      publicFun.barTitle(that.data.shareDate.page_name);

    }, '')
  },
  //获取广告图
  getBanner: function (){
    let that = this

    common.post('app.php?c=category&a=find_onecategory&cat_id=' + that.data.ccid, {}, res => {
      that.setData({
        imgSrc: res.err_msg.cat_list.cat_pic
      })
    }, '')
  },

})
