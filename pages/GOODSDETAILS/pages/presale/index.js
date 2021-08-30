
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var wxParse = require('../../../../wxParse/wxParse.js');
var canvas = require('../../../../utils/canvas.js');
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: 0, // 预售活动id
        cid: 0,
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        maskShow: false,
        itemWindowShow: false,
        textDescShow: false,
        currenttime: new Date(),
        currenttimePay: new Date(),
        instant: new Date(),
        num: 1,
        total: 0,
        originTotal: 0,
        currentSkuPrice: 0,
        isAttr: true,
        current_quantity: 0, //当前可购买实际库存
        buttonArr: [],// 底部按钮数组
        // 海报图新增字段
        qrcodePath: '',
        productInfo: {},
        canvasPosition: {},
        canvasData: {},
        winWidth: 0,
        winHeight: 0,
        payTime:"",
        resData:[],
        firstShow: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.height(that);

        var id = '';
        var preview = 0;

        if (e.scene != undefined) { // 预览模式
            that.setData({
                firstShow: false
            });
            var scene_id = decodeURIComponent(e.scene);
            console.log('pages/GOODSDETAILS/pages/presale/index.js',scene_id);
            if (scene_id) {
                let url = 'app.php?c=store&a=get_share_data',
                data = {
                scene_id: scene_id
                };
                common.post(url, data ,function(result){
                    //console.log(result)
                    if(result.err_code == 0){
                      app.globalData.store_id = result.err_msg.store_id;
                      app.globalData.share_uid = result.err_msg.share_uid;
                      id = result.err_msg.activity_id;
                      preview = 1;
                      that.setData({
                        id : result.err_msg.activity_id,
                        preview : 1
                      });
                      that.getDetails();
                    }
                  },'');
            }
        } else { // 正常模式
            id = e.id;
            getApp().globalData.share_uid = e.share_uid || app.globalData.share_uid || '';
            getApp().globalData.shareType = e.shareType || 2;
            that.setData({
                id: id,
                preview: preview,
            })
        }


      //是否展示分享图片
      app.shareWidthPic(that);
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      // getApp().globalData.share_uid = e.share_uid || '';
      // getApp().globalData.shareType = e.shareType || 2;
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        // 获得dialog组件
        this.dialog = this.selectComponent("#shareModal");
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    winWidth: res.windowWidth,
                    winHeight: res.windowHeight
                });
            },
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      //获取用户上次打开小程序距重新获取地理位置
      app.getTimeDifference();
      
        var that = this;
        if(that.data.firstShow){
            that.getDetails();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var that = this;
        let title = that.data.presale_info.name ? that.data.presale_info.name : '预购活动';
        var imageUrl = ""
        var ProductImages = this.data.allInfo.ProductImages
        if(ProductImages && ProductImages[0]){
            imageUrl = ProductImages[0].image
        }
        return getApp().shareGetFans(title, '', '/pages/GOODSDETAILS/pages/presale/index', 1, imageUrl, `&id=${that.data.id}`);
    },
    getDetails: function () {
        var that = this;
        var data = {
            id: that.data.id,
        };
        //=========================检测登录授权====================================
        publicFun.checkAuthorize({
            pageData: that.data.allInfo,
            app: app,
            callbackFunc: '',
        })
        //=========================检测登录授权====================================
        common.post('app.php?c=presale&a=detail', data, 'getDetailsCallBack', that);
    },
    getDetailsCallBack: function (res) {
        console.log(res);
        var that = this;
        if (that.compareTime(res.err_msg.presale_info.endtime) && !that.compareTime(res.err_msg.presale_info.starttime)) {
            res.err_msg.presale_info.a_open = 1//结束时间大于当前时间(开始时间小于当前时间)，属于开启中
            that.setData({
              [`presale_info.a_open`]:1
            })
        } else if (that.compareTime(res.err_msg.presale_info.starttime) && that.compareTime(res.err_msg.presale_info.endtime)) {
            res.err_msg.presale_info.a_open = 0//开始时间大于当前时间（结束时间大于当前时间），属于未开启
          that.setData({
            [`presale_info.a_open`]: 0
          })
        } else if (!that.compareTime(res.err_msg.presale_info.starttime)) {
          res.err_msg.presale_info.a_open = 2//属于关闭（开始时间小于当前时间）
          that.setData({
            [`presale_info.a_open`]:2
          })
        }
        console.log(res.err_msg.presale_info.a_open);
        // 计算当前库存
        res.err_msg.presale_info.pre_buyer_count = res.err_msg.presale_info.pre_buyer_count ? res.err_msg.presale_info.pre_buyer_count : 0;
        that.data.current_quantity = res.err_msg.presale_info.presale_amount - res.err_msg.presale_info.pre_buyer_count;
        that.data.current_quantity = that.data.current_quantity < 0 ? 0 : that.data.current_quantity;

        // 判断是否售罄
        res.err_msg.presale_info.sold_out_pre = res.err_msg.presale_info.soldout * 1 == 1 || res.err_msg.presale_info.quantity * 1 <= 0 || res.err_msg.presale_info.presale_amount * 1 <= res.err_msg.presale_info.pre_buyer_count * 1;
        console.log('presale_info.sold_out_pre === ', res.err_msg.presale_info.sold_out_pre)
        // 判断底部按钮
        checkQuantity(res.err_msg.presale_info)
            // 新增有预售单支付尾款开始时间大于当前时间倒计时
        function checkQuantity(data) {
            if (data.is_open * 1 != 1) {
                that.data.buttonArr = [{
                    text: '活动未开始',
                    color: 'gray',
                    bind: '',
                }]
            } else if (data.a_open == 0) {
                that.data.buttonArr = [{
                    text: '活动未开始',
                    color: 'gray',
                    bind: '',
                }]
            } else if (data.a_open == 2) {
                if (data.user_count.length == 0) { // 无预售单
                    that.data.buttonArr = [{
                        text: '活动已结束',
                        color: 'gray',
                        bind: '',
                    }]
                } else if (data.user_count.length > 0) {// 有无预售单
                // if 当前时间大于尾款开始支付时间 else 倒计时
                  if(that.compareTime(data.start_paytime)){
                    that.data.buttonArr = [{
                      text: '支付尾款',
                      color: '',
                      bind: '',
                    }]
                  }else{
                    that.data.buttonArr = [{
                      text: '支付尾款',
                      color: '',
                      bind: 'finalPayment',
                    }]
                  }
                   
                }
            } else if (data.a_open == 1) {
                if (data.sold_out_pre) { //售罄
                    if (data.user_count.length == 0) { // 无预售单
                        that.data.buttonArr = [{
                            text: '商品已售罄',
                            color: 'gray',
                            bind: '',
                        }]
                    } else if (data.user_count.length > 0) {// 有预售单
                      // if 当前时间大于尾款开始支付时间 else 倒计时
                      if (that.compareTime(data.start_paytime)) {
                          that.data.buttonArr = [{
                            text: '支付尾款',
                              color: '',
                              bind: '',
                          }]
                        } else {
                        that.data.buttonArr = [{
                          text: '支付尾款',
                          color: '',
                          bind: 'finalPayment',
                        }]
                        }
                    }
                    
                } else {
                    if (data.user_count.length == 0) {
                        that.data.buttonArr = [{
                            text: '立即预定',
                            color: '',
                            bind: 'showItemWindow',
                        }]
                    } else if (data.user_count.length > 0) {
                      // if 当前时间大于尾款开始支付时间 else 倒计时
                      if (that.compareTime(data.start_paytime)) {
                          that.data.buttonArr = [{
                              text: '再次预定',
                              color: '',
                              bind: 'showItemWindow',
                          }, {
                              text: '支付尾款',
                              color: '',
                              bind: '',
                          }]
                        } else {
                        that.data.buttonArr = [{
                          text: '再次预定',
                          color: '',
                          bind: 'showItemWindow',
                        }, {
                          text: '支付尾款',
                          color: '',
                          bind: 'finalPayment',
                        }]
                        }
                    }
                    
                }
            }

        }

        // 获取商品相关信息，海报图新增
        let _info = Object.assign({}, res.err_msg.presale_info, res.err_msg.ProductImages[0], res.err_msg.user);
        console.log(_info);

        that.setData({
            allInfo: res.err_msg,
            currenttime: res.err_msg.time * 1000,
          currenttimePay: res.err_msg.time * 1000,
            presale_info: res.err_msg.presale_info,
            power: res.err_msg.power,
            propertyList: res.err_msg.propertyList,
            skuList: res.err_msg.skuList,
            orders: res.err_msg.presale_info.user_count,
            s_Time: res.err_msg.presale_info.starttime,
            e_time: res.err_msg.presale_info.endtime,
          s_paytime: res.err_msg.presale_info.start_paytime,
            endTime: that.formatDate(new Date(res.err_msg.presale_info.endtime * 1000), 'yyyy-MM-dd hh:mm'),
            start_paytime: that.formatDate(new Date(res.err_msg.presale_info.start_paytime * 1000), 'yyyy-MM-dd hh:mm'),
            finalPaytime: that.formatDate(new Date(res.err_msg.presale_info.final_paytime * 1000), 'yyyy-MM-dd hh:mm'),
            total: that.data.num * res.err_msg.presale_info.dingjin,
            originTotal: (that.data.num * res.err_msg.presale_info.price).toFixed(2),
            currentSkuPrice: res.err_msg.presale_info.price,
            current_quantity: that.data.current_quantity, // 当前实际库存
            buttonArr: that.data.buttonArr, // 底部按钮
            productInfo: _info,
            unitPrice: res.err_msg.presale_info.price//单价
        })
        publicFun.barTitle(res.err_msg.presale_info.name); //修改头部标题

        var infoHtml = that.data.presale_info.info;
        wxParse.wxParse('infoHtml', 'html', infoHtml, that, 5);
        //设置初始属性
        that.setDefaultAttr(that.data.propertyList);

        // 处理秒杀计时器
        if (that.data.presale_info.a_open == 0) { // 活动未开始
            that.setData({
                e_time: that.data.presale_info.starttime * 1000
            })
            //console.log(that.data.presale_info.starttime* 1000)
            clearTimeout(publicFun.timer);
            that.timeShow();
        } else if (that.data.presale_info.a_open == 1) { // 活动已开始
            that.setData({
                e_time: that.data.presale_info.endtime * 1000,
            })
            //console.log(that.data.presale_info.endtime*1000)

            clearTimeout(publicFun.timer);
            that.timeShow();
        } else {
            clearTimeout(publicFun.timer);
            //that.timeShow();
        }
        //处理尾款支付倒计时
        if (that.compareTime(res.err_msg.presale_info.start_paytime)) {
          that.setData({
            s_paytime: that.data.presale_info.start_paytime * 1000,
          })
          clearTimeout(publicFun.paytimer);
          that.start_paytimeShow();

        } else {
          clearTimeout(publicFun.paytimer);
        }
      
    },
    timeShow: function () {
        var that = this;
        var endtime = new Date(that.data.e_time); //结束时间
        that.setData({
            currenttime: that.data.currenttime + 1000
        })
        var today = new Date(that.data.currenttime); //当前时间
        // console.log(endtime)

        var delta_T = endtime.getTime() - today.getTime(); //时间间隔
        // console.log('delta_T = ==== ', delta_T)
        if (delta_T < 0) {
            that.setData({
                total_show: '00',
                hours_show: '00',
                minutes_show: '00',
                seconds_show: '00'
            })
            clearTimeout(publicFun.timer);
            if (that.data.presale_info.a_open == 0) {
                that.data.presale_info.a_open = 1;
                that.setData({
                    presale_info: that.data.presale_info,
                    e_time: that.data.presale_info.endtime * 1000

                })
                that.timeShow();
            }
            if (that.data.presale_info.a_open == 1) {
                that.data.presale_info.a_open = 2;
                that.setData({
                    presale_info: that.data.presale_info
                })
            }
            return;
        }
        publicFun.timer = setTimeout(that.timeShow, 1000);
        var total_days = delta_T / (24 * 60 * 60 * 1000), //总天数
            total_show = Math.floor(total_days), //实际显示的天数
            total_hours = (total_days - total_show) * 24,//剩余小时
            hours_show = Math.floor(total_hours), //实际显示的小时数
            total_minutes = (total_hours - hours_show) * 60, //剩余的分钟数
            minutes_show = Math.floor(total_minutes), //实际显示的分钟数
            total_seconds = (total_minutes - minutes_show) * 60, //剩余的分钟数
            seconds_show = Math.round(total_seconds); //实际显示的秒数
        if (seconds_show == 60) seconds_show = 59;

        if (total_show <= 15) {
        }
        if (total_show < 10) {
            total_show = String(total_show);
            total_show = "0" + total_show;
        }
        if (hours_show < 10) {
            hours_show = "0" + hours_show;
        }
        if (minutes_show < 10) {
            minutes_show = "0" + minutes_show;
        }
        if (seconds_show < 10) {
            seconds_show = "0" + seconds_show;
        }
        // console.log(total_show)
        that.setData({
            total_show: total_show,
            hours_show: hours_show,
            minutes_show: minutes_show,
            seconds_show: seconds_show
        })
    },
    // 尾款支付倒计时
    start_paytimeShow: function () {
      var that = this;
      var start_paytime = new Date(that.data.s_paytime); //尾款结束时间
      that.setData({
        currenttimePay: that.data.currenttimePay+1000
      })
      var today = new Date(that.data.currenttimePay); //当前时间
      var delta_T = Number(start_paytime.getTime()) - Number(today.getTime()); //时间间隔
      // console.log('delta_T = ==== ', delta_T)
      if (delta_T < 0) {
        that.setData({
          payTime_total_show: '00',
          payTime_hours_show: '00',
          payTime_minutes_show: '00',
          payTime_seconds_show: '00'
        })
        clearTimeout(publicFun.paytimer);
        // 预售支付时间大于当前时间(支付倒计时不能支付)
        if (that.compareTime(that.data.start_paytime)) {
            that.setData({
              s_paytime: that.data.presale_info.start_paytime * 1000,
            })
            
            that.start_paytimeShow();
        }
        return;
      }
      publicFun.paytimer = setTimeout(that.start_paytimeShow, 1000);

      var total_days = Number(delta_T / (24 * 60 * 60 * 1000)), 
        total_show = Math.floor(total_days), //实际显示的天数
        total_hours = (total_days - total_show) * 24,//剩余小时
        hours_show = Math.floor(total_hours), //实际显示的小时数
        total_minutes = (total_hours - hours_show) * 60, //剩余的分钟数
        minutes_show = Math.floor(total_minutes), //实际显示的分钟数
        total_seconds = (total_minutes - minutes_show) * 60, //剩余的分钟数
        seconds_show = Math.round(total_seconds); //实际显示的秒数
      if (seconds_show == 60) seconds_show = 59;

      if (total_show <= 15) {
      }
      if (total_show < 10) {
        total_show = String(total_show);
        total_show = "0" + total_show;
      }
      if (hours_show < 10) {
        hours_show = "0" + hours_show;
      }
      if (minutes_show < 10) {
        minutes_show = "0" + minutes_show;
      }
      if (seconds_show < 10) {
        seconds_show = "0" + seconds_show;
      }
      console.log(total_show + '天' + hours_show + '时' + minutes_show + '分' + seconds_show + '秒')
     
      that.setData({
        payTime_total_show: total_show,
        payTime_hours_show: hours_show,
        payTime_minutes_show: minutes_show,
        payTime_seconds_show: seconds_show,
        payTime: total_show + '天' + hours_show + '时' + minutes_show + '分' + seconds_show + '秒',
        buttonArr: that.data.buttonArr, // 底部按钮
      })
      // 判断底部按钮
      checkQuantity(that.data.presale_info)
            // 新增有预售单支付尾款开始时间大于当前时间倒计时
      function checkQuantity(data) {
        if (data.is_open * 1 != 1) {
          that.data.buttonArr = [{
            text: '活动未开始',
            color: 'gray',
            bind: '',
          }]
        } else if (data.a_open == 0) {
          that.data.buttonArr = [{
            text: '活动未开始',
            color: 'gray',
            bind: '',
          }]
        } else if (data.a_open == 2) {
          if (data.user_count.length == 0) { // 无预售单
            that.data.buttonArr = [{
              text: '活动已结束',
              color: 'gray',
              bind: '',
            }]
          } else if (data.user_count.length > 0) {// 有无预售单
            // if 当前时间大于尾款开始支付时间 else 倒计时
            if (that.compareTime(data.start_paytime)) {
              that.data.buttonArr = [{
                text: '尾款支付' + '\n' + that.data.payTime + '',
                class: 'payTime',
                color: '',
                bind: '',
              }]
            } else {
              that.data.buttonArr = [{
                text: '支付尾款',
                color: '',
                bind: 'finalPayment',
              }]
            }

          }
        } else if (data.a_open == 1) {
          if (data.sold_out_pre) { //售罄
            if (data.user_count.length == 0) { // 无预售单
              that.data.buttonArr = [{
                text: '商品已售罄',
                color: 'gray',
                bind: '',
              }]
            } else if (data.user_count.length > 0) {// 有预售单
              // if 当前时间大于尾款开始支付时间 else 倒计时
              if (that.compareTime(data.start_paytime)) {
                that.data.buttonArr = [{
                  text: '尾款支付' + '\n' +that.data.payTime+'',
                  class: 'payTime',
                  color: '',
                  bind: '',
                }]
              } else {
                that.data.buttonArr = [{
                  text: '支付尾款',
                  color: '',
                  bind: 'finalPayment',
                }]
              }
            }

          } else {
            if (data.user_count.length == 0) {
              that.data.buttonArr = [{
                text: '立即预定',
                color: '',
                bind: 'showItemWindow',
              }]
            } else if (data.user_count.length > 0) {
              // if 当前时间大于尾款开始支付时间 else 倒计时
              if (that.compareTime(data.start_paytime)) {
                that.data.buttonArr = [{
                  text: '再次预定',
                  color: '',
                  bind: 'showItemWindow',
                }, {
                    text: '尾款支付'+ '\n' +that.data.payTime,
                    class:'payTime',
                  color: '',
                  bind: '',
                }]
              } else {
                that.data.buttonArr = [{
                  text: '再次预定',
                  color: '',
                  bind: 'showItemWindow',
                }, {
                  text: '支付尾款',
                  color: '',
                  bind: 'finalPayment',
                }]
              }
            }

          }
        }

      }
    },
    compareTime: function (t) {
        var that = this;
        var today = new Date().getTime(); //当前时间
        var targetTime = new Date(t * 1000); //结束时间
        if (today < targetTime.getTime()) {
            return true
        } else {
            return false
        }
    },
    //手动输入
    bindKeyInput: function (e) {
        var that = this;
        const { unitPrice } = that.data;
        if (that.data.num == 0) {
            that.setData({
                num: 1
            })
        }
        that.setData({
            num: e.detail.value,
            originTotal: that.data.num * unitPrice * 100 / 100
        });
        publicFun.skuPrice(that);
        that.setAttrText();

    },
    //增加数量
    addNum: function () {
        var that = this;
        that.data.num++;
        const {unitPrice}=that.data;
        that.setData({
            num: that.data.num,
            originTotal: that.data.num*unitPrice*100/100
        });
        that.setAttrText();
    },
    //减少数量
    reduceNum: function () {
        var that = this;
        if (that.data.num <= 1) {
            return
        }
        const { unitPrice } = that.data;
        that.data.num--;
        that.setData({
            num: that.data.num,
            originTotal: that.data.num * unitPrice
        });
        that.setAttrText();
    },
    //设置初始默认属性
    setDefaultAttr: function (v) {
        var that = this;
        console.log(that.data);

        that.setData({
            'shoppingData.specList[0].vid': '',
            'shoppingData.value[0]': '',
            'shoppingData.specList[1].vid': '',
            'shoppingData.value[1]': '',
            'shoppingData.specList[2].vid': '',
            'shoppingData.value[2]': ''
        });
        // 单规格 默认选中处理
        let single_sku_single_value = false;
        let isAttr = true;
        let sku_id = '';
        if (that.data.skuList) {
            if (that.data.skuList.length == 1) {
                sku_id = that.data.skuList[0].sku_id;
                single_sku_single_value = true;
            }
        } else {
            isAttr = false;
        }
        that.setData({
            'shoppingData.sku_id': sku_id,
            'shoppingData.single_sku_single_value': single_sku_single_value,
            isAttr: isAttr
        });


        that.setAttrText();
        that.setData({
            propertyList: v
        })
    },
    //设置属性文字描述
    setAttrText: function () {
        var that = this;
        // var text = '', attrId = '', that = this;
        // for (var d of v) {
        //     for (var c of d.values) {
        //         if (c.flag == true) {
        //             text += c.value + ' ';
        //             attrId += d.pid + ':' + c.vid;
        //         }
        //     }
        // }

        // that.setData({
        //     attrId: attrId,
        //     attrText: text == '' ? '请选择规格' : text
        // })
        // console.log(attrId)
        // for (let i = 0; i < that.data.skuList.length; i++) {
        //     if (attrId == that.data.skuList[i].properties+',') {
        //         that.setData({
        //             currentSkuPrice: that.data.skuList[i].price,
        //             originTotal: (that.data.num * that.data.skuList[i].price).toFixed(2)
        //         })
        //     }
        // }

        let valueDate = '';
        let valueNmae = '';
        let pre_buyer_count = that.data.presale_info.pre_buyer_count * 1;
        let skuPriceData = that.data.skuList; //商品规格列表
        let quantity = (that.data.presale_info.presale_amount - pre_buyer_count) * 1; //商品库存数量
        let shoppingNum = that.data.num * 1; //输入框数量


        if ((skuPriceData == '' || skuPriceData == undefined) && shoppingNum > quantity) { //商品无规格时判断商品库存
            that.setData({
                num: quantity
            });
            wx.showToast({
                title: '超出库存！',
                icon: 'none',
                duration: 2000
            })
            return;
        }

        for (let i in that.data.shoppingData.value) { //添加规格列表
            if (that.data.shoppingData.value[i]) {
                valueDate += that.data.shoppingData.value[i] + ';';
                valueNmae += that.data.shoppingData.name[i] + ',';
            }
        }
        valueDate = valueDate.substring(0, valueDate.length - 1);
        valueNmae = valueNmae.substring(0, valueNmae.length - 1);
        for (let i in skuPriceData) { //判断规格产品的库存以及价格
            if (skuPriceData[i].properties.includes(valueDate)) {
                if (skuPriceData[i].quantity == 0) {
                    wx.showToast({
                        title: '超出库存！',
                        icon: 'none',
                        duration: 2000
                    })
                    return;
                }

                that.setData({
                    currentSkuPrice: skuPriceData[i].price,
                    originTotal: (shoppingNum * skuPriceData[i].price).toFixed(2),
                    attrText: valueNmae == '' ? '请选择规格' : valueNmae,
                    'shoppingData.sku_id': skuPriceData[i].sku_id
                });
                if (quantity < skuPriceData[i].quantity) {
                    if (quantity < shoppingNum) {
                        that.setData({
                            num: quantity,
                            originTotal: (quantity * skuPriceData[i].price).toFixed(2)
                        });
                        wx.showToast({
                            title: '超出库存！',
                            icon: 'none',
                            duration: 2000
                        })
                        return;
                    }
                } else {
                    if (skuPriceData[i].quantity < shoppingNum) {
                        that.setData({
                            num: skuPriceData[i].quantity,
                            originTotal: (skuPriceData[i].quantity * skuPriceData[i].price).toFixed(2)
                        });
                        wx.showToast({
                            title: '超出库存！',
                            icon: 'none',
                            duration: 2000
                        })
                        return;
                    }
                }

            }
        }
    },
    //自己手动设置属性
    setMyAttr: function (e) {
        var that = this;
        let id = e.target.dataset.id;
        let vid = e.target.dataset.vid;
        let pid = e.target.dataset.pid;
        let name = e.target.dataset.name;
        if (that.data.shoppingData.specList[id].vid === vid) {
            return false;
        } else {
            let sku_id;
            if(that.data.skuList){
                let sku = that.data.skuList.find(item=>item.properties.includes(`${pid}:${vid}`))
                if(sku){
                    sku_id = sku.sku_id;
                } else{
                    return wx.showToast({
                            title: '该规格无库存',
                            icon: 'none',
                            duration: 2000
                        })
                }
            }
            id = id * 1;
            that.setData({
                [`shoppingData.specList[${id}].vid`]: vid,
                [`shoppingData.value[${id}]`]: pid + ':' + vid,
                [`shoppingData.name[${id}]`]: name,
                'shoppingData.sku_id':sku_id
            });
        }
        that.setAttrText(that);
    },
    //检查属性是否未填写完整
    checkAttr: function () {
        var that = this;
        var v = that.data.propertyList;
        var text = '';
        var l = that.data.propertyList.length;

        for (var d of v) {
            for (var c of d.values) {
                var n = 0;
                if (c.flag == true) {
                    n++
                }
                if (n == 0) {
                    text += d.name
                }
            }
        }
        if (text != '') {
            wx.showToast({
                title: text + '属性未选择',
                icon: 'success',
                duration: 2000
            })
            return false
        }
    },
    //去支付
    gopay: function () {
        var that = this;
        if (that.data.shoppingData.sku_id == '' && (that.data.skuList != '' && that.data.skuList != undefined)) {
            return wx.showToast({title:"请选择商品规格",icon:"none"});
        }
        let data = {};
        data.product_id = that.data.presale_info.product_id;
        data.is_add_cart = 0; //是否加入购物袋
        data.send_other = 0;
        data.skuId = that.data.shoppingData.sku_id,
            data.custom = [];
        data.quantity = that.data.num;
        data.store_id = that.data.presale_info.store_id;
        // data.activityId = that.data.presale_info.pigcms_id;
        // data.type = 50;
        data.presale_id = that.data.id;


        common.post('app.php?c=presale&a=add', data, "getOrder", that);

    },
    //获取订单
    getOrder: function (res) {
        var that = this;
        wx.navigateTo({
            url: '/pages/payment/index?order_no=' + res.err_msg + '&goodsType=presale',
        })
    },
    showItemWindow: function () {
        var that = this;
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this, app);
          return false;
        }
        console.log(that.data);
        if (that.data.shoppingData.sku_id != '' && (that.data.skuList != '' && that.data.skuList != undefined)) {
            that.setData({
                maskShow: true,
                itemWindowShow: true
            })
            that.setAttrText(that);
        } else {
            that.setData({
                maskShow: true,
                itemWindowShow: true,
                'shoppingData.specList[0].vid': '',
                'shoppingData.value[0]': '',
                'shoppingData.specList[1].vid': '',
                'shoppingData.value[1]': '',
                'shoppingData.specList[2].vid': '',
                'shoppingData.value[2]': ''
            })
        }
    },
    //分享
    shareClick: function () {
        wx.showShareMenu({
            withShareTicket: false
        })
    },
    //遮罩点击
    maskClick: function () {
        var that = this;
        that.setData({
            maskShow: false,
            itemWindowShow: false
        })
    },
    //点击箭头伸缩
    thisArrowClcik: function () {
        var that = this;
        that.setData({
            textDescShow: !that.data.textDescShow
        })
    },
    //时间格式化es6方法
    formatDate: function (date, fmt) {
        var that = this;
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        }


        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                // console.log(`${k}`)
                // console.log(RegExp.$1)
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : that.padLeftZero(str));
            }
        }
        return fmt;
    },
    padLeftZero: function (str) {
        return ('00' + str).substr(str.length);
    },
    //支付尾款
    finalPayment: function () {
        var that = this;
        if (that.data.orders.length > 1) {
            wx.navigateTo({
                url: '/pages/user/order/orderList?currentTab=all'
            })
        } else if (that.data.orders.length == 1) {
            if (that.data.orders[0].status == 0) {
                wx.navigateTo({
                    url: '/pages/payment/index?order_no=' + that.data.orders[0].order_no,
                })
            } else if (that.data.orders[0].status == 7) {
                var data = {
                    order_id: that.data.orders[0].order_id
                }
                common.post('app.php?c=order&a=presale_add', data, "getOrder", that);
            }
        }
    },
    //俩数组对象比较是否相等
    equals: function (object1, object2) {
        var that = this;
        //For the first loop, we only check for types
        for (let propName in object1) {
            //Check for inherited methods and properties - like .equals itself
            //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
            //Return false if the return value is different
            if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            }
            //Check instance type
            else if (typeof object1[propName] != typeof object2[propName]) {
                //Different types => not equal
                return false;
            }
        }
        //Now a deeper check using other objects property names
        for (let propName in object2) {
            //We must check instances anyway, there may be a property that only exists in object2
            //I wonder, if remembering the checked values from the first loop would be faster or not
            if (object1.hasOwnProperty(propName) != object2.hasOwnProperty(propName)) {
                return false;
            }
            else if (typeof object1[propName] != typeof object2[propName]) {
                return false;
            }
            //If the property is inherited, do not check any more (it must be equa if both objects inherit it)
            if (!object1.hasOwnProperty(propName))
                continue;
            //Now the detail check and recursion
            //This returns the script back to the array comparing
            /**REQUIRES Array.equals**/
            if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
                // recurse into the nested arrays
                if (!that.equals(object1[propName], object2[propName]))
                    return false;
            }
            else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
                // recurse into another objects
                //console.log("Recursing to compare ", this[propName],"with",object2[propName], " both named \""+propName+"\"");
                if (!that.equals(object1[propName], object2[propName]))
                    return false;
            }
            //Normal value comparison for strings and numbers
            else if (object1[propName] != object2[propName]) {
                return false;
            }
        }
        //If everything passed, let's say YES
        return true;
    },

    showModal: function () {
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this, app);
          return false;
        }
        this.dialog.showDialog();
    },
    _cancelEvent: function () {
        this.dialog.hideDialog();
    },
    // 分享到群;不改变原有代码，继续调用之前函数
    _shareGroup: function () {
        this.dialog.hideDialog();
        this.shareClick();
    },
    // 分享朋友圈  created by cms_ssa  18- 04 - 26
    _shareFriendsCircle: function () {
        wx.showLoading({
            title: '海报生成中...',
            mask: true
        });

        // 由于不支持async，采用promise的一步步回调
        this.getQrode().then(res => {
            this.creatPost();
        }, err => {
            this.showErr();
        });
    },

    // 获取二维码  created by cms_ssa  18-04-26
    getQrode: function () {
        let ticket = wx.getStorageSync('ticket');
        let data = {
            path: 'pages/GOODSDETAILS/pages/presale/index',
            id: this.data.id,
            share_uid: getApp().globalData.my_uid,
            shareType: "activity",
            activity_type :"presale"
        }
        return new Promise((resolve, reject) => {
            wx.request({
                url: common.Url + '/app.php?c=qrcode&a=share_ewm' + '&store_id=' + common.store_id + '&request_from=wxapp&wx_type=' + common.types + '&wxapp_ticket=' + ticket,
                header: {
                    'Content-Type': 'application/json'
                },
                data: data,
                method: "POST",
                success: (res) => {
                    console.log('获取二维码成功');
                    if (res.statusCode == 200 && res.data && res.data.err_code == 0) {
                        this.setData({
                            qrcodePath: res.data.err_msg
                        });
                        resolve(res);
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            })
        });
    },

    // 创建画报 created by cms_ssa  18-04-26
    creatPost: function () {
        // 设置画报数据
        let canvasData = {
            status: true,
            canvasId: 'productPost',
            canvasWidth: 750,
            canvasHeight: 1181 + 150,
            paddingLeft: 0,
            paddingTop: 0,
            bg_color: '#ffffff',
            bgPath: '../../images/presale_post_bg.png',                // 海报背景图
            heartPath: '../../images/heart.png',                        // 爱心图标
            product_name: this.data.productInfo.product_name,            // 活动名称
            product_dingjin: this.data.productInfo.dingjin,              // 商品定金
            qrcode_right_text: '长按识别小程序码 即可查看~',        // 二维码右边文字
            loadFailTapStatus: false, // 下载失败处理函数是否已执行
            // 图片数据
            avatarPath: this.data.productInfo.avatar, // 用户头像
            qrcodePath: 'https://' + this.data.qrcodePath.split('://')[1],                  // 二维码图片地址
            productImage: 'https://' + this.data.productInfo.image.split('://')[1], // 商品首图
        }
        // 获得自适应屏幕数据
        let obj = canvas.px2rpx({ w: canvasData.canvasWidth, h: canvasData.canvasHeight, base: this.data.winWidth });

        // 赋值海报图参数
        this.setData({
            canvasData: canvasData,
            canvasPosition: obj
        });

        // 下载二维码图片
        let p1 = this.loopDownLoadFile('qrcodePath', this.data.canvasData.qrcodePath);
        // 下载商品首图
        let p2 = this.loopDownLoadFile('productImage', this.data.canvasData.productImage);
        // 下载头像图片
        let p3 = this.loopDownLoadFile('avatarPath', this.data.canvasData.avatarPath);

        // 下载图片资源
        Promise.all([p1, p2, p3])
            .then(res => {
                // console.log(res);
                this.drawCanvas();

                setTimeout(() => {
                    let w = this.data.canvasData.canvasWidth;
                    let h = this.data.canvasData.canvasHeight;

                    this.save({
                        id: this.data.canvasData.canvasId,
                        w: w,
                        h: h,
                        targetW: w * 4,
                        targetH: h * 4
                    });
                }, 500)
            })
            .catch(e => {
                console.log(e);
                this.showErr();
            });

    },

    // 下载海报图所需图片资源 created by cms_ssa  18-04-26
    loopDownLoadFile: function (key, urls) {
        return new Promise((resolve, reject) => {
            if (Array.isArray(urls) && urls.length > 0) {
                this.data.canvasData[name] = [];
                for (let i = 0; i < urls.length; i++) {
                    wx.downloadFile({
                        url: urls[i],
                        success: function (res) {
                            console.info("下载一个文件成功");
                            this.data.canvasData[name].push(res.tempFilePath);
                            this.setData({
                                canvasData: this.data.canvasData
                            });
                            resolve(res);
                        },
                        fail: function (e) {
                            console.info("下载一个文件失败");
                            reject(e);
                        }
                    })
                }
            } else {
                wx.downloadFile({
                    url: urls,
                    success: res => {
                        console.info("下载一个文件成功");
                        this.data.canvasData[key] = res.tempFilePath;
                        this.setData({
                            canvasData: this.data.canvasData
                        })
                        resolve(res);
                    },
                    fail: function (e) {
                        console.info("下载一个文件失败");
                        reject(e);
                    }
                })
            }

        })
    },

    // 绘制海报图 created by cms_ssa  18-04-26
    drawCanvas: function () {
        console.log('begin draw');
        let that = this;
        let w = that.data.canvasData.canvasWidth;
        let h = that.data.canvasData.canvasHeight;
        let left = that.data.canvasData.paddingLeft;
        let top = that.data.canvasData.paddingTop;
        // 内部商品图片偏移量
        let innerLeft = 30;
        // 内部商品图片高度
        let imgH = w - (left + innerLeft) * 2;
        // 头像半径
        let head_r = 53;
        // 二维码半径
        let qrode_r = 95;
        let positionY = 0;
        // 生成画笔
        const ctx = wx.createCanvasContext(that.data.canvasData.canvasId);
        console.log(that.data.canvasData.avatarPath);


        // 绘制白色圆角背景
        canvas.roundRect({
            ctx: ctx,
            x: left,
            y: top,
            w: w - left * 2,
            h: h - top * 2,
            r: 0,
            blur: 20,
            shadow: 'rgba(180,180,180,.4)'
        });

        // 绘制头像
        positionY = top + 47;
        canvas.circleImg({
            ctx: ctx,
            img: that.data.canvasData.avatarPath,
            r: head_r,
            x: left + 69,
            y: positionY,
            w: head_r * 2,
            h: head_r * 2
        });

        // 绘制头像右侧文字
        canvas.drawText({
            ctx: ctx,
            x: left + 69 + head_r * 2 + 22,
            y: positionY + head_r - 10,
            text: '分享这款商品给你',
            baseline: 'bottom',
            fontSize: 24
        });

        canvas.drawText({
            ctx: ctx,
            x: left + 69 + head_r * 2 + 22,
            y: positionY + head_r,
            text: '提前购可享优惠哦~',
            baseline: 'top',
            fontSize: 26
        });

        positionY = positionY + head_r * 2 + 57;
        // 绘制中间容器
        canvas.roundImg({
            ctx: ctx,
            x: left + innerLeft + 20,
            y: positionY - 30,
            img: that.data.canvasData.productImage,
            w: imgH - 40,
            h: imgH - 40,
            r: 14,
            blur: 10,
            shadow: 'rgba(180,180,180,.4)',
            // 是否显示蒙层
            cover: false,
            // 蒙层高度
            coverH: 180
        });


        // 绘制中间容器,商品名称,超出25个字显示两行，多两行，显示省略号
        let product_name_text = that.data.canvasData.product_name
        if(product_name_text.length > 20){
            if(product_name_text.length > 40){
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,39)+"...";
            }else{
                product_name_text =product_name_text.slice(0,20)+'\n'+ product_name_text.slice(20,product_name_text.length);
            }
            canvas.drawMultiText({
                ctx,
                gap:5,
                text: product_name_text,
                x: left + innerLeft + 25,
                y: positionY + imgH - 15,
                baseline: 'bottom',
                fontSize: 28
            })
        }else{
            canvas.drawText({
                ctx: ctx,
                text: product_name_text,
                x: left + innerLeft + 25,
                y: positionY + imgH,
                baseline: 'bottom',
                fontSize: 28
            });
        }

        // 一系列印章,默认各个印章不存在宽度为0,
        let manjian = 0;
        let youhui = 0;
        let zengpin = 0;
        // 满减印章宽度（如果有）
        if (this.data.power.cash && this.data.power.cash * 1 != 0) {
            ctx.font = '24px PingFang-SC-Bold';
            const metrics1 = ctx.measureText(`减${this.data.power.cash}元`).width;
            manjian = metrics1 + 13 * 2 + 14;   // 13是印章padding,14是印章之间的margin

            // 1、满减印章
            canvas.drawText({
                ctx: ctx,
                x: left + innerLeft + 25 + 13,
                y: positionY + imgH - 83 +　149,
                text: `减${this.data.power.cash}元`,
                baseline: 'bottom',
                fontSize: 24,
                color: 'rgb(235,97,0)'
            });
            canvas.roundBorderRect({
                ctx: ctx,
                x: left + innerLeft + 25,
                y: positionY + imgH - 83 - 36 +　149,
                w: metrics1 + 13 * 2,
                h: 42,
                r: 6,
                border: 'rgb(235,97,0)'
            });
        }

        // 优惠券印章存在
        if (this.data.power.coupon) {
            ctx.font = '24px PingFang-SC-Bold';
            const metrics2 = ctx.measureText('赠优惠券').width;
            youhui = metrics2 + 10 * 2 + 14;        // 10是印章padding,14是印章之间的margin

            // 2、优惠券印章
            canvas.drawText({
                ctx: ctx,
                x: left + innerLeft + 25 + manjian + 10,
                y: positionY + imgH - 83　+ 149,
                text: '赠优惠券',
                baseline: 'bottom',
                fontSize: 24,
                color: 'rgb(229,0,79)'
            });
            canvas.roundBorderRect({
                ctx: ctx,
                x: left + innerLeft + 25 + manjian,
                y: positionY + imgH - 83 - 36 + 149,
                w: metrics2 + 10 * 2,
                h: 42,
                r: 6,
                border: 'rgb(229,0,79)'
            })
        }

        // 赠品印章存在
        if (this.data.power.present) {
            ctx.font = '24px PingFang-SC-Bold';
            const metrics3 = ctx.measureText('送赠品').width;
            zengpin = metrics3 + 10 * 2 + 14;

            // 2、赠品印章
            canvas.drawText({
                ctx: ctx,
                x: left + innerLeft + 25 + manjian + youhui + 10,
                y: positionY + imgH - 83 + 149,
                text: '送赠品',
                baseline: 'bottom',
                fontSize: 24,
                color: 'rgb(50,177,108)'
            });


            canvas.roundBorderRect({
                ctx: ctx,
                x: left + innerLeft + 25 + manjian + youhui,
                y: positionY + imgH - 83 - 36+ 149,
                w: metrics3 + 10 * 2,
                h: 42,
                r: 6,
                border: 'rgb(50,177,108)'
            })

        }

        // 商品定金
        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + 25,
            y: positionY + imgH - 25+ 149,
            text: '定金￥',
            baseline: 'normal',
            fontSize: 24,
            color: 'rgb(180,40,45)'
        });

        // 商品定金金额
        ctx.font = '24px PingFang-SC-Bold';
        const metrics4 = ctx.measureText('定金 ￥').width;
        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + 25 + metrics4,
            y: positionY + imgH - 25+ 149,
            text: this.data.canvasData.product_dingjin,
            baseline: 'normal',
            fontSize: 40,
            color: 'rgb(180,40,45)'
        });

        //绘制分割线
        canvas.roundBorderRect({
            ctx,x:left + innerLeft + 20, y:positionY + imgH + 149 + 20, h:0.1, w:imgH - 40, r:0,border:"#eeeeee"
        })

        // 绘制二维码
        positionY = positionY + imgH - 30;
        canvas.drawImage({
            ctx: ctx,
            img: that.data.canvasData.qrcodePath,
            x: left + innerLeft,
            y: positionY + 65+ 149 + 20,
            w: qrode_r * 2,
            h: qrode_r * 2
        });

        canvas.drawText({
            ctx: ctx,
            x: left + innerLeft + qrode_r * 2 + 41,
            y: positionY + 65 + qrode_r+ 149 + 20,
            text: '长按识别小程序码 查看详情~',
            baseline: 'middle',
            fontSize: 26
        });

        // 最终绘出画布
        ctx.draw();

        console.log('draw end');
    },

    // 画图 18-04-24 created by cms_ssa
    save: function (o) {
        canvas.canvasToTempFilePath(o).then((res) => {
            console.log(res);
            wx.hideLoading();
            o.imgSrc = res.tempFilePath;
            canvas.saveImageToPhotosAlbum(o).then((res) => {
                console.log(res);
                wx.showModal({
                    title: '存图成功',
                    content: '图片成功保存到相册了，去发圈噻~',
                    showCancel: false,
                    confirmText: '好哒',
                    confirmColor: '#72B9C3',
                    success: res => {
                        if (res.confirm) {
                            console.log('用户点击确定');
                            this.dialog.hideDialog();
                            wx.previewImage({
                                urls:[o.imgSrc],
                                current:o.imgSrc
                            })
                        }
                    }
                })
            }, err => {
                console.log('保存图片失败');
                this.showErr();
            });
        }, err => {
            console.log(err);
            this.showErr();
        });
    },

    showErr: function () {
        wx.hideLoading();
        wx.showModal({
            title: '失败',
            content: '海报图保存失败，用户取消或未开启保存到相册权限',
            showCancel: false,
            confirmText: '去开启',
            confirmColor: '#72B9C3',
            success: res => {
                if (res.confirm) {
                    this.dialog.hideDialog();
                    wx.openSetting({})
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
      clearTimeout(publicFun.paytimer);
      clearTimeout(publicFun.timer);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      clearTimeout(publicFun.paytimer);
      clearTimeout(publicFun.timer);
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
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        // console.log(e.detail.target.dataset.bindtap);
        if (!app.isLoginFun(this)) {//判断用户是否登录
          common.setUserInfoFun(this,app);
          return false;
        }

        let bindType = e.detail.target.dataset.bindtap;
        publicFun.formSubmit({
            e: e,
            that: that,
            callBack: that[bindType]
        });
    },
    officialAccountError(error) {
        console.log('关注公众号组件加载失败，具体原因：' + error.detail.errMsg);
        console.log({error});
        this.setData({
            applet_guide_subscribe: false
        })
    }


})
