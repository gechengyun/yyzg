// pages/encapsulation/encapsulation.js
let it_timeout = null;//js截流定时器
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //自定义设置导航信息数据
    set_para:{
      multiple_num: 4,//默认显示滑块数量
      nav_check_id: 0,//导航选中id
      nav_to_menutop: 500,//初始菜单距离页面顶部距离
      need_fixed: false,//wxcss菜单吸顶
    },
    nav_data:{}//获取导航数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航信息
    const DEFAULT_NUM = 4;//默认显示滑块数量
    wx.getStorage({
      key: 'nav_data',
      success: (res)=> {
        // console.log(res)
        if (res.errMsg =="getStorage:ok"){
          let data = JSON.parse(res.data)
          let num=data.nav.length;
          num = num<=DEFAULT_NUM?num:DEFAULT_NUM;
          let set_default_num ='set_para.multiple_num';
          this.setData({
            nav_data: data,
            [set_default_num]:num
          })
        }
      },
    })
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //初次nav-bar距菜单顶部距离
    var query = wx.createSelectorQuery()
    query.select('#nav_bar').boundingClientRect()
    query.exec((res)=>{
      let menutop = 'set_para.nav_to_menutop';
      this.setData({
        [menutop]: res[0].top,
      })
    })
  },
  addNavCheck:function(e){
    let target = e.currentTarget;
    let id = target.dataset.id;
    let check_id ='set_para.nav_check_id';
    this.setData({
      [check_id]:id
    });

    //获取导航对应跳转地址
    let _url = target.dataset.url;
    // console.log(_url);
  },
  onPageScroll:function(e){
    //如果it_timeout被赋值了，那么就清理掉延迟定时器
    if (this.data.nav_data.line!=1)return;
    if (it_timeout) {
      clearTimeout(it_timeout);
    }

    it_timeout=setTimeout(()=>{
      let nav_to_menutop = this.data.set_para.nav_to_menutop;
      let page_scroll = e.scrollTop;
      let need_fixed ='set_para.need_fixed';
      if ((page_scroll - nav_to_menutop) < 0) {
        
        this.setData({
          [need_fixed]: false
        })
        return;
      } else {
        this.setData({
          [need_fixed]: true
        })
        // console.log(`distance:${page_scroll - nav_to_menutop}`)
      }
    },10)


    
  }
})