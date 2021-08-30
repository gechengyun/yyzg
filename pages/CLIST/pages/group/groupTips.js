// pages/CLIST//pages/group/groupList.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
var area = require(_url + '../../utils/area.js');
var start = new Date(); //用户访问时间
let it_timeout = null;//js截流定时器
let page = 1;//商品分页
let mode_index = -1;//最后一个模板索引
let cur_nav_index = 0;//当前模板选中商品分组索引

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopHomeData: {},
    list: [],
    cur_index: 0,//默认初始选中效果
    shopHomeData:{
     
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log(options)
    // if (options.field_id) {
    //   let field_id = options.field_id;
    //   this.setData({
    //     field_id
    //   })
    // }
    if (options.name) {
      let name = options.name;
      this.setData({
        filed_type: name
      })
    }
    publicFun.setBarBgColor(app, this);// 设置导航条背景色
    page = 0;
    wx.showLoading({
      title: '加载中',
    })
    if (options.groupid) {
      let groupId = options.groupid;
      this.setData({
        groupId
      })
    }
    // if (that.data.field_id) {
    //   common.post(`app.php?c=custom_field&a=get_goods_group&field_id=${this.data.field_id}`, '', "groupData", this);
    // }
    if (that.data.groupId) {
      that.loadGoodsGroup(that.data.groupId, that);
    }
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  groupData: function (result) {
    console.log(result)
    wx.hideLoading();
    if (result.err_code == 0 && result.err_msg) {
      const { goods_group_list } = result.err_msg;
      if (goods_group_list && goods_group_list.length > 0) {
       
        this.setData({
          group_name: result.err_msg.group_name,
          shopHomeData: result.err_msg,
          cur_group_id: goods_group_list[0].group_id
        })
        publicFun.barTitle(that.data.group_name); //修改头部标题
      } else {
        wx.showModal({
          title: '',
          content: '暂无商品信息',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    }

  },
  //商品导航tab切换
  groupListSwichNav: function (e) {
    var that = this;
    let { groupid, curindex } = e.currentTarget.dataset;
    let groupId = groupid;//组件id
    page = 0;//重置分页页码
    //重置翻页
    that.setData({
      next_page: true,
      cur_group_id: groupid,
      cur_index: curindex
    });

    console.log("------groupid", groupid)

    wx.showLoading({
      title: '加载中...',
    })
    this.loadGoodsGroup(groupId, that);

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    page = 1;
    this.loadGoodsGroup();
    // common.post('app.php?c=store&a=index&store_id=' + app.globalData.store_id, '', "shopHomeData", this);
    //setTimeout(wx.stopPullDownRefresh, 300)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadGoodsGroup();
  },
  //加载商品组件
  loadGoodsGroup(groupId, that) {
    that = that ? that : this;
    const { shopHomeData } = that.data;
    let datas = shopHomeData;
    groupId = groupId || that.data.groupId;
    if (that.data.next_page == false) return;
    page++;
    that.setData({
      load_txt: '页面加载中...'
    })
    that.setData({
      next_page: false
    })
    //分页页面请求加参数from=1
    let url = `app.php?c=goods&a=get_goods_by_group&group_type=goods_group4&group_id=${groupId}&page=${page}&from=1`
    common.post(url, '', getGoodsData, '');


    function getGoodsData(result) {
      console.log(result,"resultresult")
      wx.hideLoading();
      if (result.err_code == 0) {
        const { next_page, product_list } = result.err_msg;
        if (page <= 1) {
          that.setData({
            [`shopHomeData.product_list`]: product_list,
            group_name: result.err_msg.group_name,
            next_page
          })
          publicFun.barTitle(that.data.group_name); //修改头部标题
        } else {
          // lists.product_list = lists.product_list.concat(product_list);
          that.setData({
            [`shopHomeData.product_list`]: that.data.shopHomeData.product_list.concat(product_list),
            group_name: result.err_msg.group_name,
            next_page
          })
        }
        if (!next_page) {
          that.setData({
            load_txt: '暂无更多数据'
          })
        } else {
          that.setData({
            load_txt: ''
          })
        }
        console.log(that.data.shopHomeData)
        // for (var i in datas.goods_group_list) {
        //   let lists = datas.goods_group_list[i];
        //   if (lists.group_id == groupId) {
        //     if (page <= 1) {
        //       lists.product_list = product_list;
        //       that.setData({
        //         shopHomeData: datas,
        //         next_page
        //       })
        //     } else {
        //       lists.product_list = lists.product_list.concat(product_list);
        //     }
        //     if (!next_page) {
        //       that.setData({
        //         load_txt: '暂无更多数据'
        //       })
        //     } else {
        //       that.setData({
        //         load_txt: ''
        //       })
        //     }
        //     that.setData({
        //       shopHomeData: datas,
        //       next_page
        //     })
           
        //   }
        // }
      
      }
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