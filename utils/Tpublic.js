/**@author wangmu 2016-12-8**/
/**拼团功能的公共方法**/
var common = require('common.js');
var area = require('area.js');
var bus = require('./bus.js')
var publicFun = {};

publicFun.height = function(that) { //设置页面高度
    wx.getSystemInfo({
        success: function(res) {
            that.setData({
                scrollHeight: res.windowHeight
            });
        }
    });
};
publicFun.menuGo = function(e) { //头部导航跳转
    let cat_fid = e.target.dataset.fid;
    let cat_id = e.target.dataset.id;
    if (cat_fid * 1 == 0 && cat_id * 1 == 0) {
        wx.redirectTo({ url: '/pages/index/index' })
        return
    }
    wx.redirectTo({ url: '/pages/category/index?cat_fid=' + cat_fid + '&cat_id=' + cat_id })
};
publicFun.category = function(that) {
    common.tuanPost('webapp.php?c=tuan&a=tuan_cate&cat_fid=' + that.data.cat_fid + '&cat_id=' + that.data.cat_cid, '', "setIndexData", that);
}
publicFun.setPushData = function(result, that, listData) {
    let list = that.data.indexData.tuan_list;
    for (var i = 0; i < result.err_msg.tuan_list.length; i++) {
        list.push(result.err_msg.tuan_list[i]);
    }
    that.setData({
        'indexData.tuan_list': list
    });
};
publicFun.detailsGo = function(e) { //跳转详情页面
    //let store_id = e.currentTarget.dataset.store;
    let tuan_id = e.currentTarget.dataset.tuan;
    if (tuan_id == undefined) {
        return
    }
    wx.redirectTo({ url: '/pages/GOODSDETAILS/pages/details/index?tuan_id=' + tuan_id })
};
publicFun.swichNav = function(e, that) { //点击tab切换
    if (that.data.currentTab === e.currentTarget.dataset.current) {
        return false;
    } else {
        that.setData({
            currentTab: e.currentTarget.dataset.current
        })
    }
};
publicFun.closePromptMess = function(that) { //关闭提示框遮罩层
    that.setData({
        'prompt.promptMess': false
    })
};
publicFun.oppenPromptMess = function(that) { //显示提示框
    that.setData({
        'prompt.promptMess': true
    })
};
publicFun.goBack = function(e) { //返回上一页
    wx.navigateBack(1)
};
publicFun.formatStr = function(str) { //替换空格换行
    str = str.replace(/&nbsp;/g, " ");
    str = str.replace(/<br>/g, " ");
    return str
};
publicFun.barTitle = function(title) { //修改页面标题
    wx.setNavigationBarTitle({
        title: title
    });
};
publicFun.status = function(status, that) { //拼团状态修改
    switch (status) {
        case 1:
            return that.setData({
                tuanStatus: '未开始'
            });
        case 2:
            return that.setData({
                tuanStatus: '拼团中'
            });
        case 3:
            return that.setData({
                tuanStatus: '成功'
            });
        case 4:
            return that.setData({
                tuanStatus: '失败'
            });
    }
};
publicFun.closeShopping = function(that) { //关闭购物袋遮罩层
    that.setData({
        'shoppingData.shoppingShow': false
    })
};

publicFun.oppenShopping = function(e, that) { //开启购物袋遮罩层
    if (!getApp().isLoginFun(that)) {//判断用户是否登录
      common.setUserInfoFun(that, getApp());
      return false;
    }
    let item_id = e.target.dataset.item;
    let tuan_id = e.target.dataset.tuan;
    let team_id = e.target.dataset.team;
    let type = e.target.dataset.type;
    common.tuanPost('webapp.php?c=tuan&a=tuan_info&tuan_id=' + tuan_id + '&item_id=' + item_id + '&type=' + type + '&team_id=' + team_id, '', shoppingData, '');
    that.setData({
        'shoppingData.shoppingShow': true,
        'shoppingData.shoppingNum': 1,

        'shoppingData.specList[0].vid': '',
        'shoppingData.value[0]': '',
        'shoppingData.specList[1].vid': '',
        'shoppingData.value[1]': '',
        'shoppingData.specList[2].vid': '',
        'shoppingData.value[2]': ''
    });

    function shoppingData(result) { //购物袋数据
        if (result.err_code == 0) {
            that.setData({
                'shoppingData.shoppingCatData': result.err_msg
            });
            let {sku_list, property_list} = result.err_msg
            // 单规格默认选中
            if(sku_list && sku_list[0] && !sku_list[1]){
                for (let [index,propertyListElement] of property_list.entries()) {
                    let {pid,values:[{vid}]} = propertyListElement
                    that.setData({
                        [`shoppingData.specList[${index}].vid`]:vid,
                        [`shoppingData.value[${index}]`]:`${pid}:${vid}`
                    })
                }
                publicFun.skuPrice(that);
            }
        }
    }
};
publicFun.scrollTopFun = function(e, that) {
    if (e.detail.scrollTop > 300) { //触发gotop的显示条件
        that.setData({
            'scrollTop.goTop_show': true
        });
    } else {
        that.setData({
            'scrollTop.goTop_show': false
        });
    }
};
publicFun.goTopFun = function(e, that) {
    var _top = that.data.scrollTop.scroll_top; //发现设置scroll-top值不能和上一次的值一样，否则无效，所以这里加了个判断
    if (_top == 1) {
        _top = 0;
    } else {
        _top = 1;
    }
    that.setData({
        'scrollTop.scroll_top': _top
    });
};
publicFun.dataCode = function (data, type) { //日期时间戳---格式任选
    var date = new Date(data);
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var h = date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours();
    var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes();
    var s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds();
    switch (type) {
        case 'full':
            return data = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
            break;
        case 'year':
            return data = Y + '-' + M + '-' + D;
            break;
        case 'date':
            return data = M + '-' + D;
            break;
        case 'time':
            return data = h + ':' + m + ':' + s;
            break;
        case 'full_fenzhong':
            return data = Y + '-' + M + '-' + D + ' ' + h + ':' + m;
            break;
        default:
            return data = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
    }
};
publicFun.warning = function(txt, that) { //弹出警告提示框
    that.setData({
        'warning.warningShow': true,
        'warning.warningTxt': txt
    });
    setTimeout(function() {
        that.setData({
            'warning.warningShow': false
        })
    }, 1000);
};
publicFun.shoppingVid = function(e, that) { //购物袋商品规格选择
    let id = e.target.dataset.id;
    let vid = e.target.dataset.vid;
    let pid = e.target.dataset.pid;
    if (that.data.shoppingData.specList[id].vid === vid) {
        return false;
    } else {
        that.setData({
            [`shoppingData.specList[${id}].vid`]: vid,
            [`shoppingData.value[${id}]`]: pid + ':' + vid
        });
    }
    publicFun.skuPrice(that);
};
publicFun.skuPrice = function (that) { //判断商品规格信息
  let valueDate = '';
  let skuPriceData = that.data.shoppingData.shoppingCatData.sku_list; //商品规格列表
  let quantity = that.data.shoppingData.shoppingCatData.product.quantity * 1; //之前选中的商品规格组合的库存数量
  let shoppingNum = that.data.shoppingData.shoppingNum * 1; //输入框数量
  let buyer_quota = that.data.shoppingData.shoppingCatData.product.buyer_quota * 1; //商品限购数量
  let buy_quantity = 0;
  if (typeof that.data.shoppingData.shoppingCatData.product.buy_quantity === 'undefined') {
    let buy_quantity = that.data.shoppingData.shoppingCatData.product.buy_quantity * 1; //商品已购买数量
  }
  if (skuPriceData) {//有的商品可能没有规格,//在商品列表页可能出现bug
    quantity = skuPriceData.reduce(function (prev, next) {
      return parseInt(prev) + parseInt(next.quantity)
    }, 0);//获取当前规格商品的总量
  }
  if (quantity <= 0) {
    that.setData({
      'shoppingData.shoppingNum': quantity    //0
    });
    return publicFun.warning('商品已经卖完了', that);
  } else if (shoppingNum === 0) {//如果有库存并且添加的商品数量为0，则改为默认添加一个商品
    that.setData({
      'shoppingData.shoppingNum': 1
    })
  }
  if ((skuPriceData == '' || skuPriceData == undefined) && shoppingNum > quantity) { //商品无规格时判断商品库存
    that.setData({
      'shoppingData.shoppingNum': quantity
    });
    return publicFun.warning('库存只有' + quantity + '个', that);
  }
  if ((shoppingNum > (buyer_quota - buy_quantity)) && buyer_quota > 0) {
    that.setData({
      'shoppingData.shoppingNum': (buyer_quota - buy_quantity)
    });
    if (buy_quantity != 0) {
      return publicFun.warning('此商品限购' + buyer_quota + '个,你已购买' + buy_quantity + '个', that);
    }
    return publicFun.warning('此商品限购' + buyer_quota + '个', that);
  }
  for (let i in that.data.shoppingData.value) { //添加规格列表
    if (that.data.shoppingData.value[i]) {
      valueDate += that.data.shoppingData.value[i] + ';'
    }

  }
  valueDate = valueDate.substring(0, valueDate.length - 1);
  for (let i in skuPriceData) { //判断规格产品的库存以及价格
    if (valueDate == skuPriceData[i].properties) {//当选中所用规格的时候进入到这里
      if (skuPriceData[i].quantity == 0) {//库存为0，重置添加的商品数量为0
        that.setData({
          'shoppingData.shoppingNum': skuPriceData[i].quantity, //0
          'shoppingData.shoppingCatData.product.quantity': skuPriceData[i].quantity //0
        });
        return publicFun.warning('没有库存了,选择其他商品吧', that);
      }

      that.setData({
        'shoppingData.shoppingCatData.product.price': skuPriceData[i].price,
        'shoppingData.shoppingCatData.product.quantity': skuPriceData[i].quantity,
        'shoppingData.sku_id': skuPriceData[i].sku_id
      });
      if (skuPriceData[i].quantity < shoppingNum) {
        that.setData({
          'shoppingData.shoppingNum': skuPriceData[i].quantity
        });
        return publicFun.warning('库存只有' + skuPriceData[i].quantity + '个', that);
      }
    } else if (skuPriceData[i].properties && (skuPriceData[i].properties.indexOf(valueDate) > -1)) {//当没选中部分规格进入到这里
      let skuPriceData_sub = skuPriceData.filter(function (item) {//获取所有能与当前规格组合的商品规格列表
        return item.properties.indexOf(valueDate) > -1
      });
      let allQuantity = skuPriceData_sub.reduce(function (prev, next) {//获取当前规格商品的总量
        return parseInt(prev) + parseInt(next.quantity)
      }, 0);
      let minPrice = skuPriceData_sub.reduce(function (prev, next) {//获得当前商品规格的最低价
        return prev > next.price ? next.price : prev
      }, skuPriceData[i].price)
      that.setData({
        'shoppingData.shoppingCatData.product.price': minPrice,
        'shoppingData.shoppingCatData.product.quantity': allQuantity
      });
      if (allQuantity < shoppingNum) {//如果添加的商品数量大于当前添加商品总数，则提示库存不足，并且重置购买数量为当前规格商品总量
        that.setData({
          'shoppingData.shoppingNum': allQuantity
        });
        return publicFun.warning('库存只有' + allQuantity + '个', that);
      }
      break;//这里选中部分规格只需要判断一次就跳出循环
    }
  }
  console.log(that.data.shoppingData);
};
publicFun.plus = function(that) { //加
    that.data.shoppingData.shoppingNum++;
    that.setData({
        'shoppingData.shoppingNum': that.data.shoppingData.shoppingNum
    });
    publicFun.skuPrice(that);
};
publicFun.reduce = function(that) { //减
    if (that.data.shoppingData.shoppingNum <= 1) {
        return
    }
    that.data.shoppingData.shoppingNum--;
    that.setData({
        'shoppingData.shoppingNum': that.data.shoppingData.shoppingNum
    });
};
publicFun.shoppingBlur = function(e, that) { //输入数量
    if (that.data.shoppingData.shoppingNum == 0) {
        that.setData({
            'shoppingData.shoppingNum': 1
        })
    }
    that.setData({
        'shoppingData.shoppingNum': e.detail.value
    });
    publicFun.skuPrice(that);

};
publicFun.payment = function(data, that) { //去支付
    if (that.data.shoppingData.shoppingNum*1 == 0) {
        return publicFun.warning('请选择购买数量', that);
    }
    if (that.data.shoppingData.sku_id == '' && (that.data.shoppingData.shoppingCatData.sku_list != '' && that.data.shoppingData.shoppingCatData.sku_list != undefined)) {
        return publicFun.warning('请选择商品规格', that);
    }
    publicFun.warning('订单处理中，请稍后...', that);
    common.tuanPost('webapp.php?c=tuan&a=order', data, payment, '');

    function payment(result) { //去支付
        console.log(result.err_msg.order_no, 'eda')
        if (result.err_code == 1010) {
            publicFun.promptMsg(result.err_msg.msg_txt, '知道了', '', right);

            function right() {
                // wx.navigateTo({ url: '/pages/order/index?order=' + result.err_msg.order_no })
                wx.navigateTo({ url: '/pages/payment/index?order_no=' + result.err_msg.order_no })
                // pages/payment/index?order_no=YG20200904132824759564&joinGroup=joinGroup
            }
        }
        if (result.err_code == 0) {
            var order_no = result.err_msg.order_no;
            publicFun.paymentGo(order_no)
        }
    };
};
publicFun.paymentGo = function(order_no) { //去支付
    wx.redirectTo({ url: '/pages/payment/index?order_no=' + order_no + '&joinGroup=joinGroup' });
};
publicFun.collection = function(that) { //收藏点击
    if (!getApp().isLoginFun(that)) {//判断用户是否登录
      return false;
    }
    let tuan_id = that.data.dateilsData.tuan.tuan_id;
    if (that.data.dateilsData.tuan.is_collect == 0) {
        common.tuanPost('webapp.php?c=tuan&a=add_collect&tuan_id=' + tuan_id, '', collection, '');
    } else {
        common.tuanPost('webapp.php?c=tuan&a=del_collect&tuan_id=' + tuan_id, '', collection, '');
    }

    function collection(result) { //收藏结果
        if (result.err_code == 0) {
            if (that.data.dateilsData.tuan.is_collect == 1) {
                that.setData({
                    'dateilsData.tuan.is_collect': 0
                })
            } else {
                that.setData({
                    'dateilsData.tuan.is_collect': 1
                })
            }
        }
    }
};
publicFun.joinGo = function(e, that) { //参团路由
    let tuan_id = e.target.dataset.tuan;
    let team_id = e.target.dataset.team;
    let item_id = e.target.dataset.item;
    let type = e.target.dataset.type;
    wx.navigateTo({ url: '/pages/GOODSDETAILS/pages/join/index?tuan_id=' + tuan_id + '&team_id=' + team_id + '&item_id=' + item_id + '&type=' + type });
};
publicFun.orderGo = function(e) { //跳转订单详情
    let order = e.target.dataset.order;
    wx.navigateTo({ url: '/pages/order/index?order=' + order });
};
publicFun.completeCollage = function(e, that) { //确认订单
    publicFun.promptMsg('确定完成拼团么', '确定', '取消', completeCollage);

    function completeCollage() { //确认按钮之后的操作
        let tuan_id = e.target.dataset.tuan;
        let team_id = e.target.dataset.team;
        let index = e.target.dataset.index;
        common.tuanPost('webapp.php?c=tuan&a=over&tuan_id=' + tuan_id + '&team_id=' + team_id, '', completeCollage, '');

        function completeCollage(result) { //请求数据成功的操作
            that.data.orderlistData.order_list[index].tuan_over = false;
            that.data.orderlistData.order_list[index].status_txt = '成功';
            that.setData({
                orderlistData: that.data.orderlistData
            })

        }
    }
};

publicFun.promptMsg = function(msg, confirm, cancel, callFun) { //提示警告框
    let showCancel = true;
    if (cancel == '') {
        showCancel = false;
    }
    wx.showModal({
        title: '提示信息',
        content: msg,
        confirmText: confirm,
        cancelText: cancel,
        confirmColor: '#fe6b31',
        showCancel: showCancel,
        success: function(res) {
            if (res.confirm) {
                callFun(res);
            }
        }
    })
};
publicFun.defaultAddress = function(e, that, address_id, go) { //默认地址选择
    if (e == 0) {
        var address_id = address_id;
    } else {
        var address_id = e.target.dataset.addid;
    }
    common.tuanPost('app.php?c=address&a=set_default&address_id=' + address_id, '', defaultAddress, '');

    function defaultAddress(result) {
        if (go == 'geo') {
            publicFun.freight(that, address_id);
            return
        }
        publicFun.swichNav(e, that);
        if (go == 'go') {
            publicFun.freight(that, address_id);
        }

    }
};
publicFun.delAddress = function(e, that) { //删除地址
    publicFun.promptMsg('确定删除此地址么?', '确定', '取消', delAddress);

    function delAddress() { //确认按钮之后的操作
        let address_id = e.target.dataset.addid;
        let index = e.target.dataset.index;
        delete that.data.addressData[index];
        that.setData({
            addressData: that.data.addressData
        })
        common.tuanPost('app.php?c=address&a=delete&address_id=' + address_id, '', delAddress, '');

        function delAddress() { //请求数据成功的操作
            delete that.data.addressData[index];
            that.setData({
                addressData: that.data.addressData
            })
        }
    }
};
publicFun.cancelOrder = function (that, order_no, index, callback) { //取消订单
    publicFun.promptMsg('确定取消此订单么?', '确定', '取消', cancelOrder);

    function cancelOrder() {
        common.tuanPost('app.php?c=order&a=cancel&order_no=' + order_no, '', cancelOrder, '');

        function cancelOrder(result) {
            if (result.err_code == 0) {
                // if (index != undefined) { //删除列表数据

                //     delete that.data.orderlistData.order_list[index];
                //     that.setData({
                //         'orderlistData.order_list': that.data.orderlistData.order_list
                //     })
                //     return
                // }
                // wx.navigateTo({ url: '/pages/user/order/orderList?currentTab==0' });
                typeof callback == "function" && callback()
            };
        }
    }
};
publicFun.cancelReturn = function(that, order_no, index) { //取消订单
    publicFun.promptMsg('确定取消退货么?', '确定', '取消', cancelReturn);

    function cancelReturn() {
        common.tuanPost('app.php?c=return&a=cancel&return_id=' + order_no, '', cancelReturn, '');

        function cancelReturn(result) {
            if (result.err_code == 0) {
                if (index != undefined) { //删除列表数据
                    delete that.data.orderlistData.return_list[index];
                    that.setData({
                        'orderlistData.return_list': that.data.orderlistData.return_list
                    })
                    return
                }
                wx.navigateTo({ url: '/pages/myServer/index' });
            };
        }
    }
};

publicFun.statusTitle = function(status) { //订单详情页面标题
    switch (status) {
        case 0:
            publicFun.barTitle('临时订单');
            break;
        case 1:
            publicFun.barTitle('未支付');
            break;
        case 2:
            publicFun.barTitle('未发货');
            break;
        case 3:
            publicFun.barTitle('已发货');
            break;
        case 4:
            publicFun.barTitle('已完成');
            break;
        case 5:
            publicFun.barTitle('已取消');
            break;
        case 6:
            publicFun.barTitle('退款中');
            break;
        case 7:
            publicFun.barTitle('已收货');
            break;
    }
};
publicFun.orderPushData = function(page, that, url) { //订单相关页面下拉加载
    if (that.data.orderlistData.next_page == false) {
         return
    }
    common.tuanPost(url, '', setPushData, '');

    function setPushData(result) { //添加数据
        let list = that.data.orderlistData.order_list;
        for (var i = 0; i < result.err_msg.order_list.length; i++) {
            list.push(result.err_msg.order_list[i]);
        }
        that.setData({
            'orderlistData.order_list': list,
            'orderlistData.next_page': result.err_msg.next_page
        });
    }
};
publicFun.completeOrder = function(order_no, that, index) { //完成订单-订单页面
    publicFun.promptMsg('确定完成订单么', '确定', '取消', completeOrder);

    function completeOrder() { //确认按钮之后的操作
        common.tuanPost('app.php?c=order&a=complete&order_no=' + order_no, '', completeOrder, '');

        function completeOrder() { //请求数据成功的操作
            try {
                if (index != undefined) { //删除列表数据

                    that.data.orderlistData.order_list[index].status = 4;
                    that.setData({
                        'orderlistData.order_list': that.data.orderlistData.order_list
                    })
                    return
                } else {
                    that.data.orderData.order.status = 4;
                    that.setData({
                            'orderData': that.data.orderData
                        })
                 }
            } catch (e) {
                // Do something when catch error
            }

        }
    }
};
publicFun.completeReceipt = function(order_no, that, index) { //确认收货-订单页面
    publicFun.promptMsg('确定收到货了么', '确定', '取消', completeReceipt);

    function completeReceipt() {
        common.tuanPost('app.php?c=order&a=receive&order_no=' + order_no, '', completeReceipt, '');


        function completeReceipt() {
            try {

                if (typeof index != 'undefined') { //删除列表数据

                    that.data.orderlistData.order_list[index].status = 7;
                    that.setData({
                        'orderlistData.order_list': that.data.orderlistData.order_list
                    })
                    return
                } else {
                    that.data.orderData.order.status = 7;
                    that.setData({
                        'orderData.order.status': that.data.orderData.order.status
                    })
                }
            } catch (e) {
                // Do something when catch error
            }
        }
    }
};
publicFun.returnGo = function (e) { //查看退货
    let id = e.target.dataset.id;
    let order_no = e.target.dataset.order;
    let returnid = e.target.dataset.returnid;
    if (returnid == undefined || (returnid == '')) {
        returnid = 0;
    }

    wx.navigateTo({ url: '/pages/user/order/returnCompletion?id=' + id + '&order=' + order_no + '&returnid=' + returnid });
};
publicFun.rightsGo = function (e) { //查看维权
    let pid = e.target.dataset.pid;
    let order_no = e.target.dataset.order_no;
    let rights_id = e.target.dataset.rights_id;
    if (rights_id == undefined || (rights_id == '')) {
        rights_id = 0;
    }
    wx.navigateTo({ url: '/pages/user/order/rightCompletion?rightid=' + rights_id + '&order_no=' + order_no + '&pid=' + pid });
};
publicFun.applyRefundGo = function (e) { //申请退货
    let id = e.target.dataset.id;
    let order_no = e.target.dataset.order;
    wx.navigateTo({ url: '/pages/user/order/returnGoods?id=' + id + '&order=' + order_no });
};
publicFun.applyRightsGo = function (e) { //申请退货
    let id = e.target.dataset.id;
    let order_no = e.target.dataset.order;
    wx.navigateTo({ url: '/pages/user/order/rightGoods?id=' + id + '&order=' + order_no });
};
publicFun.addImg = function(that) { //图片上传控件
    let ticket = '';
  const { wxapp_ticket } = getApp().globalData;
    try {
      let wx_ticket = wxapp_ticket || wx.getStorageSync('ticket')
        if (wx_ticket) {
            ticket = wx_ticket;
        }
    } catch (e) {
        // Do something when catch error
    }
    wx.chooseImage({ //图片上传控件
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

            var tempFilePaths = res.tempFilePaths;

            wx.uploadFile({
              url: common.Url + 'app.php?c=attachment&a=upload&store_id=' + getApp().globalData.store_id +'&request_from=wxapp&wxapp_ticket=' + ticket,
                filePath: tempFilePaths[0],
                name: 'file',
                formData: {
                    'user': 'test'
                },
                success: function(res) {
                    res = JSON.parse(res.data);
                    if (res.err_code == 20000) {
                        wx.showModal({
                            title: '用户未登录',
                            content: '请授权登录',
                            confirmText: '确定',
                            cancelText: '取消',
                            confirmColor: '#fe6b31',
                            success: function(res) {
                                wx.redirectTo({ url: '/pages/index/index' })
                            }
                        })

                        var app = getApp();
                        app.getUserInfo(function(userInfo) {})
                    }
                    if (res.err_code != 0 && res.err_code != 20000) {
                        wx.showModal({
                            title: '提示信息',
                            content: res.err_msg,
                            confirmText: '知道了',
                            showCancel: false,
                            confirmColor: '#fe6b31',
                            success: function(res) {}
                        })
                    } else {
                        let data = res;
                        that.data.imgList.unshift(data.err_msg);
                        that.setData({
                            imgList: that.data.imgList,
                        });
                    }
                },

            })

        }
    })
};
publicFun.verifyNumber = function(that, num) { //手机号验证
    let res = '!/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/';
    if (num == '' || num == undefined) {
        publicFun.warning('请填写手机号', that);
        return false;
    }
    if (!/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(num)) {
        publicFun.warning('请填写合法手机号', that);
        return false;
    }
    that.setData({
        phoneNumber: num,
    });
    return true;
};
publicFun.returnExplain = function(that, explain) { //退货说明验证
    if (explain == '' || explain == undefined) {
        publicFun.warning('请填写退货说明', that);
        return false;
    }

    that.setData({
        returnExplain: explain,
    });
    return true
};
publicFun.logistics = function(e, that) { //查询物流
    if (that.data.logisticsShow) {
        that.setData({
            logisticsShow: false
        })
        return
    }
    that.setData({
        logisticsShow: true
    })
    let code = e.target.dataset.code;
    let express = e.target.dataset.express;
    common.tuanPost('app.php?c=express&type=' + code + '&express_no=' + express, '', logistics, '');

    function logistics(result) {
        if (result.err_code == 0) {
            that.setData({
                logistics: result.err_msg.data
            })
        };
    }
};
publicFun.logisticsCode = function(that, logisticsCode) { //退货说明验证

    if (logisticsCode == '' || logisticsCode == undefined) {
        publicFun.warning('请填写快递单号', that);
        return false;
    }

    that.setData({
        logisticsCode: logisticsCode,
    });
    return true
};
publicFun.checkPhone = function(phone) {
    var regMobile = /^\d{5,12}$/; //手机

    if (regMobile.test(phone)) {
        return true;
    } else {
        return false;
    }
};
publicFun.search = function(key, that, page) { //搜索页面
    common.tuanPost('webapp.php?c=tuan&a=search&keyword=' + key + '&page=' + page, '', "setIndexData", that);
};
publicFun.wxSearchFn = function(that, page) { //搜索按钮
    let key = that.data.key;
    if ((key == undefined) || (key == '')) {
        return publicFun.warning('请输入搜索关键字', that);

    }
    if (that.data.keyword == undefined) {

        wx.navigateTo({ url: '/pages/search/search?keyword=' + key });
        return
    }
    page = 1;
    publicFun.search(key, that, page);

};
publicFun.wxSearchInput = function(that, e) { //搜索输入框
    let key = e.detail.value;
    that.setData({
        key: key
    })
};
publicFun.paymentButton = function(that) { //支付按钮
    var address_id = that.data.paymentData.wxapp_address.address_id;
    common.tuanPost('app.php?c=order&a=save&payType=weixin&is_app=wxapp', { orderNo: that.data.order_no, address_id: address_id }, paymentPay, '');

    function paymentPay(result) {
        if (result.err_code == 0) {
            var wx_data = result.err_msg;
            wx.requestPayment({
                'timeStamp': wx_data.timeStamp,
                'nonceStr': wx_data.nonceStr,
                'package': wx_data.package,
                'signType': wx_data.signType || 'MD5',
                'paySign': wx_data.paySign,
                'success': function(res) { //支付成功跳转到待发货页面
                    wx.redirectTo({ url: '/pages/user/order/orderList?currentTab=2' });
                },
                'fail': function(res) {
                    wx.showModal({
                        title: '提示信息',
                        content: '您取消了支付',
                        confirmText: '知道了',
                        showCancel: false,
                        success: function(res) {
                            setTimeout(function() { //支付失败跳转到待付款页面
                                wx.redirectTo({ url: '/pages/user/order/orderList?currentTab=1' });
                            }, 10)
                        }
                    })

                }
            })
        }
    }
};
publicFun.addressEditGO = function(that, addid, payment) { //跳转编辑地址
    that.setData({
        addressList: false,
        addressEdit: true
    });
    let addId = addid;
    if (typeof addId != 'undefined' && addId != 0 && payment != 'payment') {
        that.setData({
            address_id: addId
        });
        common.tuanPost('app.php?c=address&a=edit&address_id=' + addId, '', init, '');
    } else {
        area.picker.province(that, that.data.user_address.province);

        var province_index = that.data.province_index;
        that.pickerProvince('', province_index);

        var city_index = that.data.city_index;
        that.pickerCity('', city_index);
        that.setData({
            user_address: ''
        });
    }

    function init(result) {
        var data = result.err_msg.user_address;
        that.setData({
            user_address: data
        });

        area.picker.province(that, that.data.user_address.province);

        var province_index = that.data.province_index;
        that.pickerProvince('', province_index);

        var city_index = that.data.city_index;
        that.pickerCity('', city_index);
    }
};
publicFun.pickerProvince = function(that, e, p_index) { //地址选择-省份
    that.setData({
        city_name_arr: ['请选择'],
        city_code_arr: [],
        city_index: 0,
        country_name_arr: ['请选择'],
        country_code_arr: [],
        country_index: 0
    });
    var province_index_tmp = '';
    if (typeof p_index != "undefined") {
        province_index_tmp = p_index;
    } else {
        province_index_tmp = e.detail.value;
        that.setData({
            province_index: e.detail.value
        });
    }
    area.picker.city(that, that.data.province_code_arr[province_index_tmp], that.data.user_address.city);
    var city_index = that.data.city_index;
    that.pickerCity('', city_index);

};
publicFun.pickerCity = function(that, e, c_index) { //地址选择-市
    that.setData({
        country_name_arr: ['请选择'],
        country_code_arr: [],
        country_index: 0
    });

    var city_index = '';
    if (typeof c_index != "undefined") {
        city_index = c_index;
    } else {
        city_index = e.detail.value;
        that.setData({
            city_index: e.detail.value
        });
    }

    area.picker.country(that, that.data.city_code_arr[city_index], that.data.user_address.area);
};
publicFun.pickerCountry = function(that, e) { //县区
    that.setData({
        country_index: e.detail.value
    });
};
publicFun.addressSave = function(that, e, go) { //提交地址
    var name = e.detail.value.name;
    var tel = e.detail.value.tel;
    var province = e.detail.value.province;
    var city = e.detail.value.city;
    var area = e.detail.value.area;
    var address = e.detail.value.address;
    var zipcode = e.detail.value.zipcode;

    if (name.length == 0) {
        publicFun.warning('请填写收货人姓名', that);
        return;
    }

    if (tel.length == 0) {
        publicFun.warning('请填写手机号', that);
        return;
    }

    if (!publicFun.checkPhone(tel)) {
        publicFun.warning('请正确填写手机号', that);
        return;
    }

    province = that.data.province_code_arr[that.data.province_index];
    city = that.data.city_code_arr[that.data.city_index];
    area = that.data.country_code_arr[that.data.country_index];

    if (address.length == 0) {
        publicFun.warning('请正确填写详细地址', that);
        return;
    }
    publicFun.warning('地址信息已提交，请稍后', that);
    var data = {};
    data.address_id = that.data.address_id;
    data.name = name;
    data.tel = tel;
    data.province = province;
    data.city = city;
    data.area = area;
    data.address = address;
    data.zipcode = zipcode;

    common.tuanPost('app.php?c=address&a=save', data, saveBack, '');

    function saveBack(result) {
        if (go == 'go') { //是否是支付页面修改的地址

            let address_id = result.err_msg.address_id;
            let e = 0;
            publicFun.defaultAddress(e, that, address_id, 'geo');
            return
        }
        wx.redirectTo({ url: '/pages/address/index' });
    }
};
publicFun.freight = function(that, address_id) { //查询物流运费信息
    common.tuanPost('app.php?c=order&a=postage&address_id=' + address_id + '&order_no=' + that.data.order_no, '', freight, ''); //获取运费信息

    function freight(result) {
        if (result.err_msg == undefined) {
            result.err_msg = 0;
        }
        if (result.err_code == 1009) {
            that.setData({
                postage: false
            })

            result.err_msg = 0;
            publicFun.promptMsg('此地区不支持配送,请选择其他地址', '知道了', '', freight);
        } else if (result.err_code == 1010) {
            publicFun.promptMsg('刷新订单', '知道了', '', freight);
            that.onReady()
            result.err_msg = that.data.paymentData.order.postage
        } else {
            that.setData({
                postage: true
            })
        }

        function freight(res) {
            console.log(res);
        }

        that.setData({
            'paymentData.tuan_info.postage': result.err_msg //修改运费
        })
        publicFun.queryAddress(that, address_id);
        publicFun.closeAddress(that);
    }
};
publicFun.queryAddress = function(that, address_id) {
    common.tuanPost('app.php?c=address&a=get&address_id=' + address_id, '', queryAddress, ''); //查询单条地址

    function queryAddress(result) { //查询单条地址
        if (result.err_msg == undefined) {
            return
        }
        that.setData({
            'paymentData.wxapp_address': result.err_msg //修改地址
        })
    }
};
publicFun.addressEdit = function(that) { //选择地址列表,默认-编辑
    that.setData({
        addressList: true
    })
    common.tuanPost('app.php?c=address&a=all', '', addressData, '');

    function addressData(result) {
        if (result.err_code == 0) {
            that.setData({
                addressData: result.err_msg
            })
        }
    }
};
publicFun.closeAddress = function(that) { //关闭地址编辑弹框
    that.setData({
        addressList: false,
        addressEdit: false
    })
};
publicFun.setUrl = function(url) {
    try {
        wx.setStorageSync('url', url)
    } catch (e) {}
}
publicFun.setBarBgColor = function (app, that) { //修改导航条背景色
    var bgcolor = app.globalData.navigateBarBgColor;
    var barType = app.globalData.navigatorBarType;
    var applet_guide_subscribe = app.globalData.applet_guide_subscribe;
    if (bgcolor != '') {
        let tabBarArr = [],
            pageTheme = '';

        function tabBarStyle(selectedColor) {
            if (barType == 1) { //素雅版
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: '#ffffff'
                });
            } else {  //普通版
                wx.setNavigationBarColor({
                    frontColor: '#ffffff',
                    backgroundColor: selectedColor
                });
            }
            wx.setTabBarStyle({
                color: '#888888',
                selectedColor: selectedColor,
                backgroundColor: '#ffffff',
                borderStyle: 'white'
            })
            app.globalData.navigateBarBgColor = selectedColor;
        }

        switch (bgcolor) {
            case '#000000': // 黑色
                pageTheme = 'blackTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/black_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/black_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/black_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/black_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#DA2026': // 红色
                pageTheme = 'redTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/red_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/red_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/red_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/red_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#FF5C1C': // 橘色
                pageTheme = 'orangeTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/orange_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/orange_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/orange_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/orange_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#0098F8': // 蓝色
                pageTheme = 'blueTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/blue_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/blue_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/blue_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/blue_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#FF007C': // 桃紫
                pageTheme = 'pinkDarkTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/pink_dark_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/pink_dark_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/pink_dark_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/pink_dark_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#7948FD': // 紫色
                pageTheme = 'purpleTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/purple_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/purple_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/purple_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/purple_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            case '#B7A392': // 棕色
                pageTheme = 'brownTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/brown_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/brown_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/brown_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/brown_3.png'
                }];

                tabBarStyle(bgcolor)
                break;
            default: // 默认橘色
                pageTheme = 'orangeTheme';
                tabBarArr = [{
                    text: '首页',
                    icon: 'images/unactive_0.png',
                    iconActive: 'images/orange_0.png'
                }, {
                    text: '推荐',
                    icon: 'images/unactive_1.png',
                    iconActive: 'images/orange_1.png'
                }, {
                    text: '购物袋',
                    icon: 'images/unactive_2.png',
                    iconActive: 'images/orange_2.png'
                }, {
                    text: '我的',
                    icon: 'images/unactive_3.png',
                    iconActive: 'images/orange_3.png'
                }];

                tabBarStyle('#FF5C1C')
        }

        for (var i = 0; i < tabBarArr.length; i++) {
            wx.setTabBarItem({
                index: i,
                text: tabBarArr[i].text,
                iconPath: tabBarArr[i].icon,
                selectedIconPath: tabBarArr[i].iconActive
            })
        }

        // 设置页面主题calss
        if (that != '' && that != undefined) {
            that.setData({
                pageTheme: pageTheme,
                themeColorValue: bgcolor,
                applet_guide_subscribe
            })
        }

    } else {
        console.log('警告：app.globalData.navigateBarBgColor 为空！')
    }
    publicFun.onLoad(app, that);
}
publicFun.onLoad = function (app, that) { //授权页面
  that && (that.userCall = function (res) {
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        publicFun.userCall(res, app, that);
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        //重新登录
        wx.login({
          success: function (responce) {
            if (responce) {
              app.globalData.login = responce;
              let str_login = JSON.stringify(responce);
              wx.setStorageSync('str_login', str_login);
              publicFun.userCall(res, app, that);
            }
          }
        });
      }
    });
  })

  that && (that.loginLoaded = function (e) {
    publicFun.loginLoaded(e, app, that)
  })
  that && (that.closeModal = function (e) {
    if (that) {
      that.setData({
        showLoginModal: false
      })
    }
  })
}

publicFun.userCall = function (res, app, that) {
  // that = that||this;
  // console.log("========that7=", that)
  // var app = getApp()
  const { wxapp_ticket, login } = app.globalData
  console.log("*************entering-userCall")
  if (res.detail['userInfo']) {
    var ticket = wxapp_ticket || wx.getStorageSync('ticket');
    wx.showLoading({
      title: '正在登录',
      mask: true,
    });

    // 新增----------
    let login_info = wx.getStorageSync('str_login');
    let g_code = '';
    if (login_info) {
      login_info = login_info ? JSON.parse(login_info) : {};
      g_code = login_info.code;
    }
    // 以上新增--------------

    let data = {};
    if (app.globalData.tym_open) {
      if (app.globalData.loginData.type == 2) {
        if (!(app.globalData.new_numInput && app.globalData.sms_code && app.globalData.invite_code)) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '请正确填写手机号、验证码、邀请码',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })

          return false
        }

        data = {
          code: encodeURI(app.globalData.login.code || g_code),
          codes: encodeURI(app.globalData.login.code || g_code),
          encryptedData: encodeURI(res.detail.encryptedData),
          iv: encodeURI(res.detail.iv),
          wxapp_ticket: ticket,
          phone: app.globalData.new_numInput,
          sms_code: app.globalData.sms_code,
          invite_code: app.globalData.invite_code
        };

      }
    } else {
      data = {
        code: encodeURI(app.globalData.login.code || g_code),
        codes: encodeURI(app.globalData.login.code || g_code),
        encryptedData: encodeURI(res.detail.encryptedData),
        iv: encodeURI(res.detail.iv),
        wxapp_ticket: ticket,
      };
    }


    app.setAddres().then(res => {
      var location = {
        "location": res.longitude + "," + res.latitude
      };
      common.post('app.php?c=lbs&a=switch_substore', location, function () {
        console.log('切换门店');
        // 后台切换门店
        app.globalData.switch_store = true;
      }, '');
    });
    console.log("=====>>Tpublic.js store_login");
    common.post('app.php?c=wxapp&a=store_login', data, setUserInfo, '');

    function setUserInfo(result) {
      that = that || this;
      console.log("========result.err_msg.user.uid;", result)
      app.globalData.my_uid = result.err_msg.user.uid;
      wx.hideLoading()

      try {
        wx.setStorageSync('ticket', result.err_msg.wxapp_ticket)
        app.globalData.wxapp_ticket = result.err_msg.wxapp_ticket;
      } catch (e) { }

      app.globalData.userInfo = result.err_msg.user;
      if (result.err_msg.unlogin != undefined) {
        app.globalData.unlogin = result.err_msg.unlogin;
        wx.setStorageSync('unlogin', result.err_msg.unlogin)
      }

      typeof app.globalData.storge.callbackObj == "function" && app.globalData.storge.callbackObj(app.globalData.userInfo);
      publicFun.addFans();

      var store_openid = result.err_msg.user.store_openid || result.err_msg.store_openid;
      if (store_openid) {
        refresh_page(app.globalData.storge.refreshConfig);
      } else {
        if (that) {
          that.setData({
            userLoginUrl: common.Url + `wap/reh5.php?request_from=wxapp&store_id=${app.globalData.store_id}&wxapp_ticket=${result.err_msg.wxapp_ticket}#wechat_redirect`
          })
        }

      }
    }




    //登陆跳转到之前页面
    function refresh_page(refreshConfig, config) {
      var config_data = common.getCurrentPages();
      refreshConfig = config ? refreshConfig : config_data;
      var params = '';
      if (refreshConfig) {
        if (refreshConfig.param) {//是否有参数项
          params = '?';
          for (var i in refreshConfig.param) {
            if (i == 'equals') continue
            params += i + '=' + refreshConfig.param[i] + '&';
          }
        }

        if (refreshConfig.url) {//是否有地址
          wx.reLaunch({
            url: '/' + refreshConfig.url + params
          })
        } else {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      } else {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    }

    bus.$on(bus.events.login, refreshConfig => {
      refresh_page(refreshConfig)
    })


  } else {
    that.setData({
      showLoginModal: false
    })
  }
}


publicFun.addFans = function () {
  if (getApp().globalData.share_uid != "") {
    let data = {
      store_id: getApp().globalData.store_id,
      share_uid: getApp().globalData.share_uid,
      source: getApp().globalData.shareType ? getApp().globalData.shareType : 2
    }
    common.post("app.php?c=drp&a=add_fans", data, function callBack(res) {
      console.log("add_fans", res);
    }, '')
  }
}

publicFun.loginLoaded = function (e, app, that) {
  if (e.detail.src.indexOf('redirect_h5.php') > 0) {
    that.setData({
      userLoginUrl: null
    })
    bus.$emit(bus.events.login, app.globalData.storge.refreshConfig)
  }
}

publicFun.formSubmit = function (param) { // 生成下发模板消息所需的formId存于服务器
    if (!param.e) console.log('publicFun.formSubmit param "e" is need;')
    if (!param.that) console.log('publicFun.formSubmit param "that" is need;')
    common.post('app.php?c=wxapp&a=get_fromid&f_id=' + param.e.detail.formId + '&store_id=' + common.store_id, '', getFormIdCallBack, ''); //购买记录
    function getFormIdCallBack(res) {
        param.callBack && param.callBack();
    }
}
module.exports = publicFun
