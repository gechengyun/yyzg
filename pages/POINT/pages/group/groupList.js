// pages/CLIST//pages/group/groupList.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var wxParse = require(_url + '../../wxParse/wxParse.js');
var area = require(_url + '../../utils/area.js');
var start = new Date(); //用户访问时间
let it_timeout = null; //js截流定时器
let page = 1; //商品分页
let mode_index = -1; //最后一个模板索引
let cur_nav_index = 0; //当前模板选中商品分组索引
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopHomeData: {},
    list: [],
    cur_index: 0, //默认初始选中效果
    dxShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    console.log(options)
    publicFun.barTitle('积分商城');
    app.updateThemeColor().then(function(res) {

      publicFun.setBarBgColor(app, that); // 设置导航条背景色
      that.setData({
        navigateBarBgColor: res.navigateBarBgColor
      })
    })
    if (options.field_id) {
      let field_id = options.field_id;
      this.setData({
        field_id

      })
    }
    if (options.name) {
      let name = options.name;
      this.setData({
        filed_type: name
      })
    }
    publicFun.setBarBgColor(app, this); // 设置导航条背景色

    page = 0;
    wx.showLoading({
      title: '加载中',
    })
    common.post(`app.php?c=custom_field&a=get_goods_group&field_id=${this.data.field_id}&field_type=${options.name}`, '', "groupData", this);
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
  groupData: function(result) {
    console.log(result)
    wx.hideLoading();
    if (result.err_code == 0 && result.err_msg) {
      const {
        goods_group_list
      } = result.err_msg;
      console.log(goods_group_list, goods_group_list.length, "goods_group_listgoods_group_listgoods_group_listgoods_group_list")
      if (goods_group_list && goods_group_list.length > 0) {
        this.setData({
          shopHomeData: result.err_msg,
          product_list: result.err_msg.goods_group_list[0]
          // cur_group_id: goods_group_list[0].group_id
        })
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
  groupListSwichNav: function(e) {
    var that = this;
    let {
      groupid,
      curindex
    } = e.currentTarget.dataset;
    let groupId = groupid; //组件id
    page = 0; //重置分页页码
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
  onReachBottom: function() {
    // this.loadGoodsGroup();
    this.setData({
      dxShow:true
    })
  },
  //加载商品组件
  loadGoodsGroup(groupId, that) {
    that = that ? that : this;
    const {
      shopHomeData
    } = that.data;
    let datas = shopHomeData;
    groupId = groupId || that.data.cur_group_id;
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
      wx.hideLoading();
      if (result.err_code == 0) {
        const {
          next_page,
          product_list
        } = result.err_msg;
        for (var i in datas.goods_group_list) {
          let lists = datas.goods_group_list[i];
          if (lists.group_id == groupId) {
            if (page <= 1) {
              lists.product_list = product_list;
            } else {
              lists.product_list = lists.product_list.concat(product_list);
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
            that.setData({
              shopHomeData: datas,
              next_page
            })
          }
        }
      }
    }
  },
  //搜索
  wxSearchFn: function(e) {
    var that = this;

    let key = that.data.keyword;
  
    common.post('app.php?&c=goods&a=search_in_store&special_product_type=101&keyword=' + key, '', res => {
      if (res.err_code == 0) {
        that.setData({
          product_list: res.err_msg

        })
      }

    }, '')


   

  },
  wxSearchInput: function(e) {
    var that = this;
    publicFun.wxSearchInput(that, e)
  },
  oppenShopping: function(e) { //加入购物袋
    var that = this
    publicFun.oppenShopping(e, that);
  },
  goDetails: function(e) {
    let that = this
    if (!app.isLoginFun(that)) { //判断用户是否登录
      common.setUserInfoFun(that, app);
      return false;
    }


    const {
      product_id
    } = e.currentTarget.dataset;
    console.log(e, product_id, "product_idproduct_idproduct_id")
  
    let url = '/pages/POINT/pages/product/details?product_id=' + product_id +'&from_point_shop=1'
    wx.navigateTo({
      url: url
    })
  }

})