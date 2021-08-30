// pages/CLIST//pages/group/groupLeft.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
let page = 0;//商品分页
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 100,
    currentTab:0,//初始tab项选择
    product_list:[],//商品右边列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { page_id, page_name } = options;
    publicFun.setBarBgColor(app, this);// 设置导航条背景色
    // publicFun.barTitle(that.data.shopHomeData.title || that.data.shopHomeData.store.name, that);
    if (page_id){
      wx.showLoading({
        title: '加载中...',
      })
      // let pageName='';
      // if (page_name){
      //   pageName = page_name.indexOf('微页面标题') > -1 ? '商品分类':page_name
      // }else{
      //   pageName ='商品分类';
      // }
      wx.getStorage({
        key: 'groupName',
        success: function(res) {
          let title=res.data;
          if (title){
            publicFun.barTitle(title, this);
          }
        },
        fail:function(){
          publicFun.barTitle('微页面', this);
        }

      })
      // publicFun.barTitle('商品分类', this);
      common.post(`app.php?c=custom_field&a=page&page_id=${page_id}`, '', "initGroupData", this);
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    page = 0;
  },

  initGroupData:function(result){
    wx.hideLoading();
    const { goods_group_list } = result.err_msg;
    if (goods_group_list){
      page=1;
      if (goods_group_list.length>0){
        let product_list = goods_group_list[0].product_list;
        if (product_list){
          this.setData({
            product_list,
            checkGroupId: goods_group_list[0].group_id
          })
        }
      }
      this.setData({
        goods_group_list: goods_group_list
      })
    }

  },


  //搜索
  wxSearchFn: function (e) {
    var that = this;
    var page = 'groupPage';
    publicFun.wxSearchFn(that, e, page);
  },
  wxSearchInput: function (e) {
    var that = this;
    publicFun.wxSearchInput(that, e)
  },
  //选择当前分组
  checkGroup:function(e){
    const { index, groupid } =e.currentTarget.dataset;
    page=0;
    this.setData({
      currentTab:index,
      checkGroupId:groupid,
      next_page:true
    })
    this.loadingGoods();
  },

  // 元素滚动到页面底部
  loadingGoods: function (){
    let that = this;
    const { product_list } = that.data;

    
    let datas = product_list;
    let groupId = that.data.checkGroupId;
    if (!groupId)return;
    if (that.data.next_page == false) return;
    page++;
    that.setData({
      load_txt: '页面加载中...'
    })
    that.setData({
      next_page: false
    })
    wx.showLoading({
      title: '加载中...',
    })
    //分页页面请求加参数from=1
    let url = `app.php?c=goods&a=get_goods_by_group&group_type=goods_group1&group_id=${groupId}&page=${page}&from=1`
    console.log("url-----", url)
    common.post(url, '', "goodsData", this);
  },
  // 滚动、切换加载
  goodsData:function(result){
    if (result.err_code==0){
      wx.hideLoading();
      const { product_list, next_page } = result.err_msg;
      let that=this;
      if (product_list && product_list.length>0){
        let lists = page>1 ? that.data.product_list:[];
        lists = lists.concat(product_list);
        that.setData({
          product_list: lists
        })
      }else{
        //没有数据
        let lists = page > 1 ? that.data.product_list : [];
        lists = lists.concat(product_list);
        that.setData({
          product_list: lists
        })
      }
      if (product_list && product_list.length < 10){
        that.setData({
          no_data:'没有更多数据了'
        })
      }else{
        that.setData({
          no_data: ''
        })
      }
      that.setData({
        next_page
      })
      
    }
  },
  oppenShopping: function (e) { //加入购物袋
    var that = this;
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
    that.data.shoppingData.shoppingCatData.reservation_custom_fields[index].value = e.detail.value;
    this.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
    var that = this;
    publicFun.formSubmit({
      e: e,
      that: that
    });
  },
  payment: function (e) { //下一步,去支付
    var that = this;
    publicFun.payment(that, e)
  },
  closeShopping: function (e) { //关闭提示框遮罩层
    var that = this;
    publicFun.closeShopping(that);
  },
})