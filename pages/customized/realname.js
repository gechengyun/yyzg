var publicFun = require('../../utils/public.js');
var common = require('../../utils/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editStatus:null,
    formArr:{},
    upImgSrc1:'',
    upImgSrc2:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.barTitle('实名认证'); //修改头部标题
    that.setData({
      themeColor: app.globalData.navigateBarBgColor
    })
    if(options.realnameId){
      this.setData({
        editStatus:1
      })
      this.setFromData(options.realnameId)
    }
    if (options.addImg){
      this,setData({
        addImgStatus:true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let url = '/pages/customized/realname';
    publicFun.setUrl(url);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  setFromData(id){
    let that = this;
    let url = 'app.php?c=foreign_trade&a=attestation_detail';
    let params = {
      id: id
    }
    common.post(url, params, function (res) {
      console.log('数据回填', res)
      if (res.err_code == 0) {
        let datas = res.err_msg;
        that.setData({
          "formArr.id": datas.id,
          "formArr.realname": datas.name,
          "formArr.phone": datas.phone,
          "formArr.code": datas.id_card,
          "upImgSrc1": datas.id_card_a,
          "upImgSrc2": datas.id_card_b,
        })
      }
    }, '')
  },
  showDelete(e){

    if (e.currentTarget.dataset.value == 'realname'){
      this.setData({
        'formArr.realnameError': true,
        'formArr.codeError': false,
        'formArr.phoneError': false
      })
    }
    if (e.currentTarget.dataset.value == 'code') {
      this.setData({
        'formArr.codeError': true,
        'formArr.realnameError': false,
        'formArr.phoneError': false
      })
    }
    if (e.currentTarget.dataset.value == 'phone') {
      this.setData({
        'formArr.phoneError': true, 
        'formArr.realnameError': false,
        'formArr.codeError': false,
      })
    }
  },
  upImg(e){
    let that = this;
    let imgtype = e.currentTarget.dataset.imgtype;
    console.log(imgtype, e.currentTarget.dataset)
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res)
        var tempFilePaths = res.tempFilePaths;
        common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function (_res) {
          if (imgtype == 'upImgSrc1') {
            that.setData({
              upImgSrc1: _res.err_msg
            })
          } else {
            that.setData({
              upImgSrc2: _res.err_msg
            })
          }
         
        }, '')
        
      }
    })
  },
  clearData(e){
    let that=this
    let type = e.currentTarget.dataset.value;
    console.log(type,"wwwwwwwwwwwwwwwwwwwwwwwwwww")
    switch (type){
      case 'realname':
        that.setData({
          'formArr.realname': ''
        })
      break;
      case 'code':
        that.setData({
          'formArr.code': ''
        })
        break;
      case 'phone':
        that.setData({
          'formArr.phone': ''
        })
        break;
      case 'upImgSrc1':
        that.setData({
          'upImgSrc1': ''
        })
      break;
      case 'upImgSrc2':
        that.setData({
          'upImgSrc2': ''
        })
        break;
    }
  },
  setValue(e) {
    
    let type = e.currentTarget.dataset.value;
    let values = e.detail.value;
    console.log(type, "type", values,"values")
    switch (type) {
      case 'realname':
        this.setData({
          'formArr.realname': values,
        })
        break;
      case 'code':
        this.setData({
          'formArr.code': values,
        })
        break;
      case 'phone':
        this.setData({
          'formArr.phone': values,
        })
        break;
    }
  },
  // blurInput(e){
  //   let type = e.currentTarget.dataset.value;
  //   let values = e.detail.value;
  //   this.setData({
  //     'formArr.realnameError': false,
  //     'formArr.codeError': false,
  //     'formArr.phoneError': false
  //   })
  //   switch (type) {
  //     case 'realname':
  //       this.setData({
  //         'formArr.realnameError': true,
  //       })
  //       break;
  //     case 'code':
  //       this.setData({
  //         'formArr.codeError': true,
  //       })
  //       break;
  //     case 'phone':
  //       this.setData({
  //         'formArr.phoneError': true
  //       })
  //       break;
  //   }
  // },
  saveRealName(){
    let url = 'app.php?c=foreign_trade&a=attestationAdd';
    if (!this.data.formArr.realname){
      wx.showToast({
        title: '姓名不能为空',
        icon: 'error',
      })
      return
    }
    let codereg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!this.data.formArr.code || !codereg.test(this.data.formArr.code)) {
      wx.showToast({
        title: '身份证号码不能为空或错误',
        icon: 'error',
      })
      return
    }
    let telreg = /^1[34578]\d{9}$/;
    if (!this.data.formArr.phone || !telreg.test(this.data.formArr.phone) ) {
      wx.showToast({
        title: '手机号不能为空或错误',
        icon: 'error',
      })
      return
    }
    
    // if (!this.data.upImgSrc1){
    //   wx.showToast({
    //     title: '身份证正面',
    //     icon: 'error',
    //   })
    //   return
    // }
    // if (!this.data.upImgSrc2) {
    //   wx.showToast({
    //     title: '身份证反面',
    //     icon: 'error',
    //   })
    //   return
    // }
    let params = {
      id: this.data.formArr.id,
      name:this.data.formArr.realname,
      phone: this.data.formArr.phone,
      id_card: this.data.formArr.code,
      id_card_a: this.data.upImgSrc1,
      id_card_b: this.data.upImgSrc2,
    }
    common.post(url,params,function(res){
      console.log('jieguo',res);
      wx.showToast({
        title: res.err_msg,
        icon: 'error',
      })
      if (res.err_code==0){
        setTimeout(function () {
          // wx.redirectTo({
          //   url: '/pages/customized/showdetailstatus',
          // })
          wx.navigateBack({
            delta: 2
          })
        }, 1000)
      }
      
    },'')
  }
})