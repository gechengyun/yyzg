var _url = '../../';
var common = require(_url + '../../../utils/common.js');
var publicFun = require(_url + '../../../utils/public.js');
var app = getApp();
let page = 1;
let is_repeat_msg = false;//是否多次点击发送
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSrc: [],//图片
    imgSrc2: [],
    resetValue: '',
  },

  /**
   * 生命周期函数--监听页面加载e
   */
  onLoad: function (e) {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    if (e.rights) {
      this.setData({
        currentTab: e.rights,
        // order_no: 'PIG20170306091411248170'
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    publicFun.setBarBgColor(app, that);// 设置导航条背景色
    publicFun.height(that);
    publicFun.barTitle('我的店铺');
    var store_id = common.store_id;
    that.setData({
      store_id
    })
  },
  // 添加图片
  addImage: function (e) {
    var that = this;
    console.log(e);
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const imgList = res.tempFilePaths;//上传的图片数据
        const imageList = that.data.imgSrc || [];//原始的图片数据
        let nowLenght = imgList.length;//当前上传的图片数量
        let imageLenght = imageList.length;//原来的图片数量  
        let data = {
          store_id: app.globalData.store_id || common.store_id,
        };
        if (imageLenght < 1) {
          let imgPath = [];
          let residue = 1 - imageLenght;//获取缺少的图片张数
          if (residue >= nowLenght) {//如果缺少的张数大于当前的的张数
            imgPath = imageList.concat(imgList);
          } else {
            imgPath = imageList.concat(imgList.slice(0, residue));
          }
          that.setData({
            imgSrc2: imgPath
          });
        }
        // 调用上传
        wx.showLoading({
          title: '图片正在上传中...',
          mask: true
        })
        let imgUrl = 'app.php?c=attachment&a=upload';
        var imgSrc2 = that.data.imgSrc2;
        for (var i in imgSrc2) {
          that.upload_file_server(imgUrl, that, imgSrc2, i);
        }
        console.log(that.data.imgSrc2)
      },
    })
  },
  // 上传图片方法
  upload_file_server: function (imgUrl, that, imgSrc2, i) {
    const upload_img_fun = common.uploadFile(imgUrl, imgSrc2[i], function (_res) {
      var filename = _res.err_msg;
      imgSrc2[i] = filename
      that.setData({
        imgSrc: imgSrc2
      })
      that.testImgFun(imgSrc2[i]);
      wx.hideLoading();
    }, '');
  },
  // 图片校验
  testImgFun: function (testImg) {
    let that = this;
    let url = 'app.php?c=society&a=imgSecCheck',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        imgSec: testImg
      };
    common.post(url, data, 'testImgData', that)
  },
  testImgData: function (res) {
    let that = this;
    console.log(res);
    that.setData({
      testImgData: res.err_msg,
      testImgCode: res.err_msg.errcode
    });
    if (res.err_msg.errcode == 87014) {
      return publicFun.warning('图片涉及敏感内容，请重新上传', that, 'red');
    }
  },
  // 删除上传图片 或者视频
  delFile(e) {
    let that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认要删除吗？',
      success(res) {
        if (res.confirm) {
          let delNum = e.currentTarget.dataset.index,
            delType = e.currentTarget.dataset.type,
            imgSrc = that.data.imgSrc,
            videoSrc = that.data.videoSrc;
          if (delType == 'image') {
            imgSrc.splice(delNum, 1)
            that.setData({
              imgSrc: imgSrc
            })
          } else if (delType == 'video') {
            videoSrc.splice(delNum, 1)
            that.setData({
              videoSrc: videoSrc
            })
          } else if (delType == 'vthumb') {
            that.setData({
              vthumb: '',
              ['videoSrc[' + 0 + '].vthumb']: ''
            })
          }
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  upImg: function (e) {
    let that = this;
    let imgtype = e.currentTarget.dataset.imgtype;
    wx.chooseImage({ //图片上传控件
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '正在上传中...',
          mask: true
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
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
          wx.hideLoading();
        }, '')
      }
    })
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
  inputSubmit(e) {
    let that = this;
    if (is_repeat_msg) {//多次重复发送
      wx.showToast({
        title: '1秒内不可重复提交多次',
        icon: 'none'
      })
      return;
    }
    is_repeat_msg = true;
    let st_out_repeat = setTimeout(() => {
      is_repeat_msg = false;
      clearTimeout(st_out_repeat);
    }, 1000);
    let params = {
      store_id: that.data.store_id,
      name: e.detail.value.name,
      store_logo: that.data.imgSrc[0]
    }
    console.log(params)
    // 验证成功后
    let url = "app.php?c=drp_ucenter&a=edit_store_info&app=app";
    common.post(url, params, function (res) {
      console.log('提交成功', res)
      if (res.err_code == 0) {
        publicFun.warning(res.err_msg, that);
        setTimeout(function () {
          that.setData({
            imgSrc: [],
            imgSrc2: [],
            resetValue: '',
          })
          wx.navigateBack({
            delta: 1
          })
        }, 800);
      }
      else {
        publicFun.warning(res.err_msg, that);
      }
    }, '')
  }
})