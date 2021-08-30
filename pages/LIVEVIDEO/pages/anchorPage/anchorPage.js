// pages/LIVEVIDEO//pages/anchorPage/anchorPage.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
let page = 1;
var downTime;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_index: 0,//Tab的索引0：精彩回放，1：主播种草
    // tabText:['精彩回放','主播种草'],//Tab内容
    tabText:['精彩回放'],//Tab内容
    isFollow: 0, //是否关注0:未关注，1:已关注
    fixedNav: false,//是否固定Tab
    isOver: false,//底部提示信息,
    opacityNav: 0,//头部的透明度
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    imgwidth: 0,//默认初始图片宽度
    imgheight: 0,//默认初始图片高度
    sx: 0,//海报商品图裁剪x轴坐标
    sy: 0,//海报商品图裁剪y轴坐标
    sw: 0,//海报商品图裁剪宽
    sh: 0,//海报商品图裁剪高
    butshow: false,//海报图预览显示
    myimgsrc: '',//海报图图片路径
    closeModal:false,//关闭保存成功弹窗
    canvasImgState: false,//海报
    menuIndex: -1,//显示操作菜单的索引
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('路由参数',options)
    let that = this;
    page = 1;
    publicFun.setBarBgColor(app, that); //修改头部颜色
    publicFun.setNavSize(that) // 通过获取系统信息计算导航栏高度
    app.isLoginFun(that, 1);//判断用户是否登录
    if(options.anchor_id){
      that.setData({
        anchor_id: options.anchor_id
      });
    };
    if(options.live_id){
      that.setData({
        live_id: options.live_id
      })
    }
    if(options.share_uid){
      app.globalData.share_uid = options.share_uid
    }

    // 扫码进入判断
    if (options.scene != undefined && options.scene != 'wxapp') {
      var scene_id = decodeURIComponent(options.scene);
      console.log("anchorPage.js", scene_id);
      if (scene_id) {
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          //console.log(result)
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id
            app.globalData.share_uid = result.err_msg.share_uid
            var society_id = result.err_msg.society_id
            that.setData({
                society_id: society_id,
            });
          }
        },'');  
      };
    }
    that.anchorFun();
    that.playBackFun(1);
  },
  // 主播信息
  anchorFun:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=anchor_info';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      anchor_id: that.data.anchor_id || 7924
    };
    common.post(url, data, 'anchorData', that, '')
  },
  anchorData: function (res) {
    let that = this;
    that.setData({
      anchorData: res.err_msg
    });
    that.setData({
      isSelf: res.err_msg.ismyself*1//1:是本人,0:不是本人
    });
    if(res.err_msg.live && res.err_msg.live.length>0){
      let liveArr = res.err_msg.live;
      that.setData({
        live_id: liveArr[0].id
      });
      for(let i=0;i<liveArr.length;i++){
        if(liveArr[i].status == 0){
          that.timeDown(downTime,i); //进来就执行一遍防止1s时间的空白
          downTime = setInterval(function() {
            that.timeDown(downTime,i);
          }, 1000);
        }
      }
    }
  },
  // 正在直播商品
  goodsFun: function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_goods_list';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id || 856
    };
    common.post(url, data, 'goodsData', that, '')
  },
  goodsData: function (res) {
    let that = this;
    that.setData({
      goodsData: res.err_msg
    });
  },
  // 精彩回放
  playBackFun: function(page){
    let that = this;
    let url = 'app.php?c=tencent_live&a=anchor_record_list';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      anchor_id:  that.data.anchor_id || 7924,
      page: page
    };
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            playBackData: res.err_msg,
            next_page1: res.err_msg.next_page
          });
        }else{
          var playBackDataList = that.data.playBackData.record_list;
          for (var i = 0; i < res.err_msg.record_list.length; i++) {
            playBackDataList.push(res.err_msg.record_list[i]);
          }
          that.setData({
            'playBackData.list': playBackDataList,
            next_page1: res.err_msg.next_page
          });
        }
      }
    }, '')
  },
  // 主播种草
  grassFun: function(page){
    let that = this;
    let url = 'app.php?c=society&a=mylist';
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      openid: wx.getStorageSync('openId'),
      cfrom: 1,
      anchor_id: that.data.anchor_id || 7924,
      page: page,
      pagesize:10
    };
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        if(page == 1){
          that.setData({
            grassData: res.err_msg,
            next_page2: res.err_msg.next_page
          });
        }else{
          var grassDataList = that.data.grassData.list;
          for (var i = 0; i < res.err_msg.list.length; i++) {
            grassDataList.push(res.err_msg.list[i]);
          }
          that.setData({
            'grassData.list': grassDataList,
            next_page2: res.err_msg.next_page
          });
        }
        that.getHeight();
      }
    }, '')
  },
  // 返回上一页
  goback: function () {
    wx.navigateBack({
      delta: 1
    })
  },
  // 关注/粉丝/喜欢跳转列表页
  goNumList:function(e){
    let that = this;
    console.log(e);
    let listType = e.target.dataset.listtype;
    if(listType == 'about'){//关注
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userList?tabIndex=0'
      });
    }else if(listType == 'fans'){//粉丝
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/userPage/userList?tabIndex=1'
      });
    }else if(listType == 'like'){//喜欢
      wx.navigateTo({
        url: '/pages/SHOPKEEPER/pages/publish/publishList?way=2'
      });
    }
  },
  // 关注事件
  followClick:function(){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    if (that.data.anchorData.subscribe_template_id && that.data.anchorData.subscribe_template_id.length > 0) {
      if (that.data.anchorData.subscribe == 0) {
        that.setData({
          isFollow: 1
        });
        // 点击关注授权模板消息
        wx.requestSubscribeMessage({
          tmplIds: that.data.anchorData.subscribe_template_id,
          success(res) {
            console.log(res);
            if (res[that.data.anchorData.subscribe_template_id] == "accept") { //点击确定授权
              publicFun.warning('订阅成功', that);
            }else if(res[that.data.liveVideoData.subscribe_template_id] == "ban"){
              publicFun.warning('请开启订阅消息方便接收消息提醒', that);
            } else { //点击取消授权
              publicFun.warning('取消订阅', that);
            }
          },
          fail(e) {
            // publicFun.warning(e.errMsg, that);
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          },
          complete(res){
            that.followFun();
          }
        })
      } else {
        that.setData({
          isFollow: 0
        });
        that.followFun();
      }
    } else {
      if (that.data.anchorData.subscribe == 0) {
        that.setData({
          isFollow: 1
        });
        that.followFun();
      } else {
        that.setData({
          isFollow: 0
        });
        that.followFun();
      }
    }
  },
  // 关注函数
  followFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=subscribe',
      data = {
        live_id: that.data.live_id || 856,
        anchor_id: that.data.anchor_id || 7924,
        status: that.data.isFollow,
        phone: that.data.anchorData.phone
      };
    common.post(url, data, 'followData', that, '', true)
  },
  followData: function(res) {
    let that = this;
    console.log(res);
    if (that.data.anchorData.subscribe == 0) {
      that.setData({
        'anchorData.subscribe': 1
      });
      console.log('关注成功');
      publicFun.warning('关注成功', that);
    } else {
      that.setData({
        'anchorData.subscribe': 0
      });
      publicFun.warning('已取消关注', that);
    }
  },
   // 点击预约
  appointClick: function(e) {
    let that = this;
    let appintId = e.currentTarget.dataset.liveid;
    let liveindex = e.currentTarget.dataset.liveindex;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    if (that.data.anchorData.live[liveindex].is_preparetips == 0) {
      wx.requestSubscribeMessage({
        tmplIds: that.data.anchorData.subscribe_template_id,
        success(res) {
          console.log(res);
          if (res[that.data.anchorData.subscribe_template_id] == "accept") { //点击确定授权
            publicFun.warning('预约成功', that);
          }else if(res[that.data.liveVideoData.subscribe_template_id] == "ban"){
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          } else { //点击取消授权
            publicFun.warning('取消订阅', that);
          }
        },
        fail(e) {
          // publicFun.warning(e.errMsg, that);
          publicFun.warning('请开启订阅消息方便接收消息提醒', that);
        },
        complete(res){
          that.appointFun(appintId,liveindex);
        }
      })
    } else if (that.data.anchorData.live[liveindex].is_preparetips == 1) {
      publicFun.warning('已预约', that);
    } else {
      publicFun.warning('已发送', that);
    }
  },
  appointFun: function(appintId,liveindex) {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addPrepareTips',
      data = {
        live_id: appintId,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data,function(res) {
      that.setData({
        shareNumData: res.err_msg,
        ['anchorData.live[' + liveindex + '].is_preparetips']: 1
      });
      let nowpages = getCurrentPages(); //获取上一个页面信息栈(a页面)
      let prevPage = nowpages[nowpages.length - 2]; //给上一页面的tel赋值
      if(prevPage){
        prevPage.setData({
          'liveVideoData.is_preparetips': 1
        });
      }  
    }, '');
  },
  // 进入直播间
  goLiveDetail:function(e){
    let that = this;
    let liveId = e.currentTarget.dataset.liveid;
    let imgsrc = e.currentTarget.dataset.imgsrc;
    let status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&imgsrc=" + imgsrc + "&status=" + status,
    })
  },
  // Tab切换
  switchTab:function(e){
    let that = this;
    page = 1;
    let index = e.currentTarget.dataset.index;
    that.setData({
      btn_index: index,
      isOver: false,
      menuIndex: -1
    });
    if(index == 0){
      that.playBackFun(page);
    }else if(index == 1){
      that.grassFun(page);
    }
  },
  // 展开收起
  showMore:function(e){
    let that = this;
    let idxs = e.currentTarget.dataset.idx;
    if (that.data.moreData == idxs){
      that.setData({
        moreData: -1
      })
    }else{
      that.setData({
        moreData: idxs
      });
    }
  },
  // 去商品回放页面
  goRecordvideo: function(e) {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    wx.navigateTo({
      url: `/pages/LIVEVIDEO/pages/liveVideo/goodsPlayback?product=${e.currentTarget.dataset.product}&live_id=${e.currentTarget.dataset.lived}&filesrc=${e.currentTarget.dataset.filesrc}&allrecord=${e.currentTarget.dataset.allrecord}&showStatus=${e.currentTarget.dataset.show_status}`
    })
    if(e.currentTarget.dataset.allrecord == 1){
    //更新回放次数
    let url = 'app.php?c=tencent_live&a=update_record_replay_num',
        data = {
          live_id: e.currentTarget.dataset.lived
        };
        common.post(url, data ,function(result){          
          if(result.err_code == 0){
            console.log(result)
          }
        },'');
      }   
  },
  // 图片预览
  previewPic:function(e){
    let _current = e.currentTarget.dataset.src;
    let _urls = e.currentTarget.dataset.urls;
    let arr_urls = [];
    for (var i in _urls) {
      arr_urls.push(_urls[i].thumb);
    };
    wx.previewImage({
      current: _current, // 当前显示图片的http链接
      urls: arr_urls// 需要预览的图片http链接列表
    });
  },
  // 视频点击全屏
  videoScreen:function(e){
    let that = this;
    var videoIdx = e.currentTarget.dataset.index;
    that.videoContext = wx.createVideoContext('video' + videoIdx);
    that.videoContext.requestFullScreen();
    // 让其他视频暂停播放
    publicFun.videoPlay(this, e);
  },
  // 页面滚动监听
  onPageScroll: function(e){
    let query = wx.createSelectorQuery()
    query.select('.anchor-content').boundingClientRect( (rect) => {
      let top = rect.top
      if (top <= 64) {
        this.setData({
          fixedNav: true,
          opacityNav: 1
        })
      } else {
        this.setData({
          fixedNav: false,
          opacityNav: (239 - top)/150
        })
      }
    }).exec()
  },
  // 倒计时
  timeDown: function(downTime,index) {
    let that = this;
    let nowTime = Math.round(new Date().getTime() / 1000).toString();
    let start_time = that.data.anchorData.live[index].start_time;
    var t = (start_time - nowTime);
    if (t >= 0) { //防止倒计时到0后继续倒计时变为负数了
      let timeDownVal = Math.floor(t / 86400) + '天' + Math.floor(t % 86400 / 3600) + '时' + Math.floor(t % 86400 % 3600 / 60) + '分' + t % 60 + '秒';
      that.setData({
        ['anchorData.live[' + index + '].startTime']:timeDownVal
      });
    } else {
      let timeDownVal = '00天00时00分00秒';
      that.setData({
        ['anchorData.live[' + index + '].startTime']:timeDownVal
      });
      clearInterval(downTime);
    }
  },
  // 算内容高度
  getHeight:function(){
    let that = this;
    setTimeout(function () {
      var query = wx.createSelectorQuery();
      query.selectAll('.item-content').boundingClientRect();
      query.exec(function (rect) {
        if (rect[0] === null) return;
        var marginBM = [];
        for (var i in that.data.grassData.list) {
          marginBM.push(rect[0][i].height / 20)
        }
        that.setData({
          marginBM: marginBM
        });
      });
    }, 500) 
  },
  // 跳转到内容详情页
  goDetail: function(e){
    let that = this;
    let society_id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;//种草类型1：图片；2：视频
    let comment = e.currentTarget.dataset.comment;
    if(that.data.grassData.isfullscreen*1 == 1){//1:开启了短视频 0：未开启
      if(type == 1){//跳转种草详情
        if(comment){
          wx.navigateTo({
            url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id + '&comment=' + comment,
          });
        }else{
          wx.navigateTo({
            url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id,
          });
        }
      }else{
        wx.navigateTo({
          url: '/pages/SHOPKEEPER/pages/shop/videoSlide?society_id=' + society_id + '&comfrom=0',
        });
      }
    }else{
      if(comment){
        wx.navigateTo({
          url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id + '&comment=' + comment,
        });
      }else{
        wx.navigateTo({
          url: '/pages/SHOPKEEPER/pages/shop/detail?society_id=' + society_id,
        });
      }
    }
  },
  // 点赞
  clickHeart: function (e) {
    let id = e.currentTarget.dataset.id;
    let idxs = e.currentTarget.dataset.idxs;
    let that = this;
    let url1 = 'app.php?c=society&a=society_like',//点赞
      url2 = 'app.php?c=society&a=cancle_like',//取消赞
      data = {
        society_id: id
      };
    let changeLike = 'grassData.list[' + idxs + '].liked',
      changeNum = 'grassData.list[' + idxs + '].like_num';
    if (that.data.grassData.list[idxs].liked == 0) {
      // liked：0，当前未点赞，调用点赞接口
      common.post(url1, data, function (res) {
        that.setData({
          [changeLike]: 1,
          [changeNum]: res.err_dom.split('').splice(4).join('')
        });   
      }, '');
    } else {
      // liked：1，当前已点赞，调用取消点赞接口
      common.post(url2, data, function (res) {
        that.setData({
          [changeLike]: 0,
          [changeNum]: res.err_dom.split('').splice(4).join('')
        });   
      }, '');
    }
  },
  // 显示上架删除菜单
  moreFun:function(e){
    let that = this;
    let listindex = e.currentTarget.dataset.listindex;
    if(that.data.menuIndex != listindex){
      that.setData({
        menuIndex: listindex
      })
    }else{
      that.setData({
        menuIndex: -1
      })
    }  
  },
  // 置顶/下架/上架/删除
  menuClick:function(e){
    let that = this;
    console.log(e);
    let grassData = that.data.grassData;
    let menutype = e.target.dataset.menutype;
    let society_id = e.currentTarget.dataset.id;
    let listIndex = e.currentTarget.dataset.listindex;
    that.setData({
      menuIndex: -1
    });
    if(menutype == 'topping'){//置顶
      let toptime = e.target.dataset.toptime;
      let url = 'app.php?c=society&a=user_toptime',
        data = {
          store_id: app.globalData.store_id || common.store_id,
          society_id: society_id
        };
      if(toptime*1 > 0){//置顶中
        data.opttype = 1
        wx.showModal({
          title: '置顶中',
          content: '确认取消置顶?',
          confirmText: '确认',
          showCancel: true,
          confirmColor: '#fe6b31',
          success: function(res) {
            common.post(url, data, function(){
              publicFun.warning('取消置顶成功', that);
              that.grassFun(1);
              // that.setData({
              //   ['grassData.list['+listIndex+'].user_toptime']: 0
              // });
            }, '', '', true)
          }
        });
      }else{
        data.opttype = 0
        common.post(url, data, function(){
          publicFun.warning('置顶成功', that);
          that.grassFun(1);
          // that.setData({
          //   ['grassData.list['+listIndex+'].user_toptime']: 1
          // });
        }, '', '', true)
      }
    }else if(menutype == 'downshelf'){//下架
      let url = 'app.php?c=society&a=change_status',
        data = {
          store_id: app.globalData.store_id || common.store_id,
          society_id: society_id,
          status: 3//3:下架,1:上架
        };
      common.post(url, data, function(){
        grassData.list.splice(listIndex, 1);
        publicFun.warning('下架成功', that);
        that.setData({
          'grassData.list': grassData.list
        });
        console.log('下架/上架');
      }, '', '', true)
    }else if(menutype == 'delitem'){//删除
      wx.showModal({
        title: '确定删除？',
        content: '删除后，作品将无法恢复请谨慎操作！',
        cancelText: '取消',
        confirmText: '删除',
        confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor:'#fe6b31',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            let url = 'app.php?c=society&a=del_society',
              data = {
                store_id: app.globalData.store_id || common.store_id,
                society_id: society_id
              };
            common.post(url, data, function(){
              grassData.list.splice(listIndex, 1);
              publicFun.warning('删除成功', that);
              that.setData({
                'grassData.list': grassData.list
              });
              console.log('删除');
            }, '', '', true);
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      });
    }
  },
  //显示对话框
  shareTap: function (e) {
    let that = this;
    that.setData({
      shareIdx: e.currentTarget.dataset.idxs
    });
    that.dialog.showDialog();
  },
  //取消事件
  _cancelEvent: function () {
    var that = this;
    console.log('你点击了取消');
    try {
      clearInterval(loopDownloadTimer); // 清除检测downloadFile是否全部执行完的计时器
    } catch (e) {

    }
    // 修改画布执行状态
    if (that.data.canvasData) {
      that.data.canvasData.status = false;
    }
    that.setData({
      canvasData: that.data.canvasData
    })
    wx.hideLoading();
    that.dialog.hideDialog();
    that.setData({
      canvasImgState: false
    })
  },
  //分享好友或群
  _shareGroup: function () {
    console.log('分享好友或群');
    wx.showShareMenu({
      withShareTicket: false
    });
    this.shareData();
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function () {
    var that = this;
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let listIdx = that.data.shareIdx;
    let data = {
      path: 'pages/SHOPKEEPER/pages/shop/detail',
      id: that.data.grassData.list[listIdx].id,
      share_uid: getApp().globalData.my_uid,
      store_id: app.globalData.store_id || common.store_id,
      shareType: "society"
    }
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    });
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function (res) {
        console.log('获取二维码成功')
        if (res.statusCode == 200) {
          if (res.data.err_code == 0) {
            that.setData({
              qrcodePath: res.data.err_msg
            })
            // 处理canvas
            wx.showLoading({
              title: '海报生成中...',
              mask: true
            })
            that.creatPost();
            // 处理canvas    
          } else if (res.data.err_code == 1000) {
            console.log('未发布，暂不支持分享');
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: res.data.err_msg,
              confirmText: '好哒',
              confirmColor: app.globalData.navigateBarBgColor,
              showCancel: false,
              success: function (res) {
                that.dialog.hideDialog();
              }
            });
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
      }
    })
  },
  // 生成分享海报
  creatPost: function () {
    let that = this;
    let listIdx = that.data.shareIdx;
    // 过滤富文本标签
    let str = that.data.grassData.list[listIdx].content;
    // let reg = RegExp("<[^>]+>", "g");
    // let product_content = str.replace(reg, '');
    str = str.split('&nbsp;').join('');
    str = str.split('&#39;').join("'");
    str = str.replace(/(\n)/g, "");
    str = str.replace(/(\t)/g, "");
    str = str.replace(/(\r)/g, "");
    str = str.replace(/<\/?[^>]*>/g, "");
    str = str.replace(/\s*/g, "");
    let product_content = str;
    // 1 设置画布数据
    var windowHeight = wx.getSystemInfoSync().windowHeight
    var windowWidth = wx.getSystemInfoSync().windowWidth
    
    console.log(windowHeight, windowWidth, 750 * Number(windowHeight)/Number(windowWidth) ,"windowWidthwindowWidth------")
  
    let canvasData = { // 画布数据
      status: true,
      canvasW: windowWidth,
      canvasH: windowHeight,
      canvasId: 'productPost',
      // canvasWidth: 670,
      // canvasHeight: 720,
      canvasWidth: 750,
      canvasHeight: 750 * 1.6,
      whProportion: 1.28,
      paddingLeft: 40,
      paddingTop: 30,
      radius: 10,
      bg_color: '#ffffff',// 画图填充背景色（不设置默认会生成透明背景的图片）
      product_content: product_content, // 活动内容
      shopName: that.data.anchorData.store_name,
      text_qrcode_btm: '长按识别小程序码 即可查看~', // 二维码下方文字
      loadFailTapStatus: false, // 下载失败处理函数是否已执行
      // 图片数据
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      // qrcodePath: that.data.grassData.list[listIdx].files[0].thumb, // 二维码
      productImage: that.data.grassData.list[listIdx].files[0].thumb || 'https://' + that.data.qrcodePath.split('://')[1], // 商品首图
    };
    let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: that.data.winWidth });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['productImage', 'qrcodePath']
    for (let j = 0; j < filePaths.length; j++) {
      const filePath = filePaths[j];
      task.push(canvasFun.loadImageFileByUrl(that.data.canvasData[filePath]))
    }

    Promise.all(task).then(resultList => {
      for (let filePathIndex = 0; filePathIndex < resultList.length; filePathIndex++) {
        let resultListElement = resultList[filePathIndex];
        that.data.canvasData[filePaths[filePathIndex]] = resultListElement.tempFilePath
      }
      that.setData({
        canvasData: that.data.canvasData
      })
      that.getImageMes();
      setTimeout(function () {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        that.save({
          id: that.data.canvasData.canvasId,
          w: w,
          h: h,
          targetW: w * 4,
          targetH: h * 4
        });
      }, 300)
    }).catch(err => {
      console.log(err);
    })
  },
  getImageMes:function(){
    let that = this;
    var sx, sy, sw, sh, imgH=510;
    // var sx =  0,  sw = 510,  imgW = 510;
    // var sy = 0, sh = 510 * that.data.canvasData.whProportion, imgH = 510 * that.data.canvasData.whProportion;
    wx.getImageInfo({
      src: that.data.canvasData.productImage,
      success(res) {
        var imgw = res.width,
          imgh = res.height, 
          whProportion = that.data.canvasData.whProportion;
        console.log(imgw,"--------------");
        console.log(imgh, "--------------");
        console.log(that.data.canvasData.whProportion, "--------------");
        
        //如果图宽大于高&&图宽小于高*whProportion
        if ((imgh * whProportion > imgw)&&imgw > imgh ) {
          console.log(11);
          sx = 0;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
        //如果图宽小于高&&图高大于*whProportion宽
        } else if (imgw < imgh && (imgh < imgw * whProportion)){
          console.log(22);
          sx = 0;
          sy = 0;
          sw = imgw;
          sh = imgw * whProportion
          //如果图宽大于高*whProportion
        } else if (imgw > imgh * whProportion){
          console.log(33);
          sx = (imgw - imgh / whProportion ) / 2;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
          //如果图高大于*whProportion宽
        } else if (imgh > imgw * whProportion ){
          console.log(44);
          sx = 0;
          sy = (imgh - imgw * whProportion) / 2;
          sw = imgw;
          sh = imgw * whProportion
          //正方形
        }else{
          console.log(55);
          sx = 0;
          sy = (imgh - imgw * whProportion) / 2;
          sw = imgw;
          sh = imgw * whProportion
        }
        that.setData({
          sx: sx,
          sy: sy,
          sw: sw,
          sh: sh
        });
        that.drawCanvas();
      },
      fail(res){
        console.log(res,'getImageInfo失败')
      }
    })
  },
  // 画图海报
  drawCanvas: function () {
    let that = this;
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部商品图片偏移量
    let innerLeft = 40;
    // 内部商品图片高度
    let imgH = w - (innerLeft) * 2;
    // 头像半径
    let head_r = 53;
    // 二维码半径
    let qrode_r = 70;
    let positionY = 0;

    var sx = that.data.sx,
      sy = that.data.sy,
      sw = that.data.sw,
      sh = that.data.sh;
    console.log(sx, "*************", sy, "*************", sw, "*************", sh)
    // 生成画笔
    // 获取图片信息    
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: 0,
      y: 0,
      w: w ,
      h: h ,
      r: 20,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });
    
    // 绘制商品图片
    positionY =  40;
   
    canvas.roundImg({
      ctx: ctx,
      x: innerLeft,
      sx: sx,
      y: positionY,
      sy: sy,
      img: that.data.canvasData.productImage,
      w: imgH,
      sw: sw,
      h: imgH *that.data.canvasData.whProportion,
      sh: sh,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });
    let product_name_text = that.data.canvasData.product_content;
    // 绘制中间容器,商品内容,超出19个字显示两行，多两行，显示省略号

  //获取字符串长度，中文是两个字符串
    function getStrleng(str) {
      let myLen = 0;
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) //字符编码，128以内的是数字，英文字符，已经英文的符号等
          myLen++;
        else
          myLen += 2;
      }
      return myLen;
    }
  //截取一般
    function _sub(str, len, start) {
      var num = 0;
      for (let i=0  ; i < str.length; i++) {
        var a = str.charAt(i);
        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128){//字符编码，128以内的是数字，英文字符，已经英文的符号等
          num++;
        }else{
          num += 2;
        }
        if (num == len) {
          return str.substring(start, i + 1);
        }
        if (num > len) {
          return str.substring(start, i);
        }
      }
    }

    if (getStrleng(product_name_text) > 34) {
      if (getStrleng(product_name_text) > 68) {        
        let start = _sub(product_name_text, 34, 0).length
        console.log(_sub(product_name_text, 34, 0), start, "staetstaetstaet", _sub(product_name_text, 68, start) )
        product_name_text = _sub(product_name_text, 34, 0) + '\n' + _sub(product_name_text, 68, start) + "...";
        // product_name_text = product_name_text.slice(0, 17) + '\n' + product_name_text.slice(17, 34) + '\n' + product_name_text.slice(34, 50) + "...";
      // } else if (product_name_text.length > 34 && product_name_text.length < 51){
      //   product_name_text = product_name_text.slice(0, 17) + '\n' + product_name_text.slice(17, 34) + '\n' + product_name_text.slice(34, product_name_text.length);
      }else{
        let len = getStrleng(product_name_text)
        let start = _sub(product_name_text, 34, 0).length
        product_name_text = _sub(product_name_text, 34, 0) + '\n' + _sub(product_name_text, len, start )
      }
      canvas.drawMultiText({
        ctx,
        gap: 15,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH * that.data.canvasData.whProportion + 24,
        fontSize: 30
      })
    } else {
      canvas.drawText({
        ctx: ctx,
        text: product_name_text,
        x: left + innerLeft,
        y: positionY + imgH * that.data.canvasData.whProportion + 24,
        fontSize: 30
      });
    }
    
    // 绘制二维码
    positionY = positionY + imgH * that.data.canvasData.whProportion + 24;
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x:  innerLeft + 50,
      y: positionY + 110,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码右侧文字
    canvas.drawMultiText({
      ctx: ctx,
      text: '长按小程序码查看详情\n分享自[' + that.data.canvasData.shopName +']',
      x: innerLeft + qrode_r * 2 + 80,
      y: positionY + qrode_r + 110,
      fontSize: 25,
      baseline: 'middle',
      gap: 15,
      color: '#919398'
    });

    // 最终绘出画布
    ctx.draw();
  },
  // 画图 18-04-24 created by cms_ssa
  save: function (o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function (res) {
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath,
        canvasImgState: true,
        myimgsrc: o.imgSrc,
        butshow: true
      })
      that.dialog.hideDialog();  
      
    }, function (err) {
      console.log(err);
    });
  },
  // 海报点击关闭
  closeCanvas: function () {
    let that = this;
    that.setData({
      butshow: false
    });
  },
  // 海报点击保存
  saveCanvas: function () {
    let that = this;
    wx.showLoading({
      title: '正在保存中...',
      mask: true
    });
    wx.getSetting({
      success(res) {
        console.log('666', res)
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.hideLoading();
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              console.log('用户同意授权')
              that.savaImageToPhoto();
            },
            fail() {//这里是用户拒绝授权后的回调
              console.log('用户拒绝授权');
              that.setData({
                saveImgBtnHidden: false
              })
            }
          })
        } else {//用户已经授权过了
          console.log('用户已经授权过了')
          that.savaImageToPhoto();
        }
      }
    })    
  },
  // 用户取消授权重新授权
  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存在相册中！',
        confirmColor: app.globalData.navigateBarBgColor,
        showCancel: false
      })
      that.setData({
        saveImgBtnHidden: false,
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        confirmColor: app.globalData.navigateBarBgColor,
        showCancel: false
      })
      that.setData({
        saveImgBtnHidden: true
      })
    }
  },
  // 保存到相册
  savaImageToPhoto: function () {
    let that = this;
    // saveImageToPhotosAlbum图片保存到本地相册
    wx.saveImageToPhotosAlbum({
      filePath: that.data.myimgsrc,
      success: function () {
        console.log('保存成功');
        wx.hideLoading();
        that.setData({
          butshow: false,
          closeModal: true
        });
        //保存成功分享数据加一
        that.shareData();
      },
      fail: function () {
        console.log('用户取消保存');
        wx.hideLoading();
      }
    });
  },
  // 关闭保存成功
  closeModaled: function (e) {//关闭弹窗
    this.setData({
      closeModal: false
    })
  },
  // 分享数据接口
  shareData:function(){
    let that = this;
    let listIdx = that.data.shareIdx;
    let url = 'app.php?c=society&a=share_callback',
      shareNum = 'grassData.list[' + listIdx + '].share_num',
      data = {
        society_id: that.data.grassData.list[listIdx].id
      };
    common.post(url, data, function (res) {
      console.log(res);
      that.setData({
        [shareNum]: res.err_dom.split('').splice(4).join('')
      })
    }, '')
    console.log(that.data.lists)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    // 获得dialog组件
    setTimeout(function(){
      that.dialog = that.selectComponent("#shareModal");
      console.log(that.dialog)
    },1000);
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
    let that = this;
    clearInterval(downTime);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    wx.showNavigationBarLoading();
    that.anchorFun();
    page = 1;
    that.setData({
      isOver: false,
      menuIndex: -1
    });
    if(that.data.btn_index == 0){
      that.playBackFun(page);
    }else if(that.data.btn_index == 1){
      that.grassFun(page);
      that.getHeight();
    }
    setTimeout(function(){
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    if(that.data.btn_index == 0 && that.data.next_page1 ==true){
      wx.showNavigationBarLoading();
      that.playBackFun(++page);
      setTimeout(function(){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 1500)
    }else if(that.data.btn_index == 1 && that.data.next_page2 ==true){
      wx.showNavigationBarLoading();
      that.grassFun(++page);
      setTimeout(function(){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, 1500)
    }else{
      that.setData({
        isOver:true
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    let that = this;
    let listIdx = that.data.shareIdx
    const product = that.data.grassData.list[listIdx];
    // 过滤富文本标签
    let str = that.data.grassData.list[listIdx].content;
    // let reg = RegExp("<[^>]+>", "g");
    // let product_content = str.replace(reg, '');
    str = str.split('&nbsp;').join('');
    str = str.split('&#39;').join("'");
    str = str.replace(/(\n)/g, "");
    str = str.replace(/(\t)/g, "");
    str = str.replace(/(\r)/g, "");
    str = str.replace(/<\/?[^>]*>/g, "");
    str = str.replace(/\s*/g, "");
    let product_content = str;
    if (product_content.length > 30) {
      product_content = product_content.slice(0,31) + "...";    
    }
    if (options.from === 'button') {
      that.dialog.hideDialog();
    }
    return getApp().shareGetFans(product_content, ` `, `/pages/SHOPKEEPER/pages/shop/detail`, 1, product.files[0].thumb, `&society_id=${product.id}`);
  }
})