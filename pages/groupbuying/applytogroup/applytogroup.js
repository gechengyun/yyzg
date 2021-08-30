let common = require('../../../utils/common')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '页面加载中。。。',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let urls = "app.php?c=community_leader&a=get_apply_status";
    let that = this;
    common.post(urls,'',function(res){
      wx.hideLoading();
       console.log('获取状态',res)
       if(res.err_code == 0){
        that.setData({
          apply_background_img: res.err_msg.apply_background_img || '',
          apply_button_img: res.err_msg.apply_button_img || ''
        })
       }
    },'')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '申请成为团长',
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff',
    })
  }


})