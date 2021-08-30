var publicFun = require('../../../utils/public.js');
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var app = getApp();
Page({
    data: {
        order_no: '',
        orderData: '',
        has_return: true,
        orderAddress: true,
        flag:true,
        postage: true,
        showMessage: false, // 查看留言信息
        open_community_group: 0,//是否是社区团购模式订单
        showMoreTxt: '展开',
        writeLen: 5,//核销列表，默认最多展示条数
    },
    onLoad: function(e) { // 页面渲染完成
        var that = this;
        console.log(e);
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        this.setData({
            order_no: e.order,
            //order_no: 'PIG20170310144011781341'
        });
        if (!app.isLoginFun(that)) {//判断用户是否登录
            return false;
        }
    },
    onShow:function(){
      var that = this;
      publicFun.open_community_group(that); //判断是否是社区团购模式
    },
    onReady: function(e) {
        var that = this;
        common.post('app.php?c=order&a=detail&order_no=' + this.data.order_no, '', "orderData", that);
    },
    orderData: function(result) {
        if (result.err_code == 0) {
            if (result.err_msg.order.shipping_method == 'selffetch') {
                result.err_msg.shopData = result.err_msg.user_address;
                result.err_msg.shopData.logo = result.err_msg.store.logo;
                if(result.err_msg.order.verify_image_code_type==1){
                    this.setData({
                        flag:true
                    });
                }
                else{
                    this.setData({
                        flag: false,
                    });
                }
            }
            if (result.err_msg.order.status == '7') {
                for (var i in result.err_msg.product_list) {
                    if (result.err_msg.product_list[i].has_return) {
                        this.setData({
                            has_return: false,
                        });
                        break
                    } else {
                        this.setData({
                            has_return: true,
                        });

                    }
                }
            }

          // // 是否折叠商品列表
          let lists = result.err_msg.product_list;
          if (lists){
            if (lists.length < 5) {
              this.setData({
                NUM: lists.length,
                slide: 'down',
                slide_txt: '收起'
              })
            } else {
              this.setData({
                NUM: 5,
                slide: 'up',
                slide_txt: '展开全部'
              })
            }
          }
          

            result.err_msg.order.add_time_txt = publicFun.setDate(result.err_msg.order.add_time)
            result.err_msg.order.pay_time_txt = publicFun.setDate(result.err_msg.order.paid_time)
            if(result.err_msg.deliver_data && result.err_msg.deliver_data.deliver_list){
                let { deliver_list }= result.err_msg.deliver_data
                publicFun.setDeliverDataIndexNum(deliver_list)
            }

            this.setData({
                orderData: result.err_msg
            })
            publicFun.statusTitle(result.err_msg.order.status) //设置标题
            publicFun.barTitle(this.data.orderData.store.name) //设置标题
          
        };

    },
    cancelOrder: function (e) { //取消订单
        var that = this;
        publicFun.cancelOrder(that, that.data.order_no, 0, callback);
        function callback() {
            wx.navigateBack({
                delta:1
            })
        }
    },
    paymentGo: function() { //去支付
        var order_no = this.data.order_no;
        wx.navigateTo({ url: '/pages/payment/index?order_no=' + order_no +'&paystatus=waitpay' });
    },
    joinGo: function(e) { //跳转参团页面
        var that = this;
        publicFun.joinGo(e, that)
    },
    completeReceipt: function(e) { //确认收货
        var that = this;
        let order_no = this.data.order_no;
        console.log(order_no);
        publicFun.completeReceipt(order_no, that);
    },
    completeOrder: function(e) { //交易完成
        var that = this;
        let order_no = this.data.order_no;
        console.log(order_no);
        publicFun.completeOrder(order_no, that);
    },
    addressGo: function(e) { //我的地址
        wx.navigateTo({ url: '/pages/address/index' })
    },
    applyRefundGo: function(e) { //跳转申请退货页面
        var that = this;
        let status = e.currentTarget.dataset.status;
        let type = e.currentTarget.dataset.type;
        let id = e.currentTarget.dataset.id;
        if (status*1 == 2 && type*1 == 6) {
            return publicFun.warning('拼团进行中订单暂不可退！', that);
        }
        common.post('app.php?c=return&a=apply&pigcms_id=' + id + '&order_no=' + this.data.order_no, '',(res)=> {
            if (res.err_code === 0) {
              publicFun.applyRefundGo(e)
              return false
            } else {
							return publicFun.warning(err_msg, that);
						}
        }, '');
        // publicFun.applyRefundGo(e)
    },
    // 申请退款置灰提示信息
    goldRefund:function(){
      let that = this;
      return publicFun.warning(that.data.orderData.order.privilege_name+'余额支付暂不支持退款', that);
    },
    returnGo: function(e) { //跳转退货详情页面
        publicFun.returnGo(e)
    },
    applyRightsGo: function(e) { //跳转申请维权页面
        publicFun.applyRightsGo(e)
    },
    rightsGo: function(e) { //跳转维权详情页面
        publicFun.rightsGo(e)
    },
    calling: function(e) { //拨打电话
        let num = e.target.dataset.num;
        publicFun.calling(num)
    },
    logistics: function(e) { //查看物流信息
        var that = this;
        publicFun.logistics(e, that)
    },
    appointment: function() { //预约核销
        var that = this;
        if (that.data.appointment) {
            that.setData({
                appointment: false
            })
            return
        }
        that.setData({
            appointment: true
        })
    },
    productcoupon(e){
        let {id,status,index} = e.currentTarget.dataset;
        if(status && status != 0){
            return false;
        }
        if(this.data.productcoupon){
            this.setData({
                productcoupon:false
            })
        }else{
            wx.showToast({title: "正在加载...", icon: "loading"})
            common.post('app.php?c=order&a=get_qrcode_by_code', {id}, res => {
                wx.hideLoading()
                if (res.err_code == 0) {
                    this.setData({
                        'orderData.productcoupon_qrcode': res.err_msg,
                        'orderData.productcoupon_qrcode_code': res.err_msg.split('id=')[1],
                        'orderData.productcoupon_qrcode_index': index,
                        productcoupon: true
                    })
                } else {
                    wx.showToast({
                        title: res.err_msg,
                        icon: "none",
                        duration: 2000
                    })
                }
            }, '')
        }
    },
    // 复制商品券核销code
    copy_productcoupon_qrcode_code(e){
        let {code} = e.currentTarget.dataset
        wx.setClipboardData({
            data:code
        })
    },
    selffetch: function(e) { //自提二维码
        var that = this;
        if (that.data.selffetch) {
            that.setData({
                selffetch: false,
            })
            return
        }
        that.setData({
            selffetch: true
        })
    },
    showMessage: function (e) { //查看留言
        var that = this;
        that.setData({
            'showMessage': true
        })
    },
    showPayment: function (e) { //查看订单(留言弹窗内)
        var that = this;
        that.setData({
            'showMessage': false
        })
    },
    finalPayment: function (e) { // 支付尾款
        var that = this;
        var data = {
            order_id: that.data.orderData.order.order_id
        }
        common.post('app.php?c=order&a=presale_add', data, "getOrder", that);
    },
    getOrder: function (res) { // 支付尾款回调
        var that = this;
        wx.navigateTo({
            url: '/pages/payment/index?order_no=' + res.err_msg,
        })
    },
    //周期购的订单，点击我要延期
    deliverDelay(e){
        let that = this;
        let {id,order_no,status,delay_num,prolong_num} = e.currentTarget.dataset;
        if(parseInt(status) !== 0)return;
        if(parseInt(prolong_num) >= 0 && parseInt(delay_num) >= parseInt(prolong_num)){
            return wx.showModal({
                showCancel:false,
                title:"操作提示",
                confirmColor:app.globalData.navigateBarBgColor || "#3CC51F",
                content: `本单最多可延期${prolong_num}次，您已延期${delay_num}次, 不能再次延期`
            })
        }
        let modalContent = `本单最多可延期${prolong_num}次，您已延期${delay_num}次。确定要${parseInt(delay_num) > 0?"再次":""}延期吗？`
        if(parseInt(prolong_num) < 0){
            modalContent = `您已延期${delay_num}次。确定要${parseInt(delay_num) > 0?"再次":""}延期吗？`
        }
        wx.showModal({
            title:"我要延期",
            content:modalContent,
            confirmColor:app.globalData.navigateBarBgColor || "#3CC51F",
            success(o){
                if(o.cancel)return false
                wx.showToast({
                    title:"正在请求延期...",
                    icon:"loading",
                    duration: 10000
                })
                common.post('app.php?c=order&a=deliver_delay',{id,order_no},res=>{
                    if(res.err_code === 0){
                        let {list,delay_num} = res.err_dom
                        that.setData({
                            'orderData.deliver_data.delay_num':delay_num,
                            'orderData.deliver_data.deliver_list':publicFun.setDeliverDataIndexNum(list)
                        })
                        wx.showToast({
                            title: res.err_msg,
                            icon: 'success',
                            duration: 1500
                        })
                    }else{
                        wx.showToast({
                            title:"延期失败",
                            icon: 'none',
                            duration: 1500
                        })
                    }
                },'')
            }
        })
    },
    //查看周期购的快递物流信息
    viewExpressDetail(e){
        if(this.data.orderData.deliver_data.express && this.data.orderData.deliver_data.express.layer_show){
            return this.setData({
                'orderData.deliver_data.express.layer_show':false
            })
        }
        let {package_id} = e.currentTarget.dataset;
        wx.showLoading({mask:true,title:"正在查询..."})
        if(this.data.orderData.order.shipping_method =='local'){
            common.post('app.php?c=order&a=getLocalPackage',{package_id,order_id:this.data.orderData.order.order_id},res=>{
                wx.hideLoading();
                if (res.err_code == 0) {
                    res.err_msg.nowOrder.add_time = util.formatTime(new Date(res.err_msg.nowOrder.add_time * 1000))
                    res.err_msg.nowPackage.add_time = util.formatTime(new Date(res.err_msg.nowPackage.add_time * 1000))
                    res.err_msg.nowPackage.send_time = util.formatTime(new Date(res.err_msg.nowPackage.send_time * 1000))
                    res.err_msg.nowPackage.arrive_time = util.formatTime(new Date(res.err_msg.nowPackage.arrive_time * 1000))
                    this.setData({
                        'orderData.deliver_data.express.layer_show': true,
                        'orderData.deliver_data.express.list': res.err_msg
                    })
                }
            },'')
        }else{
            common.post('app.php?c=order&a=getExpress', {package_id}, res => {
                wx.hideLoading();
                if (res.err_code == 0) {
                    this.setData({
                        'orderData.deliver_data.express.layer_show': true,
                        'orderData.deliver_data.express.list': res.err_msg.data
                    })
                }
            }, '')
        }

    },
    makePhoneCall(e) {
        let tel = e.target.dataset.tel
        wx.makePhoneCall({
            phoneNumber:tel
        })
    },
  //显示展开商品列表
  showList: function () {
    let slide = this.data.slide;
    let datas = this.data.orderData;
    let len_goods = datas.product_list.length ? datas.product_list.length:100;
    // 是否折叠商品列表
    let NUM = 5;
    if (slide == 'up') {
      this.setData({
        slide: 'down',
        NUM: len_goods,
        slide_txt: '收起'
      })
    } else {
      this.setData({
        slide: 'up',
        NUM: 5,
        slide_txt: '展开全部'
      })
    }
  },
  // 点击展示商品留言
  showDialogMsg: function () {
    let that = this;
    this.setData({
      showModal: true
    })
  },
  oppeMap: function (e) {
    console.log(e)
    let latitude = parseFloat(e.target.dataset.lat)
    let longitude = parseFloat(e.target.dataset.long)

    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  calling: function (e) { //拨打电话
    let num = e.target.dataset.num;
    publicFun.calling(num)
  },
  //核销二维码
  writeCode:function(e){
    let that = this;
    console.log(e);
    let writetype = e.currentTarget.dataset.writetype;
    let data = {
        type: writetype
    }
    if(writetype == 0){
        data.card_no = e.currentTarget.dataset.order_no
    }else if(writetype == 1){
        data.card_no = e.currentTarget.dataset.cardno
    }
    wx.showToast({title: "正在加载...", icon: "loading"})
    common.post("app.php?c=order&a=get_virtual_qrcode", data, function callBack(res) {
        wx.hideLoading();
        if (res.err_code == 0) {
            that.setData({
                'orderData.productcoupon_qrcode': res.err_msg,
                'orderData.productcoupon_qrcode_code': res.err_msg.split('id=')[1],
                'orderData.productcoupon_qrcode_index': e.currentTarget.dataset.idx + 1,
                productcoupon: true
            })
        } else {
            wx.showToast({
                title: res.err_msg,
                icon: "none",
                duration: 2000
            })
        }
    }, '')
  },
  //展开收起核销码列表
  showMore:function(){
      let that = this;
      let writeLen = that.data.orderData.write_off_code.length
      if(that.data.showMoreTxt == '展开'){
        that.setData({
            showMoreTxt: '收起',
            writeLen: writeLen
        })
      }else{
        that.setData({
            showMoreTxt: '展开',
            writeLen: 5
        })
      }
  },
  // 复制
  cardCopy:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.cardnum,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  }, 
//  复制
  copyText: function (e) {
       console.log(e)
        wx.setClipboardData({
          data: e.currentTarget.dataset.text,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                wx.showToast({
                  title: '复制成功'
                })
              }
            })
          }
        })
  }
})
