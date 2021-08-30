// pages/distribution/fans_manage.js
var common = require('../../utils/common.js');
var wxCharts = require('../../utils/wxcharts.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
var lineChart = null;
var pieChart = null;
let newType=0;
let newIndex=0
Page({ 
  /**
   * 页面的初始数据
   */
  data: {
    selectedIndex: 0, 
    fansData:{}, 
    sidebar:[],
    rowData:[],
    rowData1:[], 
    fenRowData: [
      {
        tan_show: false,
      }
    ],
    tiaoTanData:[],
    title:'',
    currentPage: 1,
    nextPage: true, 
    selectedIndex: 0,
    diy_fx_seller_name:'',
    fx_name:''

    
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.barTitle('粉丝管理');
    //获取系统信息  
    wx.getSystemInfo({
      //获取系统信息成功----系统窗口的宽高 
      success: function (res) {
        that.width = res.windowWidth
        that.setData({
          'width': res.windowWidth,
          'height': res.windowHeight,
        })
      }
    }); 
     
    if (options.selectedIndex){
      this.setData({
        selectedIndex:2
      }) 
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
  onShow: function (e) {
    var that = this;  
    common.post('app.php?c=drp_ucenter&a=drp_fans', '', "fansShow", that);
     
    let page = 1; 
    let url2 = 'app.php?c=drp_ucenter&a=get_fans_list' + '&type=2' + '&page=' + page;;
    common.post(url2, '', "tabindex2Show", that); 

    let url1 = 'app.php?c=drp_ucenter&a=get_fans_list' + '&type=0' + '&page=' + page;;
    common.post(url1, '', "tab1Show", that); 

  },
  tabindex2Show(result){
    if (result.err_code == 0) {
      this.setData({  
        fenRowData: result.err_msg.list,
        diy_fx_seller_name: result.err_msg.diy_fx_seller_name,
        fx_name: result.err_msg.diy_fx_name
        
      })
    }
  },
  fansShow(res){ 
    if (res.err_code==0){
      this.setData({
        fansData: res.err_msg,
        sidebar: res.err_msg.sidebar
      })
    } 
  },
  selected(e) {  
    console.log(e) 
    var that = this;  
    let { type, index } = e.currentTarget.dataset; 
    newType = e.currentTarget.dataset.type; 
    if(index==this.data.selectedIndex){
     return false
    } 
    // let page = this.data.currentPage;
    let page=1; 
    let url = 'app.php?c=drp_ucenter&a=get_fans_list' + '&type=' + newType + '&page=' + page;
    common.post(url, '', "tab2Show", that);
    this.setData({
      selectedIndex: index,
      currentPage:1,
      nextPage: true,
      rowData: [],
      rowData1: [],
      fenRowData:[]
    })  
  }, 
  tab1Show(result){
     if(result.err_code == 0){
       this.setData({ 
         rowData1: result.err_msg.list  
       }) 
     }
  },
  tab2Show(result) {
    if (result.err_code == 0) {
      let { fenRowData, rowData, rowData1} = this.data;  
      let rownames = ['rowData1','rowData','fenRowData'];
      this.setData({
        [rownames[newType]]: [...this.data[rownames[newType]], ...result.err_msg.list],
        nextPage: result.err_msg.next_page
      })
    }
  },
  clickNum(e) { 
    let next_seller_num = e.currentTarget.dataset.next_seller_num; 
    console.log(next_seller_num)
    if (next_seller_num==0){
      this.setData({
        tan_show: false
      })
      wx.showToast({
        title: '没有下级经销商',  
      })
    }
    else{
      this.setData({
        tan_show: true
      })
      var that = this;
      console.log(e.currentTarget.dataset)
      let seller_id = e.currentTarget.dataset.store_id;
      let page = this.data.currentPage;
      let url = 'app.php?c=drp_ucenter&a=nextSellerList' + '&seller_id=' + seller_id + '&page=' + page;
      common.post(url, '', "tanShowCall", that); 
      this.setData({  
        currentPage: 1,
        nextPage: true, 
        tiaoTanData:[]
      })  

    }
 
  },
  tanShowCall(res){
    if (res.err_code == 0) { 
      let tiaoTanData=this.data;
      this.setData({
        title: res.err_msg.title,
        tiaoTanData: [...this.data.tiaoTanData, ...res.err_msg.list],
        nextPage: res.err_msg.next_page
      })  
    } 
  },
  clickClose(e) {
    this.setData({
      tan_show: false
    })
  }, 
  scrollToLower: function (e) {
    console.log('加载更多')
    console.log(this.data)
    let that=this
    if (this.data.nextPage) {
      this.setData({
        currentPage: ++this.data.currentPage
      })   
      let page = this.data.currentPage; 
      var type = newType; 
      let url = 'app.php?c=drp_ucenter&a=get_fans_list' + '&type=' + type + '&page=' + page;
      common.post(url, '', "tab2Show", that); 
       
    }
  },
  // 弹窗分页
  scrollToLowerPage(e){
    let that = this; 
    console.log('加载更多')
    console.log(this.data)
    if (this.data.nextPage) {
      this.setData({
        currentPage: ++this.data.currentPage
      })
      let page = this.data.currentPage;
      let seller_id = e.currentTarget.dataset.store_id; 
      let url = 'app.php?c=drp_ucenter&a=nextSellerList' + '&seller_id=' + seller_id + '&page=' + page;
      common.post(url, '', "tanShowCall", that); 
    }
  }, 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { 
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { 
  },
})