var common = require('../../../utils/common.js');
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
    let url ="app.php?c=community_leader&a=get_apply_status";
    let that = this;
    common.post(url,'',function(res){
      if(res.err_code == 0){
        that.setData({
          applyResult: res.err_msg
        })
      }
      console.log('团长状态',res)
    },'')
  },
  showBackApply:function(){
    //临时的修改  【ID1002873】
    // 【dev 】团长信息审核页面，撤回申请调整成：回到首页
    wx.navigateTo({
      url: '/pages/index/index',
    })
    // this.setData({
    //   backApplyStatus: true
    // })
  },
  closeApply(){
    this.setData({
      backApplyStatus:false
    })
  },
  confirmCloseApply(){
    let url ="app.php?c=community_leader&a=recall_apply";
    common.post(url, '', function (res) {
      console.log('撤回状态')
    }, '')
  },
  reSubmit() {
    wx.showLoading({
      title: '加载中...',
    })
    wx.navigateTo({
      url: '/pages/groupbuying/applyform/applyform',
    })
  }

})