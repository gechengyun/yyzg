// pages/user/myFans/myFans.js
var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
var app = getApp();
var page=1;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    listpage:1,
    typeIndex:1, //1粉丝，2会员
    paixuIndex:1,  //排序类型1时间 2成长 3活跃
    searchTxt:"",
    isOver:false,
    applayType:false,
    checkedLeval:1,//初始显示会员等级

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.type)
    if (options.type){
      this.setData({
        typeIndex: options.type ,
        applayType: true
      })
    }
    page=1;
    
    var that = this;
    publicFun.setBarBgColor(getApp(), that); // 设置导航条背景色
    let pageTheme = this.data.pageTheme;
    this.getList(1, this.data.typeIndex);
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
    page = 1;
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getList(1,1);
    this.setData({
      listpage: 1,
      isOver: false
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.nextPage == true) {
      wx.showNavigationBarLoading();
      let listpage = this.data.listpage + 1;
      this.getList(listpage, 2);
      this.setData({
        listpage,
      })
    } else {
      this.setData({
        isOver: true,
        nextPage:false
      })
    }
  },

  //获取粉丝列表
  getList(page,type){
    var that = this;
    var applayType = '';
    if (this.data.applayType){
      applayType = 'gift'
    }
    that.setData({
      getType: type
    })
    const { zsType, checkedLeval, paixuIndex, typeIndex, searchTxt, userType}=this.data;
    let data={
      keyword:searchTxt,
      page, 
      type: applayType,
      user_type: userType, //用户类型（1粉丝 2会员）
      sort:paixuIndex == 1 ? "add_time desc" :"pullulate desc",
      zs_type: zsType,//直推类型（1直推会员 2团队会员）
      level: checkedLeval//会员级别（1低级 2中级 3高级）
    }
    common.post("app.php?c=my&a=myFansMember",data,'getListData',that)
  },
  getListData:function(res){
    let that = this;
    console.log('fans',res);
    if(res.err_code==0){
      let listData = that.data.listData||[];
      if(that.data.getType==1){//刷新
        listData = res.err_msg.fans_list
      }else{
        listData = listData.concat(res.err_msg.fans_list);
      }
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      that.setData({
        listData,
        month_num:res.err_msg.month_num,
        today_num: res.err_msg.today_num,
        count: res.err_msg.count,
        nextPage: res.err_msg.next_page,
        pageCount: res.err_msg.count,
        fans_alias: res.err_msg.fans_alias,
        member_alias: res.err_msg.member_alias,
        need_num: res.err_msg.need_num,//成为会员总数
        fans_data: res.err_msg
      })
    }
  },
  changeType(e) {//切换类型动画  用户类型（usertype ->1粉丝 2会员）
    const { type, zstype, usertype } = e.currentTarget.dataset;
    this.setData({
      typeIndex: type,
      zsType: zstype,
      listpage:1,
      userType: usertype
    })
    this.getList(1,1);
  },
  paiXuList(e){//切换排序
    //排序（add_time asc：注册时间升序 add_time desc：注册时间降序 pullulate asc：成长升序 pullulate desc：成长降序）
    //paixuIndex 1时间 2成长
    let paixuIndex = e.currentTarget.dataset.type;
    this.setData({
      paixuIndex,
    });
    this.getList(1, 1);
  },
  changeTxt(e){
    this.setData({
      searchTxt: e.detail.value
    })
  },
  clearTxt(){
    this.setData({
      searchTxt: ""
    })
  },
  searchBtn(){
    if(this.data.searchTxt==""){
      wx.showModal({
        title: '提示信息',
        content: '请输入搜索内容',
        confirmText: '知道了',
        showCancel: false,
        confirmColor: '#fe6b31',
      })
    }
    this.getList(1, 1);
  },
  //获取当前选中等级
  changeLevelFun(e){
    const {level} = e.currentTarget.dataset;
    if(level){
      this.setData({
        checkedLeval: level,
        listpage:1
      })
    }
    this.getList(1, 1);
  }


})