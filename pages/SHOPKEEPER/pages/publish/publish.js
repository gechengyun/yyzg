// pages/SHOPKEEPER//pages/publish/publish.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
let page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoSrc: '',//视频
    imgSrc: '',//图片
    imgSrc2:'',
    vthumb: '',//视频封面
    actionSheetHidden: true,//上传方式显示与否
    actionSheetItems: [
      { bindtap: 'addImage', txt: '上传图片' },
      { bindtap: 'addVideo', txt: '上传视频' }
    ],
    textareaShow: false,//是否显示文本框
    goods_ids:[],//关联商品的商品id
    goodsData:'',//关联商品数据
    group_detail:{},//表单提交数据
    isSubmit:false,//是否禁止提交
    tagList:[],//话题列表
    topicList:[],//话题列表
    no_more: false,
    isTopic: false,//是否显示话题列表
    topicVal: '',
    tagTid: [],//选中标签的tid
    toppicTid: [],//选中话题的tid
    pcode:'',//code是否过期
    jointype: 0,//参与类型--0:默认，1:标签，2：话题
    isRepeat: true,//防止重复点击提交
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;    
    publicFun.setBarBgColor(app, that); //修改头部颜色
    app.isLoginFun(that, 1);//判断用户是否登录
    publicFun.height(that);
    page = 1;
    that.topicFun();
    that.tagFun();
    wx.login({
      success: res => {
        that.data.pcode = res.code;
      }
    });
    if(options.isvideothumb){//视频是否必传封面图
      that.setData({
        isvideothumb: options.isvideothumb
      });
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
    let that = this;
    that.setData({
      goods_ids: that.data.goods_ids
    })
    console.log(that.data.goods_ids)
    that.aboutGoods();
  },
  // 关联商品
  aboutGoods:function(){
    let that = this;
    let url = 'app.php?c=society&a=getproduct',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        goods_ids: that.data.goods_ids.toString()
      };
    common.post(url, data, 'aboutGoodsData', that,'',true)
  },
  aboutGoodsData: function(res){
    var that = this;
    that.setData({
      goodsData: res.err_msg
    });
  },
  // 删除关联商品
  delGoods:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let plist = that.data.goodsData.plist;
    let goodsid = that.data.goods_ids;
    plist.splice(index, 1);
    goodsid.splice(index, 1);
    that.setData({
      'goodsData.plist': plist,
      goods_ids: goodsid
    })
  },
  // 删除话题
  delTopic:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index;
    let topictype = e.currentTarget.dataset.topictype;
    if(topictype == 'tag'){//标签
      let tagList = that.data.tagList;
      for (let i = 0; i < that.data.tagData.list.length; i++) {
        if (that.data.tagData.list[i].titleid == tagList[index].titleid) {
          that.data.tagData.list[i].tagIsClock = -1;
        }
      }
      that.data.tagTid.splice(index, 1);
      tagList.splice(index, 1);
      that.setData({
        tagList: tagList,
        'tagData.list': that.data.tagData.list
      });
    }else if(topictype == 'topic'){//话题
      let topicList = that.data.topicList;
      for (let i = 0; i < that.data.topicData.list.length; i++) {
        if (that.data.topicData.list[i].tid == topicList[index].tid) {
          that.data.topicData.list[i].topicIsClock = -1;
        }
      }
      that.data.toppicTid.splice(index, 1);
      topicList.splice(index, 1);
      that.setData({
        topicList: topicList,
        'topicData.list': that.data.topicData.list
      });
    }
  },
  // 选择上传类型
  chooseStyle:function(){
    let that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  actionSheetbindchange: function () {
    let that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  // 添加视频
  addVideo: function () {
    var that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
    if (that.data.videoSrc.length > 0) {
      return publicFun.warning('最多可以上传一个视频', that);
    }
    if(that.data.imgSrc.length>0){
      return publicFun.warning('视频与图片不能同时上传', that);
    }
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: false,
      maxDuration: 60,
      camera: 'back',
      success: function (res) {
        console.log(res);
        let videoSrcLise = that.data.videoSrc || [];
        if (res.duration > 300) {
          return publicFun.warning('视频长度不超过5分钟', that);
        }
        if (res.size > 1024 * 1024 * 25) {
          return publicFun.warning('视频大小不超过25M', that);
        }
        // 视频、图片上传
        wx.showLoading({
          title: '视频正在上传中...',
          mask: true
        })
        var tempFilePathsed = res.tempFilePath;
        let videoUrl = 'app.php?c=attachment&a=file_upload';
        that.upload_file_video(videoUrl, that, tempFilePathsed);
      }
    })
  },
  // 上传视频封面
  addVideoPic: function () {
    var that = this;
    wx.chooseImage({ //图片上传控件
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '图片上传中...',
          mask: true
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function (_res) {
          that.setData({
            vthumb: _res.err_msg,
            ['videoSrc[' + 0 + '].vthumb']:_res.err_msg
          });
          wx.hideLoading();
        }, '')
      }
    })
  },
  // 添加图片
  addImage: function () {
    var that = this;
    that.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
    if (that.data.videoSrc.length > 0) {
      return publicFun.warning('视频与图片不能同时上传', that);
    }
    wx.chooseImage({
      count: 9,
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
        if (nowLenght > 9) {
          return publicFun.warning('最多上传9张图片', that);
        }
        if (imageLenght == 9) {
          return publicFun.warning('数量已经有9张，请删除在添加...', that);
        }
        if (imageLenght < 9) {
          let imgPath = [];
          let residue = 9 - imageLenght;//获取缺少的图片张数
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
  // 上传视频
  upload_file_video: function (videoUrl, that, tempFilePathsed) {
    common.uploadFile(videoUrl, tempFilePathsed, function (_res) {
      console.log(_res.err_msg);
      let videoSrcLise = that.data.videoSrc || [];
      let videoInfo = {};
      videoInfo['furl'] = _res.err_msg.url;
      videoInfo['vthumb'] = _res.err_msg.vthumb;
      videoInfo['sort'] = 0;
      videoSrcLise.push(videoInfo);
      that.setData({
        videoSrc: videoSrcLise
      });
      wx.hideLoading();
    }, '');
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
  // 点击显示textarea文本框
  showTextarea: function () {
    let that = this;
    that.setData({
      textareaShow: true
    });
  },
  // 失去焦点
  hideTextarea: function (e) {
    let that = this;
    that.setData({
      textareaShow: false
    });
    if(e.detail.value != ''){
      that.testTxtFun(e.detail.value);
    }    
  },
  // 验证发布内容
  testTxtFun: function (testTxt) {
    let that = this;
    let url = 'app.php?c=society&a=msgSecCheck',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        msgSec: testTxt
      };
    common.post(url, data, 'testTxtData', that)
  },
  testTxtData: function (res) {
    let that = this;
    console.log(res);
    that.setData({
      testTxtData: res.err_msg,
      testTxtCode: res.err_msg.errcode
    });
    if (res.err_msg.errcode == 87014){
      return publicFun.warning('请检查是否有违法违规的内容', that, 'red');
    }
  },
  // 数据绑定
  // 输入标题
  bindTitle: function (e) {
    let that = this;
    var strTitle = publicFun.filterEmoji(e.detail.value)
    that.setData({
      "group_detail.title": publicFun.filterSpace(strTitle)
    })
  },
  // 标题输入框失去焦点校验
  inputblur:function(e){
    let that = this;
    if(e.detail.value != ''){
      that.testTxtFun(e.detail.value);
    }
  },
  // 输入内容
  bindContent: function (e) {
    let that = this;
    var strContent = publicFun.filterEmoji(e.detail.value)
    that.setData({
      "group_detail.content": publicFun.filterSpace(strContent)
    })
  },
  // 表单提交
  grouperSave:function(){
    let that = this;
    let topicList = that.data.topicList;
    let topicId = [];
    if(!that.data.isRepeat){
      return publicFun.warning('正在发布中，请稍后', that);
    }
    for (var i = 0; i < topicList.length;i++){
      topicId.push(topicList[i].tid);
    }
    if (that.data.imgSrc.length <= 0 && that.data.videoSrc.length <= 0) {
      return publicFun.warning('请上传图片或视频', that);
    };
    if (that.data.isvideothumb == 1 && that.data.videoSrc.length>0 && that.data.vthumb == '') {
      return publicFun.warning('请上传封面图', that);
    };
    if (that.data.testImgCode == 87014) {
      return publicFun.warning('图片涉及敏感内容，请重新上传', that);
    };
    if (!this.data.group_detail.title) {
      return publicFun.warning('请输入标题', that);
    };
    if (!this.data.group_detail.content) {
      return publicFun.warning('请输入内容', that);
    };
    if (that.data.testTxtCode == 87014) {
      return publicFun.warning('请检查是否有违法违规的内容', that);
    };
    // if (that.data.group_detail.content.length>60 && that.data.videoSrc.length>0) {
    //   return publicFun.warning('短视频内容最多60个字', that);
    // };
    // 数据结构处理
    var imgUrl=[];
    for (var i = 0; i < that.data.imgSrc.length; i++){
      var imgSrc={
        furl: that.data.imgSrc[i],
        "sort": 0
      };
      imgUrl.push(imgSrc);
    }
    that.setData({
      isRepeat: false
    });
    let params = {
      store_id: app.globalData.store_id || common.store_id,
      title: this.data.group_detail.title,
      openid: wx.getStorageSync('openId'),
      content: this.data.group_detail.content,
      ttids: topicId.toString(),
      titleids: that.data.tagTid.toString(),
      goods_ids: that.data.goods_ids.toString(),
      cfrom:1,
      "imgsrc": imgUrl,
      "vfile": that.data.videoSrc
    }
    let url = "app.php?c=society&a=add_item";
    common.post(url, params, function (res) {
      console.log('发布成功', res)
      if (res.err_code == 0) {
        that.setData({
          isSubmit: true,
          isRepeat: true
        })
        publicFun.warning(res.err_msg.msg, that);
        setTimeout(function () {
          wx.redirectTo({
            url: '/pages/SHOPKEEPER/pages/shop/index',
          })
        }, 800);        
      }
      if(res.err_code == 30002){
        that.setData({
          showgetPhone: true,
          isRepeat: true
        });
      } 
    }, '')
  },


  // 点击显示话题
  showTopic:function(e){
    let that = this;
    let topictype = e.currentTarget.dataset.topictype;
    if(topictype == 'tag'){//标签
      that.setData({
        jointype: 1
      });
    }else if(topictype == 'topic'){//话题
      that.setData({
        jointype: 2
      });
    }
    that.setData({
      isTopic:true
    });
  },
  // 取消
  cancleTopic:function(){
    let that = this;
    that.setData({
      isTopic: false
    });
  },
  // 标签列表
  tagFun:function(){
    let that = this;
    let url = 'app.php?c=society&a=getTitleTagList',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        keyword: that.data.keyword
      };
    common.post(url, data, function(res){
      that.setData({
        tagData: res.err_msg
      });
      for (let i = 0; i < res.err_msg.list.length;i++){
        that.data.tagData.list[i].tagIsClock = -1;
        that.data.tagData.list[i].index = i;
        if (that.data.tagTid.length>0){//搜索刷新接口保持选择状态
          for (let j = 0;j<that.data.tagTid.length;j++){
            if (that.data.tagData.list[i].titleid == that.data.tagTid[j]){
              that.setData({
                ['tagData.list[' + i + '].tagIsClock']:that.data.tagTid[j]
              });
            }
          }
        }
      }
    },'')
  },
  // 话题列表
  topicFun: function () {
    let that = this;
    let url = 'app.php?c=society&a=getTalkTagList',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        keyword: that.data.keyword,
        cfrom: 1,
        page: 1,
        pagesize: 20
      };
    common.post(url, data, 'topicData', that)
  },
  topicData: function (res) {
    var that = this;
    that.setData({
      topicData: res.err_msg
    });
    for (let i = 0; i < that.data.topicData.list.length;i++){
      that.data.topicData.list[i].topicIsClock = -1;
      that.data.topicData.list[i].index = i;
      if (that.data.toppicTid.length>0){
        for (let j = 0;j<that.data.toppicTid.length;j++){
          if (that.data.topicData.list[i].tid == that.data.toppicTid[j]){
            that.data.topicData.list[i].topicIsClock = that.data.toppicTid[j];
          }
        }
      }
    }
    that.setData({
      'topicData.list': that.data.topicData.list
    });
    //publicFun.barTitle(res.err_msg.privilege_name, that); //修改头部标题 
  },
  // 输入框监听
  wxSearchInput: function (e) {
    var that = this;
    let key = e.detail.value;
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
    var txt_value = "";
    for (var i = 0; i < key.length; i++) {
      txt_value = txt_value + key.substr(i, 1).replace(pattern, '');
    }
    that.setData({
      keyword: txt_value
    });
    page = 1;
    that.setData({
      no_more: false
    });
    if(that.data.jointype == 1){//标签
      that.tagFun();
    }else if(that.data.jointype == 2){//话题
      that.topicFun();
    }
  },
  // 搜索
  wxSearchFn: function () {
    var that = this;
    page = 1;
    that.setData({
      no_more: false
    });
    if(that.data.jointype == 1){//标签
      that.tagFun();
    }else if(that.data.jointype == 2){//话题
      that.topicFun();
    }
  },
  // 创建话题
  creatTopic: function () {
    let that = this;
    let url = 'app.php?c=society&a=addTalkTag',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        tid: 0,
        talkname: that.data.keyword,
        talkintroduce: '',
        xsort: 0,
        talkbgimg: '',
        cfrom: 1,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, function () {
      that.setData({
        keyword: ''
      });
      page = 1;
      that.setData({
        no_more: false,
        topicVal:'',
      });
      that.topicFun();
    }, '')
  },
  // 上拉加载
  bindDownLoad: function () {
    var that = this;
    let url = 'app.php?c=society&a=getTalkTagList';
    that.listPushData(++page, that, url);
  },
  // 上拉加载方法(分页)
  listPushData: function (page, that, url) {
    //订单相关页面下拉加载
    if (that.data.topicData.total_page < page) {
      that.setData({
        no_more: true
      });
      return;
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      keyword: that.data.keyword,
      cfrom: 1,
      page: page,
      pagesize: 20
    };
    common.post(url, data, function (result) {
      //添加数据
      var list = that.data.topicData.list;
      let listLen = list.length; 
      for (var i = 0; i < result.err_msg.list.length; i++) {
        result.err_msg.list[i].topicIsClock = -1;
        result.err_msg.list[i].index = list[listLen - 1].index + 1 + i;
        if (that.data.toppicTid.length > 0) {
          for (let j = 0; j < that.data.toppicTid.length; j++) {
            if (result.err_msg.list[i].tid == that.data.toppicTid[j]) {
              result.err_msg.list[i].topicIsClock = that.data.toppicTid[j];
            }
          }          
        } 
        list.push(result.err_msg.list[i]);
      }
      that.setData({
        'topicData.list': list,
        'topicData.total_page': result.err_msg.total_page
      });
      if (that.data.topicData.total_page < page) {
        that.setData({
          no_more: true
        });
      }
    }, '');
  },
  // 选择标签
  tagItem:function(e){
    let that = this;
    let tagitem = e.currentTarget.dataset.tagitem;
    let index = e.currentTarget.dataset.idx;
    let tagTid = that.data.tagTid.concat(tagitem.titleid);
    if(tagTid.length>3){
      return publicFun.warning('最多选择3个标签', that);
    }
    let tagList = that.data.tagList.concat(tagitem);
    that.setData({
      ['tagData.list[' + index + '].tagIsClock']: tagitem.titleid,
      tagList:tagList,
      isTopic: false,
      tagTid:tagTid
    })
  },
  // 选择话题
  topicItem: function (e) {
    let that = this;
    let topicItem = e.currentTarget.dataset.topicitem;
    let index = e.currentTarget.dataset.idx;
    let toppicTid = that.data.toppicTid.concat(topicItem.tid);
    if(toppicTid.length>3){
      return publicFun.warning('最多选择3个话题', that);
    }
    that.data.topicData.list[index].topicIsClock = topicItem.tid;
    let topicList = that.data.topicList.concat(topicItem);
    that.setData({
      topicList: topicList,
      'topicData.list': that.data.topicData.list,
      isTopic: false,
      toppicTid: toppicTid
    });
  },
  unClickTopic:function(){
    let that = this;
    if(that.data.jointype == 1){//标签
      return publicFun.warning('已选择此标签', that);
    }else if(that.data.jointype == 2){//话题
      return publicFun.warning('已参与此话题', that);
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //获取手机号
  getPhoneNumber(e) {
    let that = this;
    // 检查登录态是否过期
    wx.checkSession({
      success(res) {
        app.getPhoneNumber(e, that, that.data.pcode);
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            that.data.pcode = res.code;
            app.getPhoneNumber(e, that, res.code);
          }
        })
      }
    })
  },
})