var publicFun = require('../../utils/public.js');
var common = require('../../utils/common.js');
var app = getApp();
Page({
  data: {
    userData: '',
    is_fx: '',
    sid: '',
    SUER_URL: '/pages/USERS',
    LIVE_URL:'/pages/LIVEVIDEO/pages',
    //open_drp_pulverize:1 不显示分销管理，0显示
  },
  onLoad: function(e) { // 页面渲染完成
    var that = this;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.barTitle('会员主页'); //修改头部标题
    //增加拉粉进度条
    // let data = {
    //   store_id: getApp().globalData.store_id
    // };
    common.post("app.php?c=ucenter&a=share_info", {}, "shareInfoFun", that)

    // 新授权方式下锁粉新增
    if (e.scene != undefined) { // 预览模式
      var scene_id = decodeURIComponent(e.scene);
      console.log("user/index二维码", scene_id);
      if (scene_id) {
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          console.log("123",result);
          if(result.err_code == 0){
            //id = scene.split(',')[1];  //这个是原有参数修改二维码接口不确定还未添加
            preview = 1;//这个是否要setData
            app.globalData.store_id = result.err_msg.store_id;
            app.globalData.share_uid = result.err_msg.share_uid;
          }
        },'');    
        
      }
    } else { // 正常模式
      getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;
    }
    // 以上新增

    app.isLoginFun(this, 1);//判断用户是否登录
    if(this.data._unlogin){
      return;
    }
    //是否展示分享图片
    app.shareWidthPic(that);
    if (getApp().globalData.anchor_team_type){
      console.log('团队参数',getApp().globalData.anchor_team_type);
      that.setData({
        teamType: getApp().globalData.anchor_team_type*1
      });
      console.log(that.data.teamType);
    }

    // 获取新的code
    wx.checkSession({
      success(res) {
        console.log('code未过期')
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        console.log('code过期,重新获取')
        wx.login({
          success: res => {
            app.globalData.login == res;
          }
        });
      }
    });
  },
  onReady: function(e) {

  },
  onShow: function(e) {
    var that = this;
    let data = {
      // store_id: app.globalData.store_id
    }
    common.post('app.php?c=my&a=index', data, "userData", that);
    publicFun.height(that);
    that.setData({
      'is_fx': common.is_fx,
      'sid': common.store_id
    })
  },
  onPullDownRefresh() {
    var that = this;
    // let data = {
    //   store_id: app.globalData.store_id
    // }
    common.post('app.php?c=my&a=index', {}, "userData", that);
    that.setData({
      'is_fx': common.is_fx,
      'sid': common.store_id
    })
  },
  shareInfoFun(res) {
    let that=this;
      if (res.err_code == 0) {
        //百分比
        let progress = Number(res.err_msg.now_num) * 100 / Number(res.err_msg.num);
        let description = '';
        if (res.err_msg.description){
          description = res.err_msg.description.split("↵");
        }
        that.setData({
          pageData: res.err_msg,
          progress,
          description
        })
      }
    },
  userData: function(result) {
    console.log('shujj',result);
    if (result.err_code == 0) {
      if (!result.err_msg.wxapp_member_content) {
        //会员控制项兼容处理
        result.err_msg.wxapp_member_content = {
          "gouwuche": 1,
          "wodeshoucang": 1,
          "wodeshouhou": 1,
          "huiyuanka": 1,
          "lianxikefu": 1,
          "shouhuodizhi": 1,
          "wodeyuyue": 1,
          "tuiguangbendian": 1,
          "wodepintuan": 1,
          "daiyanguanli": 1
        }
      }

      let {
        open_ucenter_show: open_index_show,
        live_code_title,
        live_code_description,
        live_code_logo
      } = result.err_msg.store_config
      let live_code_config = {
        open_index_show,
        live_code_title,
        live_code_description,
        live_code_logo
      }
      let haveShow = false; //我的邀请人显示
      if (result.err_msg.invite_module.show_inviter!=0){
        haveShow =true
      }
      this.setData({
        haveShow,
        live_code_config,
        userData: result.err_msg,
        show_inviter: result.err_msg.invite_module.show_inviter,
        wxapp_member_content: result.err_msg.wxapp_member_content,
        centre_custom_url: result.err_msg.centre_custom_url || "",//设置复制链接
      })
      wx.stopPullDownRefresh();
    };
  },
  updateInfo: function() {
    wx.showLoading({
      title: "正在更新资料..",
      mask: true
    })

    var that = this;
    wx.getUserInfo({
      success: ({
        userInfo
      }) => {
        console.log(userInfo)
        let url = 'app.php?c=my&a=refreshUserInfo&nickname=' + userInfo.nickName + '&avatar=' + userInfo.avatarUrl;
        common.post(url, '', (res) => {
          wx.hideLoading();
          if (res.err_code == 0) {
            that.setData({
              'userData.user.nickname': userInfo.nickName,
              'userData.user.avatar': userInfo.avatarUrl
            })
            wx.showToast({
              title: res.err_msg,
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.err_msg,
              icon: 'none',
              duration: 2000
            })
          }
        }, "");
      }
    })
  },
  liveGo: function(e) {
    var that = this; //开通直播功能
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
    
    // let id = e.currentTarget.dataset.status;
    let teamType = that.data.teamType;
    let LIVE_URL = that.data.LIVE_URL;
    wx.navigateTo({
      url: `${LIVE_URL}/userLive/register?teamstyle=${teamType}`
    })
  },
  orderListGo: function(e) { //我的订单列表
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
    
    let id = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '/pages/user/order/orderList?currentTab=' + id
    })
  },
  mycollageGo: function(e) { //我的拼团
    wx.navigateTo({
      url: '/pages/USERS/pages/myCollage/myCollageList'
    })
  },
  myCollection: function(e) { //我的收藏
    wx.navigateTo({
      url: '/pages/SHOPGOODS/pages/myCollection/index'
    })
  },
  gotoGroupstatus:function(){
        let gotoUrl = '/pages/groupbuying/applytogroup/applytogroup'
        if (this.data.userData.show_community_group!= 0){
          gotoUrl = '/pages/groupbuying/applyform/applystatus'
        }
      wx.navigateTo({
        url: gotoUrl
      })
  },
  addressGo: function(e) { //我的地址
    wx.navigateTo({
      url: '/pages/address/index'
    })
  },
  myServerGo: function(e) { //我的售后
    console.log(e);
    wx.navigateTo({
      url: '/pages/myServer/index'
    })
  },
  openMemberCard() {
    
    let that = this;
    let kaquan = that.data.userData.wx_card;
    if (!kaquan)return;
    let status = kaquan.card_type
    if (status == 1) {// card_type 1 店铺为绑定公众号，跳转到老的页面

    } else if (status == 2) { // card_type 2 未领取会员卡，去微信开卡
      // wx.navigateToMiniProgram({
      //   appId: "wxeb490c6f9b154ef9", // 固定为此appid，不可改动
      //   extraData: kaquan.cardExt, 
      //   success(e) {
      //     console.log(e);
      //   },
      //   fail(err) {
      //     console.log(err);
      //   },
      //   complete(res) {
      //     console.log(res);
      //   }
      // })
      wx.addCard({
        cardList: [
          {
            cardId: kaquan.card_id,
            cardExt: kaquan.cardExt
          }
        ],
        success(res) {
          console.log(res.cardList) // 卡券添加结果
        }
      })

    } else if (status == 3) {// card_type 3 已领取会员卡。打开卡
      wx.openCard({
        cardList: [{
          cardId: kaquan.card_id,
          code: kaquan.code
        }],
        fail({
          errMsg
        }) {
          wx.showToast({
            title: errMsg,
            icon: "none"
          })
        }
      })
     }

  },
  gotoDetail() {
    wx.navigateTo({
      url: '/pages/giftMember/giftuser/user',
    })
  },
  gotoMyShop() {
    let that = this;
     if(that.data.userData.base_gift_type == 1) {
      wx.navigateTo({
        url: '/pages/USERS/pages/user/myshop/index',
      })
     }
     else if(that.data.userData.show_gift == 2){
      wx.navigateTo({
        url: '/pages/giftMember/giftVip/vip',
      })
     }
  },
  gotoMyMoney() { //去账户页
    let is_show = this.data.userData.my_account.is_show;
    console.log("is_show", )
    if (is_show == 1 && !this.data.userData.is_gift) {
      wx.navigateTo({
        url: '/pages/user/myMoney/myMoney',
      })
    } else if (this.data.userData.show_gift != 0 && this.data.userData.is_gift !=0){
      wx.navigateTo({
        url: '/pages/user/myMoney/myMoney?giftaccunt=true',
      })
    }
    else {
      wx.showModal({
        title: '提示信息',
        content: this.data.userData.my_account.msg ? this.data.userData.my_account.msg:'您还没有账户哦',
        confirmText: '知道了',
        showCancel: false,
        confirmColor: '#fe6b31',
      })
    }
  },
  goToMyFans() { //去粉丝页 
    let urla = '/pages/user/myFans/myFans';
    if (this.data.userData.is_gift && this.data.userData.show_gift!=0){
      urla = '/pages/user/myFans/myFans?type=1'
    }
    wx.navigateTo({
      url: urla,
    })
  },
  //推广海报
  tuiguangHaiBao() {
    wx.navigateTo({
      url: "/pages/coupons/extension"
    })
  },
  onShareAppMessage: function() {
    let userData = this.data.userData;
    if(userData.point_share_open){//开启了积分分享
      return getApp().shareGetFans(``, ``, `pages/index/index`, `checkin`,``,`&share_id=${userData.share_id}`);
    }else{
      return getApp().shareGetFans('', '', '/pages/index/index', 2);
    }    
  },
  haveAndNo(){
    this.setData({
      haveShow: !this.data.haveShow
    })
  },
  showgroupModal() {
    let data = {
      source:1,
      product_id:'',

    };
    let group_black_code = '';
    let that = this;
    common.post("app.php?c=live_code&a=get_group_code_id", data, function callBack(res) {
      if (res.err_code == 0) {
        group_black_code = res.err_msg;
        let group_title = res.err_dom;
        that.setData({
          groupmodalStatus: true,
          group_black_code: group_black_code,
          group_title: group_title
        })
      }
    }, "")
  },
  hidegroupModal() {
    this.setData({
      groupmodalStatus: false
    })
  },
  goinGroupnew() {
    console.log(11111);
  },
  grouperScancode(){
    wx.showLoading({
      title: '加载中',
    });
    wx.navigateTo({
      url: '/pages/SHOPGOODS/pages/user/scancode/camera'
    })
        
    // wx.navigateTo({
    //   url: './scancode/scancode',
    // })
    // wx.scanCode({
    //   success(res) {
    //     console.log('扫码结果',res);
    //     if (res.result){
    //       let orderno = res.result;
    //       wx.navigateTo({
    //         url: './scancode/scancode?orderno=' + orderno,
    //       })
    //       // wx.navigateTo({
    //       //   url: '/pages/groupbuying/ordermanagement/ordermanagement?orderno=' + orderno,
    //       // })
    //     }
    //   }
    // })
  },
  // 赋值邀请码
  copyCode: function (e) {
    let codeTxt = e.currentTarget.dataset.code ? e.currentTarget.dataset.code : '';
    wx.setClipboardData({
      data: codeTxt,
      success(res) {
        wx.getClipboardData({
          success(res) {
            wx.showToast({
              title: '复制成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })

  },
  //isLogin登录
  isLogin:function(e){
    if (!app.isLoginFun(this)) {//判断用户是否登录
      return false;
    }
  },
  //分享店铺
  shareFun:function(e){
    const {type}=e.currentTarget.dataset;
    if(type=="share-link"){ //分享店铺
      wx.showShareMenu({
          withShareTicket: false
      })
    }else if(type=="share-haibao"){ //分享海报
      wx.showLoading({
        title: '页面加载中...',
      })
      var st_out=setTimeout(function(){
        wx.hideLoading();
        clearTimeout(st_out);
      },3000)
      this.tuiguangHaiBao();
    }else if(type=="share-code"){ //下载二维码    
      let data = {
        path: 'pages/index/index',
        id: this.data.userData.share_id,
        uid: 0,
        share_uid: getApp().globalData.my_uid,
        shareType: 'checkin'
      } 
      common.post("app.php?c=qrcode&a=share_ewm", data, "getCodeData", this);
    }else if(type=="share-copy-link"){ //复制链接到剪切板
      const {url}=e.currentTarget.dataset;
      if(url){
        wx.setClipboardData({
          data: url,
          success (res) {
            wx.getClipboardData({
              success (res) {
                wx.showToast({
                  title: '复制成功',
                })
              }
            })
          }
        })
      }else{
       
        wx.showToast({
          title: '无可复制链接',
          icon:'none'
        })
      }
    }

  },
  /***
   * 获取下载二维码
   */
  getCodeData:function(result){
    console.log("result",result)
    if(result && result.err_code==0){
      let _url=result.err_msg;
      if(_url){
        wx.downloadFile({
          url: _url, 
          success (res) {
            if (res.statusCode === 200) {
              wx.saveImageToPhotosAlbum({
                filePath:res.tempFilePath,
                success(res) {

                  wx.showToast({
                    title: '成功保存到相册',
                  })
                },
                fail(){
            
                  wx.showModal({
                    title: '提示',
                    content: '推广码保存失败,是否开启授权图片保存',
                    success (res) {
                      if (res.confirm) {
                        wx.openSetting({
                          success (res) {
                          }
                        })
                      } 
                    }
                  })
                  
                  
                }
              })
            }
          }
        })
      }else{
        wx.showToast({
          title: '无可下载二维码',
          icon:'none'
        })
      }
    }else{
      wx.showToast({
        title: '无可下载二维码',
        icon:'none'
      })
    }
  },
  // 开通店铺
  openShop:function(e){
    let that = this;
    if(e.currentTarget.dataset.showstore*1 == 1){
      wx.navigateTo({
        url: '/pages/user/myMoney/myMoney?giftaccunt=true'
      })
    }else{
      publicFun.warning('请先成为主播', that);
    }
  },
  // 跳到个人修改
  clickperson: function () {
    let that = this;
    wx.navigateTo({
      url: '/pages/USERS/pages/information/information',
    })
  },
})