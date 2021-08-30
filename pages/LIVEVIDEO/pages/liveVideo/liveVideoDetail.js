// pages/LIVEVIDEO//pages/liveVideo/liveVideoDetail.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url + '../../utils/common.js');
var publicFun = require(_url + '../../utils/public.js');
var log = require(_url + '../../utils/log.js');
var canvasFun = require(_url + '../../utils/canvas-post.js');
var canvas = require(_url + '../../utils/canvas.js');
let page = 1,pager=1;
let startTime = new Date().getTime();
var downTime, animateTime, couponTimeing,prizeTimes,addProductTime,rewardTimeClear;
// 点赞动画参数
var queue = {};
let timer = 0;
let likeCtx = null;
//用户点赞计数初始
let like_count=0;
//未读消息计数
let msg_count=0;
let tim;
// const imgURL = "https://s.404.cn/applet/images/qudao/dianzan1/"
const imgURL = "../image/"
const image1 = imgURL + "y1.png";
const image2 = imgURL + "y2.png";
const image3 = imgURL + "y3.png";
const image4 = imgURL + "y4.png";
const image5 = imgURL + "y5.png";
const image6 = imgURL + "y6.png";
const image7 = imgURL + "y7.png";
const image8 = imgURL + "y8.png";
const image9 = imgURL + "y9.png";
const image10 = imgURL + "y10.png";

let is_repeat_msg=false;//是否多次点击发送

var startX, endX;//礼物滑动始末位置
var moveFlag = true;// 判断执行滑动事件
// 即时通讯插件
import TIM from '../../miniprogram_npm/tim-wx-sdk/index.js';
import COS from "../../miniprogram_npm/cos-wx-sdk-v5/index.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    codenum: 3, //3s倒计时
    live_id: '', //直播id
    statusBegin: true, //开始直播黑屏
    couponPopup: false, //优惠券领取弹窗
    coverImg: "",
    liveVideoData: {
      couponShow: false, //优惠券
      goodsListShow: false, //商品列表
      shoppingShow: false, //商品规格
      cutoff_status: 2, // 0异常断流    1 正常断流  2正常  3恢复断流
      lucky: '', // 大转盘
      luckyhb: '' // 红包
    },
    goodsListShow: false,
    canvasShow: true, //点赞画板
    barrageArr: [],
    goodsData: [], //商品列表
    inputInfo: '跟主播聊点什么...',
    inputBottom: 0, //输入框距离底部的高度
    rinputBottom: 0,//打赏输入框距离底部的距离
    nameColor: ['rgb(132,218,246)', 'rgb(236,187,80)', 'rgb(184,213,159)', 'rgb(251,207,174)'], //弹幕发布者名称颜色
    videoContext: '', //直播组件
    loginFail: false, //登录失败
    statusTips: 0, //关注/购买/进入/分享提示信息状态，默认0 3：关注，1：进入，4：分享，2：购买
    isFollow: 0, //是否关注0:未关注，1:已关注
    tip: {}, //关注/购买/进入/分享提示信息
    tipReally: false, //是否显示购买真数据
    shoppingData: '', //分享页商品列表规格弹窗
    no_more: false, //底部显示无商品
    dialog: {
      dialogHidden: true,
      titleMsg: "海报图保存失败，用户取消或未开启保存到相册权限",
      determineBtnTxt: "去开启"
    },
    timeDownVal: {}, //倒计时
    isClearScreen: false, //是否清屏 false：否，true：是
    screenBtnShow: true, //清屏按钮显示与否
    sx: 0,//海报商品图裁剪x轴坐标
    sy: 0,//海报商品图裁剪y轴坐标
    sw: 0,//海报商品图裁剪宽
    sh: 0,//海报商品图裁剪高
    couponActive: false,//关注/限时（活动）优惠券弹窗
    couponType: 0,//优惠券类型0:关注优惠券，1：限时优惠券
    couponStatus: 0,//优惠券的状态 0：未关注，1：已关注并领取
    couponTime: 0,//限时优惠券 0：未领取，1：领取成功，2领取失败
    couponNum: 3,//限时优惠券倒计时数字
    prizeActive: false,//抽奖活动弹窗
    prizeBtn: false,//抽奖按钮
    prizeType: 0,//抽奖弹窗类型0:抽奖倒计时弹窗,1:获奖名单,2:中奖者填写地址引导,3:填写地址
    myPrize:'',//自己中奖信息
    iptPhoneVal: '',
    iptAddressVal: '',
    iptPostalVal:'',
    prizeTime:{},//抽奖时间
    failNum: 0,//IM登录失败，发送消息次数统计
    isAbout: false,//关注去主播主页弹窗
    isAddProduct: false,//上架商品弹窗
    addProductNum: 0,//上架商品时间计数
    im_group_id:'', //IM群组ID
    pcode:'',//code是否过期
    fansStatus: 0,//0:未为成为粉丝，1：已成为粉丝
    modeIdx: 0,//支付方式选择
    rewardIdx: 0,//打赏礼物索引
    reNumIdx: 0,//礼物数量的索引
    sendTxt: '发送',//发送礼物的按钮
    pager: 1,//礼物的page
    rewardTip:[],//礼物弹窗数组
    firstShow: true,
    // 大转盘
    awardsList: {},
    animationData: {},
    btnDisabled: '',
    hidden: true,
    lotteryId: '',
    prizeGuide: false,
    awarded: '',// 中奖名单,
    // 红包
    prizeHb: false,
    hb: {
      coinNum: '',
      msg: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    // setInterval(()=> {
    //   console.log(1)
    //   let _context = {
    //     name: 1,
    //     content: '123'+new Date()
    //   }
    //   let barrageArr =  that.data.barrageArr.concat(_context);
    //   let msgLength = barrageArr.length
    //   let msgMaxLength = 10;
    //   let delLength = msgLength - msgMaxLength;
    //   if(delLength  > 0){
    //     //只保留最新的10条 
    //     barrageArr.splice(0,delLength) 
    //   }
    //   that.setData({
    //     barrageArr: barrageArr
    //   });
    // },1000)
   
    page = 1;
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    publicFun.height(that);
    app.isLoginFun(that); //判断用户是否登录
    // 其他页面进入
    if (options.live_id) {
      that.setData({
        live_id: options.live_id
      });
      if (options.isShare == 1) {
        that.setData({
          isScene: false
        })
      } else {
        that.setData({
          isScene: true
        })
      }
    }
    if (options.store_id != undefined && options.store_id != '') {
      app.globalData.store_id = options.store_id;
    } 
    // 小程序白屏问题
    if (options.imgsrc) {
      that.setData({
        coverImg: options.imgsrc
      });
    }
    if (options.status) {

      that.setData({
        optionsStatus: options.status
      });
    }
    if(options.canGoLiving){
      that.setData({
        canGoLiving: options.canGoLiving
      })
    }
    // 扫码进入判断
    if (options.scene != undefined && options.scene != 'wxapp') {
      that.setData({
        firstShow: false
      });
      var scene_id = decodeURIComponent(options.scene);
      console.log("直播分享二维码", scene_id);
      if (scene_id) {
        //var scene_arr = scene.split(',');
        // if (scene_arr.length == 2) {
        //   // 扫后台码进入直播间
        //   app.globalData.store_id = scene_arr[0]
        //   var live_id = scene_arr[1];
        //   this.setData({
        //     live_id: live_id,
        //     isScene: true
        //   });
        // } else if (scene_arr.length > 2) { //扫分享码进来的
        //   app.globalData.store_id = scene_arr[0];
        //   app.globalData.share_uid = scene_arr[3];
        //   var live_id = scene_arr[1];
        //   this.setData({
        //     live_id: live_id,
        //     isScene: true
        //   });
        //   // 直播间分享记录
        //   that.shareRecordFun();
        // }
        let url = 'app.php?c=store&a=get_share_data',
        data = {
          scene_id: scene_id
        };
        common.post(url, data ,function(result){
          if(result.err_code == 0){
            app.globalData.store_id = result.err_msg.store_id
            app.globalData.share_uid = result.err_msg.share_uid
            var live_id = result.err_msg.live_id
            that.setData({
            live_id: result.err_msg.live_id,
            isScene: true
            });
            that.comingLive();
            that.liveVideoFun();
            that.liveVideoFunInfo();
          }
        },''); 
      };
    }
    // 分享好友判断
    if (options.share_uid) {//分享进入
      app.globalData.share_uid = options.share_uid;
      that.shareRecordFun();
    }
    // 手机类型
    wx.getSystemInfo({
      success: function (res) {
        let platformType = res.platform;
        if (platformType == "devtools") {
          console.log('PC');
        } else if (platformType == "ios") {
          console.log('IOS');
          let phoneSystem= ((res.system).split(' '))[1].split('.');
          that.setData({
            iosPhone: true,
            phoneSystem:phoneSystem[0]*1 //IOS手机系统版本
          })
        } else if (platformType == "android") {
          console.log('android');
          that.setData({
            androidPhone: true
          })
        }
      },
    });
    wx.login({
      success: res => {
        app.globalData.login == res
        that.data.pcode = res.code;
      }
    });
    // 是否登录
    if (!app.isLoginFun(that)) {//未登录
      that.setData({
        _unlogin: true
      });
      return false;
    };
    if(that.data.firstShow){
      that.comingLive();
      that.liveVideoFun();
      that.liveVideoFunInfo();
    }
  },
  clickhb: function (params) {
    var that = this;
    that.setData({
      prizeHb: true,
      'hb.coinNum': '',
      'hb.msg': ''
    })
  },
  openHb:function (params) {
    let that = this;
    let url = "api/product/redpacket/snatch/" + that.data.storeCoinRecordId;
    common.ajax1(url, 'POST',{}, 'openHbDetail', that, '', false)
  },
  openHbDetail:function (res) {
    let that = this;
    if (res.err_code === '200') {
      that.setData({
        'hb.coinNum': res.data.coinNum,
        'hb.msg': res.data.coinNum+'艺羊币',
        'hb.code': res.err_code,
      })
    }
    if (res.err_code === '500') {
      that.setData({
        'hb.coinNum': '',
        'hb.msg': res.err_msg,
        'hb.code': res.err_code,
      })
    }
    console.log(res)
  },
  // 大转盘 --start---------------------------------------
  // 点击大转盘获取详情
  luckyDetail: function() {
    var that = this
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let lotteryId = that.data.lotteryId;
    let url = "api/product/draw/detail?lotteryId=" + lotteryId;
    common.ajax1(url, 'GET',{}, 'getLuckyDetail', that, '', false)
  },
  // 获取大转盘数据
  getLuckyDetail: function (res) {
    var that = this
    if (res.err_code === '200') {
      app.awardsConfig = {
        awards: res.data.lotteryPrizeArray
      }
      that.drawLucky()
      var hidden = this.data.hidden;
      this.setData({
        hidden: !hidden,
      })
    }

  },
  // 绘制转盘
  drawLucky: function () {
    var that = this
    var awardsConfig = app.awardsConfig.awards,
    len = awardsConfig.length,
    rotateDeg = 360 / len / 2 + 90,
    html = [],
    turnNum = 1 / len  // 文字旋转 turn 值
    var ctx = wx.createContext()
    for (var i = 0; i < len; i++) {
      // 保存当前状态
      ctx.save();
      // 开始一条新路径
      ctx.beginPath();
      // 位移到圆心，下面需要围绕圆心旋转
      ctx.translate(150, 150);
      // 从(0, 0)坐标开始定义一条新的子路径
      ctx.moveTo(0, 0);
      // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
      ctx.rotate((360 / len * i - rotateDeg) * Math.PI/180);
      // 绘制圆弧
      ctx.arc(0, 0, 150, 0,  2 * Math.PI / len, false);
      // 颜色间隔
      if (i % 2 == 0) {
          ctx.setFillStyle('#ffb820');
      }else{
          ctx.setFillStyle('#ffffff');
      }
      // 填充扇形
      ctx.fill();
      // 绘制边框
      ctx.setLineWidth(0.5);
      ctx.setStrokeStyle('#ffb820');
      ctx.stroke();
      // 恢复前一个状态
      ctx.restore();
      // 奖项列表
      html.push({turn: i * turnNum + 'turn', award: awardsConfig[i].productName,  img: awardsConfig[i].image });    
    }
    that.setData({
      awardsList: html
    });
  },
  // 关闭大转盘
  closeLottery: function() {
    if (!this.data.btnDisabled) {
      this.setData({
        hidden: true
      })
    }
  },
  // 显示大转盘
  showLottery: function () {
    var that = this
    that.luckyDetail();
  },
  // 大转盘抽奖开始
  getLottery: function () {
    var that = this
    if (that.data.btnDisabled === 'disabled') {
      return false
    }
    let lotteryId = that.data.lotteryId;
    let url = `api/product/draw/doLottery?lotteryId=${lotteryId}&liveId=` + that.data.live_id;
    common.ajax1(url, 'post',{}, 'clickLucky', that, '', false)
  },
  clickLucky:function (res) {
    for(let i=0;i < app.awardsConfig.awards.length;i++) {
      if (app.awardsConfig.awards[i].id === res.data.lotteryPrize.id){
        var awardIndex = i;
        break;
      }
    }
    var that = this
    // var awardIndex = Math.random() * 6 >>> 0;
    // 获取奖品配置
    var awardsConfig = app.awardsConfig
    // 初始化 rotate
    var animationInit = wx.createAnimation({
      duration: 1
    })
    this.animationInit = animationInit;
    animationInit.rotate(0).step()
    this.setData({
      animationData: animationInit.export(),
      btnDisabled: 'disabled'
    })
    // 旋转抽奖
    setTimeout(function() {
      var animationRun = wx.createAnimation({
        duration: 4000,
        timingFunction: 'ease'
      })
      that.animationRun = animationRun
      animationRun.rotate(360 * 8 - awardIndex * (360 / app.awardsConfig.awards.length)).step()
      that.setData({
        animationData: animationRun.export()
      })
    }, 100)
   
    setTimeout(function() {
       // 中奖提示
      that.setData({
        hidden: true,
        prizeGuide: true,
        awarded: awardsConfig.awards[awardIndex].productName,
        btnDisabled: ''
      })
    }, 4100);
    
  },
  // 大转盘 --end---------------------------------------
  // 直播详情数据
  liveVideoFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_live',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'liveVideoData', that, '', true)
  },
  // 直播详情数据
  liveVideoFunInfo: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_live_info',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'liveVideoDataInfo', that, '', true)
    // 获取大转盘是否开启
    let url1 = `api/product/draw/getActiveLottery?liveId=` + that.data.live_id;
    common.ajax1(url1, 'get',{}, 'liveVideoDataLucky', that, '', false)
    // 获取红包是否开启
    let url2 = `api/product/redpacket/get/`+ that.data.live_id;
    common.ajax1(url2, 'post',{}, 'liveVideoDataHb', that, '', false)
  },
  liveVideoDataHb:function(res) {
    let that = this;
    if (res.err_code === '200' &&  res.data !== null) {
      that.setData({
        'liveVideoData.luckyhb': true,
        storeCoinRecordId: res.data.storeCoinRecordId
      });
    } else {
      that.setData({
        'liveVideoData.luckyhb': false,
        storeCoinRecordId: ''
      });
    }
  },
  liveVideoDataLucky:function (res) {
    let that = this;
    if (res.err_code === '200') {
      if(res.data !== '0') {
        that.setData({
          'liveVideoData.lucky': true,
          lotteryId: res.data
        });
      }
    }
  },
  liveVideoData: function(res) {
    var that = this;
    console.log(res,"getlive-------------")
    that.setData({
      status: res.err_msg.status,
      liveVideoDataimg: res.err_msg,
      liveVideoData: Object.assign(that.data.liveVideoData, res.err_msg)
    });
    // 直播中
    if (res.err_code == 0 && res.err_msg.status == 1) {
      // 调用点赞动画
      // that.likeClick();  
      
      that.couponFun();//直播中优惠券列表
      that.goodsFun();//直播中商品列表
      that.addProduct();//上架商品
      if (that.data.liveVideoData.subscribe == 0){
        // 直播中，未关注的用户，1min后开启关注领券弹窗
        that.rightAbout();
      }
    }
    
    if(res.err_code == 0 && res.err_msg.status != 1){//非直播中
      that.livingGoodsFun();//非直播中商品列表
    }
    if(that.data.canGoLiving && res.err_code == 0 && res.err_msg.status == 0){
      return publicFun.warning('尚未开播，请耐心等待~', that);
    }
  },
  liveVideoDataInfo: function(res) {
    var that = this;
    console.log(res, "getliveinfo-------------")
    that.setData({
      status: res.err_msg.status,
      liveVideoDataInfo: res.err_msg,
      liveVideoData: Object.assign(that.data.liveVideoData, res.err_msg)
    }); 
    // 直播中
    if(res.err_code == 0 && that.data.liveVideoData.status == 1){
      // 关注/进入/分享/购买 进入动画
      if (res.err_msg.initdata.length > 0) {
        that.tipFun();
      }
      if (res.err_msg.draw_info){//抽奖未结束
        that.setData({
          prizeData: res.err_msg.draw_info,
          myPrize: res.err_msg.draw_detail
        });
        console.log(res.err_msg.draw_info)
        console.log(Object.keys(res.err_msg.draw_info).length)
        if (Object.keys(res.err_msg.draw_info).length > 0){
          that.setData({
            prizeBtn: true
          });
          clearInterval(prizeTimes);
          that.prizeDownTime(prizeTimes); //进来就执行一遍防止1s时间的空白
          prizeTimes = setInterval(function () {
            that.prizeDownTime(prizeTimes);
          }, 1000);
        }
      }
      if(res.err_msg.enrollCode && res.err_msg.enrollCode == false){//中奖评论是否可以继续报名
        that.setData({
          isSpeak: false
        });
      }
    }
    // 直播未开始
    if (res.err_code == 0 && that.data.liveVideoData.status == 0) {
      // 倒计时
      that.timeDown(downTime); //进来就执行一遍防止1s时间的空白
      downTime = setInterval(function() {
        that.timeDown(downTime);
      }, 1000);
    }
  },
  // 登录IM
  comingLive: function() {
    let that = this;
    let postdata = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id
    };
    common.post('app.php?c=tencent_live&a=getTxImAppid', postdata, 'comingLiveFun', that)
  },
  comingLiveFun:function(res){
    let that = this;
    if(res.err_msg.live_status != 1){
      return;
    }
    that.setData({
      useData: res.err_msg
    });
   
    that.data.im_group_id = res.err_msg.im_group_id;

    // 创建 SDK 实例
    tim = TIM.create({
      SDKAppID: res.err_msg.tx_im_appid
    });
    // 设置 SDK 日志输出级别为 release 级别
    tim.setLogLevel(1);
    // 注册 COS SDK 插件
    tim.registerPlugin({
      'cos-js-sdk': COS
    });
    //SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等api，使用 SDK 的各项功能
    let onSdkReady = function (event){
        console.log("SDK 进入 ready 状态时触发，接入侧监听此事件，然后可调用 SDK 发送消息等api，使用 SDK 的各项功能",event)
        //设置自己的昵称和头像
        that.updateMyProfile();
        //先查询组是否存在
        that.searchGroupByID(that.data.im_group_id);
    };
    tim.on(TIM.EVENT.SDK_READY,onSdkReady);

    // let onSdkNotReady = function(event) {
    //   // 如果想使用发送消息等功能，接入侧需驱动 SDK 进入 ready 状态，重新调用 login 接口即可，如下所示：
    //   that.loginIM(res.err_msg.identifier,res.err_msg.sign);
    // };
    // tim.on(TIM.EVENT.SDK_NOT_READY, onSdkNotReady);
  
    // 监听事件
    let onMessageReceived = function(event) {
      // event.data - 存储 Message 对象的数组 - [Message]
      if (event.data) {
        let reciver_msg = event.data;
        console.log(reciver_msg)
        console.log(typeof reciver_msg[0]._elements[0])
        for (var i in reciver_msg) {
          let imResponse = reciver_msg[i];
          let userName = imResponse.nick;
          let _context = that.analysisContent(imResponse, 'recived');
          console.log("***userName***", userName, "***content***", _context);
          console.log('IM变量类型',typeof(_context))
          if (typeof(_context) == 'object') {
            if(_context.type == 'chat'){// 弹幕消息
              if (userName != '@TIM#SYSTEM' && _context.content.length > 0) { //防止空信息
                let barrageArr =  that.data.barrageArr.concat(_context);
                let msgLength = barrageArr.length
                let msgMaxLength = 10;
                let delLength = msgLength - msgMaxLength;
                if(delLength  > 0){
                  //只保留最新的10条 
                  barrageArr.splice(0,delLength) 
                }
                that.setData({
                  barrageArr: barrageArr
                });
                // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
                let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus)? true :false;
                if(!is_focus){
                  //用户浏览主播时，未读消息清空
                  msg_count=0;
                  that.setData({
                    msg_count:0
                  })
                  that.pageScrollToBottom();
                }else{
                  //用户输入状态，更新未读消息数
                  msg_count++;
                  that.setData({
                    msg_count
                  })
                }     
              }
            } else if (_context.type == 'like_num') { //点赞数
              that.setData({
                'liveVideoData.like_num': _context.like_num
              })
            } else if (_context.type == 'view_num') { //观看人数
              that.setData({
                'liveVideoData.view_num': _context.view_num
              })
            } else if (_context.type == 'live_subscribe') { //关注主播
              that.setData({
                'tip.followName': _context.nickname,
                // statusTips: 3,
                tipReally: true
              });
              if(0){
                that.tipAnimate();
                that.clearAnimate(3);
              }

              let objMsg = {};
              objMsg.type = 'chat';
              objMsg.name = _context.nickname;
              objMsg.content = '关注了主播';
              objMsg.faceUrl = '';
              if(_context.fans_info){
                objMsg.level_name = _context.fans_info.level_name;
                objMsg.level = _context.fans_info.level;
              }
              that.data.barrageArr.push(objMsg);
              that.setData({
                barrageArr: that.data.barrageArr
              });
              // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
              let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
              if(!is_focus){
                that.pageScrollToBottom();
              }

            } else if (_context.type == 'live_share') { //分享直播间
              that.setData({
                'tip.shareName': _context.nickname,
                // statusTips: 4,
                tipReally: true
              });

              if(0){
                that.tipAnimate();
                that.clearAnimate(4);
              }

              let objMsg = {};
              objMsg.type = 'chat';
              objMsg.name = _context.nickname;
              objMsg.content = '分享了直播间';
              objMsg.faceUrl = '';
              if(_context.fans_info){
                objMsg.level_name = _context.fans_info.level_name;
                objMsg.level = _context.fans_info.level;
              }
              that.data.barrageArr.push(objMsg);
              that.setData({
                barrageArr: that.data.barrageArr
              });
              // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
              let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
              if(!is_focus){
                that.pageScrollToBottom();
              }

            } else if (_context.type == 'live_tips') { //购买和进入
              if (_context.isreal == 1) { //真数据
                let isbuy = _context.buy.isbuy;
                let iscomin = _context.comin.iscomin;
                let liveReward = that.data.liveVideoData.live_reward;
                if (isbuy == 1 && iscomin == 0) { //仅购买
                  that.setData({
                    'tip.buyName': _context.user[0].nickname,
                    'tip.buyProduct': _context.buy.product,
                    statusTips: 2,
                    tipReally: true
                  });
                  if(liveReward.reward_open && liveReward.group_open && _context.fans_info){//打赏粉丝团功能都开通
                    if(_context.fans_info.level>liveReward.level_tips_come){
                      that.setData({
                        'tip.level_name': _context.fans_info.level_name,
                        'tip.level': _context.fans_info.level,
                      });
                    }
                  }
                  that.tipAnimate();
                  that.clearAnimate(2);

                  let objMsg = {};
                  objMsg.type = 'chat';
                  objMsg.name = _context.user[0].nickname;
                  objMsg.content = _context.buy.product;
                  objMsg.faceUrl = '';
                  if(_context.fans_info){
                    objMsg.level_name = _context.fans_info.level_name;
                    objMsg.level = _context.fans_info.level;
                  }
                  that.data.barrageArr.push(objMsg);
                  that.setData({
                    barrageArr: that.data.barrageArr
                  });
                  // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
                  let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
                  if(!is_focus){
                    that.pageScrollToBottom();
                  }

                } else if (iscomin*1 == 1 && isbuy*1 == 0) { //仅进入
                  if(liveReward.reward_open && liveReward.group_open && _context.fans_info){//打赏粉丝团功能都开通,且等级大于进入的等级
                    if(_context.fans_info.level>liveReward.level_tips_come){
                      that.setData({
                        'tip.joinName': _context.user[0].nickname,
                        'tip.level_name': _context.fans_info.level_name,
                        'tip.level': _context.fans_info.level,
                        statusTips: 1,
                        tipReally: true
                      });
                      that.tipAnimate();
                      that.clearAnimate(1);
                    }
                  }

                  let objMsg = {};
                  objMsg.type = 'chat';
                  objMsg.name = _context.user[0].nickname;
                  objMsg.content = '来到直播间';
                  objMsg.faceUrl = '';
                  if(_context.fans_info){
                    objMsg.level_name = _context.fans_info.level_name;
                    objMsg.level = _context.fans_info.level;
                  }
                  that.data.barrageArr.push(objMsg);
                  that.setData({
                    barrageArr: that.data.barrageArr
                  });
                  // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
                  let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
                  if(!is_focus){
                    that.pageScrollToBottom();
                  }

                } else { //购买和进入都有取购买
                  that.setData({
                    'tip.buyName': _context.user[0].nickname,
                    'tip.buyProduct': _context.buy.product,
                    statusTips: 2,
                    tipReally: true
                  });
                  if(liveReward.reward_open && liveReward.group_open &&  _context.fans_info){//打赏粉丝团功能都开通
                    if(_context.fans_info.level>liveReward.level_tips_come){
                      that.setData({
                        'tip.level_name': _context.fans_info.level_name,
                        'tip.level': _context.fans_info.level,
                      });
                    }
                  }
                  that.tipAnimate();
                  that.clearAnimate(2);

                  let objMsg = {};
                  objMsg.type = 'chat';
                  objMsg.name = _context.user[0].nickname;
                  objMsg.content = _context.buy.product;
                  objMsg.faceUrl = '';
                  if(_context.fans_info){
                    objMsg.level_name = _context.fans_info.level_name;
                    objMsg.level = _context.fans_info.level;
                  }
                  that.data.barrageArr.push(objMsg);
                  that.setData({
                    barrageArr: that.data.barrageArr
                  });
                  // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
                  let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
                  if(!is_focus){
                    that.pageScrollToBottom();
                  }

                }
              } else {
                let initdata = []
                that.setData({
                  'liveVideoData.initdata': initdata.concat(_context),
                  tipReally: false,
                  statusTips: 0
                });
                that.tipFun();
              }
            } else if (_context.type == 'product') { //商品列表数（商品上架）
              that.setData({
                'goodsData.list': that.data.goodsData.list.concat(_context)
              });
              that.goodsFun();
              if(that.data.addProductNum == 0){
                that.addProduct();
              }                
            } else if (_context.type == 'teach_product') { //正在讲解商品
              that.setData({
                'liveVideoData.is_take': true,
                'liveVideoData.teach_product': _context
              });
              that.goodsFun();
            } else if (_context.type == 'live_status') { //流中断
              console.log(_context.type, _context.status, " _context.msg _context.msg")
              //status//是否异常断流
              if (_context.status == 1) {
                that.setData({
                  'liveVideoData.status': 2
                })
                that.livingGoodsFun()
              } else {
                that.setData({
                  'liveVideoData.cutoff_status': _context.status
                })
                if (_context.status == 0) {
                  // that.setData({
                  //   'liveVideoData.tips_text': "主播暂时离开一会，请耐心等待！\n更多惊喜即将登场~"
                  // })
                } else if (_context.status == 3) {
                  // //恢复断流时卡屏重新调直播接口
                  // that.liveVideoFun();
                  // that.liveVideoFunInfo()
                  // that.bindResume()
                  that.bindPlay()
                  that.setData({
                    'liveVideoData.cutoff_status': 2
                  })
                }
              }
            } else if (_context.type == 'sync_product_price') { //秒杀商品/商品改价
              let seckillProduct = that.data.liveVideoData.seckill_product;
              var isseckillProduct = true;
              if(seckillProduct.length>0){
                for(let i in seckillProduct){
                  if(seckillProduct[i].product_id == _context.product_id){
                    that.setData({
                      ['liveVideoData.seckill_product[' + i + ']']:_context
                    });
                    isseckillProduct = false;
                  }
                }
              }
              if(isseckillProduct){
                that.setData({
                  'liveVideoData.seckill_product': that.data.liveVideoData.seckill_product.concat(_context)
                })
              }                
              that.goodsFun();
            } else if (_context.type == 'live_open_start') {//未开播界面开播直接进入直播间
              if (_context.live_id == that.data.live_id){//全局消息判断
                that.setData({
                  'liveVideoData.status': 1,
                  live_id: _context.live_id,
                  optionsStatus: 1
                });
                that.liveVideoFun();
                that.liveVideoFunInfo();
                that.bindPlay();
              }
            } else if (_context.type == 'live_starttime_change'){//后台调整开播时间
              if (_context.live_id == that.data.live_id) {//全局消息判断
                that.setData({
                  'liveVideoDataInfo.start_time': _context.new_start_time
                });
                clearInterval(downTime);
                that.timeDown(downTime); //进来就执行一遍防止1s时间的空白
                downTime = setInterval(function () {
                  that.timeDown(downTime);
                }, 1000);
              }                
            } else if (_context.type == 'grant_limit_product' && that.data.liveVideoData.status == 1){//限时优惠券的推送
              if (_context.grant_status == 1) {//发放中
                that.setData({
                  couponActive: true,
                  couponType: 1,//1：限时优惠券
                  couponTime: 0,//未领取
                  limitCoupon: _context,
                  live_id: _context.live_id,
                  limit_coupon_id: _context.id
                });
                var couponNum = that.data.couponNum;
                var couponNumTime = setInterval(function () {
                  --couponNum;
                  if (couponNum >= 0) {
                    that.setData({
                      couponNum: couponNum
                    });
                  } else {
                    clearInterval(couponNumTime);
                  }
                }, 1000);
              } else if (_context.grant_status == 2) {//已结束
                that.setData({
                  couponType: 1,//1：限时优惠券
                  limitCoupon: _context,
                  live_id: _context.live_id,
                  limit_coupon_id: _context.id
                });
              }
            } else if (_context.type == 'push_draw' && that.data.liveVideoData.status == 1){//推送抽奖
              if (_context.status == 1){//推送抽奖
                that.setData({
                  prizeData: _context,
                  prizeBtn: true,//显示抽奖按钮
                  prizeActive: true,//抽奖活动弹窗
                  prizeType: 0
                });
                // 抽奖倒计时
                clearInterval(prizeTimes);
                that.prizeDownTime(prizeTimes); //进来就执行一遍防止1s时间的空白
                prizeTimes = setInterval(function () {
                  that.prizeDownTime(prizeTimes);
                }, 1000);
              }else{//抽奖终止
                that.setData({
                  prizeData: _context,
                  prizeBtn: false,//显示抽奖按钮
                  prizeActive: false,//抽奖活动弹窗
                  prizeType: 0
                });
              }
            } else if (_context.type == 'draw_lottery' && that.data.liveVideoData.status == 1) {//抽奖名单
              that.setData({
                prizeName: _context
              });
              var isPrize = true;//是否未中奖
              for (var x in _context.member_list) {
                if (x == getApp().globalData.my_uid){//自己中奖
                  that.setData({
                    myPrize: _context.member_list[x],
                    prizeActive: true,
                    prizeType: 2
                  });
                  isPrize = false;
                }
              }
              if (isPrize){//自己未中奖
                that.setData({
                  prizeActive: true,
                  prizeType: 1
                });
              }                
            } else if (_context.type == 'product_soldout' && that.data.liveVideoData.status == 1) {//商品售罄
              that.goodsFun();
            } else if (_context.type == 'product_seckill_locking' && that.data.liveVideoData.status == 1) {//改价中，锁定购买
              that.goodsFun();
            } else if (_context.type == 'live_product_top' && that.data.liveVideoData.status == 1) {//置顶商品
              let product_id=_context.product_id;//置顶商品id
              if(product_id){
                that.goodsFun();
              }
            } else if(_context.type == 'product_off' && that.data.liveVideoData.status == 1){//商品下架
              that.goodsFun();
            } else if(_context.type == 'upgrade_level' && that.data.liveVideoData.status == 1){//粉丝团升级
              let liveReward = that.data.liveVideoData.live_reward
              that.setData({
                'liveVideoData.live_reward.level': _context.level*1
              });
              if(liveReward.reward_open && liveReward.group_open && _context.level*1 > liveReward.level_tips_come){//打赏粉丝团功能都开通
                that.setData({
                  'tip.upName': _context.nickname,
                  'tip.level_name': _context.level_name,
                  'tip.level': _context.level,
                  statusTips: 3,
                  tipReally: true
                });  
                that.tipAnimate();
                that.clearAnimate(3);
              }
            } else if(_context.type == 'reward_top_list' && that.data.liveVideoData.status == 1){//打赏榜单
              that.setData({
                'liveVideoData.live_reward.reward_list': _context.top_list
              });
            } else if(_context.type == 'update_user_intimacy' && that.data.liveVideoData.status == 1){//修改亲密度
              if (_context.uid == getApp().globalData.my_uid){
                that.setData({
                  'liveVideoData.live_reward.intimacy': _context.intimacy
                });
              }
            } else if(_context.type == 'reward_anchor' && that.data.liveVideoData.status == 1){//打赏主播
              clearTimeout(rewardTimeClear);
              let rewardTipArr = that.data.rewardTip.concat(_context);
              if(that.data.rewardTip.length > 0){//打赏有数据时
                if(rewardTipArr.length<3){//数据没有超过两条时
                  that.setData({
                    rewardTip: rewardTipArr
                  });
                  that.rewardTipAnimate(300,0);
                  that.rewardTipAnimate(300,1);
                }else{//数据超过两条，留最后两条
                  rewardTipArr.splice(0,1);
                  that.setData({
                    rewardTip: rewardTipArr
                  });
                  that.rewardTipAnimate(0,1);
                  that.rewardTipAnimate(300,0);
                  setTimeout(() => {
                    that.rewardTipAnimate(300,1);
                  }, 700);
                }
              }else{//当打赏没人开始时，直接拼接
                that.setData({
                  rewardTip: rewardTipArr
                });
                that.rewardTipAnimate(300,0);
              }
            } else if (_context.type == 'luck_turn' && that.data.liveVideoData.status == 1){// 大转盘
              if (_context.status === 0) {
                that.setData({
                  'liveVideoData.lucky': false,
                  lotteryId: ''
                });
              } 
              if (_context.status === 1) {
                that.setData({
                  'liveVideoData.lucky': true,
                  lotteryId: _context.product_id
                });
              } 
              that.setData({
                'tip.followName': _context.message,
                // statusTips: 3,
                tipReally: true
              });
              if(0){
                that.tipAnimate();
                that.clearAnimate(5);
              }
              let objMsg = {};
              objMsg.type = 'chat';
              objMsg.typeName = 'lucky';
              objMsg.content = _context.message;
              objMsg.faceUrl = '';
              if(_context.status!==0 && _context.status!==1) {
                that.data.barrageArr.push(objMsg);
                console.log(that.data.barrageArr)
                that.setData({
                  barrageArr: that.data.barrageArr
                });
              }
              // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
              let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
              if(!is_focus){
                that.pageScrollToBottom();
              }
            } else if (_context.type == 'envelopeRedpacket' && that.data.liveVideoData.status == 1){// 红包显示
              if (_context.storeCoinRecordId) {
                that.setData({
                  'liveVideoData.luckyhb': true,
                  storeCoinRecordId: _context.storeCoinRecordId,
                });
              } else {
                that.setData({
                  'liveVideoData.luckyhb': false,
                  storeCoinRecordId: '',
                });
              } 
            } else if (_context.type == 'snatchRedpacket' && that.data.liveVideoData.status == 1) {// 领取红包
              let objMsg = {};
              objMsg.type = 'chat';
              objMsg.typeName = 'lucky';
              objMsg.content =  _context.nickName + '获得' + _context.coinNum + '艺羊币';
              objMsg.faceUrl = '';
              that.data.barrageArr.push(objMsg);
              that.setData({
                barrageArr: that.data.barrageArr
              });
              // 如果当前用户正在发送弹幕，则不强制滚动弹幕，会引发输入框离焦被强制关闭输入
              let is_focus=(that.data.inputBottom || that.data.rinputBottom || that.data.inputFocus) ? true :false;
              if(!is_focus){
                that.pageScrollToBottom();
              }
            }
          }
        }
      }
    };
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    
    tim.on(TIM.EVENT.ERROR, function(event) {
     console.log('收到 SDK 发生错误通知，可以获取错误码和错误信息',event);
    });
    
    tim.on(TIM.EVENT.KICKED_OUT, function(event) {
      // 收到被踢下线通知
     console.log("收到被踢下线通知",event)
    });
    
    tim.on(TIM.EVENT.NET_STATE_CHANGE, function(event) {
      // 网络状态发生改变（v2.5.0 起支持）。
      console.log('网络状态发生改变（v2.5.0 起支持）。',event)
      // event.name - TIM.EVENT.NET_STATE_CHANGE
      // event.data.state 当前网络状态，枚举值及说明如下：
      //   - TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
      //   - TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
      //   - TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
    
    });
    // 调用 login 接口前调用此tim.on接口监听事件，避免漏掉 SDK 派发的事件
    that.loginIM(res.err_msg.identifier,res.err_msg.sign);
  },
  // 登录IM，加入群组
  loginIM:function(imidentifier,imsign){
    let that = this;
    console.log(tim);
    let promise = tim.login({
      userID: imidentifier,
      userSig: imsign
    });

    let openId = wx.getStorageSync('openId');
    promise.then(function(imResponse) {
      console.log('IM登录成功~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`', imResponse.data);
      log.info('用户openID', openId, 'IM登录成功', imResponse.data);
      that.setData({
        loginFail: false
      });

      // 加入群组
      let promiseGroup = tim.joinGroup({ groupID: that.data.im_group_id, type: TIM.TYPES.GRP_AVCHATROOM });
      promiseGroup.then(function (imResponse) {
        console.log('成功加入群组（ TIM.TYPES.GRP_AVCHATROOM）',imResponse);
        switch (imResponse.data.status) {
          case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
            break;
          case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
            console.log('加群成功------------------->',imResponse.data.group); // 加入的群组资料
            break;
          case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
            break;
          default:
            break;
        }
      }).catch(function (imError) {
        publicFun.warning(imError,' 请尝试重新进来直播间。',that);
        console.warn('申请加群失败的相关信息:', imError); // 申请加群失败的相关信息
      });
    }).catch(function(imError) {
      publicFun.warning('joinGroup error '+imError, that);
        console.log('失败', 'login error:', imError);
        log.info('用户openID', openId, '登录失败', imError);
        that.setData({
          loginFail: true
        });
    });
  },
  //设置自己的昵称和头像，需要2.6.2及以上版本 SDK
  updateMyProfile:function(){
    let that = this;
    console.log('------------------->>',that.data.useData)
    //设置自己的昵称和头像
    let promiseMy = tim.updateMyProfile({
      nick: that.data.useData.nickname,
      avatar: that.data.useData.avatar
    });
    promiseMy.then(function(imResponse){
      console.log('设置自己的昵称和头像',imResponse.data); // 更新资料成功
    }).catch(function(imError){
      console.warn('updateMyProfile error:', imError); // 更新资料失败的相关信息
    });
  },
  //通过 groupID 搜索群组
  searchGroupByID:function(im_group_id){
    /**
     * 防止一种情况就是直播异常关闭，群组被解散，但是直播状态未及时更改
     * 客户端还是看到直播状态进来的发言异常的
     */
    let that = this;
    let promise = tim.searchGroupByID(im_group_id);
    promise.then(function(imResponse) {
      // const group = imResponse.data.group; // 群组信息
      console.log('群组信息-->',imResponse.data.group);
    }).catch(function(imError) {
      publicFun.warning('该直播间可能已下播，可以退出直播间重新进去试试！ '+imError, that);
      console.warn('searchGroupByID error:', imError); // 搜素群组失败的相关信息
    }); 

  },
  //退出当前群组
  quitGroup:function(im_group_id){
    //TODO 如果以后身份统一之后，如果这个人即是主播开播又同时进去小程序等看的时候 可能就导致这个群无群主了。
    let that = this;
    let promise = tim.quitGroup(im_group_id);
    promise.then(function(imResponse) {
      console.log('退出成功的群~',imResponse.data.groupID); // 退出成功的群 ID
    }).catch(function(imError){
      console.warn('quitGroup error:', imError); // 退出群组失败的相关信息
    });
  },
  //退出登录
  logoutIM:function(){
    console.log('登出即时通信 IM');
    console.log(tim,'tim的值');
    let onMessageReceived = function(event) {
      console.log('页面监听卸载', event)
    };
    tim.off(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);
    
    let promise = tim.logout();
    promise.then(function(imResponse) {
      console.log(imResponse.data,'登出成功'); // 登出成功
    }).catch(function(imError) {
      console.warn('logout error:', imError);
    });
  },
  // 关注/进入/分享/购买 动画
  tipAnimate: function() {
    let that = this;
    let tipanimation = wx.createAnimation({
      duration: 500,
      transformOrigin: '50% 50% 0',
      timingFunction: 'linear'
    })
    tipanimation.translateX(0).step()
    that.setData({
      tipanimation: tipanimation.export()
    });
    if (that.data.tipReally == false) {
      that.setData({
        statusTips: 0
      });
      let comingBuy = that.data.liveVideoData.initdata[0];
      let comingBuyIndex = Math.floor(Math.random() * comingBuy.user.length);
      let comingBuyName = comingBuy.user[comingBuyIndex].nickname;
      let buyNum = comingBuy.buy.xfrequency;
      let cominNum = comingBuy.comin.xfrequency;
      var statusTipsing = 0;
      if (buyNum && buyNum * 1 > 0 && cominNum && cominNum * 1 > 0) {
        let random = Math.random();
        let buyGdp = buyNum / (buyNum * 1 + cominNum * 1);
        let cominGdp = cominNum / (buyNum * 1 + cominNum * 1);
        // console.log(buyGdp, cominGdp, random);
        if (random >= 0 && random < buyGdp) {
          statusTipsing = 2
        } else {
          statusTipsing = 1
        }
      } else if (buyNum && buyNum * 1 > 0 && cominNum && cominNum == 0) {
        statusTipsing = 2
      } else if (buyNum && buyNum * 1 == 0 && cominNum && cominNum * 1 > 0) {
        statusTipsing = 1
      } else if (buyNum && buyNum * 1 > 0 && !cominNum) {
        statusTipsing = 2
      } else if (!buyNum && cominNum && cominNum * 1 > 0) {
        statusTipsing = 1
      } else if (buyNum && buyNum * 1 == 0 && !cominNum) {
        statusTipsing = 0
      } else if (!buyNum && cominNum && cominNum * 1 == 0) {
        statusTipsing = 0
      } else {
        statusTipsing = 0
      }
      that.setData({
        statusTips: statusTipsing,
        'tip.buyName': comingBuyName || '',
        'tip.buyProduct': comingBuy.buy.product || '',
        'tip.joinName': comingBuyName || ''
      });
    } else {
      that.setData({
        statusTips: that.data.statusTips
      });
    }
    setTimeout(function() {
      tipanimation.translateX(300).step()
      that.setData({
        tipanimation: tipanimation.export(),
        tipReally: false
      });
    }, 10);
  },
  // 关注/进入/分享/购买 动画调用
  tipFun: function() {
    let that = this;
    let comingBuy = that.data.liveVideoData.initdata[0];
    var comingNum = 0;
    if (comingBuy.buy.xfrequency && comingBuy.comin.xfrequency) {
      comingNum = comingBuy.buy.xfrequency * 1 + comingBuy.comin.xfrequency * 1;
    } else if (comingBuy.buy.xfrequency && !comingBuy.comin.xfrequency) {
      comingNum = comingBuy.buy.xfrequency * 1;
    } else if (!comingBuy.buy.xfrequency && comingBuy.comin.xfrequency) {
      comingNum = comingBuy.comin.xfrequency * 1;
    }
    if (comingNum >= 40) {
      comingNum = 40
    }
    if (comingNum > 0) {
      clearInterval(animateTime);
      console.log('进入次数', comingNum)
      animateTime = setInterval(function() {
        that.tipAnimate();
      }, 60 * 1000 / comingNum);
    }
  },
  // 清除动画
  clearAnimate: function(animateStatus) {
    let that = this;
    var clearAnimateTime = setTimeout(function() {
      if (that.data.statusTips == animateStatus) {
        that.setData({
          statusTips: 0
        });
      }
      clearTimeout(clearAnimateTime);
    }, 4000);
  },
  // 关注
  followClick: function() {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    console.log(that.data.liveVideoData, "--------------------------")
    if (that.data.liveVideoData.subscribe_template_id && that.data.liveVideoData.subscribe_template_id.length > 0) {
      if (that.data.liveVideoData.subscribe == 0) {
        that.setData({
          isFollow: 1
        });
        // 点击关注授权模板消息
        wx.requestSubscribeMessage({
          tmplIds: that.data.liveVideoData.subscribe_template_id,
          success(res) {
            console.log(res);
            if (res[that.data.liveVideoData.subscribe_template_id] == "accept") { //点击确定授权
              publicFun.warning('订阅成功', that);
            }else if(res[that.data.liveVideoData.subscribe_template_id] == "ban"){
              publicFun.warning('请开启订阅消息方便接收消息提醒', that);
            } else { //点击取消授权
              publicFun.warning('取消订阅', that);
            }
          },
          fail(res) {
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
      if (that.data.liveVideoData.subscribe == 0) {
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
        live_id: that.data.live_id,
        anchor_id: that.data.liveVideoData.anchor_id,
        status: that.data.isFollow,
        phone: that.data.phoneNumber
      };
    common.post(url, data, 'followData', that, '', true)
  },
  followData: function(res) {
    let that = this;
    that.setData({
      isAbout: false
    })
    if (that.data.liveVideoData.subscribe == 0) {
      that.setData({
        'liveVideoData.subscribe': 1
      });
      if (that.data.liveVideoData.status == 1){
        // 正在直播中调用关注优惠券
        clearInterval(couponTimeing);
        that.aboutCouponFun();
      }else{
        publicFun.warning('关注成功', that);
      }
    } else {
      that.setData({
        'liveVideoData.subscribe': 0
      });
      publicFun.warning('已取消关注', that);
    }
  },
  // 关注优惠券的立即使用与立即关注按钮
  rightUsrAbout:function(){
    let that = this;
    if (that.data.couponStatus == 0){//未关注（立即关注）
      that.setData({
        couponActive: false
      });
      that.followClick();//点击关注
    } else if (that.data.couponStatus == 1) {//已关注并领取(立即使用)
      that.setData({
        couponActive: false
      });
      that.goodsListShow();//显示全部商品
    }
  },
  // 直播中，未关注的用户，1min后开启关注领券弹窗
  rightAbout:function(){
    let that = this;
    if (that.data.liveVideoData.status == 1 && that.data.liveVideoData.subscribe == 0){
      var comingTime = 0;
      couponTimeing = setInterval(function () {
        ++ comingTime;
        if (comingTime >= 60 && comingTime < 62){
          // 正在直播中调用关注优惠券
          console.log('关注领券弹窗定时器id',couponTimeing)
          clearInterval(couponTimeing);
          that.aboutCouponFun();
        }else if(comingTime >= 62){
          clearInterval(couponTimeing);
        }
      }, 1000);
    }
  },
  // 关注优惠券函数
  aboutCouponFun:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_subscribe_coupon',
      data = {
        live_id: that.data.live_id
      };
    common.post(url, data, 'aboutCouponData', that, '', true)
  },
  aboutCouponData:function(res){
    let that = this;
    that.setData({
      aboutCouponData: res.err_msg.list
    });
    if (that.data.liveVideoData.status == 1 && that.data.aboutCouponData.length != 0) {//直播间关注成功后弹领取关注优惠券
      // if (that.data.aboutCouponData.receive_status == 2) {
      //   that.setData({
      //     couponActive: true,
      //     couponType: 0,
      //     couponStatus: 1
      //   })
      // } else if (that.data.aboutCouponData.receive_status == 0){
      //   that.setData({
      //     couponActive: true,
      //     couponType: 0,
      //     couponStatus: 0
      //   });
      // }
       if (that.data.liveVideoData.subscribe == 1) {
        that.setData({
          couponActive: true,
          couponType: 0,
          couponStatus: 1
        })
      } else if (that.data.liveVideoData.subscribe == 0){
        that.setData({
          couponActive: true,
          couponType: 0,
          couponStatus: 0
        });
      }
      clearInterval(couponTimeing);
    }
  },
  // 打开限时优惠券
  openTimeCoupon:function(){
    let that = this;
    if (that.data.limitCoupon.grant_status == 1){//发放中
      that.setData({
        couponActive: true,
        couponType: 1//1：限时优惠券
      });
      that.receiveCoupons();
    } else if (that.data.limitCoupon.grant_status == 2){//已结束
      that.setData({
        couponActive: true,
        couponType: 1,//1：限时优惠券
        couponTime: 2//领取失败
      });
    }    
  },
  // 限时优惠券的按钮
  rightUserClose: function(){
    let that = this;
    if (that.data.couponTime == 1) {//领取成功（立即使用）
      that.setData({
        couponActive: false
      });
      that.goodsListShow();//显示全部商品
    } else if (that.data.couponTime == 2) {//领取失败(关闭)
      that.setData({
        couponActive: false
      });
    }
  },
  // 分享页商品
  livingGoodsFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=getLiveProducts',
      data = {
        live_id: that.data.live_id,
        page: 1
      };
    common.post(url, data, 'livingGoods', that, '', true)
  },
  livingGoods: function(res) {
    var that = this;
    that.setData({
      livingGoods: res.err_msg
    });
    if (res.err_msg.next_page == 0) {
      that.setData({
        no_more: true
      });
    }
  },
  // 商品数据
  goodsFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_goods_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'goodsData', that, '', true)
  },
  goodsData: function(res) {
    var that = this;
    that.setData({
      goodsData: res.err_msg
    });
  },
  // 商品的按钮点击显示商品列表
  goodsListShow: function(e) {
    let that = this;
    if (e){
      var goodsLength = e.currentTarget.dataset.goodslength;
    }else{
      var goodsLength = that.data.goodsData.list.length;
    }
    that.setData({
      couponPopup: false
    })
    if (goodsLength == 0) {
      publicFun.warning('暂无商品', that);
    } else {
      //加载提示
      // wx.showLoading({
      //   title:'努力加载中...',
      //   mask:true
      // });
      that.setData({
        goodsListShow: true,
        screenBtnShow: false,
        canvasShow: false,
        isAddProduct: false
      });
      // let load_st=setTimeout(function () {
      //   wx.hideLoading()
      //   clearTimeout(load_st);
      // }, 1000)
    }
  },
  // 关闭商品列表
  goodsListClose: function() {
    let that = this;
    that.setData({
      goodsListShow: false,
      screenBtnShow: true,
      canvasShow: true
    });
  },
  // 点击弹出商品规格
  openShop: function(e) {
    var that = this;
    let goodsIndex = e.currentTarget.dataset.index;
    let skstatus = e.currentTarget.dataset.skstatus;
    if(goodsIndex != undefined){
      var goodsNum = that.data.goodsData.list[goodsIndex].live_product_qty
    }    
    if(skstatus == 2){
      return publicFun.warning('暂时不支持购买，请稍后再试', that);
    }else if(goodsNum && goodsNum == 0){
      that.setData({
        goodsListShow: false
      });
      wx.navigateTo({
        url: '/pages/product/details?product_id=' + e.currentTarget.dataset.product
      });
      that.setData({
        screenBtnShow: true
      });
    }else{
      that.setData({
        goodsListShow: false,
        screenBtnShow: false,
        canvasShow: false,
        isAddProduct: false
      });
      publicFun.oppenShopping(e, that);
    }
    
  },
  // 入购物袋
  addCartBtn: function(e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      screenBtnShow: true
    });
    publicFun.oppenShopping(e, that);
  },
  // 立即购买
  payment: function(e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      screenBtnShow: true
    });
    publicFun.payment(that, e)
  },
  plus: function() { //加
    var that = this;
    publicFun.plus(that);
  },
  reduce: function() { //减
    var that = this;
    publicFun.reduce(that);
  },
  // 点击聚焦商品数量输入框
  shoppingFocus: function() {
    var that = this;
    that.setData({
      shoppingInputFocus: true
    });
  },
  //关闭购物袋规格选择框遮罩层
  closeShopping: function(e) {
    var that = this;
    that.setData({
      'liveVideoData.shoppingShow': false,
      'shoppingData.shoppingShow': false,
      screenBtnShow: true,
      canvasShow: true
    });
  },
  shoppingBlur: function(e) { //输入框失去焦点
    var that = this;
    publicFun.shoppingBlur(e, that)
  },
  shoppingFocus: function(e) { //输入框聚焦
    let that = this;
    that.setData({
      'shoppingData.shoppingNum': e.detail.value
    })
  },
  shoppingChange: function(e) { //输入框输入
    let that = this;
    that.setData({
      'shoppingData.shoppingNum': e.detail.value
    })
  },
  shoppingVid: function(e) { //选择商品规格
    var that = this;
    publicFun.shoppingVid(e, that);
  },
  selectDeliverDate: function(e) {
    let {
      index
    } = e.currentTarget.dataset;
    this.setData({
      "shoppingData.deliver_date_index": index
    })
  },
  messageInput: function(e) { //留言内容
    var that = this;
    let index = e.target.dataset.index;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].value = e.detail.value;
    this.setData({
      'shoppingData': that.data.shoppingData
    })
  },

  bindDateChange: function(e) { //选择日期
    var that = this;
    let index = e.target.dataset.index;
    let date = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].date = date;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  bindTimeChange: function(e) { //选择时间
    var that = this;
    let index = e.target.dataset.index;
    let time = e.detail.value;
    that.data.shoppingData.shoppingCatData.custom_field_list[index].time = time;
    that.setData({
      'shoppingData': that.data.shoppingData
    })
  },
  addImg: function(e) { //图片上传
    var that = this;
    let index = e.target.dataset.index;
    publicFun.addImgMessage(that, index);
  },

  // 分享页加入购物袋
  oppenShopping: function(e) {
    var that = this;
    publicFun.oppenShopping(e, that);
  },
  // 优惠券数据
  couponFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_coupon_list',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, 'couponData', that, '', true)
  },
  couponData: function(res) {
    var that = this;
    that.setData({
      couponData: res.err_msg
    });
  },
  // 优惠券的按钮点击
  couponList: function() {
    let that = this;
    that.setData({
      'liveVideoData.couponShow': true,
      screenBtnShow: false,
      canvasShow: false,
      couponPopup: false
    });
  },
  //关闭优惠券提示框遮罩层
  closeCoupon: function(e) {
    var that = this;
    that.setData({
      'liveVideoData.couponShow': false,
      screenBtnShow: true,
      canvasShow: true
    });
  },
  // 领取优惠券
  receiveCoupons: function(e) {
    var that = this;
    if (!app.isLoginFun(this)) { //判断用户是否登录
      return false;
    }
    var coupon_id;
    if (that.data.couponActive && that.data.couponTime == 0){
      coupon_id = that.data.limit_coupon_id
    }else{
      var index = e.currentTarget.dataset.index;
      coupon_id = that.data.couponData.list[index].id;
      that.setData({
        couponWindow: that.data.couponData.list[index]
      });
    }
    
    let data = {
      coupon_id: coupon_id,
      live_id: that.data.live_id
    }
    common.post('app.php?c=coupon&a=collect', data, 'coupontsData', that, 'coupontsDataFail');
  },
  coupontsData: function (result) {
    let that = this;
    if(result.err_code == 0) {
      that.setData({
        screenBtnShow: false
      });
      //新的领取弹窗
      that.closeCoupon();
      if (that.data.couponActive && that.data.couponTime == 0) {
        // 限时优惠券领取成功
        that.setData({
          couponTime: 1//领取成功
        })
      } else {
        that.setData({
          couponPopup: true
        });
      }
      let codenum = 3;
      let interTime = setInterval(function () {
        if (codenum > 0) {
          that.setData({
            codenum: codenum--
          });
        } else {
          clearInterval(interTime);
          that.couponPopupClose()
        }
      }, 1000)
    }
  },
  coupontsDataFail: function() {
    let that = this;
    // 限时优惠券领取失败
    if (that.data.couponActive && that.data.couponTime == 0) {
      that.setData({
        couponTime: 2//领取失败
      })
    }
  },
  // 新的领取弹窗关闭
  couponPopupClose: function() {
    let that = this
    that.setData({
      couponPopup: false
    })
  },
  // 关闭 -- 关注/限时(活动)优惠券
  couponActiveClose: function(){
    let that = this
    that.setData({
      couponActive: false
    });
  },
  // 清屏
  clearScreen: function() {
    console.log(666)
    let that = this;
    let isClearScreen = !that.data.isClearScreen
    that.setData({
      isClearScreen: isClearScreen
    });
    let clearanimation = wx.createAnimation({
      duration: 500,
      transformOrigin: '50% 50% 0',
      timingFunction: 'ease'
    });
    if (isClearScreen) {
      clearanimation.opacity(0.2).translateX(400).step()
      that.setData({
        clearanimation: clearanimation.export()
      });
    } else {
      clearanimation.opacity(1).translateX(0).step()
      that.setData({
        clearanimation: clearanimation.export()
      });
    }
  },

  // 点击输入框调取键盘
  tapInput: function() {
    let that = this;
    if (!app.isLoginFun(this)) { //判断用户是否登录
      return false;
    }
    if (that.data.loginFail){
      return publicFun.warning('暂时无法发送评论', that);
    };
    that.setData({
      inputFocus: true,
      inputInfo: that.data.inputInfo == '跟主播聊点什么...' ? '' : that.data.inputInfo,
      isClearInput: false
    });
  },
  // 聚焦事件
  focusInput: function(e) {
    let that = this;
    console.log('键盘高度', e.detail.height);
    that.setData({
      inputBottom: e.detail.height
    });
  },
  // 失去焦点事件
  blurInput: function(e) {
    let that = this;
    msg_count=0;
    if (that.data.isClearInput == false) {
      that.setData({
        inputInfo: e.detail.value || '跟主播聊点什么...',
        inputBottom: 0,
        msg_count:0,
        inputFocus: false
      });
    } else {
      that.setData({
        inputInfo: '跟主播聊点什么...',
        inputBottom: 0,
        msg_count:0,
        inputFocus: false
      });
    }
  },
  // 输入框输入事件
  inputChange: function(e) {
    let that = this;
    that.setData({
      inputInfo: e.detail.value
    });
  },
  // 监听键盘事件
  sendInput: function(e) {
    let that = this;
    let _val = e.detail.value.trim();
    console.log('点击发送', e.detail.value);
    that.setData({
      inputInfo: '',
      isClearInput: true
    });
    if(_val){
      that.testTxtFun(_val);
    }
  },
  sendInputBtn: function() {
    let that = this;
    let _val = that.data.inputInfo.trim();
    console.log('按钮点击发送', that.data.inputInfo);
    that.setData({
      inputInfo: '',
      isClearInput: true
    });
    if(_val != ''){
      that.testTxtFun(_val);
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
    this.setData({
      inputText:testTxt
    })
    common.post(url, data, 'testTxtData', that, '', true)
  },
  testTxtData: function (res) {
    let that = this;
    console.log(res);
    if (res.err_msg.errcode == 87014){
      console.log('ok')
      return publicFun.warning('请检查是否有违法违规的内容', that, 'red');
    }else{
      let testTxt = that.data.inputText;
      if(is_repeat_msg){//多次重复发送
        wx.showToast({
          title: '1秒内不可重复提交多次',
          icon:'none'
        })
        return;
      }
      is_repeat_msg=true;

      let st_out_repeat=setTimeout(() => {
        is_repeat_msg=false;
        clearTimeout(st_out_repeat);
      }, 1000);

      var objMsg = {};
      objMsg.type = 'chat';
      objMsg.name = that.data.useData.nickname;
      objMsg.content = testTxt;
      objMsg.faceUrl = that.data.useData.avatar;
      objMsg.level_name = that.data.liveVideoData.live_reward.level_name;
      objMsg.level = that.data.liveVideoData.live_reward.level;
      that.data.barrageArr.push(objMsg);
      that.setData({
        barrageArr: that.data.barrageArr
      });
      that.pageScrollToBottom();
      that.sendMsg(testTxt,objMsg);
    }
  },
  // 弹幕聊天信息发送
  sendMsg: function(_val,objMsg) {
    let that = this;
    console.log('弹幕聊天信息发送打印IM~~',tim);
    var _val = _val.trim();
    this.setData({
      inputText:_val
    })
    if (_val != "") {
      // 文本消息
      // let message = tim.createTextMessage({
      //   to: that.data.im_group_id,
      //   conversationType: TIM.TYPES.CONV_GROUP,
      //   payload: {
      //     text: _val
      //   }
      // });
      // 自定义消息
      let message = tim.createCustomMessage({
        to: that.data.im_group_id,
        conversationType: TIM.TYPES.CONV_GROUP,
        payload: {
          data: JSON.stringify(objMsg), // 用于标识该消息是什么类型消息
          description: '', // 获取消息描述
          extension: '' //消息延伸
        }
      });
      // 2. 发送消息
      let promise = tim.sendMessage(message);
      promise.then(function(imResponse) {
        // 发送成功
        console.log("发送消息成功", imResponse);
        // 抽奖评论通知
        if(that.data.isSpeak){
          that.prizeSign();
        }
      }).catch(function(imError) {
       // 重发消息
        let resPromise = tim.resendMessage(message); // 传入需要重发的消息实例
        resPromise.then(function(imResponse) {
          // 重发成功
          console.log('重发成功');
          

        }).catch(function(imError) {
          // 重发失败
          that.setData({
            failNum: ++that.data.failNum
          })
          //计算进入次数
          if (that.data.failNum > 3) {
            return;
          }
        });
       
      });
    }
  },
  // 获取随机颜色
  getRandomColor: function() {
    const rgb = []
    for (let i = 0; i < 3; ++i) {
      let color = Math.floor(Math.random() * 256).toString(16)
      color = color.length == 1 ? '0' + color : color
      rgb.push(color)
    }
    return '#' + rgb.join('')
  },
  pageScrollToBottom: function() {
    let that = this;
    wx.createSelectorQuery().selectAll('.chat-list').boundingClientRect(function(res) {
      // 使页面滚动到底部
      let top = 0;
      res.forEach((rect) => {
        top = top + rect.height
      })
      if (top > 200) {
        top = top - 200;
        that.setData({
          scrollTop: top
        });
      }
    }).exec();
  },
  // 解析返回消息
  analysisContent: function(imResponse, type) {
    if (!type && imResponse.data.message && imResponse.data.message.payload) {
      let elements = imResponse.data.message.payload;
      if (elements) {
        let content = elements ? elements.text : '';
        return content;
      }
    } else if (type == 'recived' && imResponse.payload) {
      let elements = imResponse.payload;
      if (elements) {
        let content = elements ? elements.text : '';
        if (content == undefined || content == 'undefined' || content == '') {
          content = elements ? (elements.data ? elements.data : '') : '';
          if (content && content.length > 0) {
            content = JSON.parse(content)
          }
        }
        return content;
      }
    }
  },
  // 点赞
  clickHeart: function() {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let endTime = new Date().getTime();
    // 优化点赞次数大于2000毫秒
    let clickTime = endTime - startTime
    console.log(clickTime, 'clickTime')
    if (clickTime > 500) {
      that.likeClick();
    } else {
      if (like_count%3=== 1 ){
        that.likeClick();
      }
    }
    startTime = endTime
    like_count++;
    // console.log(like_count)
    if(true){
      let isLoding = true;
      let url = 'app.php?c=tencent_live&a=set_like',
        data = {
          live_id: that.data.live_id,
          like_count:1
        };
        common.post(url, data, 'clickHeartData', that, '', isLoding)
    }
    //新增点赞数更新
    let _vlike_num=that.data.liveVideoData.like_num || 0;
    _vlike_num++;
    that.setData({
      'liveVideoData.like_num':_vlike_num
    })
  },
  clickHeartData: function(res) {
    var that = this;
    that.setData({
      clickHeartData: res.err_msg
      // 'liveVideoData.like_num': ++that.data.liveVideoData.like_num
    });
  },
  // 点赞动画
  likeClick() {
    let anmationData = {
      id: new Date().getTime(),
      timer: 0,
      opacity: 0,
      pathData: this.generatePathData(),
      image: [image1, image2, image3, image4, image5, image6, image7,image8,image9,image10],
      imageIndex: Math.floor(Math.random() * (4 - 0 + 1)) + 0,
      factor: {
        speed: 0.01, // 运动速度，值越小越慢
        t: 0 //  贝塞尔函数系数
      }
    };
    if (Object.keys(queue).length > 0) {
      queue[anmationData.id] = anmationData;
    } else {
      queue[anmationData.id] = anmationData;
      this.bubbleAnimate();
    }
  },
  getRandom(min, max) {
    return Math.random() * (max - min) + min;
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  generatePathData() {
    const p0 = {
      x: 40,
      y: 400
    };
    const p1 = {
      x: this.getRandom(20, 30),
      y: this.getRandom(200, 300)
    };
    const p2 = {
      x: this.getRandom(0, 80),
      y: this.getRandom(100, 200)
    };
    const p3 = {
      x: this.getRandom(0, 80),
      y: this.getRandom(0, 50)
    };
    return [p0, p1, p2, p3];
  },

  updatePath(data, factor) {
    const p0 = data[0]; // 三阶贝塞尔曲线起点坐标值
    const p1 = data[1]; // 三阶贝塞尔曲线第一个控制点坐标值
    const p2 = data[2]; // 三阶贝塞尔曲线第二个控制点坐标值
    const p3 = data[3]; // 三阶贝塞尔曲线终点坐标值

    const t = factor.t;

    /*计算多项式系数*/
    const cx1 = 3 * (p1.x - p0.x);
    const bx1 = 3 * (p2.x - p1.x) - cx1;
    const ax1 = p3.x - p0.x - cx1 - bx1;

    const cy1 = 3 * (p1.y - p0.y);
    const by1 = 3 * (p2.y - p1.y) - cy1;
    const ay1 = p3.y - p0.y - cy1 - by1;

    /*计算xt yt的值 */
    const x = ax1 * (t * t * t) + bx1 * (t * t) + cx1 * t + p0.x;
    const y = ay1 * (t * t * t) + by1 * (t * t) + cy1 * t + p0.y;
    return {
      x,
      y
    };
  },
  bubbleAnimate() {
    var anmationData;
    Object.keys(queue).forEach(key => {
      anmationData = queue[+key];
      const {
        x,
        y
      } = this.updatePath(
        anmationData.pathData,
        anmationData.factor
      );
      const speed = anmationData.factor.speed;
      anmationData.factor.t += speed;
      likeCtx.drawImage(anmationData.image[anmationData.imageIndex], x, y, 30, 30);
      likeCtx.globalAlpha = 1 - anmationData.factor.t > 0 ? 1 - anmationData.factor.t : 0;
    });
    likeCtx.draw();
    if (anmationData.factor.t > 1) {
      // delete queue[anmationData.id];
      queue = {}
      clearTimeout(timer);
      anmationData = {
        id: new Date().getTime(),
        timer: 0,
        opacity: 0,
        pathData: this.generatePathData(),
        image: [image1, image2, image3, image4, image5, image6, image7,image8,image9,image10],
        imageIndex: Math.floor(Math.random() * (4 - 0 + 1)) + 0,
        factor: {
          speed: 0.01, // 运动速度，值越小越慢
          t: 0 //  贝塞尔函数系数
        }
      };
      queue[anmationData.id] = anmationData;
      this.bubbleAnimate();
      anmationData.factor.t = 0;
    } else {
      timer = setTimeout(() => {
        this.bubbleAnimate();
      }, 100);
    }
  },
  // 播放状态变化事件
  statechange(e) {
    let that = this;
    console.log('live-player code:--------------------------', e.detail.code)
    if (e.detail.code == 2004) {
      that.setData({
        'statusBegin': false
      })
    }
    if (e.detail.code == -2301) {
      that.setData({
        'liveVideoData.cutoff_status': 0
      })
    }
    return e.detail.code
  },
  error(e) {
    let that = this;
    console.error('live-player error:', e.detail.errMsg)
    // publicFun.warning(e.detail.errMsg, that);
    publicFun.warning('加载失败！请稍后重试', that);
   
  },
  bindPlay() {
    this.ctx.play({
      success: res => {
        console.log('play success')
      },
      fail: res => {
        console.log('play fail')
      }
    })
  },
  bindPause() {
    this.ctx.pause({
      success: res => {
        console.log('pause success')
      },
      fail: res => {
        console.log('pause fail')
      }
    })
  },
  bindStop() {
    this.ctx.stop({
      success: res => {
        console.log('stop success')
      },
      fail: res => {
        console.log('stop fail')
      }
    })
  },
  bindResume() {
    this.ctx.resume({
      success: res => {
        console.log('resume success')
      },
      fail: res => {
        console.log('resume fail')
      }
    })
  },
  bindMute() {
    this.ctx.mute({
      success: res => {
        console.log('mute success')
      },
      fail: res => {
        console.log('mute fail')
      }
    })
  },
  // 获取手机号
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
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    this.ctx = wx.createLivePlayerContext('player');
    likeCtx = wx.createCanvasContext("bubble", this);
    // 加载分享组件 
    setTimeout(function() {
      that.dialog = that.selectComponent("#shareModal");
      console.log('分享组件', that.dialog)
    }, 1000);
  },
  // 倒计时
  timeDown: function(downTime) {
    let that = this;
    let nowTime = Math.round(new Date().getTime() / 1000).toString();
    let start_time = that.data.liveVideoDataInfo.start_time;
    var t = (start_time - nowTime);
    if (t >= 0) { //防止倒计时到0后继续倒计时变为负数了
      let str = Math.floor(t / 86400) + '天' + Math.floor(t % 86400 / 3600) + '时' + Math.floor(t % 86400 % 3600 / 60) + '分' + t % 60 + '秒';
      that.setData({
        isShowDownTime: true,
        'timeDownVal.day': Math.floor(t / 86400),
        'timeDownVal.time': Math.floor(t / 3600)>9?Math.floor(t / 3600):'0' + Math.floor(t / 3600),
        'timeDownVal.minute': Math.floor(t % 86400 % 3600 / 60)>9?Math.floor(t % 86400 % 3600 / 60):'0' + Math.floor(t % 86400 % 3600 / 60),
        'timeDownVal.second': t % 60 > 9 ? t % 60 : '0' + t % 60
      });
    } else {
      that.setData({
        isShowDownTime: false,
        'timeDownVal.day': 0,
        'timeDownVal.time': 0,
        'timeDownVal.minute': 0,
        'timeDownVal.second': 0
      });
      clearInterval(downTime);
    }
  },
  // 点击预约
  appointClick: function() {
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    if (that.data.liveVideoData.is_preparetips == 0) {
      wx.requestSubscribeMessage({
        tmplIds: that.data.liveVideoData.subscribe_template_id,
        success(res) {
          console.log(res);
          if (res[that.data.liveVideoData.subscribe_template_id] == "accept") { //点击确定授权
            publicFun.warning('订阅成功', that);
          }else if(res[that.data.liveVideoData.subscribe_template_id] == "ban"){
            publicFun.warning('请开启订阅消息方便接收消息提醒', that);
          } else { //点击取消授权
            publicFun.warning('取消订阅', that);
          }
        },
        fail(res) {
          // publicFun.warning(e.errMsg, that);
          publicFun.warning('请开启订阅消息方便接收消息提醒', that);
        },
        complete(res){
          that.appointFun();
        }
      })
    } else if (that.data.liveVideoData.is_preparetips == 1) {
      publicFun.warning('已预约', that);
    } else {
      publicFun.warning('已发送', that);
    }
  },
  appointFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=addPrepareTips',
      data = {
        live_id: that.data.live_id,
        cfrom: 0,
        openid: wx.getStorageSync('openId')
      };
    common.post(url, data, 'appointData', that)
  },
  appointData: function(res) {
    var that = this;
    that.setData({
      shareNumData: res.err_msg,
      'liveVideoData.is_preparetips': 1
    });
  },
  // 分享
  //显示对话框
  shareTap: function() {
    let that = this;
    // that.dialog.showDialog();
    that.setData({
      isShowShare: true,
      isShow: true,
      canvasShow: false
    })
  },
  //取消事件
  _cancelEvent: function() {
    var that = this;
    that.hideDialog();
  },
  //分享好友或群
  _shareGroup: function() {
    var that = this;
    wx.showShareMenu({
      withShareTicket: false
    });
  },
  shareFriendUnlogin:function(){
    let that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
  },
  //分享朋友圈（分享海报图）
  _shareFriendsCircle: function() {
    var that = this;
    if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    console.log('分享朋友圈');
    let ticket = wx.getStorageSync('ticket');
    let data = {
      path: 'pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail',
      id: that.data.live_id,
      uid: 0,
      share_uid: getApp().globalData.my_uid,
      shareType: 'live'
    }
    wx.showLoading({
      title: '正在生成中...',
      mask: true
    })
    wx.request({
      url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      method: "POST",
      success: function(res) {
        console.log(res.data.err_msg)
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
              success: function(res) {
                that.hideDialog();
              }
            });
          }
        }
      },
      fail: function(res) {
        wx.hideLoading();
      }
    })
  },
  // 生成分享海报
  creatPost: function() {
    let that = this;
    // 1 设置画布数据
    let liveVideoData = that.data.liveVideoData;
    let liveVideoDataimg = that.data.liveVideoDataimg;
    if(liveVideoDataimg.avatar == '' || liveVideoDataimg.store_logo == '' || liveVideoDataimg.cover_img == ''){
      return publicFun.warning('生成失败', that);
    }
    let canvasData = { // 画布数据
      canvasId: 'productPost',
      canvasWidth: 750,
      canvasHeight: 1270,
      paddingLeft: 0,
      paddingTop: 0,
      whProportion: 1.2,
      nickname: liveVideoData.nickname, //主播名称
      shopName: liveVideoData.store_name, // 店铺名称
      liveName: liveVideoData.title, //直播名称
      liveDes: liveVideoData.description, //直播描述
      text_qrcode_btm: '长按二维码进入直播', // 二维码下方文字
      // 图片数据
      userAvatar: liveVideoDataimg.avatar, //主播头像
      store_logo: liveVideoDataimg.store_logo, //店铺logo
      qrcodePath: 'https://' + that.data.qrcodePath.split('://')[1], // 二维码
      coverImage: liveVideoDataimg.cover_img, // 背景图
      start_time: "直播时间：" + liveVideoDataimg.start_time //直播开始时间
    };
    let obj = canvas.px2rpx({
      w: canvasData.canvasWidth,
      h: canvasData.canvasHeight
    });
    that.setData({
      canvasData: canvasData,
      canvasPosition: obj
    })
    let task = []
    let filePaths = ['coverImage', 'qrcodePath', 'store_logo', 'userAvatar']
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
      });
      // that.drawCanvas();
      that.getImageMes();
      setTimeout(function() {
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        that.save({
          id: that.data.canvasData.canvasId,
          w: w,
          h: h
        });
      }, 300)
    }).catch(err => {
      console.log(err);
    })
  },
  // 画图海报
  drawCanvas: function() {
    let that = this;
    let w = that.data.canvasData.canvasWidth;
    let h = that.data.canvasData.canvasHeight;
    let left = that.data.canvasData.paddingLeft;
    let top = that.data.canvasData.paddingTop;
    // 内部偏移量
    let innerLeft = 30;
    // 内部商品图片高度
    let imgH = w * 1.2;
    // 头像半径
    let head_r = 50;
    // 店铺logo半径
    let shop_r = 25;
    // 二维码半径
    let qrode_r = 80;
    let positionY = 0;

    let liveName = that.data.canvasData.liveName;
    let liveDes = that.data.canvasData.liveDes;
    let shopName = that.data.canvasData.shopName;
    let text_qrcode_btm = that.data.canvasData.text_qrcode_btm;
    let start_time = that.data.canvasData.start_time;
    // 生成画笔
    const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
    // 绘制白色圆角背景
    canvas.roundRect({
      ctx: ctx,
      x: left,
      y: top,
      w: w,
      h: h,
      r: 20,
      blur: 20,
      shadow: 'rgba(180,180,180,.4)'
    });
    var sx = that.data.sx,
      sy = that.data.sy,
      sw = that.data.sw,
      sh = that.data.sh;
    console.log(sx, "*************", sy, "*************", sw, "*************", sh)
    canvas.roundImg({
      ctx: ctx,
      x: left,
      sx: sx,
      y: top,
      sy: sy,
      img: that.data.canvasData.coverImage,
      w: w,
      sw: sw,
      h: imgH,
      sh: sh,
      r: 20,
      blur: 14,
      shadow: 'rgba(180,180,180,.4)',
      // 是否显示蒙层
      cover: false,
      // 蒙层高度
      coverH: 140
    });
    //绘制黑色半透明背景层x0, y0, r0, x1, y1, r1
    canvas.blackBgRect({
      ctx: ctx,
      x: left,
      y: top,
      w: w,
      h: imgH,
      r: 20,
      blur: 14,
    })

    
    // 绘制头像
    positionY = top + 50;
    canvas.circleImg({
      ctx: ctx,
      img: that.data.canvasData.userAvatar,
      r: head_r,
      x: left + 45,
      y: positionY,
      w: head_r * 2,
      h: head_r * 2
    });

    // 绘制主播名字
    canvas.drawText({
      ctx: ctx,
      text: that.data.canvasData.nickname,
      x: left + head_r * 2 + 75,
      y: positionY + head_r - 20,
      fontSize: 40,
      color: '#fff'
    });
    // 判断是否有描述
    var botHeight = imgH - 60
    if (liveDes.length>0){
      botHeight = imgH - 60
    }else{
      botHeight = imgH
    }
    // 绘制直播名称
    if (liveName.length > 20) {
      liveName = liveName.slice(0, 20) + "...";
      canvas.drawText({
        ctx: ctx,
        text: liveName,
        x: left + innerLeft,
        y: botHeight - 80,
        fontSize: 40,
        color: '#fff'
      });
    } else {
      canvas.drawText({
        ctx: ctx,
        text: liveName,
        x: left + innerLeft,
        y: botHeight - 90,
        fontSize: 40,
        color: '#fff'
      });
    }
    // 绘制直播时间
    canvas.drawText({
      ctx: ctx,
      text: start_time,
      x: left + innerLeft,
      y: botHeight - 40,
      fontSize: 30,
      color: '#fff'
    });

    // 绘制直播描述
    if (liveDes.length > 23) {
      if (liveDes.length < 46) {
        liveDes = liveDes.slice(0, 23) + '\n' + liveDes.slice(23, liveDes.length);
      } else {
        liveDes = liveDes.slice(0, 23) + '\n' + liveDes.slice(23, 45) + "...";
      }
      canvas.drawMultiText({
        ctx,
        gap: 15,
        text: liveDes,
        x: left + innerLeft,
        y: botHeight,
        fontSize: 30,
        color: '#fff'
      })
    } else {
      canvas.drawText({
        ctx: ctx,
        text: liveDes,
        x: left + innerLeft,
        y: botHeight,
        fontSize: 30,
        color: '#fff'
      });
    }
  
    // 绘制店铺名称    
    if (shopName.length > 15) {
      // 绘制店铺logo
      canvas.circleImg({
        ctx: ctx,
        img: that.data.canvasData.store_logo,
        r: shop_r,
        x: w / 2 - 300 - shop_r-10,
        y: imgH + 40,
        w: shop_r * 2,
        h: shop_r * 2
      });

      shopName = shopName.slice(0, 15) + '\n' + shopName.slice(20, 29) + "...";
      canvas.drawText({
        ctx: ctx,
        text: shopName,
        x: w / 2 - 300 + shop_r,
        y: imgH + 46,
        fontSize: 40
      });      
    } else {
      let name_r = shopName.length*40/2
      // 绘制店铺logo
      canvas.circleImg({
        ctx: ctx,
        img: that.data.canvasData.store_logo,
        r: shop_r,
        x: w / 2 - name_r - shop_r-10,
        y: imgH + 40,
        w: shop_r * 2,
        h: shop_r * 2
      });

      canvas.drawText({
        ctx: ctx,
        text: shopName,
        x: w / 2 - name_r + shop_r ,
        y: imgH + 46,
        fontSize: 40
      });
    }
    // 绘制二维码
    canvas.drawImage({
      ctx: ctx,
      img: that.data.canvasData.qrcodePath,
      x: (w - qrode_r * 2) / 2,
      y: imgH + shop_r * 2 + 60,
      w: qrode_r * 2,
      h: qrode_r * 2
    });

    // 绘制二维码下面文字
    canvas.drawText({
      ctx: ctx,
      text: text_qrcode_btm,
      x: w / 2 - 130,
      y: imgH + shop_r * 2 + qrode_r * 2 + 100,
      fontSize: 30,
      baseline: 'middle',
      color: '#030000'
    });

    // 最终绘出画布
    ctx.draw();
  },

  // 保存到相册
  save: function(o) {
    let that = this;
    // 把当前画布指定区域的内容导出生成指定大小的图片
    canvas.canvasToTempFilePath(o).then(function(res) {
      // console.log(res);
      wx.hideLoading();
      o.imgSrc = res.tempFilePath;
      that.setData({
        canvasImg: res.tempFilePath
      })
      // saveImageToPhotosAlbum图片保存到本地相册
      canvas.saveImageToPhotosAlbum(o).then(function(res) {
        // 统计分享次数
        that.shareNumFun();
        // console.log(res);
        wx.showModal({
          title: '存图成功',
          content: '图片成功保存到相册了，去发圈噻~',
          showCancel: false,
          confirmText: '好哒',
          confirmColor: app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#72B9C3',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              if (that.data.isShowShare) {
                that.hideDialog();
              }
              wx.previewImage({
                urls: [o.imgSrc],
                current: o.imgSrc
              })
            }
          }
        })
      }, function(err) {
        console.log(err);
        wx.hideLoading();
        that.setData({
          'dialog.dialogHidden': false
        })
      });
    }, function(err) {
      console.log(err);
    });
  },

  // 抽奖活动
  // 显示抽奖弹窗
  showPrize:function(){
    let that = this;
    that.setData({
      prizeActive: true,//抽奖活动弹窗
      prizeType: 0,
    });
  },
  // 去评论
  goSay:function(){
    let that = this;
    that.setData({
      prizeActive: false,
      isSpeak: true
    });
    that.tapInput();
  },
  // 报名评论抽奖
  prizeSign:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=enroll_draw',
      data = {
        draw_id: that.data.prizeData.draw_id
      };
    common.post(url, data, function(res){
      console.log(res);
      if(res.err_code == 0){
        that.setData({
          'liveVideoData.enrollCode': true,
          isSpeak: false
        });
      }
    }, '')
  },
  // 抽奖倒计时
  prizeDownTime: function (prizeTimes) {
    let that = this;
    let nowTime = Math.round(new Date().getTime() / 1000).toString();
    let start_time = that.data.prizeData.end_time;
    var t = (start_time - nowTime);
    // let str = Math.floor(t / 86400) + '天' + Math.floor(t % 86400 / 3600) + '时' + Math.floor(t % 86400 % 3600 / 60) + '分' + t % 60 + '秒';
    // console.log(str);
    if (t >= 0) { //防止倒计时到0后继续倒计时变为负数了
      that.setData({
        'prizeTime.minute': Math.floor(t % 86400 % 3600 / 60 / 10),
        'prizeTime.minuteBit': Math.floor(t % 86400 % 3600 / 60 % 10),
        'prizeTime.second': Math.floor(t % 60 / 10),
        'prizeTime.secondBit': Math.floor(t % 60 % 10)
      });
    } else {
      that.prizeEnd();
      that.setData({
        prizeActive: false,
        prizeBtn: false,
        'prizeTime.minute': 0,
        'prizeTime.minuteBit': 0,
        'prizeTime.second': 0,
        'prizeTime.secondBit': 0
      });    
      clearInterval(prizeTimes);
    }
  },
  // 抽奖结束
  prizeEnd:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=end_draw',
      data = {
        live_id: that.data.live_id,
        draw_id: that.data.prizeData.draw_id
      };
    common.post(url, data, function (res) {
      console.log(res);
    },'');
  },
  // 填写地址按钮
  showAdress:function(){
    let that = this;
    that.setData({
      prizeType: 0,
      prizeActive: false
    });
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/myActive/myActive'
    })
  },
  // 关闭抽奖弹窗
  prizeActiveClose:function(){
    let that = this;
    that.setData({
      prizeActive: false
    })
  },
  prizeActiveClose1:function(){
    let that = this;
    that.setData({
      prizeGuide: false
    })
  },
  hbActiveClose: function (params) {
    let that = this;
    that.setData({
      prizeHb: false
    })
  },
  // 普通关注弹窗
  aboutOpen:function(){
    this.setData({
      isAbout: true
    });
  },
  aboutClose:function(){
    this.setData({
      isAbout: false
    });
  },
  // 去主播主页
  goAnchor:function(){
    wx.navigateTo({
      url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + this.data.liveVideoData.anchor_id + '&live_id=' + this.data.live_id
    })
  },
  // 上架商品
  addProduct:function(){
    let that = this;
    let url = 'app.php?c=tencent_live&a=get_pop_goods',
      data = {
        store_id: app.globalData.store_id || common.store_id,
        live_id: that.data.live_id
      };
    common.post(url, data, function(res){
      that.setData({
        addProduct: res.err_msg
      });
      if(res.err_msg.list.length > 0){
        that.addProductFun(); 
      }
    }, '');
  },
  addProductFun:function(){
    let that = this;
    let addProductNum = 0;
    that.setData({
      isAddProduct: true
    });
    addProductTime = setInterval(function(){
      ++ addProductNum;
      if (addProductNum >= 8 && addProductNum < 10){
        // 正在直播中调用关注优惠券
        console.log('商品上架定时器id',addProductTime);
        that.setData({
          isAddProduct: false
        });
        clearInterval(addProductTime);
      }else if(addProductNum >= 10){
        clearInterval(addProductTime); 
        that.setData({
          isAddProduct: false,
          addProductNum: 0
        });       
      }else{
        that.setData({
          addProductNum: addProductNum
        });
      }
    },1000);
  },

  // 本场榜按钮
  isNowRank:function(){
    let that = this;
    that.setData({
      showNowRank: true,
      screenBtnShow: false,
      canvasShow: false,
      rankStatus: 2//1：打赏榜，2：主播榜，3：粉丝列表
    });
  },
  // 打赏榜更多按钮
  isMareRank:function(e){
    let that = this;
    let idx =  e.currentTarget.dataset.idx;
    console.log(idx);
    that.rewardList();
    if(idx != undefined){
      that.setData({

      });
    }
    that.setData({
      showNowRank: true,
      screenBtnShow: false,
      canvasShow: false,
      rankStatus: 1
    });
  },
  // 打赏榜单
  rewardList:function(){
    let that = this;
    let url = 'app.php?c=live_reward&a=get_reward_list',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id
    };
    common.post(url, data, function(res){//礼物列表
      that.setData({
        rewardList: res.err_msg
      });
    }, '');
  },
  // 跳转直播间/主播主页
  rankgoAnchor:function(e){
    let that = this;
    if(that.data.rankStatus == 2){
      let liveId = e.currentTarget.dataset.idx;
      if(1){//去直播间
        wx.navigateTo({
          url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + liveId + "&status=" + status
        });
      }else{//去主播主页
        wx.navigateTo({
          url: '/pages/LIVEVIDEO/pages/anchorPage/anchorPage?anchor_id=' + this.data.liveVideoData.anchor_id + '&live_id=' + liveId
        })
      }
    }
  },
  // 关闭打赏榜弹窗
  nowRankClose:function(){
    let that = this;
    that.setData({
      showNowRank: false,
      screenBtnShow: true,
      canvasShow: true,
      showFans: false,
      rankStatus:0
    });
  },
  // 粉丝按钮
  fansBtn:function(){
    let that = this;
    that.fansData();
  },
  // 未成为/成为粉丝数据
  fansData:function(){
    let that = this;
    let isAddGroup = that.data.liveVideoData.live_reward.is_add_group;//1:加入；0未加入
    let url;
    if (isAddGroup == 0) {//未成为粉丝
      url = 'app.php?c=fans_group&a=get_fans_config';
      that.setData({
        fansStatus: 0,//0:为成为粉丝，1：已成为粉丝,2:粉丝团规则
        fansStatus2: 0,
      });
    }else{//已成为粉丝
      url = 'app.php?c=fans_group&a=get_fans_info'
      that.setData({
        fansStatus: 1,//0:为成为粉丝，1：已成为粉丝,2:粉丝团规则
        fansStatus2: 1,
      });
    }
    let data = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id
    };
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });
    common.post(url, data, function(res){//礼物列表
      wx.hideToast();
      that.setData({
        showFans: true,
        screenBtnShow: false,
        canvasShow: false,
        fansData: res.err_msg
      });
    }, '');
  },
  // 加入粉丝团按钮
  joinFans:function(){
    let that = this;
    let url = 'app.php?c=fans_group&a=add_fans_group',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id
    };
    common.post(url, data, function(res){//加入粉丝团
      that.nowRankClose();
      that.setData({
        'liveVideoData.live_reward.is_add_group': 1,
        'liveVideoData.live_reward.level': 1,
        'liveVideoData.live_reward.intimacy': that.data.fansData.intimacy,
      });
      publicFun.warning('加入成功', that);
    }, '');
  },
  // 粉丝弹窗进入粉丝团列表按钮
  fansList:function(){
    let that = this;
    let url = 'app.php?c=fans_group&a=get_fans_list',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      live_id: that.data.live_id
    };
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true
    });
    common.post(url, data, function(res){//粉丝团列表
      wx.hideToast();
      that.setData({
        showFans: false,//关闭粉丝弹窗
        showNowRank: true,//开启粉丝列表弹窗
        rankStatus: 3,//粉丝列表
        rewardList: res.err_msg
      });
    }, '');
  },
  // 粉丝团规则
  fansRule:function(){
    let that = this;
    that.setData({
      fansStatus: 2,//0:未成为粉丝，1：已成为粉丝
    });
  },
  // 粉丝列表返回粉丝弹窗
  goFans:function(){
    let that = this;
    that.setData({
      showFans: true,//关闭粉丝弹窗
      fansStatus: that.data.fansStatus2,
      showNowRank: false,//开启粉丝列表弹窗
      rankStatus: 0,//粉丝列表
    });
  },
  // 打赏按钮
  rewardBtn:function(){
    let that = this;
    wx.showLoading({
      title:'努力加载中...',
      mask:true
    });
    that.giftList(pager);
    that.setData({
      showReward: true,
      screenBtnShow: false,
      canvasShow: false
    });
  },
  // 打赏列表
  giftList:function(page){
    let that = this;
    let url = 'app.php?c=live_reward&a=get_gift_list',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      page: page
    };
    common.post(url, data, function(res){//礼物列表
      wx.hideLoading()
      that.setData({
        // showReward: true,
        giftData: res.err_msg
      })
    }, '', true);
  },
  // 关闭打赏/充值
  rechargeClose:function(){
    let that = this;
    that.setData({
      showReward: false,
      showRecharge: false,
      screenBtnShow: true,
      canvasShow: true,
      rinputInfo: ''
    });
  },
  // 关闭输入框
  rechargeClose2:function(){
    let that = this;
    that.setData({
      rinputFocus: false
    });
  },
  // 礼物选择
  rewardType:function(e){
    let that = this;
    let rewardIdx = e.currentTarget.dataset.idx;
    let giftId = e.currentTarget.dataset.giftid;
    let giftNum = e.currentTarget.dataset.giftnum;
    that.setData({
      rewardIdx: rewardIdx,
      giftId: giftId,
      giftNum:giftNum
    });
  },
  // 礼物数量选择
  rewardNum:function(e){
    let that = this;
    let reNumIdx = e.currentTarget.dataset.idx;
    let reNums = e.currentTarget.dataset.num;
    that.setData({
      reNumIdx: reNumIdx,
      reNums: reNums
    });
  },
  // 礼物其他数量
  rewardNumIpt:function(e){
    let that = this;
    that.setData({
      reNumIdx: e.currentTarget.dataset.idx,
      rinputFocus: true
    });
  },
  // 聚焦事件
  rfocusInput: function(e) {
    let that = this;
    console.log('键盘高度', e.detail.height);
    that.setData({
      rinputBottom: e.detail.height
    });
  },
  // 失去焦点事件
  rblurInput: function(e) {
    let that = this;
    that.setData({
      rinputBottom: 0,
      rinputFocus: false
    });
  },
  // 输入框输入事件
  rinputChange: function(e) {
    let that = this;
    if(e.detail.value*1 === 0) {
      return 1;
    }
    that.setData({
      rinputInfo: e.detail.value,
      reNums: e.detail.value
    });
  },
  // 监听键盘事件
  rsendInput: function(e) {
    let that = this;
    console.log('点击发送', e.detail.value);
    let _val = e.detail.value.trim();
    if(_val){
      that.sendReward();
    }
  },
  // 打开充值列表
  rechargeList:function(){
    let that = this;
    that.goldLevel();
    that.setData({
      showReward: false,
      showRecharge: true
    });
  },
  // 金币充值档位
  goldLevel:function(){
    let that = this;
    let url = 'app.php?c=user_coin&a=get_recharge_level',
    data = {
      store_id: app.globalData.store_id || common.store_id
    };
    common.post(url, data, function(res){//礼物列表
      that.setData({
        goldLevel: res.err_msg
      });
    }, '');
  },
  //充值模式选择
  balanceMode:function(e){
    let that = this;
    let modeIdx = e.currentTarget.dataset.idx;
    that.setData({
      modeIdx: modeIdx,
      modeId: e.currentTarget.dataset.id,
      modeAmount: that.data.goldLevel.recharge_list[modeIdx].recharge_money
    });
  },
  // 去其他金额充值页面
  goRecharge:function(){
    wx.navigateTo({
      url: '/pages/SHOPGOODS/pages/user/recharge/recharge'
    });
  },
  // 金币充值
  goldPay:function(){
    let that = this;
    let url = 'app.php?c=user_coin&a=recharge_coin',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      type: 0,
      pay_type:'weixin',
      recharge_money: that.data.modeAmount || that.data.goldLevel.recharge_list[0].recharge_money
    };
    common.post(url, data, function(res){//金币充值
      if (res.err_code == 0) {
        console.log(res);
        let wx_data = res.err_msg;
        wx.requestPayment({//调用微信支付
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function (res) {//支付成功
            wx.showToast({
              title: '您已成功充值',
            })
            //清空输入金额
            that.setData({
              amount: 0.00
            });
            this.cashConfig();
            that.getMoneyList(1);
          },
          'fail': function (res) {
            wx.showModal({
              title: '提示信息',
              content: '您取消了支付',
              confirmText: '知道了',
              showCancel: false,
              success: function (res) {}
            })
          }
        });
      }else if(result.err_code == 30002){
        that.setData({
          showgetPhone: true
        });
      }
    }, '');
  },
  // 礼物--开始触摸事件
  touchStartR:function(e){
    startX = e.touches[0].pageX; // 获取触摸时的原点
    moveFlag = true;//防止多次调用滑动事件
  },
  // 礼物--触摸移动事件
  touchMoveR:function(e){
    let that = this;
    endX = e.touches[0].pageX; // 获取触摸时的原点
    if(moveFlag){
      if (endX - startX > 50 && pager > 1) {//向右滑动
        console.log("move right");
        // that.giftList(--pager);
        that.pageMove(--pager);
        moveFlag = false;
      }
      if (startX - endX > 50 && pager < that.data.giftData.gift_list.page_total) {//向左滑动
        console.log("move left");
        // that.giftList(++pager);
        that.pageMove(++pager);
        moveFlag = false;
      }
    }
  },
  touchEndR:function(e){
    moveFlag = true;
  },
  //向左滑动操作
  pageMove(pager) {
    let that = this;
    let animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    });
    let translateX = -100*(pager - 1) + '%';
    animation.translateX(translateX).step();
    that.setData({
      aniR: animation.export(),
      pager
    });
  },
  // 发送礼物
  sendReward:function(){
    let that = this;
    clearInterval(rewardTime);
    that.rewardSend();
    let sendNum = 3;
    that.setData({
      sendTxt: '连击' + sendNum + 's'
    });
    var rewardTime = setInterval(function(){
      --sendNum;
      if(sendNum>0){
        that.setData({
          sendTxt: '连击' + sendNum + 's'
        });
      }else{
        clearInterval(rewardTime);
        that.setData({
          sendTxt: '发送'
        });
      }        
    },1000);
    
  },
  // 用户打赏接口
  rewardSend:function(){
    let that = this;
    let url = 'app.php?c=live_reward&a=reward_anchor',
    data = {
      store_id: app.globalData.store_id || common.store_id,
      gift_id: that.data.giftId || that.data.giftData.gift_list.list[0].id,
      reward_num: that.data.reNums || 1,
      live_id: that.data.live_id
    };
    common.post(url, data, function(res){//礼物列表
      if (res.err_code === 0) {
        let user_coin = that.data.giftData.user_coin - (that.data.reNums || 1)*(that.data.giftNum || that.data.giftData.gift_list.list[0].gold_coin);
        that.setData({
          'giftData.user_coin': user_coin
        });
      } 
    },'');
  },
  // 打赏礼物弹窗数字累加器
  // 打赏动画
  rewardTipAnimate: function(transX,index) {
    let that = this;
    let rewardTipAnimate = wx.createAnimation({
      duration: 500,
      transformOrigin: '50% 50% 0',
      timingFunction: 'linear'
    });
    rewardTipAnimate.translateX(transX).step()
    that.setData({
      ['rewardTip[' + index + '].rewardTipAnimate']: rewardTipAnimate.export()
    });
    setTimeout(function() {
      rewardTipAnimate.translateX(transX).step()
      that.setData({
        ['rewardTip[' + index + '].rewardTipAnimate']: rewardTipAnimate.export()
      });
    }, 10);

    rewardTimeClear = setTimeout(function() {//5s后清除
      rewardTipAnimate.translateX(0).step()
      that.setData({
        ['rewardTip[' + index + '].rewardTipAnimate']: rewardTipAnimate.export()
      });
      that.setData({
        rewardTip: []
      });
    }, 8000);
  },  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    // 获取菜单按钮的信息(单位px)；(注意getMenuButtonBoundingClientRect这个方法在onShow中调用，不然IOS系统会有频率报错)
    var data = wx.getMenuButtonBoundingClientRect();
    that.setData({
      boundHeight: data.height,
      boundtop: data.top,
      bound: data
    });
    like_count=0;//用户点赞计数初始
    is_repeat_msg=false;//是否多次点击发送
    console.log('获取微信胶囊数据', data);
    setTimeout(()=> {
      if (that.data.liveVideoData.status === '1') {
        that.likeClick();  
        that.setData({
          canvasShow: true,
        });
      }
    }, 1000)
   
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    queue = {}
    clearTimeout(timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let that = this;
    wx.setKeepScreenOn({
      keepScreenOn: false,
    });
    clearInterval(downTime);
    clearInterval(animateTime);    
    clearInterval(couponTimeing);
    clearInterval(prizeTimes);
    clearInterval(addProductTime);
    clearTimeout(timer);
    queue = {}
    console.log('im_group_id-->',that.data.im_group_id)
    //quitGroup
    if(that.data.im_group_id != ''){
      that.quitGroup(that.data.im_group_id);
      console.log('执行that.logoutIM')
      that.logoutIM();
    }
    
    //更新提交当前点赞数
    let url = 'app.php?c=tencent_live&a=set_like',
    data = {
      live_id: that.data.live_id,
      like_count:like_count
    };    
    common.post(url, data, 'clickHeartData', that, '', true)
    like_count=0;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=getLiveProducts';
    that.listPushData(++page, that, url);
  },
  // 上拉加载方法(分页)
  listPushData: function(page, that, url) {
    //订单相关页面下拉加载
    if (that.data.livingGoods.next_page == 0) {
      return
    }
    wx.showToast({
      title: "加载中..",
      icon: "loading"
    });
    let data = {
      live_id: that.data.live_id,
      page: page
    };
    common.post(url, data, function(result) {
      //添加数据
      var list = that.data.livingGoods.products;
      for (var i = 0; i < result.err_msg.products.length; i++) {
        list.push(result.err_msg.products[i]);
      }
      that.setData({
        'livingGoods.products': list,
        'livingGoods.next_page': result.err_msg.next_page
      });
      if (result.err_msg.next_page == 0) {
        that.setData({
          no_more: true
        });
      }
    }, '');
  },

  // 分享次数统计
  shareNumFun: function() {
    let that = this;
    let url = 'app.php?c=tencent_live&a=liveShareCount',
      data = {
        live_id: that.data.live_id
      };
    common.post(url, data, 'shareNumData', that)
  },
  shareNumData: function(res) {
    var that = this;
    that.setData({
      shareNumData: res.err_msg
    });
  },
  // 直播间分享记录console.log()
  shareRecordFun: function () {
    let that = this;
    let url = 'app.php?c=tencent_live&a=set_share_record',
      data = {
        live_id: that.data.live_id,
        share_uid: app.globalData.share_uid,
        store_id: app.globalData.store_id || common.store_id
      };
    common.post(url, data, 'shareRecordData', that)
  },
  shareRecordData: function (res) {
    var that = this;
    that.setData({
      shareRecordData: res.err_msg
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let that = this;
    if (!app.isLoginFun(this)) { //判断用户是否登录
      return false;
    }
    console.log('转发');
    that.shareNumFun();
    let liveVideoData = that.data.liveVideoData;
    return getApp().shareGetFans(liveVideoData.title, ` `, `pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail`, 1, liveVideoData.cover_img, `&live_id=${that.data.live_id}`);
  },
  // 去商品回放页面
  goRecordvideo: function(e) {
    let that = this;
     if (!app.isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    wx.navigateTo({
      url: `/pages/LIVEVIDEO/pages/liveVideo/goodsPlayback?product=${e.currentTarget.dataset.product}&live_id=${that.data.live_id}&filesrc=${e.currentTarget.dataset.filesrc}&allrecord=${e.currentTarget.dataset.allrecord}&showStatus=${e.currentTarget.dataset.show_status}`
    })
    if(e.currentTarget.dataset.allrecord == 1){
      //更新回放次数
      let url = 'app.php?c=tencent_live&a=update_record_replay_num',
      data = {
        live_id: that.data.live_id
      };
      common.post(url, data ,function(result){          
        if(result.err_code == 0){
          console.log(result)
        }
      },'');
    }
  },
  getImageMes: function () {
    let that = this;
    var sx, sy, sw, sh, imgH = 510;
    // var sx =  0,  sw = 510,  imgW = 510;
    // var sy = 0, sh = 510 * that.data.canvasData.whProportion, imgH = 510 * that.data.canvasData.whProportion;
    wx.getImageInfo({
      src: that.data.canvasData.coverImage,
      success(res) {
        var imgw = res.width,
          imgh = res.height,
          whProportion = that.data.canvasData.whProportion;
        console.log(imgw, "--------------");
        console.log(imgh, "--------------");
        console.log(that.data.canvasData.whProportion, "--------------");
        //如果图宽大于高&&图宽小于高*whProportion
        if ((imgh * whProportion > imgw) && imgw > imgh) {
          console.log(11);
          sx = 0;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
          //如果图宽小于高&&图高大于*whProportion宽
        } else if (imgw < imgh && (imgh < imgw * whProportion)) {
          console.log(22);
          sx = (imgw - imgh / whProportion) / 2;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh;
          //如果图宽大于高*whProportion
        } else if (imgw > imgh * whProportion) {
          console.log(33);
          sx = (imgw - imgh / whProportion) / 2;
          sy = 0;
          sw = imgh / whProportion;
          sh = imgh
          //如果图高大于*whProportion宽
        } else if (imgh > imgw * whProportion) {
          console.log(44);
          sx = 0;
          sy = (imgh - imgw * whProportion) / 2;
          sw = imgw;
          sh = imgw * whProportion
          //正方形
        } else {
          console.log(55)
          sx = (imgw - imgh / whProportion) / 2;
          sy = 0;
          sw = imgw / whProportion;
          sh = imgh
        }
        that.setData({
          sx: sx,
          sy: sy,
          sw: sw,
          sh: sh
        });
        that.drawCanvas();
      }
    })
  },

  hideDialog() {
    let that = this;
    // that.setData({
    //     cls: 'bottom-modal-hide'
    // })
    // time = setTimeout(function () {
    that.setData({
      isShow: !that.data.isShow,
      canvasShow:true
    })
    // }, 300);
  },
  //展示弹框
  showDialog() {
    this.setData({
      isShow: !this.data.isShow,
      cls: 'bottom-modal-show'
    })
  },
  //加载错误申报
  loadErrorPost:function(data){
    let url = "app.php?c=wxapp&a=get_im_infoSync";
    common.post(url, data, function callBack(res) {
      if (res.err_code == 0) {
        console.log('reMsg=====:',res.err_msg);
      }
    }, '');
  },
  //展示未显示消息
  showNewsList:function(){
    this.pageScrollToBottom();//消息滚动到底部
    msg_count=0;
    this.setData({
      msg_count:0
    })
  },
  // 未开始页面进入直播间
  goLiving:function(){
    let that = this;
    wx.redirectTo({
      url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.live_id + "&imgsrc=" + that.data.coverImg+ "&status=" + that.data.liveVideoData.status + '&canGoLiving=1',
    });
  },

})