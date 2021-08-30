var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var app = getApp();
let page = 2;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderlistNav: [{ name: '全部', type: 'all' }, { name: '待发货', type: 'unsend' }, { name: '待收货', type: 'send' }, { name: '已完成', type: 'complete' }],
    navName:{
      name: '全部', type: 0
    },
    order_no:'',
    scrollHeight: 0,
    currentTab: 'all',
    getOrderlist: '',
    BASE_IMG_URL: 'https://s.404.cn/applet/',
    no_more:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.barTitle('订单管理'); //修改头部标题
    publicFun.height(that);
    that.setData({
      scrollHeight: that.data.scrollHeight - 105
    });

    var currentTab = 'all';
    if (e && e.currentTab != '' && e.currentTab != undefined) currentTab = e.currentTab;
    that.setData({
      currentTab: currentTab
    });

    let orderno = e.orderno;
    if (orderno){
      this.setData({
        order_no: orderno
      })
    }
    console.log(orderno)
    // wx.setNavigationBarTitle({
    //   title: '订单管理',
    // })
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
    let that = this;
    page = 2;
    that.getOrderlist();
  },
  swithNav:function(e){
    page = 2;
    this.setData({
      navName: e.currentTarget.dataset.value
    });
    this.getOrderlist();
    console.log('选择的导航', e);
  },
  bindDownLoad: function () { //滚动触发到底部
    var that = this;
    let typeTab = (that.data.currentTab && that.data.currentTab != "undefined") ? that.data.currentTab : "all";
    let order_no = this.data.order_no;
    let type = this.data.navName.type;
    // console.log("=======================", typeTab, "=======", page)
    let url = 'app.php?c=community_leader&a=get_community_order_list&order_no=' + order_no + '&type=' + type + '&page=' + page;

    that.orderPushData(page++, that, url)
    // publicFun.orderPushData(page++, that, url)
  },

  // 上拉加载方法
  orderPushData:function (page, that, url) {
    //订单相关页面下拉加载
    if (that.data.getOrderlist.next_page == false) {
      that.setData({
        no_more:true
      })
      return;
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    common.post(url, '', setPushData, '');

    function setPushData(result) {
      //添加数据
      var list = that.data.getOrderlist.order_list;
      for (var i = 0; i < result.err_msg.order_list.length; i++) {
        list.push(result.err_msg.order_list[i]);
      }
      that.setData({
        orderlist: list,
        'getOrderlist.next_page': result.err_msg.next_page
      });
      wx.hideToast();
    }
  },

  //输入订单号
  savaOrder:function(e){
    console.log("e---",e)
    let order_no = e.detail.value;
    this.setData({
      order_no
    })
  },
  getOrderlist:function(e){
    let _that=this;
    
    let url = "app.php?c=community_leader&a=get_community_order_list";
    let params = {
      order_no: this.data.order_no,
      type: this.data.navName.type,
      page: 1
    }
    let that = this;
    common.post(url, params, function (res) {
      if (res.err_code == 0) {
        that.setData({
          orderlist: res.err_msg.order_list,
          getOrderlist: res.err_msg,
          page:1
        })
      }
      console.log('订单数据', res)
    }, '')
  },
  grouperScancode() {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    wx.scanCode({
      
      success(res) {
        console.log('扫码结果', res);
        if (res.result) {
          that.setData({
            order_no: res.result
          })
          
        }
      }
    })
  },
  logistics: function (e) { //查看物流信息
    var that = this;
    publicFun.logistics(e, that)
  },
  //复制订单号
  copyOrderNo:function(e){
    console.log(e.currentTarget.dataset.value)
    var _val = e.currentTarget.dataset.value;

    var _indexof = _val.indexOf("G")+1
    _val=_val.substring(_indexof, _val.length)
    wx.setClipboardData({
      data: _val,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '订单号复制成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })

  },
  // 点击自提
  MyDraw:function(e){
    let that = this;
    let url = "app.php?c=community_leader&a=set_community_status";
    let orderNo = e.currentTarget.dataset.orderno;
    console.log(e);
    console.log(orderNo)
    let data={
      order_no: orderNo,
      status:2
    };
    common.post(url, data, function (res) {
      if (res.err_code == 0) {
        that.getOrderlist();
      }
    }, '')
  },
  oppeMap: function (e) {
    console.log(e)
    let latitude = parseFloat(e.target.dataset.lat)
    let longitude = parseFloat(e.target.dataset.long)

    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  calling: function (e) { //拨打电话
    let num = e.currentTarget.dataset.num;
    publicFun.calling(num)
  },

})