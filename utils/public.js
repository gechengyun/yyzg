var common = require('common.js');
var area = require('area.js');
var bus = require('./bus.js')
var wxParse = require('../wxParse/wxParse.js');
var publicFun = {};
var COUNT = 0;

function toDecimal(str) {
  //取两位小数-截取-不四舍五入-----------------
  let num = Math.floor(str * 100) / 100;
  return num;
}
publicFun.toDecimal = toDecimal;
publicFun.timer = null; //设置秒杀和砍价的倒计时用的
publicFun.paytimer = null; //设置预售尾款支付倒计时用的
publicFun.height = function(that) { //设置页面高度
  console.log("执行了publicFun.height");
  wx.getSystemInfo({
    success: function(res) {
      that.setData({
        scrollHeight: res.windowHeight
      });
    }
  });
};

publicFun.setPushData = function(result, that, listData) {
  let list = that.data.indexData.tuan_list;
  for (var i = 0; i < result.err_msg.tuan_list.length; i++) {
    list.push(result.err_msg.tuan_list[i]);
  }
  that.setData({
    'indexData.tuan_list': list
  });
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
publicFun.productListSwichNav = function(e, that) { //点击tab切换
  if (!that.data.productList) return false;
  let {
    t_index,
    productlist
  } = e.target.dataset
  if (that.data.productList[t_index] === productlist) {
    return false;
  } else {
    that.data.productList[t_index] = productlist
    that.setData({
      productList: that.data.productList
    })
  }
};
publicFun.CouponSwichNav = function(e, that) { //点击tab切换
  if (that.data.couponTab === e.target.dataset.coupontab) {
    return false;
  } else {
    that.setData({
      couponTab: e.target.dataset.coupontab
    })
  }
};
publicFun.postage = function(that) {
  let product = that.data.productData.product;
  if (product.postage == 0 || product.postage == null) {
    product.postage = '包邮';
  }
  if (product.postage_type == 0) {
    product.postage = product.postage;
  } else {
    if (product.postage_tpl == undefined) {
      product.postage = product.postage;
    } else {
      product.postage = product.postage_tpl.min + '~' + product.postage_tpl.max;
    }
  }

  that.setData({
    'productData.product.postage': product.postage
  })

};
publicFun.credit_arr = function(that) { //特权显示
  function credit_arr(type) {
    switch (type) {
      case 'RZ':
        return '证';
        break;
      case '7D':
        return '退';
        break;
      case 'DB':
        return '保';
        break;
      case 'MD':
        return '店';
        break;
    };
  }

  for (var i = 0; i < that.data.productData.credit_arr.length; i++) {
    that.data.productData.credit_arr[i].type = credit_arr(that.data.productData.credit_arr[i].type)
  }
  that.setData({ //店铺特权
    'productData.credit_arr': that.data.productData.credit_arr
  });
};
publicFun.business = function(that, order_notice_time) { //订单提醒
  function businessData() {
    var url;
    var store_order_id = wx.getStorageSync('store_order_id');
    if (store_order_id == undefined || store_order_id == 'undefined') {
      url = 'app.php?c=order&a=notice';
    } else {
      url = 'app.php?c=order&a=notice&store_order_id=' + store_order_id; //交易提醒提示框
    }
    common.post(url, '', business, '');

    function business(data) {
      if (data.err_code == 0) {
        that.setData({
          business: data.err_msg
        })
        if (that.data.business.has_data) {
          that.data.businessShow = true;
          wx.setStorageSync('store_order_id', that.data.business.store_order_id)
        } else {
          that.data.businessShow = false;
        }
        that.setData({
          'businessShow': that.data.businessShow
        })
      };
    }

  };

  function orderClose() {
    setTimeout(function() {
      that.setData({
        'businessShow': false
      })
    }, order_notice_time * 1000)
  }

  function businessTime() { //交易提醒计时
    that.data.businessTimeInt = setInterval(function() {
      // console.log(111);
      businessData();
      orderClose();
    }, 10000);

  };
  businessData();
  businessTime();
  that.setData({
    'businessShow': true
  })
  orderClose();

};
publicFun.productSwichNav = function(that, e) { //产品详情页面筛选按钮
  let sort = e.target.dataset.sort;
  if (e.target.dataset.current == 3) {
    if (that.data.priceTab == 'sort_active') {
      that.setData({
        priceTab: ''
      })
      sort = 'price_asc';
    } else {
      that.setData({
        priceTab: 'sort_active'
      })
      sort = 'price_desc';
    }
  }
  wx.setStorage({
    key: 'product_list_price_sort',
    data: sort,
  })
  that.setData({
    sort: sort
  });
  let url = 'app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + (that.data.cid ? ('&cid=' + that.data.cid) : '')
  common.post(url, '', "productListData", that);
  publicFun.swichNav(e, that);
};
publicFun.productSwichNavBar = function(that, e, store_id, wholesale_id) { //产品详情页面筛选按钮
  console.log(10, e)
  let sort = e.currentTarget.dataset.sort;
  if (e.currentTarget.dataset.current == "2") {
    if (that.data.priceTab == 'sort_active') {
      that.setData({
        priceTab: ''
      })
      sort = 'price_asc';
    } else {
      that.setData({
        priceTab: 'sort_active'
      })
      sort = 'price_desc';
    }
  };
  that.setData({
    sort: sort
  });
  // let url = 'app.php?c=goods&a=search_in_store&keyword=' + that.data.keyword + '&sort=' + that.data.sort + (that.data.cid ? ('&cid=' + that.data.cid) : '')
  let url = 'app.php?c=goods&a=store_wholesale_list&store_id=' + store_id + '&wholesale_store_id=' + wholesale_id + '&sort=' + that.data.sort
  common.post(url, '', "productListData", that);
  publicFun.swichNav(e, that);
};
publicFun.closePromptMess = function (that) { //关闭提示框遮罩层
  that.setData({
    'prompt.promptMess': false
  })
};
publicFun.oppenPromptMess = function (that) { //显示提示框
  that.setData({
    'prompt.promptMess': true
  })
};
publicFun.goBack = function (e) { //返回上一页
  wx.navigateBack(1)
};
publicFun.formatStr = function (str) { //替换空格换行
  str = str.replace(/&nbsp;/g, " ");
  str = str.replace(/<br>/g, " ");
  return str
};

publicFun.barTitle = function(title, that) { //修改页面标题
  wx.setNavigationBarTitle({
    title: title
  });
  if (that) {
    that.setData({
      _barTitle: title
    })
  }
};
publicFun.closeShopping = function(that) { //关闭购物袋遮罩层
  that.setData({
    'shoppingData.shoppingShow': false
  })
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
publicFun.calling = function(num) {
  wx.makePhoneCall({
    phoneNumber: num,
    success: function() {
      console.log("拨打电话成功！")
    },
    fail: function() {
      console.log("拨打电话失败！")
    }
  })
}
publicFun.warning = function(txt, that, setColor) { //弹出警告提示框
  that.setData({
    'warning.warningShow': true,
    'warning.warningTxt': txt
  });
  if (setColor){
    that.setData({
      'warning.warningColor': setColor
    });
  }else{
    that.setData({
      'warning.warningColor': ''
    });
  }
  setTimeout(function() {
    that.setData({
      'warning.warningShow': false
    })
  }, 1000);
};
publicFun.richText = function(content, that) { //自定义弹出富文本提示框
  that.setData({
    'richTextBoxShow': true,
    'richTextBoxData': content
  });
};

publicFun.hideRichTexBox = function(that) {
  that.setData({
    'richTextBoxShow': false,
  });
};

publicFun.text = function(content, that) { //自定义弹出文本提示框
  that.setData({
    'textBoxShow': true,
    'textBoxData': content
  });
};

publicFun.hideTexBox = function(that) {
  that.setData({
    'textBoxShow': false,
  });
};

publicFun.soldOutBox = function(content, that) { //售罄提示框
  that.setData({
    'soldOutBoxShow': true,
    'soldOutBoxData': content
  });
};

publicFun.hideSoldOutBox = function(that) {
  that.setData({
    'soldOutBoxShow': false,
  });
};

publicFun.oppenShopping = function(e, that) { //开启购物袋遮罩层
  if (!getApp().isLoginFun(that)) { //判断用户是否登录
    return false;
  }
  let current_tartget = e.currentTarget.dataset;
  let son_target = e.target.dataset;
  let product_id = current_tartget.baby ? current_tartget.product : son_target.product;
  let type = current_tartget.baby ? current_tartget.type : son_target.type;
  let buttonTxt = '下一步';
  if (type == 'add_cart') {
    buttonTxt = '加入购物袋';
  }else if(type == 'self_buy1'){
    buttonTxt = '立即购买';
  }
  if (that.data.live_id && that.data.shoppingData != undefined && that.data.shoppingData.shoppingNum != undefined) {
    that.setData({
      'shoppingData.shoppingNum': that.data.shoppingData.shoppingNum
    })
  }else{
    that.setData({
      'shoppingData.shoppingNum': 1
    });
  }
  that.setData({
    'shoppingData.buttonTxt': buttonTxt,
    'shoppingData.type': type,
    'shoppingData.specList[0].vid': '',
    'shoppingData.value[0]': '',
    'shoppingData.specList[1].vid': '',
    'shoppingData.value[1]': '',
    'shoppingData.specList[2].vid': '',
    'shoppingData.value[2]': ''
  });
  wx.showToast({
    icon: "loading",
    title: "加载中...",
    mask: true
  });
  let data = {};
  if (that.data.live_id) {
    if ((that.data.liveVideoData && that.data.liveVideoData.status == 1) || that.data.liveStatus == 1) {
      data.live_id = that.data.live_id
    }
  }
  common.post('app.php?c=goods&a=info&product_id=' + product_id, data, shoppingData, '',shoppFail);

  function shoppingData(result) { //购物袋数据
    wx.hideToast()
    if (result.err_code == 0) {
      if (type == 'make') {
        result.err_msg.custom_field_list = result.err_msg.reservation_custom_fields;
      }
      if (type == 'add_cart') {
        if (result.err_msg.product.union_ticket_code != '') {
          return publicFun.warning('此商品不能加入购物袋', that);
        }
      }
      // 判断规格样式
      if (result.err_msg.property_list && result.err_msg.property_list.length > 0) {
        for(let e in result.err_msg.property_list[0].values) {
          let pvid = result.err_msg.property_list[0].pid+':'+result.err_msg.property_list[0].values[e].vid;
          let skuPriceData_sub = result.err_msg.sku_list.filter(function(item) { //获取所有能与当前规格组合的商品规格列表
            return item.properties.indexOf(pvid) > -1
          });
          let allQuantity = skuPriceData_sub.reduce(function(prev, next) { //获取当前规格商品的总量
            return parseInt(prev) + parseInt(next.quantity)
          }, 0);
          result.err_msg.property_list[0].values[e].allQuantity = allQuantity
        }
      }
      for (var i in result.err_msg.custom_field_list) {
        result.err_msg.custom_field_list[i].value = '';
        if (result.err_msg.custom_field_list[i].field_type == 'date') {
          // result.err_msg.custom_field_list[i].date = publicFun.setDateDay('');
          // result.err_msg.custom_field_list[i].dateDay = publicFun.setDateDay('');
          // result.err_msg.custom_field_list[i].time = publicFun.setDateTime();
        }
        if (result.err_msg.custom_field_list[i].field_type == 'time') {
          // result.err_msg.custom_field_list[i].date = publicFun.setDateDay('');
        }
        if (result.err_msg.custom_field_list[i].field_type == 'image') {
          result.err_msg.custom_field_list[i].imgList = [];
        }
      }

      // 单规格 默认选中处理
      let single_sku_single_value = false;
      let sku_id = '';
      if (result.err_msg.sku_list && result.err_msg.sku_list.length == 1) {
        sku_id = result.err_msg.sku_list[0].sku_id;
        that.data.shoppingData.sku_id;
        single_sku_single_value = true;
        //单规格如果有规格图片，设置规格图
        if (result.err_msg.property_list &&
          result.err_msg.property_list[0] &&
          result.err_msg.property_list[0].values &&
          result.err_msg.property_list[0].values[0] &&
          result.err_msg.property_list[0].values[0].image) {
          result.err_msg.product.image = result.err_msg.property_list[0].values[0].image
        }
      }
      that.setData({
        'shoppingData.shoppingCatData': result.err_msg,
        'shoppingData.sku_id': sku_id,
        'shoppingData.single_sku_single_value': single_sku_single_value
      });
      result.err_msg.sku_list && result.err_msg.sku_list[0] && result.err_msg.sku_list[0].deliver_phase && that.setData({
        'shoppingData.shoppingCatData.product.deliver_phase': result.err_msg.sku_list[0].deliver_phase
      })

      if ((type == 'add_cart') && (that.data.shoppingData.shoppingCatData.sku_list == '' || that.data.shoppingData.shoppingCatData.sku_list == undefined) && (that.data.shoppingData.shoppingCatData.custom_field_list == '' || that.data.shoppingData.shoppingCatData.custom_field_list == undefined)) {
        publicFun.payment(that, e);
        return
      }
      if (that.data.live_id){
        if (that.data.liveVideoData && result.err_msg.custom_field_list.length > 0){
          wx.navigateTo({
            url: '/pages/product/details?product_id=' + product_id + '&live_id=' + that.data.live_id + '&liveStatus=' + that.data.liveVideoData.status,
          });
          return;
        }
        that.setData({
          'liveVideoData.shoppingShow': true
        })
      }
      that.setData({
        'shoppingData.shoppingShow': true
      });

    }
  }
  function shoppFail(result){
    if(result.err_code == 1000){
      that.setData({
        screenBtnShow: true,
        canvasShow: true,
      });
    }
  }
};
publicFun.shoppingVid = function(e, that) { //购物袋商品规格选择
  let id = e.target.dataset.id;
  let vid = e.target.dataset.vid;
  let pid = e.target.dataset.pid;
  let image = e.target.dataset.image;
  if (that.data.shoppingData.specList[id].vid === vid) {
    return false;
  } else {
    that.setData({
      'shoppingData.shoppingNum':1
    })
    // 选中第一层其余层高亮去掉
    if(id === 0) {
      that.setData({
        'shoppingData.specList[0].vid': '',
        'shoppingData.specList[1].vid': '',
        'shoppingData.specList[2].vid': '',
        'shoppingData.value[0]': '',
        'shoppingData.value[1]': '',
        'shoppingData.value[2]': ''
      })
    }
    if(id === 1) {
      that.setData({
        'shoppingData.specList[1].vid': '',
        'shoppingData.specList[2].vid': '',
        'shoppingData.value[1]': '',
        'shoppingData.value[2]': ''
      })
    }
    if (image) {
      that.setData({
        [`shoppingData.specList[${id}].vid`]: vid,
        [`shoppingData.value[${id}]`]: pid + ':' + vid,
        'shoppingData.shoppingCatData.product.image': image,
        'shoppingData.currendId':id
      })
    } else {
      that.setData({
        [`shoppingData.specList[${id}].vid`]: vid,
        [`shoppingData.value[${id}]`]: pid + ':' + vid,
        'shoppingData.currendId':id
      })
    }
  }
  publicFun.skuPrice(that);
};


publicFun.skuPrice = function(that) {
  //判断商品规格信息
  let property_list = that.data.shoppingData.shoppingCatData.property_list;
  let valueDate = '';
  let skuPriceData = that.data.shoppingData.shoppingCatData.sku_list; //商品规格列表
  let quantity = that.data.shoppingData.shoppingCatData.product.quantity * 1; //之前选中的商品规格组合的库存数量
  let shoppingNum = that.data.shoppingData.shoppingNum * 1; //输入框数量
  let buyer_quota = that.data.shoppingData.shoppingCatData.product.buyer_quota * 1; //商品限购数量
  let buy_quantity = 0;
  if (typeof that.data.shoppingData.shoppingCatData.product.buy_quantity === 'undefined') {
    let buy_quantity = that.data.shoppingData.shoppingCatData.product.buy_quantity * 1; //商品已购买数量
  }
  if (skuPriceData) { //有的商品可能没有规格,//在商品列表页可能出现bug
    quantity = skuPriceData.reduce(function(prev, next) {
      return parseInt(prev) + parseInt(next.quantity)
    }, 0); //获取当前规格商品的总量
  }
 
  if (quantity <= 0) {
    that.setData({
      'shoppingData.shoppingNum': quantity //0
    });
    return publicFun.warning('商品已经卖完了', that);
  } else if (shoppingNum === 0) { //如果有库存并且添加的商品数量为0，则改为默认添加一个商品
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
  for (let i in skuPriceData) { 
    //判断规格产品的库存以及价格
    if (valueDate == skuPriceData[i].properties) { //当选中所用规格的时候进入到这里
      if (skuPriceData[i].quantity == 0) { //库存为0，重置添加的商品数量为0
        that.setData({
          'shoppingData.shoppingNum': skuPriceData[i].quantity, //0
          'shoppingData.shoppingCatData.product.quantity': skuPriceData[i].quantity //0
        });
        return publicFun.warning('没有库存了,选择其他商品吧', that);
      }
      if (skuPriceData[i].point_exchange_num) {
        that.setData({
          'shoppingData.shoppingCatData.product.point_exchange_num': skuPriceData[i].point_exchange_num,
        })
      }
      that.setData({
        'shoppingData.shoppingCatData.product.price': skuPriceData[i].price,
        'shoppingData.shoppingCatData.product.quantity': skuPriceData[i].quantity,
        'shoppingData.shoppingCatData.product.deliver_phase': skuPriceData[i].deliver_phase,
        'shoppingData.sku_id': skuPriceData[i].sku_id
      });
      if (skuPriceData[i].quantity < shoppingNum) {
        that.setData({
          'shoppingData.shoppingNum': skuPriceData[i].quantity
        });
       
        return publicFun.warning('库存只有' + skuPriceData[i].quantity + '个', that);
      }
    } else if (skuPriceData[i].properties && (skuPriceData[i].properties.indexOf(valueDate) > -1)) { //当没选中部分规格进入到这里
      let skuPriceData_sub = skuPriceData.filter(function(item) { //获取所有能与当前规格组合的商品规格列表
        return item.properties.indexOf(valueDate) > -1
      });
      // 判断下一级按钮样式start
      let pcurrendId = that.data.shoppingData.currendId+1
      if (property_list[pcurrendId]) {
        for(let e in property_list[pcurrendId].values) {
          property_list[pcurrendId].values[e].allQuantity = skuPriceData_sub[e].quantity
        }
      }
      // 判断下一级按钮样式end
      let allQuantity = skuPriceData_sub.reduce(function(prev, next) { //获取当前规格商品的总量
        return parseInt(prev) + parseInt(next.quantity)
      }, 0);
      let minPrice = skuPriceData_sub.reduce(function(prev, next) { //获得当前商品规格的最低价
        return prev > next.price ? next.price : prev
      }, skuPriceData[i].price)
      that.setData({
        'shoppingData.shoppingCatData.product.price': minPrice,
        'shoppingData.shoppingCatData.product.quantity': allQuantity,
        'shoppingData.shoppingCatData.property_list':property_list
      });
      if (allQuantity < shoppingNum) { //如果添加的商品数量大于当前添加商品总数，则提示库存不足，并且重置购买数量为当前规格商品总量
        that.setData({
          'shoppingData.shoppingNum': allQuantity
        });
        return publicFun.warning('库存只有' + allQuantity + '个', that);
      }
      break; //这里选中部分规格只需要判断一次就跳出循环
    }
  }
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

publicFun.payment = function(that, e, page_name) { //去支付
  // console.log(that.data.shoppingData.shoppingCatData);
  // if(that.data.is_paying){
  //   wx.showModal({
  //     title: '提示',
  //     content: '这是一个模态弹窗',
  //     success(res) {
  //       if (res.confirm) {
  //         console.log('用户点击确定')
  //       } else if (res.cancel) {
  //         console.log('用户点击取消')
  //       }
  //     }
  //   })
  //   return false
  // };
  publicFun.skuPrice(that);
  let type = e.target.dataset.type || e.currentTarget.dataset.type;
  let is_add_cart = 0;
  let addType = 0;
  var emailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, // 邮箱正则
    idcardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  let reservation_custom = {}
  //    console.log(type);
  if (that.data.shoppingData.shoppingNum * 1 == 0) {
    return publicFun.warning('请选择购买数量', that);
  }
  if (that.data.shoppingData.sku_id == '' && (that.data.shoppingData.shoppingCatData.sku_list != '' && that.data.shoppingData.shoppingCatData.sku_list != undefined)) {
    return publicFun.warning('请选择商品规格', that);
  }
  if (type == 'add_cart') {
    is_add_cart = 1;
  }
  let param = '';
  if (type == 'make') { //预约
    addType = 10;
    param = '&store_id=' + that.data.shoppingData.shoppingCatData.product.store_id;
  }
  let custom_field_list = that.data.shoppingData.shoppingCatData.custom_field_list;
  /*检测留言信息start*/
  for (var i in custom_field_list) {
    reservation_custom[i] = {};
    if (custom_field_list[i].field_type == 'time') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].date;
      continue
    }
    if (custom_field_list[i].field_type == 'date') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].date + ' ' + custom_field_list[i].time;
      continue
    }
    if (custom_field_list[i].field_type == 'image') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].imgList;
      if (reservation_custom[i].value == '' || reservation_custom[i].value == []) {
        return publicFun.warning('请上传' + custom_field_list[i].field_name, that)
      }
      continue
    }
    if (custom_field_list[i].required * 1 && custom_field_list[i].value == '') {
      return publicFun.warning('请输入' + custom_field_list[i].field_name, that)
    }
    var is_required = custom_field_list[i].required != 0
    if (custom_field_list[i].field_name == '联系方式' && is_required) {
      if (!(custom_field_list[i].value).match(/\d{11}/)) {
        return publicFun.warning('请填写合法手机号', that);
      }
    }
    if (custom_field_list[i].field_type == 'id_no' && is_required) {
      if (!idcardReg.test(custom_field_list[i].value) && custom_field_list[i].value) {
        return publicFun.warning('请正确输入身份证格式留言内容', that)
      }
    }
    if (custom_field_list[i].field_type == 'email' && is_required) {
      if (!emailReg.test(custom_field_list[i].value) && custom_field_list[i].value) {
        return publicFun.warning('请正确输入邮箱格式留言内容', that)
      }
    }
    if (custom_field_list[i].field_type == 'number' && is_required) {
      if (!/^\d+(\.\d+)?$/.test(custom_field_list[i].value) && custom_field_list[i].value) {
        return publicFun.warning('请正确输入数字格式留言内容', that)
      }
    }
    reservation_custom[i]['name'] = custom_field_list[i].field_name;
    reservation_custom[i]['type'] = custom_field_list[i].field_type;
    reservation_custom[i]['value'] = custom_field_list[i].value;
  }
  /*检测留言信息end*/
  let data = {};
  data = {
    quantity: that.data.shoppingData.shoppingNum,
    sku_id: that.data.shoppingData.sku_id,
    send_other: 0,
    is_add_cart: is_add_cart,
    type: addType,
    custom: reservation_custom,
    product_id: that.data.shoppingData.shoppingCatData.product.product_id,
  };
  var product = that.data.shoppingData.shoppingCatData.product;
  if (product.special_product_type == 98) {
    data.cycle_select_date = product.deliver_date[that.data.shoppingData.deliver_date_index]
    data.cycle_type = 1
  }
  if (type == 'add_cart') { //加入购物袋
    // publicFun.warning('订单处理中，请稍后...', that);
  } else {
    publicFun.warning('订单处理中，请稍后...', that);
  }
  that.setData({
    is_paying: true
  })
  // 直播参数加上直播id
  if (that.data.live_id) {
    if ((that.data.liveVideoData && (that.data.liveVideoData.status == 1 || that.data.liveVideoData.status == 2)) || that.data.liveStatus == 1){
      data.live_id = that.data.live_id
    }
  }
  common.post('app.php?c=order&a=add' + param, data, payment, '');

  function payment(result) { //去支付
    // 30002获取手机号
    if(result.err_code == 30002){
      that.setData({
        showgetPhone: true
      });
    }else{
      that.setData({
        is_paying: false
      })
      if (type == 'add_cart') { //加入购物袋
        that.setData({
          'shoppingData.shoppingShow': false,
          'shoppingCatNum': true
        });
        if (result.err_code === 0) {
          wx.showToast({
            title: '添加成功',
            image: '../../images/successIcon.png',
            icon: 'success',
            duration: 2000
          })
        } else {
          publicFun.warning(result.err_msg, that);
        }
        return
      }
      if (result.err_code == 1010) {
        publicFun.promptMsg(result.err_msg.msg_txt, '知道了', '', right);
  
        function right() {
          wx.redirectTo({
            url: '/pages/user/order/index?order=' + result.err_msg
          })
        }
      }
      if (result.err_code == 0) {
        var order_no = result.err_msg;
        publicFun.paymentGo(order_no, page_name,e)
      }
    }
    
  };


};
publicFun.paymentGo = function(order_no, page_name,e) { //去支付
  if (page_name) {
    if(e.currentTarget.dataset.reserva && e.currentTarget.dataset.reserva*1 == 1){
      wx.navigateTo({
        url: '/pages/payment/index?order_no=' + order_no + '&cfrom=' + page_name + '&goodsType=appoint'
      });
    }else{
      wx.navigateTo({
        url: '/pages/payment/index?order_no=' + order_no + '&cfrom=' + page_name
      });
    }
  } else {
    wx.navigateTo({
      url: '/pages/payment/index?order_no=' + order_no
    });
  }

};
publicFun.textScroll = function(that) { //公告滚动
  let text = '';
  let flag = true;
  let marqueeDistance = 0;
  for (var i in that.data.shopHomeData.custom_field_list) {
    if (that.data.shopHomeData.custom_field_list[i].field_type == 'notice') {
      text = that.data.shopHomeData.custom_field_list[i].content;
      that.data.shopHomeData.custom_field_list[i].marqueeDistance = that.data.marqueeDistance;
      flag = false;
      marqueeDistance = i;
    }
  }
  if (flag) {
    return
  }
  that.setData({
    shopHomeData: that.data.shopHomeData
  })
  var length = text.length * 12; //文字长度
  var windowWidth = wx.getSystemInfoSync().windowWidth - 100; // 屏幕宽度
  that.setData({
    windowWidth: windowWidth,
    // length: length,
    // marqueeDistance: marqueeDistance
  });
  that.data.textScrollInterval = setInterval(function() {
    if (-that.data.marqueeDistance < length) {
      that.data.shopHomeData.custom_field_list[marqueeDistance].marqueeDistance = that.data.marqueeDistance - 1;
      that.setData({
        marqueeDistance: that.data.marqueeDistance - 1,
        shopHomeData: that.data.shopHomeData
      });
    } else {
      // clearInterval(that.data.textScrollInterval);
      that.data.shopHomeData.custom_field_list[marqueeDistance].marqueeDistance = that.data.windowWidth;
      that.setData({
        marqueeDistance: that.data.windowWidth,
        shopHomeData: that.data.shopHomeData
      });
      // publicFun.textScroll(that);
    }
  }, 35);
};
publicFun.collect = function(that, e) { //收藏商品
  if (!getApp().isLoginFun(that)) { //判断用户是否登录
    return false;
  }
  let dataid = e.target.dataset.dataid;
  let index = e.target.dataset.index;
  let type = e.target.dataset.type || e.currentTarget.dataset.type;
  let fromPointShop = e.currentTarget.dataset.frompointshop;//0 非积分商品 1 是
  let url = '';
  if (that.data.productData.product.is_collect == 1) {
    url = 'app.php?c=collect&a=cancel';
    that.data.productData.product.collect--;
    that.data.productData.product.is_collect--
  } else {
    url = 'app.php?c=collect&a=add';
    that.data.productData.product.collect++;
    that.data.productData.product.is_collect++
  };
  let data={
    from_point_shop:fromPointShop 
  }
  common.post(url + '&dataid=' + dataid + '&type=' + type, data, collect, '');

  function collect(res) {
    if (res.err_code == 0) {
      let _collect = publicFun.formateNumber(that.data.productData.product.collect);
      that.setData({
        'productData.product.is_collect': that.data.productData.product.is_collect,
        'productData.product.collect': _collect
      })
    }
  }
};
publicFun.shopcollect = function(that, e) { //店铺动态收藏

  if (!getApp().isLoginFun(that)) { //判断用户是否登录
    return false;
  }
  let dataid = e.target.dataset.dataid;
  let index = e.target.dataset.index;
  if (that.data.shopHomeData.custom_field_list[that.data.article_id].content.activity_arr[index].mycollected * 1 == 1) {
    that.data.shopHomeData.custom_field_list[that.data.article_id].content.activity_arr[index].collect--;
    that.data.shopHomeData.custom_field_list[that.data.article_id].content.activity_arr[index].mycollected--
  } else {
    that.data.shopHomeData.custom_field_list[that.data.article_id].content.activity_arr[index].collect++;
    that.data.shopHomeData.custom_field_list[that.data.article_id].content.activity_arr[index].mycollected++
  }
  common.post('app.php?c=article&a=collect&aid=' + dataid, '', collect, '');

  function collect(res) {
    if (res.err_code == 0) {
      that.setData({
        shopHomeData: that.data.shopHomeData
      })
    }
  }
};
publicFun.collectShop = function(that, e) { //店铺收藏

  common.post('app.php?c=collect&a=add&type=2&dataid=' + common.store_id, '', collect, '');

  function collect(res) {
    if (res.err_code == 0) {
      for (var i in that.data.shopHomeData.custom_field_list) {
        if (that.data.shopHomeData.custom_field_list[i].field_type == 'attention_collect') {
          that.data.shopHomeData.custom_field_list[i].collect++
        }
      };
      that.setData({
        shopHomeData: that.data.shopHomeData
      })
    }
  }
};
//已挪
publicFun.operation = function(that, e, plus) { //购物袋页面操作
  let index = e.target.dataset.index;
  let number = e.target.dataset.num;
  let cartId = e.target.dataset.cartid;
  let skuId = e.target.dataset.skuid;
  let productId = e.target.dataset.productid;
  if (plus == 'plus') {
    number++;
  }
  if (plus == 'input') {
    if (e.detail.value < 1 || e.detail.value == number) {
      setTimeout(function() {
        that.setData({
          'shoppingCatData': that.data.shoppingCatData,
        })
      }, 1000)
      return
    }
    number = e.detail.value * 1
  }
  if (plus == 'reduce') {
    if (number <= 1) {
      common.post('app.php?c=cart&a=delete&cart_id=' + cartId, '', shoppingNum, '');

      function shoppingNum(result) {
        let cart_list = that.data.shoppingCatData.now_physical_product_list;
        cart_list[index] = '';
        publicFun.shoppingMoney(that);

        var empty = true; // 判断购物袋是否被清空
        for (var i in cart_list) {
          if (cart_list[i].isEditActive == 1) {
            cart_list[i] = '';
          }
          if (cart_list[i] != '') {
            empty = false;
          }
        }
        if (empty) {
          cart_list = [];
        }

        that.setData({
          'shoppingCatData': that.data.shoppingCatData,
        })
      }

      return
    }
    number--;
  }
  common.post('app.php?c=cart&a=quantity&number=' + number + '&cart_id=' + cartId + '&sku_id=' + skuId + '&product_id=' + productId, '', shoppingNum, '',shoppingNumFail);

  function shoppingNum(result) {
    let shoppingCatData = that.data.shoppingCatData;
    if (result.err_code == 0) { //操作成功
      let goods_list = shoppingCatData.now_physical_product_list; //正在操作商品列表
      let is_active = 'active';
      goods_list.forEach(function(i) {
        if (i.isActive == 0) {
          is_active = ''
        }
      })
      goods_list[index].pro_num = number;
      publicFun.shoppingMoney(that);
      that.setData({
        'shoppingCatData': shoppingCatData,
        'flag': false,
        'isActive': is_active
      })
      var st_count = setTimeout(function(){
          that.setData({clickable:true});
          clearTimeout(st_count);
      },100)
    } else { //操作失败
      console.log(222)
      //商品库存不足或者其情况设置购物袋商品数量为1
      if (plus == 'input') {
        let goods_list = shoppingCatData.now_physical_product_list; //正在操作商品列表
        goods_list[index].pro_num = that.data.shoppingCatData.now_physical_product_list[index].pro_num;
        that.setData({
          'shoppingCatData': shoppingCatData,
        })
      }
      wx.showModal({
        title: '',
        content: result.err_msg ? result.err_msg : '操作失败',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: that.data.themeColorValue,
      })
    }
  }
  function shoppingNumFail(result){
    //超出库存重新修改输入框的值
    let shoppingCatData = that.data.shoppingCatData;
    if (plus == 'input') {
      let goods_list = shoppingCatData.now_physical_product_list; //正在操作商品列表
      goods_list[index].pro_num = that.data.shoppingCatData.now_physical_product_list[index].pro_num;
      that.setData({
        'shoppingCatData': shoppingCatData,
      })
    }
    that.setData({
      clickable: true
    });
    return
  }
};
//以挪
publicFun.shoppingMoney = function(that, e) { // 合计
  var cart_list = that.data.shoppingCatData.now_physical_product_list;
  for (var i in cart_list) {
    if (cart_list[i] != '') {
      cart_list[i].shoppingMoney = cart_list[i].pro_num * cart_list[i].pro_price;

    }
  }
  publicFun.isActiveNew(that);
  that.setData({
    'isActive': '',
    'shoppingCatData': that.data.shoppingCatData
  })
};
publicFun.isActive = function(that, e) { //活动选中状态
  var cart_list = that.data.shoppingCatData.cart_list;
  that.data.shoppingCatMoney = 0;
  that.data.shoppingCatNum = 0;
  that.data.shoppingCatTotalNum = 0;
  for (var i = 0; i < cart_list.length; i++) {
    if (cart_list[i].isActive == 1) {
      that.data.shoppingCatMoney += cart_list[i].shoppingMoney;
      that.data.shoppingCatNum += cart_list[i].pro_num * 1
    }
    that.data.shoppingCatTotalNum += cart_list[i].pro_num * 1

  }
  that.setData({
    shoppingCatData: that.data.shoppingCatData,
    'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
    'shoppingCatNum': that.data.shoppingCatNum,
    'shoppingCatTotalNum': that.data.shoppingCatTotalNum,
    'isEditActive': that.data.isEditActive
  })
};
publicFun.isEditActive = function(that, e) { //活动选中状态
  var cart_list = that.data.shoppingCatData.cart_list;
  for (var i = 0; i < cart_list.length; i++) {
    if (cart_list[i].isEditActive == 1) {
      cart_list[i].isEditActive == 0
    } else {
      cart_list[i].isEditActive == 1
    }

  }
  that.data.shoppingCatData.cart_list = cart_list;
  that.setData({
    shoppingCatData: that.data.shoppingCatData
  })
};

//已挪
publicFun.isActiveNew = function(that, isEditActive) { //活动选中状态
  var cart_list = that.data.shoppingCatData.now_physical_product_list;
  let sold_price = 0; //初始购物袋商品总售价
  let shop_catnum = 0; //初始购物袋商品总数量
  that.data.shoppingCatNum = 0;
  let shop_totalnum = 0;
  for (var i = 0; i < cart_list.length; i++) {
    if (cart_list[i].isActive == 1) {
      sold_price += cart_list[i].pro_price * parseInt(cart_list[i].pro_num);
      shop_catnum += parseInt(cart_list[i].pro_num);
    }
    shop_totalnum += parseInt(cart_list[i].pro_num);

  }
  let is_edit_active = isEditActive ? isEditActive : that.data.isEditActive; //全选
  let is_active = is_edit_active ? 'active' : '';
  that.setData({
    shoppingCatData: that.data.shoppingCatData,
    'shoppingCatMoney': sold_price.toFixed(2),
    'shoppingCatNum': shop_catnum,
    'shoppingCatTotalNum': shop_totalnum,
    'isEditActive': is_edit_active,
    'isActive': is_active
  })
};
publicFun.choiceShopping = function(that, e) { //购物袋选择按钮
  let index = e.target.dataset.index;
  let check = e.target.dataset.check;
  var cart_list = that.data.shoppingCatData.cart_list;
  if (check == 'check') { //全选按钮的操作
    if (that.data.isActive == 'active') {
      that.data.isActive = '';
      that.data.shoppingCatMoney = 0;
      that.data.shoppingCatNum = 0;
      for (var i in cart_list) {
        cart_list[i].isActive = 0;
      }
    } else {
      for (var i in that.data.shoppingCatData.cart_list) {
        cart_list[i].isActive = 1;
      }
      publicFun.isActive(that);
      that.data.isActive = 'active';
    }
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isActive': that.data.isActive,
      'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
      'shoppingCatNum': that.data.shoppingCatNum
    })
    return
  }
  let allSelected = false
  if (cart_list[index].isActive == 1) {
    cart_list[index].isActive = 0;
  } else {
    cart_list[index].isActive = 1;
  }
  allSelected = cart_list.every(item => item.isActive == 1)
  that.data.isEditActive = allSelected ? 'active' : '';
  publicFun.isActive(that);
};

publicFun.choiceShoppingNew = function(that, e, check_type) { //新增购物袋按钮选择逻辑
  let check = check_type ? check_type : e.target.dataset.check;
  var cart_list = that.data.shoppingCatData.now_physical_product_list;
  let index = check_type ? 0 : e.target.dataset.index;
  if (check == 'check') { //全选按钮的操作
    if (that.data.isActive == 'active') {
      that.data.isActive = '';
      that.data.shoppingCatMoney = 0;
      that.data.shoppingCatNum = 0;
      for (var i in cart_list) {
        cart_list[i].isActive = 0;
      }
    } else {
      for (var i in cart_list) {
        cart_list[i].isActive = 1;
      }
      publicFun.isActiveNew(that);
      that.data.isActive = 'active';
    }
   
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isActive': that.data.isActive,
      'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
      'shoppingCatNum': that.data.shoppingCatNum
    })
    return
  }
  if (check == 'check1') { //全选商品列表
    if (that.data.isActive1 == 'active') {
      that.data.isActive1 = '';
      that.data.shoppingCatMoney = 0;
      that.data.shoppingCatNum = 0;
      for (var i in cart_list) {
        if (cart_list[i].foreign_product != 2) {
          cart_list[i].isActive = 0;
        }
      }
    } else {
      for (var i in cart_list) {
        if (cart_list[i].foreign_product != 2) {
          cart_list[i].isActive = 1;
        } else {
          cart_list[i].isActive = 0;
        }
      }
      publicFun.isActiveNew(that);
      that.data.isActive1 = 'active';
      that.data.isActive2 = '';
      that.data.isforeignProductType = 1
    }
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isActive1': that.data.isActive1,
      'isActive2': that.data.isActive2,
      'isforeignProductType': that.data.isforeignProductType,
      'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
      'shoppingCatNum': that.data.shoppingCatNum
    })
    return
  }
  if (check == 'check2') { //全选跨境含税列表
    if (that.data.isActive2 == 'active') {
      that.data.isActive2 = '';
      that.data.shoppingCatMoney = 0;
      that.data.shoppingCatNum = 0;
      for (var i in cart_list) {
        if (cart_list[i].foreign_product == 2) {
          cart_list[i].isActive = 0;
        }
      }
    } else {
      for (var i in cart_list) {
        if (cart_list[i].foreign_product == 2) {
          cart_list[i].isActive = 1;
        } else {
          cart_list[i].isActive = 0;
        }
      }
      publicFun.isActiveNew(that);
      that.data.isActive2 = 'active';
      that.data.isActive1 = '';
      that.data.isforeignProductType = 2
    }
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isActive2': that.data.isActive2,
      'isActive1': that.data.isActive1,
      'shoppingCatMoney': (that.data.shoppingCatMoney * 1).toFixed(2),
      'isforeignProductType': that.data.isforeignProductType,
      'shoppingCatNum': that.data.shoppingCatNum
    })
    return
  }

  let allSelected = false
  //如果该商品不是跨境含税商品则跨境含税商品不可选,商品分组全选状态页要去除
  if (cart_list[index].foreign_product != 2) {

    if (cart_list[index].isActive == 1) {
      cart_list[index].isActive = 0;
    } else {
      cart_list[index].isActive = 1;
    }

    for (var i in cart_list) {
      if (cart_list[i].foreign_product == 2) {
        cart_list[i].isActive = 0;
      }
    }
    that.data.isforeignProductType = 1
    that.data.isActive1 = '';
    that.data.isActive2 = '';
    that.setData({
      'isforeignProductType': that.data.isforeignProductType,
      'isActive1': that.data.isActive1,
      'isActive2': that.data.isActive2,
    })
  }else{

    if (cart_list[index].isActive == 1) {
      cart_list[index].isActive = 0;
    } else {
      cart_list[index].isActive = 1;
    }

    for (var i in cart_list) {
      if (cart_list[i].foreign_product != 2) {
        cart_list[i].isActive = 0;
      }
    }
    that.data.isforeignProductType = 2
    that.data.isActive1 = '';
    that.data.isActive2 = '';
    that.setData({
      'isforeignProductType': that.data.isforeignProductType,
      'isActive1': that.data.isActive1,
      'isActive2': that.data.isActive2,
    })
  }

  allSelected = cart_list.every(item => item.isActive == 1)
  let isEditActive = allSelected ? 'active' : '';
  that.setData({
    isEditActive: isEditActive,
    isActive1: isEditActive
  })
  publicFun.isActiveNew(that, isEditActive);
};
publicFun.editChoiceShopping = function(that, e) { //编辑购物袋选择按钮
  /***
   * belong_to_physical
     1:当前门店可用 2:当前门店不可用 3:其他门店
   */
  let index = e.target.dataset.index;
  let check = e.target.dataset.edit_check;
  let data = that.data.shoppingCatData;
  var cart_all_list = data.cart_list; //当前购物袋下所有商品
  let cart_list = []; //购物袋不同类目下商品
  let type = e.currentTarget.dataset.type;
  if (type) {
    if (type == 1) { //当前门店
      cart_list = data.now_physical_product_list;
    } else if (type == 2) { //当前门店不可选商品
      cart_list = data.now_physical_unable_list;
    } else if (type == 3) { //其他门店
      cart_list = data.other_physical_product_list;
    }
  }
  // 全选按钮的操作
  if (check == 'edit_check') {
    let isEditActive = '';
    if (that.data.isEditActive == 'active') {
      isEditActive = '';
    } else {
      isEditActive = 'active';
    }
    //当前门店
    for (var i in data.now_physical_product_list) {
      if (data.now_physical_product_list[i]) {
        data.now_physical_product_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
        data.now_physical_product_list[i].isActive = that.data.isEditActive == 'active' ? 0 : 1;
      }
    }
    //当前门店不可选
    for (var i in data.now_physical_unable_list) {
      if (data.now_physical_unable_list[i]) {
        data.now_physical_unable_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
      }
    }
    //其他门店
    for (var i in data.other_physical_product_list) {
      if (data.other_physical_product_list[i]) {
        data.other_physical_product_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
      }
    }
    //所有商品列表
    for (var i in cart_all_list) {
      if (cart_all_list[i]) {
        cart_all_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
      }
    }

    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isEditActive': isEditActive,
    })
    return
  }
  // 全选普通商品列表
  if (check == 'edit_check1') {
    let isEditActive1 = '';
    if (that.data.isEditActive1 == 'active') {
      isEditActive1 = '';
    } else {
      isEditActive1 = 'active';
    }
    //当前门店
    for (var i in data.now_physical_product_list) {
      if (data.now_physical_product_list[i]) {
          if(data.now_physical_product_list[i].foreign_product != 2) {
            data.now_physical_product_list[i].isEditActive = that.data.isEditActive1 == 'active' ? 0 : 1;
            data.now_physical_product_list[i].isActive = that.data.isEditActive1 == 'active' ? 0 : 1;
        }
      }
    }
    //所有商品列表
    for (var i in cart_all_list) {
      if (cart_all_list[i]) {
        if (cart_all_list[i].foreign_product != 2) {
        cart_all_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
        }
      }
    }
    console.log(that.data.shoppingCatData)
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isEditActive1': isEditActive1,
    })
    return
  }

  // 全选跨境
  if (check == 'edit_check2') {
    let isEditActive2 = '';
    if (that.data.isEditActive2 == 'active') {
      isEditActive2 = '';
    } else {
      isEditActive2 = 'active';
    }
    //当前门店
    for (var i in data.now_physical_product_list) {
      if (data.now_physical_product_list[i]) {
        if (data.now_physical_product_list[i].foreign_product == 2) {
          data.now_physical_product_list[i].isEditActive = that.data.isEditActive2 == 'active' ? 0 : 1;
          data.now_physical_product_list[i].isActive = that.data.isEditActive2 == 'active' ? 0 : 1;
        }
      }
    }
    //所有商品列表
    for (var i in cart_all_list) {
      if (cart_all_list[i]) {
        if (cart_all_list[i].foreign_product == 2) {
          cart_all_list[i].isEditActive = that.data.isEditActive == 'active' ? 0 : 1;
        }
      }
    }
    that.setData({
      'shoppingCatData': that.data.shoppingCatData,
      'isEditActive2': isEditActive2,
    })
    return
  }

  let allSelected = false
  // 单项按钮的操作
  if (cart_list[index].isEditActive == 1) {
    cart_list[index].isEditActive = 0;
    data.cart_list.forEach(function(v, i) {
      if (v.pigcms_id == cart_list[index].pigcms_id) {
        data.cart_list[i].isEditActive = 0;
      }
    })
    if (type == 1) { //可选门店
      data.now_physical_product_list[index].isActive = 0;
    }

  } else {
    cart_list[index].isEditActive = 1;
    data.cart_list.forEach(function(v, i) {
      if (v.pigcms_id == cart_list[index].pigcms_id) {
        data.cart_list[i].isEditActive = 1;
      }
    })
    if (type == 1) { //当前门店
      data.now_physical_product_list[index].isActive = 1;
    }
  }
  //全选数据遍历

  let allSelectd = false;
  let select1 = false,
    select2 = false,
    select3 = false;
  //当前门店
  if (data.now_physical_product_list && data.now_physical_product_list.length > 0) {
    select1 = data.now_physical_product_list.every(item => item.isEditActive == 1);
  } else {
    select1 = true;
  }
  //当前门店不可选
  if (data.now_physical_unable_list && data.now_physical_unable_list.length > 0) {
    select2 = data.now_physical_unable_list.every(item => item.isEditActive == 1);
  } else {
    select2 = true;
  }
  //其他门店
  if (data.other_physical_product_list && data.other_physical_product_list.length > 0) {
    select3 = data.other_physical_product_list.every(item => item.isEditActive == 1);
  } else {
    select3 = true;
  }
  allSelectd = (select1 && select2 && select3) ? true : false;

  let isEditActive = allSelectd ? 'active' : '';

  that.setData({
    'shoppingCatData': data,
    'isEditActive': isEditActive,
  })
};

publicFun.orderGo = function(e) { //跳转订单详情
  let order = e.target.dataset.order;
  wx.navigateTo({
    url: '/pages/user/order/index?order=' + order
  });
};
publicFun.completeCollage = function(e, that) { //确认订单
  publicFun.promptMsg('确定完成拼团么', '确定', '取消', completeCollage);

  function completeCollage() { //确认按钮之后的操作
    let tuan_id = e.target.dataset.tuan;
    let team_id = e.target.dataset.team;
    let index = e.target.dataset.index;
    common.post('webapp.php?c=tuan&a=over&tuan_id=' + tuan_id + '&team_id=' + team_id, '', completeCollage, '');

    function completeCollage(result) { //请求数据成功的操作
      that.data.orderlistData.order_list[index].tuan_over = false;
      that.data.orderlistData.order_list[index].status_txt = '成功';
      that.setData({
        orderlistData: that.data.orderlistData
      })

    }
  }
};

publicFun.promptMsg = function(msg, confirm, cancel, callFun, title) { //提示警告框
  let showCancel = true;
  if (cancel == '') {
    showCancel = false;
  }
  if (!title) title = '提示信息';
  wx.showModal({
    title: title,
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
publicFun.shear = function(that) { //分享
  if (that.data.shear) {
    that.setData({
      shear: false
    })
    return
  }
  that.setData({
    shear: true
  })
}
publicFun.defaultAddress = function(e, that, address_id, go) { //默认地址选择
  if (e == 0) {
    var address_id = address_id;
  } else {
    var address_id = e.currentTarget.dataset.addid;
  }
  common.post('app.php?c=address&a=set_default&address_id=' + address_id, '', defaultAddress, '');

  function defaultAddress(result) {
    if (go == 'geo' || go == 'go' || go == 'pay') {
      publicFun.freight(that, address_id);
    } else if (go == 'back2') {
      wx.navigateBack({
        delta: 2
      })
    } else if (go != undefined && go != '') {
      // wx.redirectTo({
      //     url: '/pages/payment/index?order_no=' + go + '&address_id=' + address_id,
      // })
      console.log('选择默认地址后，返回上一页---支付页')
      let pages = getCurrentPages()
      publicFun.freight(pages[pages.length - 2], address_id);
      wx.navigateBack({
        delta: 1
      })
    }
    if (e) {
      publicFun.swichNav(e, that);
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
    common.post('app.php?c=address&a=delete&address_id=' + address_id, '', delAddress, '');

    function delAddress() { //请求数据成功的操作
      delete that.data.addressData[index];
      that.setData({
        addressData: that.data.addressData
      })
    }
  }
};
publicFun.cancelOrder = function(that, order_no, index, callback) { //取消订单
  publicFun.promptMsg('确定取消此订单么?', '确定', '取消', cancelOrder);

  function cancelOrder() {
    common.post('app.php?c=order&a=cancel&order_no=' + order_no, '', cancelOrder, '');

    function cancelOrder(result) {
      if (result.err_code == 0) {
        typeof callback == "function" && callback()

      };
    }
  }
};
publicFun.cancelReturn = function(that, order_no, index) { //取消退货
  publicFun.promptMsg('确定取消退货么?', '确定', '取消', cancelReturn);

  function cancelReturn() {
    common.post('app.php?c=return&a=cancel&return_id=' + order_no, '', cancelReturn, '');

    function cancelReturn(result) {
      if (result.err_code == 0) {
        if (typeof index !== 'undefined') { //删除列表数据
          delete that.data.orderlistData.return_list[index];
          that.setData({
            'orderlistData.return_list': that.data.orderlistData.return_list
          })
          return
        }
        wx.redirectTo({
          url: '/pages/USERS/pages/user/myServer/index?rights=0'
        });
      };
    }
  }
};
publicFun.cancelRights = function(that, order_no, index) { //取消维权
  publicFun.promptMsg('确定取消维权么?', '确定', '取消', cancelRights);

  function cancelRights() {
    common.post('app.php?c=rights&a=cancel&id=' + order_no, '', cancelRights, '');

    function cancelRights(result) {
      if (result.err_code == 0) {
        if (typeof index !== 'undefined') { //删除列表数据
          delete that.data.orderlistData.return_list[index];
          that.setData({
            'orderlistData.return_list': that.data.orderlistData.return_list
          })
          return
        }
        wx.redirectTo({
          url: '/pages/USERS/pages/user/myServer/index?rights=1'
        });
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
  wx.showToast({
    title: "加载中..",
    icon: "loading"
  })
  common.post(url, '', setPushData, '');

  function setPushData(result) { //添加数据
    let list = that.data.orderlistData.order_list;
    for (var i = 0; i < result.err_msg.order_list.length; i++) {
      list.push(result.err_msg.order_list[i]);
    }
    that.setData({
      'orderlistData.order_list': list,
      'orderlistData.next_page': result.err_msg.next_page
    });
    wx.hideToast()
  }
};
publicFun.completeOrder = function(order_no, that, index) { //完成订单-订单页面
  publicFun.promptMsg('确定完成订单么', '确定', '取消', completeOrder);

  function completeOrder() { //确认按钮之后的操作
    common.post('app.php?c=order&a=complete&order_no=' + order_no, '', completeOrder, '');

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
    common.post('app.php?c=order&a=receive&order_no=' + order_no, '', completeReceipt, '');


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
publicFun.returnGo = function(e) { //查看退货
  let id = e.target.dataset.id;
  let order_no = e.target.dataset.order;
  let returnid = e.target.dataset.returnid;
  if (returnid == undefined || (returnid == '')) {
    returnid = 0;
  }

  wx.navigateTo({
    url: '/pages/user/order/returnCompletion?id=' + id + '&order=' + order_no + '&returnid=' + returnid
  });
};
publicFun.rightsGo = function(e) { //查看维权
  let pid = e.target.dataset.pid;
  let order_no = e.target.dataset.order_no;
  let rights_id = e.target.dataset.rights_id;
  if (rights_id == undefined || (rights_id == '')) {
    rights_id = 0;
  }
  wx.navigateTo({
    url: '/pages/user/order/rightCompletion?rightid=' + rights_id + '&order_no=' + order_no + '&pid=' + pid
  });
};
publicFun.applyRefundGo = function(e) { //申请退货
  let id = e.target.dataset.id;
  let order_no = e.target.dataset.order;
  wx.navigateTo({
    url: '/pages/user/order/returnGoods?id=' + id + '&order=' + order_no
  });
};
publicFun.applyRightsGo = function(e) { //申请退货
  let id = e.target.dataset.id;
  let order_no = e.target.dataset.order;
  wx.navigateTo({
    url: '/pages/user/order/rightGoods?id=' + id + '&order=' + order_no
  });
};
publicFun.addImg = function(that, evaluation, index) { //图片上传控件---评价
  let ticket = '';
  const {
    wxapp_ticket
  } = getApp().globalData;
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
    success: function(res) { // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片

      var tempFilePaths = res.tempFilePaths;
      wx.uploadFile({
        url: common.Url + 'app.php?c=attachment&a=upload&store_id=' + getApp().globalData.store_id+'&request_from=wxapp&wxapp_ticket=' + ticket,
        filePath: tempFilePaths[0],
        name: 'file',
        formData: {
          'user': 'test'
        },
        success: function(res) {
          res = JSON.parse(res.data);
          if (res.err_code == 20000) {
            wx.redirectTo({
              url: '/pages/index/index'
            })
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
            if (typeof evaluation !== 'undefined') {
              that.data.evaluationData.order_product_list[index].imgList.unshift(data.err_msg);
              that.setData({
                evaluationData: that.data.evaluationData
              })
              return
            }

            that.data.imgList.unshift(data.err_msg);
            that.setData({
              imgList: that.data.imgList,
            });
          }
        },

      })

    },
    fail: function(res) {
      console.log(res);
    }
  })
};
publicFun.addImgMessage = function(that, index) { //图片上传控件---通用添加留言图片
  wx.chooseImage({ //图片上传控件
    count: 1, // 默认9
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function(res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths;
      common.uploadFile('app.php?c=attachment&a=upload', tempFilePaths[0], function(_res) {
        that.data.shoppingData.shoppingCatData.custom_field_list[index].imgList.unshift(_res.err_msg);
        that.setData({
          shoppingData: that.data.shoppingData,
        });
      }, '')
    }
  })
};
publicFun.verifyNumber = function(that, num) { //手机号验证
  let res = '!/^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/';
  if (num == '' || num == undefined) {
    publicFun.warning('请填写手机号', that);
    return false;
  }
  if (!(num).match(/\d{11}/)) {
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
  // that.setData({
  //   logisticsShow: true
  // })
  let code = e.target.dataset.code;
  let express = e.target.dataset.express;
  wx.navigateTo({
    url: '/pages/SHOPGOODS/pages/ems/ems?id='+ express
  })
  // common.wuliu ({data: {number: express,mobile: '13855198776'}, sCallback: function (res) {
  //   if (res.data) {
  //     that.setData({
  //       logistics: res.data.list
  //     })
  //   }
  // }});

  function logistics(result) {
    if (result.err_code == 0) {
      that.setData({
        logistics: result.err_msg.data
      })
    }
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
  var regMobile = /^1\d{10}$/; //手机

  if (regMobile.test(phone)) {
    return true;
  } else {
    return false;
  }
};
publicFun.search = function(key, that, page) { //搜索页面
  common.post('app.php?c=goods&a=search_in_store&keyword=' + key + '&page=' + page, '', "productListData", that);
};
publicFun.wxSearchFn = function(that, e, page) { //搜索按钮-跳转效果
  let key = that.data.keyword;
  if ((key == undefined) || (key == '')) {
    return publicFun.warning('请输入搜索关键字', that);
  }
  if (page == 'groupPage') {
    wx.navigateTo({
      url: '../../../product/productList?keyword=' + key
    })
    return
  }
  if (page == 'page') { //店铺主页搜索跳到产品搜索页面
    wx.navigateTo({
      url: '/pages/product/productList?keyword=' + key
    })
    return
  }
  if (page == 'shopHome') { //门店列表搜索,
    common.post('app.php?c=lbs&a=substores&keyword=' + key, '', "shopHomeData", that);
    return
  }
  publicFun.search(key, that, page);
};
publicFun.wxSearchInput = function(that, e) { //搜索输入框-文字效果
  let key = e.detail.value;
  var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
  var txt_value = "";
  for (var i = 0; i < key.length; i++) {
    txt_value = txt_value + key.substr(i, 1).replace(pattern, '');
  }

  that.setData({
    keyword: txt_value
  })
};
publicFun.cancelSearch = function(that, e) { //搜索输入框-取消效果
  that.setData({
    keyword: ''
  })
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
    common.post('app.php?c=address&a=edit&address_id=' + addId, '', init, '');
  } else {
    area.picker.province(that, that.data.user_address.province);

    var province_index = that.data.province_index;
    that.pickerProvince('', province_index);

    var city_index = that.data.city_index;
    that.pickerCity('', city_index);
    that.setData({
      user_address: '',
      flags: true
    });
  }

  function init(result) {
    var data = result.err_msg.user_address;
    if (that && that.data && that.data.paymentPostage == 'local') {
      data.address = '';
    }
    data.lat = '';
    data.lng = '';

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
publicFun.pickerProvince = function(that, e, p_index, status) { //地址选择-省份
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
  if (status) {
    publicFun.resolutionAddress(that);
  }


};
publicFun.resolutionAddress = function(that) {
  let params = {
    province: that.data.province_code_arr[that.data.province_index],
    city: that.data.city_code_arr[that.data.city_index],
    county: that.data.country_code_arr[that.data.country_index]
  }
  let url = 'app.php?c=community_leader&a=get_physical_list';
  common.post(url, params, function(res) {
    console.log('解析地址', res);
    let physica_list_arr = [];
    for (var i in res.err_msg.physica_list) {
      physica_list_arr.push(res.err_msg.physica_list[i].name)
    }
    that.setData({
      physica_list_arr: physica_list_arr,
      community_name_arr: res.err_msg.physica_list,
      community_index: 0

    })
  }, '')
};
publicFun.pickerCity = function(that, e, c_index, status) { //地址选择-市
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
  if (status) {
    publicFun.resolutionAddress(that);
  }
};
publicFun.pickerCountry = function(that, e, status) { //县区
  that.setData({
    country_index: e.detail.value
  });
  if (status) {
    publicFun.resolutionAddress(that);
  }
};
publicFun.addressSave = function(that, e, go) { //提交地址

  var name = e.detail.value.name;
  var tel = e.detail.value.tel;
  var province = e.detail.value.province;
  var city = e.detail.value.city;
  var area = e.detail.value.area;
  var address = e.detail.value.address;
  var address_detail = e.detail.value.address_detail;
  var zipcode = e.detail.value.zipcode;
  var paymentPostage = that.data.paymentPostage;
  let {
    lng,
    lat
  } = that.data.user_address
  if (name.length == 0) {
    publicFun.warning('请填写收货人姓名', that);
    return;
  }

  if (tel.length == 0) {
    publicFun.warning('请填写手机号', that);
    return;
  }
  if (paymentPostage == 'local' && (!that.data.user_address.lng || !that.data.user_address.lat)) {
    that.setData({
      positionError: true
    })
    publicFun.warning('请选择详细定位', that);
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
    publicFun.warning('请选择详细地址', that);
    return;
  }
  var data = {
    lng,
    lat
  };
  data.address_id = that.data.address_id;
  data.name = name;
  data.tel = tel;
  data.province = province;
  data.city = city;
  data.area = area;
  data.address = address;
  data.address_detail = address_detail;
  data.zipcode = zipcode;
  if(that.data.repeatSubmit==true){
    wx.showToast({
      title: '已提交，10秒内不可提交多次',
      icon:'none'
    })
    return;
  }
  that.setData({
    repeatSubmit: true//防止重复提交 
  })
  var st_out=setTimeout(() => {
    that.setData({
      repeatSubmit: false//防止重复提交 
    })
    clearTimeout(st_out);
  }, 10000);
  wx.showLoading({
    title: '地址信息已提交，请稍后',
  })
  common.post('app.php?c=address&a=save', data, saveBack, '');

  function saveBack(result) {
    wx.hideToast();
    if (go == 'go') { //是否是支付页面修改的地址
      let address_id = result.err_msg.address_id;
      let e = 0;
      publicFun.defaultAddress(e, that, address_id, 'geo');
      return
    } else if (go == 'sid') { // 返回带有order信息的address/index页面
      if (that.data.address_id == 0) {
        console.log('新建地址保存后，设置为默认地址，并返回支付页面')
        publicFun.defaultAddress(0, that, result.err_msg.address_id, 'back2');
      } else {
        wx.navigateBack({
          delta: 1,
        })
      }

      return
    }
    wx.showToast({
      title: '成功添加地址',
      icon: 'success',
      duration: 2000
    })
    // 保存地址后，返回上一页
    wx.navigateBack({
      delta: 1,
    })
  }
};

publicFun.chooseLocation = function(that, cb) {
  wx.chooseLocation({
    success: function(res) {
      // console.log("res.address", res, res.address);
      // address:"上海市松江区三新北路900弄"
      // errMsg:"chooseLocation:ok"
      // latitude:31.033767
      // longitude:121.198205
      // name:"泰晤士小镇"
      //自动选择省市区
      //匹配省市区信息
      if (!res.address) return;
      let pvReg = /.*?[省|市|区|县]/g

      console.log("res-地址：", res, JSON.stringify(res));
      let addressParam = res.address;
      if (addressParam.indexOf('省') < 0) {
        let {
          lat,
          lng
        } = publicFun.MapabcEncryptToBdmap(res.latitude, res.longitude)
        let data = {};
        data.keyword = JSON.stringify(res);

        //获取省市信息
        common.post('app.php?c=address&a=getAddressByJw', data, (result) => {
          if (result.err_code == 0) {
            const {
              province,
              city,
              area,
              address,
              latitude,
              longitude,
              name
            } = result.err_msg;
            publicFun.localFun(that, province, city, area);
            let _address=name;
            if (area.indexOf("区")<0){
              _address = area + name;
            }
            that.setData({
              'user_address.address': _address,
              'user_address.lat': latitude,
              'user_address.lng': longitude,
              positionError: false
            })
          } else {
            that.setData({
              'user_address.address': res.name,
              'user_address.lat': lat,
              'user_address.lng': lng,
              newAddress: res,
              positionError: false
            })
          }
        }, '');
        return;
      } else {
        that.setData({
          newAddress: []
        })
      }
      let province = pvReg.exec(res.address)[0]
      let city = "";
      if (['北京市', '上海市', '天津市', '重庆市'].includes(province)) {
        city = province
      } else {
        city = pvReg.exec(res.address)[0]
      }
      let province_index = that.data.province_name_arr.findIndex(pv => pv === province);
      publicFun.pickerProvince(that, {
        detail: {
          value: province_index
        }
      })
      let city_index = that.data.city_name_arr.findIndex(c => c === city)
      publicFun.pickerCity(that, {
        detail: {
          value: city_index
        }
      });
      let district = pvReg.exec(res.address);
      if(district){
        district = district[0];
        let district_index = that.data.country_name_arr.findIndex(d => d === district)
        publicFun.pickerCountry(that, {
          detail: {
            value: district_index
          }
        })
      }
      let {
        lat,
        lng
      } = publicFun.MapabcEncryptToBdmap(res.latitude, res.longitude)
      that.setData({
        'user_address.address': res.name,
        'user_address.lat': lat,
        'user_address.lng': lng,
        positionError: false
      })
      cb && cb(res)
    },
    fail: function(res) {
      console.log("地址res---------------",res)
      if (res.errMsg && res.errMsg.indexOf('cancel')<0){
        wx.showModal({
          title: '',
          content: '由于您关闭了地理位置获取权限，无法取得您的定位，请重新开启权限',
          confirmText: '授权开启',
          cancelText: '取消',
          success(res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) { }
              })
            }
          }
        })
      }
      
    }
  })
}

// 解析获取不到的省市信息
publicFun.localFun = function(that, province, city, district) {
  let province_index = that.data.province_name_arr.findIndex(pv => pv === province);
  publicFun.pickerProvince(that, {
    detail: {
      value: province_index
    }
  })
  let city_index = that.data.city_name_arr.findIndex(c => c === city)
  publicFun.pickerCity(that, {
    detail: {
      value: city_index
    }
  })
  let district_index = that.data.country_name_arr.findIndex(d => d === district)
  publicFun.pickerCountry(that, {
    detail: {
      value: district_index
    }
  })
}
publicFun.freight = function(that, address_id, method, confrim_address) {
  //查询物流运费信息
  if (!method) {
    method = that.data.paymentPostage;
  }
  wx.showLoading({
    title: '数据加载中...',
    mask: true,
  })

  if ((method == 'local' || method == 'express') && (!address_id)) {
    wx.hideLoading();
    wx.showModal({
      title: '',
      content: '配送地址获取失败。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: that.data.themeColorValue
    })
    return;
  }
  //添加运费请求之前提交订单是否可点击判断
  var freight_stauts = that.data.freight_stauts;
  freight_stauts = 'post';
  that.setData({
    freight_stauts
  });
  var post_st = setTimeout(() => {
    freight_stauts = 'get_price';
    that.setData({
      freight_stauts
    })
    clearTimeout(post_st);
  }, 1000 * 20)
  if(method != 'local'){
    common.post('app.php?c=order&a=postage&method=' + method + '&postage=' + that.data.paymentData.order.postage + '&address_id=' + address_id + '&order_no=' + that.data.order_no, '', freight, ''); //获取运费信息
  }else{
    wx.hideLoading();
  }
  function freight(result) {

    var post_st1 = setTimeout(() => {
      freight_stauts = 'get_price';
      that.setData({
        freight_stauts
      })
      clearTimeout(post_st1);
    }, 800)

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
        postageData: result.err_dom,
        postage: true
      })
    }

    function freight(res) {
      // console.log(res);
    }
    wx.hideLoading();
    that.setData({
      'paymentData.order.postage': result.err_msg, //修改运费
      'order_post': result.err_msg //修改运费
    })
    publicFun.paymentMoney(that)
    //之前这里是选择位置的处理，现在换了位置
    if (confrim_address) {
      publicFun.closeAddress(that);
      publicFun.queryAddress(that, address_id, confrim_address)
    }
    //同城配送->最后一遍支付规则校对
    if (method == 'local') {
      let deliveryfeejoin = that.data.paymentData.now_physical ? that.data.paymentData.now_physical.deliveryfeejoin : 0;
      if (deliveryfeejoin>0)return;//达达配送逻辑下不走规则验证

      publicFun.checkRule(that);
    }

  }
};
//支付信息校对
publicFun.checkRule = function(that) {
  //获取当前订单的价格，如果不满足消费金额，则不能支付
  if (that.data.paystatus == "waitpay") return;
  let now_physical = that.data.paymentData.now_physical;
  let amount_type = now_physical.amount_type;
  let total = (that.data.paymentData.order.float_amount * 1 > 0) ? that.data.paymentData.order.total : (that.data.paymentData.order.sub_total * 1);
  let currentPrice = total - that.data.discountPrice * 1 - that.data.rewardPrice * 1 - that.data.couponMoney * 1 - that.data.integralPricePage * 1 - that.data.presaleReducePrice; //所有折扣优惠除去的实际付的价格
  currentPrice = (currentPrice).toFixed(2);
  let baseMoney = amount_type === 'order_money' ? total : currentPrice
  let typeText = amount_type === 'order_money' ? '订单' : '消费'

  /**
   * local_type
   * 2=不限配送距离 1=限定配送距离
   * **/
  if (now_physical.local_type == 1) {
    if (typeText == 'order_money') {
      //满减>订单价
      if ((now_physical.delivery_min_amount * 1 > total)) {
        let no_postage_text = `${typeText}满${now_physical.delivery_min_amount}元起送`
        that.setData({
          postage: false,
          no_postage_text
        })
        return wx.showToast({
          title: no_postage_text,
          icon: "none",
        })
      }
    } else {
      //满减>实际消费
      if ((now_physical.delivery_min_amount * 1 > baseMoney)) {
        let no_postage_text = `${typeText}满${now_physical.delivery_min_amount}元起送`
        that.setData({
          postage: false,
          no_postage_text
        })
        return wx.showToast({
          title: no_postage_text,
          icon: "none",
        })
      }
    }
  }


}

//选择同城配送相关逻辑处理
publicFun.localExpress = function(that, integralChange) {
  //1126 新增【ID1000402】源码h5同城配送运费由后台返回  

  let now_physical = that.data.paymentData.now_physical;
  let amount_type = now_physical.amount_type;
  let total = (that.data.paymentData.order.float_amount * 1 > 0) ? that.data.paymentData.order.total : (that.data.paymentData.order.sub_total * 1);
  let currentPrice = total - that.data.discountPrice * 1 - that.data.rewardPrice * 1 - that.data.couponMoney * 1 - that.data.integralPricePage * 1 - that.data.presaleReducePrice * 1;//所有折扣优惠除去的实际付的价格
  currentPrice = (currentPrice).toFixed(2);
  let baseMoney = amount_type === 'order_money' ? total : currentPrice;
  let typeText = amount_type === 'order_money' ? '订单' : '消费'
  if (!that.data.paymentData.wxapp_address.address_id) {
    let no_postage_text = "同城配送需要精确定位当前位置,请新增或修改地址"
    that.setData({
      postage: false,
      no_postage_text,
      positionError: true
    })
    return;
  }
  //11.19同城配送
  //新增获取同城配送价格

  getDeliveryPrice(that.data.paymentData.wxapp_address, now_physical, that)

  // order_no lat lng rname rtel order_no address address_id  baseMoney order_money
  function getDeliveryPrice(address, shop, that) {
    if (!address.lat) {
      wx.showModal({
        title: '',
        content: '详细地址信息缺少，即将前往地址编辑页，请重新编辑地址信息',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: that.data.themeColorValue,
        success: function (res) {
          wx.navigateTo({
            url: '/pages/user/address/addressEdit?addid=' + address.address_id + '&order_no=' + that.data.paymentData.order.order_no_txt + '&address=' + address.address_id+'&paymentPostage=' + that.data.paymentPostage
          })
        }
      })

      return;
    }
    let data = {
      physical_id: shop.pigcms_id,
      lat: address.lat,
      lng: address.lng,
      rname: address.address_user,
      rtel: address.address_tel,
      order_no: that.data.order_no,
      payprice: currentPrice,
      pro_price: total,
      address_id: address.address_id,
      address: address
    }

    common.post('app.php?c=order&a=multdeliveryfee', data, res => {
      if (res) {
        if (res.err_code == 0) {
          shop.current_deliver_fee = res.err_msg.delivery_fee * 1;
          that.setData({
            no_postage_text: "",
            postage: true,
            'paymentData.order.postage': shop.current_deliver_fee,
            'order_post': shop.current_deliver_fee//修改运费
          })
          publicFun.paymentMoney(that)
          // publicFun.freight(that, that.data.paymentData.wxapp_address.address_id, 'local');
          let deliveryfeejoin = that.data.paymentData.now_physical ? that.data.paymentData.now_physical.deliveryfeejoin : 0;
          if (deliveryfeejoin>0)return;//达达配送逻辑下不走规则验证
    
          publicFun.checkRule(that);
          that.setData({ freight_stauts:'get_price'  })
          return false;
        } else {
          that.setData({
            no_postage_text: res.err_msg,
            postage: false,
            'paymentData.order.postage': 0
          })
        }
      }
    }, '')
  }

}

function getRad(d) { //转换
  let PI = Math.PI;
  return d * PI / 180.0;
}

function getFlatternDistance(lat1, lng1, lat2, lng2) { //计算距离
  let EARTH_RADIUS = 6378137.0; //单位M

  lat1 = parseFloat(lat1);
  lng1 = parseFloat(lng1);
  lat2 = parseFloat(lat2);
  lng2 = parseFloat(lng2);

  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;
  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
}

// 门店配送区域检测（多边形）
function IsPtInPoly(ALon, ALat, APoints) {
  var iSum = 0,
    iCount;
  var dLon1, dLon2, dLat1, dLat2, dLon;
  if (APoints.length < 3) return false;
  iCount = APoints.length;
  for (var i = 0; i < iCount; i++) {
    if (i == iCount - 1) {
      dLon1 = APoints[i].lng;
      dLat1 = APoints[i].lat;
      dLon2 = APoints[0].lng;
      dLat2 = APoints[0].lat;
    } else {
      dLon1 = APoints[i].lng;
      dLat1 = APoints[i].lat;
      dLon2 = APoints[i + 1].lng;
      dLat2 = APoints[i + 1].lat;
    }
    //以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上
    if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
      if (Math.abs(dLat1 - dLat2) > 0) {
        //得到 A点向左射线与边的交点的x坐标：
        dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
        if (dLon < ALon)
          iSum++;
      }
    }
  }
  if (iSum % 2 != 0)
    return true;
  return false;
}

publicFun.queryAddress = function(that, address_id) {
  common.post('app.php?c=address&a=get&address_id=' + address_id, '', queryAddress, ''); //查询单条地址

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
  common.post('app.php?c=address&a=all', '', addressData, '');

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
};
publicFun.getLocation = function(that) {
  wx.getLocation({
    type: 'wgs84',
    success: function(res) {
      console.log(`经纬度=============`, res)
      var latitude = res.latitude
      var longitude = res.longitude
      wx.setStorage({
        key: "latitude",
        data: latitude
      });
      wx.setStorage({
        key: "longitude",
        data: longitude
      })
      //发送请求通过经纬度反查地址信息  
      var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + res.latitude + "," + res.longitude + "&key=" + getApp().globalData.mapKey;
      wx.request({          
        url: getAddressUrl,
        success: function (result) {  
          if (result.data.result.address_component.city) {
            let localName = result.data.result.address_component.city;
            localName = localName.substring(0,localName.length-1);
            getApp().globalData.localName = localName;
          }
          wx.setStorage({
            key: "localname",
            data: getApp().globalData.localName
          })
        },
        fail: function(res) {
          console.log(res,'request fail')   
        }      
      })
    },
    fail: function(res) {
      console.log("定位失败-----", res)
      // wx.showToast({
      //   title: '定位失败，请稍后重试111-123',
      //   icon:'none'
      // })
    }
  })
}
publicFun.expressDistance = function(lats, longs) {
  function expressDistance(alats, alongs, lats, longs) {
    var express = '请设置您的位置';
    var distance = '0';
    if (lats == '' || longs == '') {
      express = '商家未设置位置';
    } else if (alats == '' || alongs == '') {
      express = '您未设置位置';
    } else {
      distance = (getFlatternDistance(alats, alongs, lats, longs) / 1000).toFixed(2);

    }
    if (distance > 1000) {
      return '>1000km';
    }
    return distance + 'km';

  }

  function getRad(d) { //转换
    let PI = Math.PI;
    return d * PI / 180.0;
  }

  function getFlatternDistance(lat1, lng1, lat2, lng2) { //计算距离
    let EARTH_RADIUS = 6378137.0; //单位M

    lat1 = parseFloat(lat1);
    lng1 = parseFloat(lng1);
    lat2 = parseFloat(lat2);
    lng2 = parseFloat(lng2);

    var f = getRad((lat1 + lat2) / 2);
    var g = getRad((lat1 - lat2) / 2);
    var l = getRad((lng1 - lng2) / 2);

    var sg = Math.sin(g);
    var sl = Math.sin(l);
    var sf = Math.sin(f);

    var s, c, w, r, d, h1, h2;
    var a = EARTH_RADIUS;
    var fl = 1 / 298.257;

    sg = sg * sg;
    sl = sl * sl;
    sf = sf * sf;

    s = sg * (1 - sl) + (1 - sf) * sl;
    c = (1 - sg) * (1 - sl) + sf * sl;

    w = Math.atan(Math.sqrt(s / c));
    r = Math.sqrt(s * c) / w;
    d = 2 * w * a;
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  }

  let latitude = '';
  let longitude = '';
  try {
    latitude = wx.getStorageSync('latitude')
    longitude = wx.getStorageSync('longitude')
  } catch (e) {

  }
  return (expressDistance(latitude, longitude, lats, longs));
};
publicFun.setDate = function(date) {
  var date = new Date(date * 1000);
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var strDate1 = date.getMinutes();
  var seperator2 = ":";
  if (strDate1 >= 0 && strDate1 <= 9) {
    strDate1 = "0" + strDate1;
  }
  var getSeconds = date.getSeconds();

  if (getSeconds >= 0 && getSeconds <= 9) {
    getSeconds = "0" + getSeconds;
  }
  var getHours = date.getHours();

  if (getHours >= 0 && getHours <= 9) {
    getHours = "0" + getHours;
  }
  return date.getFullYear() + seperator1 + month + seperator1 + strDate + ' ' + getHours + seperator2 + strDate1 + seperator2 + getSeconds;
};
publicFun.setDateDay = function(date) {
  if ((date != '') && date) {
    date = new Date(date * 1000)
  } else {
    date = new Date()
  }

  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var strDate1 = date.getMinutes();
  var seperator2 = ":";
  if (strDate1 >= 0 && strDate1 <= 9) {
    strDate1 = "0" + strDate1;
  }
  return date.getFullYear() + seperator1 + month + seperator1 + strDate

};
publicFun.setDateTime = function(date) {
  var date = new Date();
  var seperator1 = "-";
  var hours = date.getHours();
  var seconds = date.getSeconds();
  var strDate1 = date.getMinutes();
  if (hours >= 1 && hours <= 9) {
    hours = "0" + hours;
  }
  if (seconds >= 0 && seconds <= 9) {
    seconds = "0" + seconds;
  }

  var seperator2 = ":";
  if (strDate1 >= 0 && strDate1 <= 9) {
    strDate1 = "0" + strDate1;
  }
  var getSeconds = date.getSeconds();

  if (getSeconds >= 0 && getSeconds <= 9) {
    getSeconds = "0" + getSeconds;
  }
  return hours + seperator2 + strDate1;

};
publicFun.getNowFormatDate = function(that) { //获取日期时间
  var getNowFormatDate = {}
  getNowFormatDate.currentdate = function() {
    var date = new Date();
    var seperator1 = "-";

    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    return date.getFullYear() + seperator1 + month + seperator1 + strDate;
  }
  getNowFormatDate.currentTime = function() {
    var date = new Date();
    var strDate = date.getMinutes();
    var seperator2 = ":";
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    return date.getHours() + seperator2 + strDate;
  }
  that.setData({
    date: getNowFormatDate.currentdate(),
    time: getNowFormatDate.currentTime()
  })
};
publicFun.toFixed = function(d) {
  var s = this + "";
  if (!d) d = 0;
  if (s.indexOf(".") == -1) s += ".";
  s += new Array(d + 1).join("0");
  if (new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (d + 1) + "})?)\\d*$").test(s)) {
    var s = "0" + RegExp.$2,
      pm = RegExp.$1,
      a = RegExp.$3.length,
      b = true;
    if (a == d + 2) {
      a = s.match(/\d/g);
      if (parseInt(a[a.length - 1]) > 4) {
        for (var i = a.length - 2; i >= 0; i--) {
          a[i] = parseInt(a[i]) + 1;
          if (a[i] == 10) {
            a[i] = 0;
            b = i != 1;
          } else break;
        }
      }
      s = a.join("").replace(new RegExp("(\\d+)(\\d{" + d + "})\\d$"), "$1.$2");

    }
    if (b) s = s.substr(1);
    return (pm + s).replace(/\.$/, "");
  }
  return this + "";
};

//积分计算
publicFun.integral = function(that) {
  if (typeof that.data.paymentData.points_data === 'undefined') {
    return
  }
  let points_data = that.data.paymentData.points_data;
  let consume_min = points_data.consume_min; //积分抵扣的规则
  let is_consume_min = points_data.is_consume_min; //勾选抵扣积分
  let integral = 0; //抵现积分
  let integralPrice = 0; //抵现金额
  let integralTxt = 0; //抵现文字
  // let supllier_postage = 0;

  // if (typeof that.data.postageData.supllier_postage !== 'undefined') {
  //     supllier_postage = that.data.postageData.supllier_postage * 1
  // }
  let percent = ((that.data.productPrice - that.data.couponMoneysSelf) * points_data.percent * 0.01); //1每单最多抵现百分比金额
  if (points_data.is_percent == 0) {
    percent = that.data.productPrice - that.data.couponMoneysSelf
  }
  let offset_limit = points_data.offset_limit; //2每单最多可抵现金额
  let point = points_data.point; //用户积分数
  let price = points_data.price * 1; //积分价格，每多少积分抵1元
  if (percent <= 0 && (points_data.is_percent > 0)) { //满减商品为0时
    integralTxt = false
    that.setData({
      integralPricePage: 0,
      point: 0,
      integralTxt: integralTxt,
    })
    return
  }
  // 计算积分规则不展示
  if ((is_consume_min == 1 && consume_min * 1 >= 0 && that.data.paymentData.order.sub_total * 1 < consume_min * 1)) {
    integralTxt = false
    that.setData({
      integralPricePage: 0,
      point: 0,
      integralTxt: integralTxt,
    })
    return
  }

  if (points_data.is_percent * 1 || points_data.is_limit * 1) { //每单是否有抵现百分比金额限制，1：是，0：否
    if (points_data.is_limit * 1) { //每单是否有可抵现金额限制，1：是，0：否
      if (offset_limit > percent && percent != 0) {
        if (percent * price > point) {
          integralPrice = point / price;
        } else {
          integralPrice = percent; //抵现金额为:最多抵现百分比金额
          point = percent * price;
        }
        console.log({
          offset_limit,
          percent,
          point,
          integralPrice
        });


      } else {
        // if (percent * price > point) {
        //   integralPrice = point / price;
        // } else {
        //   integralPrice = offset_limit;//抵现金额为:最多可抵现金额
        //   point = offset_limit * price
        // }
        //2019-7-2更改
        //积分小于最高抵扣设置
        if (point < offset_limit * price) {
          integralPrice = point / price;
        } else {
          //积分大于最高抵扣设置
          integralPrice = offset_limit; //抵现金额为:最多可抵现金额
          point = offset_limit * price
        }

      }

    } else {
      if (percent * price > point) {
        integralPrice = point / price; //全部积分用完
      } else {
        integralPrice = percent; //抵现金额为:最多可抵现百分比金额
        point = (percent * price)
      }
    }
    if ((parseInt(integralPrice) * 1 < integralPrice * 1) && (point * 1 < points_data.point)) {
      point = point * 1 + 1;
    }
    point = Math.floor(point);

  } else {
    integralPrice = point / price; //全部积分用完
  }
  //运费
  let price_postage = that.data.paymentData.order.postage ? that.data.paymentData.order.postage * 1 : 0;


  integralPrice = integralPrice < 0 ? 0 : integralPrice; //小于0的积分差按0计算
  //积分抵扣=应付金额-运费
  let paymentMoneyExceptPostage = that.data.paymentMoney * 1 - price_postage;
  if (integralPrice >= paymentMoneyExceptPostage) {
    integralPrice = paymentMoneyExceptPostage;
    point = price * paymentMoneyExceptPostage.toFixed(2);
  }
  if (that.data.integral) {
    that.setData({
      integralpointPage: point,
      integralPricePage: integralPrice,
    })
  }

  integralPrice = toDecimal(integralPrice)
  integralTxt = point > 0 ? '您可以使用' + (Math.round(point * 100) / 100) + '积分，抵' + integralPrice + '元' : '';
  // publicFun.paymentMoney(that);

  that.setData({
    integralPrice: integralPrice,
    point: point,
    integralTxt: integralTxt,
  })



};

publicFun.product_list = function(that) { //计算直营商品的价格折扣
  // console.log("------折扣计算")
  let product_list = that.data.paymentData.product_list;
  let reward_list = that.data.paymentData.reward_list;
  let discountPrice = 0; //初始折扣金额0
  that.data.productPrice = 0; //商品金额计算初始0
  that.data.rewardPrice = 0; //初始满减金额为0
  for (var i = 0; i < product_list.length; i++) {
    // if (product_list[i].is_self) {//虚拟批发商品也计算优惠券
    if (product_list[i].discount != 0 && product_list[i].discount != 10) {
      that.data.productPrice += product_list[i].pro_price * product_list[i].pro_num * product_list[i].discount * 0.1;
      // 小程序浮点运算问题需要加0.0000000001进位
      discountPrice += product_list[i].pro_price * product_list[i].pro_num * (10 - product_list[i].discount * 1 + 0.00000000001) * 0.1;
    } else {
      that.data.productPrice += product_list[i].pro_price * product_list[i].pro_num
    }
    // }
  }

  for (var i = 0; i < reward_list.length; i++) {
    that.data.rewardPrice += reward_list[i].money * 1;
    // if (reward_list[i].is_self) {
    //   that.data.productPrice = (that.data.productPrice -= reward_list[i].money * 1)
    // }
    that.data.productPrice = (that.data.productPrice -= reward_list[i].money * 1);
  }
  that.setData({
    discountPrice: toDecimal(discountPrice),
    rewardPrice: toDecimal(that.data.rewardPrice)
  })

  publicFun.paymentMoney(that)

};
publicFun.CouponSwichNavTab = function(that, e) { //优惠券选择
  //积分重置为0，等待计算
  that.setData({
    integralPricePage: 0
  })
  that.data.couponMoney = 0;
  let couponTxt = e.target.dataset.coupontxt;
  let couponId = e.target.dataset.couponid;
  let couponmoney = e.target.dataset.couponprice;
  let self = e.target.dataset.self;
  if (e.target.dataset.coupontab == -1) {
    couponTxt = '';
    couponId = '';
    couponmoney = 0;
  }

  that.data.oppenCouponTxt[that.data.cuponIndex] = couponTxt;
  that.data.oppenCouponMoney[that.data.cuponIndex] = couponmoney;
  that.data.oppenCouponId[that.data.cuponIndex] = couponId;
  if (self) {
    that.data.couponMoneysSelf = couponmoney
  }
  for (var i in that.data.oppenCouponMoney) {
    that.data.couponMoney += that.data.oppenCouponMoney[i] * 1;
  }
  if (that.data.couponMoney > that.data.productPrice) that.data.couponMoney = that.data.productPrice
  publicFun.paymentMoney(that);
  that.setData({
    oppenCouponTxt: that.data.oppenCouponTxt,
    oppenCouponMoney: that.data.oppenCouponMoney,
    oppenCouponId: that.data.oppenCouponId,
    couponMoney: toDecimal(that.data.couponMoney),
    couponMoneysSelf: that.data.couponMoneysSelf
  })
  publicFun.integral(that); //积分计算
  setTimeout(function() {
    that.oppenCoupon();
  }, 300)
  publicFun.CouponSwichNav(e, that)
};

publicFun.paymentButton = function(that, e) { //支付按钮
  var address_id = that.data.paymentData.wxapp_address.address_id;
  var address = that.data.paymentData.wxapp_address.address;
  let payType = e.target.dataset.type || e.currentTarget.dataset.type;
  if (that.data.paymentData.product_list[0].special_product_type == '95') {
    if (that.data.homeservicetime == "" && that.data.paymentData.order.homeservicetime == "") {
      that.setData({
        flags: true,
      });
      return publicFun.warning('请选择服务时间', that)
    }
    if (that.data.paymentData.order.homeservicetime != "" && that.data.homeservicetime == "") {
      that.data.homeservicetime = that.data.paymentData.order.homeservicetime;

    }
  }

  if (that.data.paymentPostage == 'express' && !address_id && !address && that.data.paymentData.order.virtual_goods_order*1 != 1) {
    that.setData({
      flags: true
    });
    return publicFun.warning('请选择收货地址', that)
  }

  // if (!that.data.flags) {
  //     return
  // }

  that.data.flags = false;
  let shipping_method = 'selffetch';
  // no_password字段，免密该参数为1，默认为0
  let data = {
    orderNo: that.data.order_no,
    shipping_method: 'express',
    address_id: address_id,
    msg: that.data.customMessage,
    user_coupon_id: that.data.oppenCouponId,
    payType: payType,
    postage_list: that.data.postageData.postaage_list,
    point: that.data.integralpointPage,
    point_money: that.data.integralPricePage,
    is_app: 'store_wxapp',
    homeservicetime: that.data.homeservicetime //服务时间
  }
  if (typeof that.data.paymentData.shopData === 'undefined' && that.data.paymentPostage == 'selffetch') {
    that.setData({
      flags: true
    })
    return publicFun.warning('请选择上门自提门店', that);
  }

  // 到店自提
  if (typeof that.data.paymentData.shopData !== 'undefined' && that.data.paymentPostage == 'selffetch') {
    data = {
      selffetch_id: that.data.paymentData.shopData.pigcms_id,
      selffetch_name: that.data.paymentData.name,
      selffetch_phone: that.data.paymentData.tel,
      selffetch_date: that.data.date,
      selffetch_time: that.data.time,
      orderNo: that.data.order_no,
      shipping_method: 'selffetch',
      msg: that.data.customMessage,
      user_coupon_id: that.data.oppenCouponId,
      payType: payType,
      point: that.data.integralpointPage,
      point_money: that.data.integralPricePage,
      is_app: 'store_wxapp',
    }
    if (that.data.paymentData.order.type != 10 && that.data.paymentData.order.product_coupon != 1) {
      if (data.selffetch_name == '' || data.selffetch_name == undefined) {
        that.setData({
          flags: true
        });
        return publicFun.warning('请填写姓名', that);
      }
      if (data.selffetch_phone == '' || data.selffetch_phone == undefined) {
        that.setData({
          flags: true
        });
        return publicFun.warning('请填写手机号', that);
      }
      if (!(data.selffetch_phone).match(/\d{11}/)) {
        that.setData({
          flags: true
        });
        return publicFun.warning('请填写合法手机号', that);
      }
    }
  }
  //同城配送
  if (!that.data.paymentData.now_physical.pigcms_id && that.data.paymentPostage == 'local') {
    that.setData({
      flags: true
    });
    return publicFun.warning('请选择收货地址', that)
    // 这里需要填用户选择的门店id)
  }
  if (that.data.paymentData.now_physical.pigcms_id && that.data.paymentPostage == 'local') {
    data.shipping_method = 'local';
    data.selffetch_id = that.data.paymentData.now_physical.pigcms_id;
  }

  if (that.data.paymentData.product_list[0].special_product_type == '95') {
    data.shipping_method = 'local';
    data.selffetch_id = that.data.paymentData.now_physical.pigcms_id;
  }


  const payError = function() {
    that.setData({
      flags: true
    })
  }

  /*        'status'=>201,
          'message'=> '余额不足，请前往会员卡--会员中心充值'
          'status'=>202,
          'message'=> '为保障您的资金，请设置您的支付密码'
          'status'=>203,
          'message'=> '请输入密码'
          'status'=>200,
          'message'=> '免密支付'*/

  const check_cash_pay = (res, res1) => {
    wx.hideNavigationBarLoading()
    that.setData({
      flags: true
    })
    switch (+res.err_msg.status) {
      case 201:
        wx.showModal({
          title: "提示信息",
          content: res.err_msg.message,
          confirmText: "去充值",
          confirmColor: getApp().globalData.navigateBarBgColor || "#3CC51F",
          success: function(e) {
            if (e.cancel) return false;
            wx.openCard({
              cardList: [{
                cardId: res1.err_msg.message.card_id,
                code: res1.err_msg.message.card_no
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
        })
        break;
      case 202:
        wx.showModal({
          title: "提示信息",
          content: res.err_msg.message,
          confirmText: "去设置",
          confirmColor: getApp().globalData.navigateBarBgColor || "#3CC51F",
          success: function(e) {
            if (e.cancel) return false;
            wx.navigateTo({
              url: "/pages/setPassword/index"
            })
          }
        })
        break;
      case 203:
        that.setData({
          passwordInputShow: true,
          currentAccountRemainMoney: res.err_msg.data.money
        })
        break;
      case 200:
        that.setData({
          passwordInputShow: true,
          currentAccountRemainMoney: res1.err_msg.message.cash,
          no_password: 1
        })
        break;
    }
  }

  const check_user_have_card = res1 => {
    switch (res1.err_msg.status) {
      case 0:
        let check_cash_pay_data = {
          member_id: res1.err_msg.message.member_id,
          price: that.data.paymentMoney
        }
        if (that.data.paymentData.order.type == 10) {
          check_cash_pay_data.price = that.data.paymentData.order.total
        }
        common.member_id = res1.err_msg.message.member_id;
        if (that.data.paymentPostage == 'selffetch') {
          check_cash_pay_data.physical_id = that.data.paymentData.shopData.pigcms_id
        } else {
          check_cash_pay_data.physical_id = that.data.paymentData.order.physical_id
        }
        that.setData({
          wx_card_no: res1.err_msg.message.card_no
        })
        common.post('app.php?c=order&a=check_cash_pay', check_cash_pay_data, function(res) {
          check_cash_pay(res, res1)
        }, '', payError)
        break;
      case 1:
        wx.hideNavigationBarLoading()
        wx.showModal({
          title: "提示信息",
          content: "您没有会员卡，是否去开卡？",
          confirmColor: getApp().globalData.navigateBarBgColor || "#3CC51F",
          confirmText: "去开卡",
          success: function(e) {
            that.setData({
              flags: true
            })
            if (e.cancel) return false;
            wx.navigateToMiniProgram({
              appId: "wxeb490c6f9b154ef9", // 固定为此appid，不可改动
              extraData: res1.err_msg.message, // 包括encrypt_card_id outer_str biz三个字段，须从step3中获得的链接中获取参数   success: function() {    },   fail: function() {   },   complete: function() {   } })
              success(e) {
                console.log(e);
              },
            })
            /*wx.navigateTo({
                url: `/pages/webview/index?url=${encodeURIComponent(res1.err_msg.url)}`
            })*/
          }
        })
        break;
      case 2:
        wx.hideNavigationBarLoading()
        that.setData({
          flags: true
        })
        wx.showToast({
          title: res1.err_msg.message,
          icon: "none"
        })
        break;
    }
  }

  //余额支付之前的校验
  /*if (payType === 'balance_check') {
    if (that.data.paymentPostage == 'selffetch') {
      //到店自提检查当前门店是否支持余额支付
      if (that.data.paymentData.shopData.can_use_balance != 1 && that.data.paymentData.order.status != 1) {
        that.setData({
          flags: true
        })
        return wx.showToast({
          title: `门店${that.data.paymentData.shopData.store_name || that.data.paymentData.shopData.name}暂不支持余额支付`,
          icon: "none"
        })
      }
    }
    if (that.data.paymentData.can_use_balance != 1) {
      that.setData({
        flags: true
      })
      return wx.showToast({
        title: "抱歉，此门店暂不支持余额支付功能",
        icon: "none"
      })
    }
    wx.showNavigationBarLoading()
    return common.post('app.php?c=order&a=check_user_have_card', {}, check_user_have_card, '', payError)
  }*/

  if (payType === 'balance') {
    data.password = that.data.inputPassword
    data.wx_card_no = that.data.wx_card_no
    data.member_id = common.member_id
    data.no_password = e.target.dataset.no_password
    that.setData({
      inputPassword: ""
    })
    wx.showLoading({
      title: "正在支付..."
    })
  }
  wx.showLoading({
    title: "正在支付..."
  })

  var cancel_st = setTimeout(() => {
    wx.hideLoading()
    clearTimeout(cancel_st);
  }, 1000 * 10);
  common.post('app.php?c=order&a=save&payType=' + payType + '&is_app=wxapp', data, paymentPay, '', payError);

  function paymentPay(result) {
    var currentTabShop = 0; // currentTabShop = 6/7/10/50属于活动订单，直接跳到全部订单而不是本店订单
    if (that.data.paymentData.order.type == 6 || that.data.paymentData.order.type == 7 || that.data.paymentData.order.type == 10 || that.data.paymentData.order.type == 50) currentTabShop = 1;
    if (result.err_code == 0) {
      if (result.err_dom == 'not_pay') {
        let cfrom = that.data.cfrom;
        if (cfrom) {
          wx.redirectTo({
            url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop + '&cfrom=' + cfrom
          });
        } else {
          wx.redirectTo({
            url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
          });
        }

        that.setData({
          flags: true
        })
        return
      }
      var wx_data = result.err_msg;
      // 返回的是跳转链接
      // console.log(typeof(wx_data))
      if (typeof(wx_data) != 'object') {
        if (that.data.paymentData.channel && that.data.paymentData.channel.is_can_channel_pay == 1){
          wx.hideLoading();
          publicFun.warning("支付成功", that);
        }else{
          if(payType !== 'balance'){
            publicFun.unPay(that,'offline');
          }
          payType !== 'balance' && publicFun.warning("此订单为货到付款，现在无须支付", that);
        }
        setTimeout(function() {
          var orderInfo = that.data.paymentData.order
          if (orderInfo.type == 6 && orderInfo.data_tuan_item_id) {
            wx.showModal({
              title: "支付成功！",
              content: "请选择想要跳转的页面",
              confirmText: "拼团详情",
              cancelText: "拼团列表",
              confirmColor: getApp().globalData.navigateBarBgColor || '#72B9C3',
              complete(e) {
                if (e.confirm) {
                  wx.redirectTo({
                    url: `/pages/GOODSDETAILS/pages/join/index?tuan_id=${orderInfo.data_id}&team_id=${orderInfo.data_item_id}&item_id=${orderInfo.data_tuan_item_id}&type=1`
                  })
                } else {
                  wx.redirectTo({
                    url: '/pages/USERS/pages/myCollage/myCollageList'
                  });
                }
              }
            })
            return that.setData({
              flags: true
            })
          } else {
            // console.log("zhifu", that.data)
            publicFun.warning("支付成功", that);
            let cfrom = that.data.cfrom;
            if (cfrom) {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop + '&cfrom=' + cfrom
              });
            } else {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
              });
            }
          }
        }, 1000)
        that.setData({
          flags: true
        })
        return
      }

      // 发起微信支付
      if (payType == 'weixin') {
        wx.requestPayment({
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function(res) { //支付成功跳转到待发货页面
            if(that.data.goodsType != '' && that.data.canPay){//预售/预约商品
              publicFun.alreadyPay(that);
            }
            //拼团跳转到拼团详情页面
            var orderInfo = that.data.paymentData.order
            if (that.data.paymentData.order.type == 6 && orderInfo.data_tuan_item_id) {
              wx.showModal({
                title: "支付成功！",
                content: "请选择想要跳转的页面",
                confirmText: "拼团详情",
                cancelText: "拼团列表",
                confirmColor: getApp().globalData.navigateBarBgColor || '#72B9C3',
                complete(e) {
                  if (e.confirm) {
                    wx.redirectTo({
                      url: `/pages/GOODSDETAILS/pages/join/index?tuan_id=${orderInfo.data_id}&team_id=${orderInfo.data_item_id}&item_id=${orderInfo.data_tuan_item_id}&type=1`
                    })
                  } else {
                    wx.redirectTo({
                      url: '/pages/USERS/pages/myCollage/myCollageList'
                    });
                  }
                  wx.removeStorageSync({
                    subDate: "subDate"
                  })
                }
              })
              return that.setData({
                flags: true
              })
            }


            let cfrom = that.data.cfrom;
            if (cfrom) {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop + '&cfrom=' + cfrom
              });
            } else {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
              });
            }
            that.setData({
              flags: true
            })
          },
          'fail': function(res) {
            publicFun.unPay(that);
            wx.showModal({
              title: '提示信息',
              content: '您取消了支付',
              confirmText: '知道了',
              showCancel: false,
              success: function(res) {

                that.setData({
                  flags: true
                })
                setTimeout(function() { //支付失败跳转到待付款页面
                  wx.redirectTo({
                    url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
                  });
                }, 1)
              }
            })
          }
        })
      }

      // 发起收银宝支付
      if (payType == 'vspallinpay') {
        wx.requestPayment({
          'timeStamp': wx_data.timeStamp,
          'nonceStr': wx_data.nonceStr,
          'package': wx_data.package,
          'signType': wx_data.signType || 'MD5',
          'paySign': wx_data.paySign,
          'success': function (res) { //支付成功跳转到待发货页面
            if(that.data.goodsType != '' && that.data.canPay){//预售/预约商品
              publicFun.alreadyPay(that);
            }
            //拼团跳转到拼团详情页面
            var orderInfo = that.data.paymentData.order
            if (that.data.paymentData.order.type == 6 && orderInfo.data_tuan_item_id) {
              wx.showModal({
                title: "支付成功！",
                content: "请选择想要跳转的页面",
                confirmText: "拼团详情",
                cancelText: "拼团列表",
                confirmColor: getApp().globalData.navigateBarBgColor || '#72B9C3',
                complete(e) {
                  if (e.confirm) {
                    wx.redirectTo({
                      url: `/pages/GOODSDETAILS/pages/join/index?tuan_id=${orderInfo.data_id}&team_id=${orderInfo.data_item_id}&item_id=${orderInfo.data_tuan_item_id}&type=1`
                    })
                  } else {
                    wx.redirectTo({
                      url: '/pages/USERS/pages/myCollage/myCollageList'
                    });
                  }
                  wx.removeStorageSync({
                    subDate: "subDate"
                  })
                }
              })
              return that.setData({
                flags: true
              })
            }


            let cfrom = that.data.cfrom;
            if (cfrom) {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop + '&cfrom=' + cfrom
              });
            } else {
              wx.redirectTo({
                url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
              });
            }
            that.setData({
              flags: true
            })
          },
          'fail': function (res) {
            publicFun.unPay(that);
            wx.showModal({
              title: '提示信息',
              content: '您取消了支付',
              confirmText: '知道了',
              showCancel: false,
              success: function (res) {

                that.setData({
                  flags: true
                })
                setTimeout(function () { //支付失败跳转到待付款页面
                  wx.redirectTo({
                    url: '/pages/user/order/orderList?currentTab=all&currentTabShop=' + currentTabShop
                  });
                }, 1)
              }
            })
          }
        })
      }
    } else {
      wx.hideLoading();
      wx.showModal({
        title: "",
        content: result.err_msg.message || result.err_msg,
        showCancel: false,
        confirmText: "知道了",
        confirmColor: getApp().globalData.navigateBarBgColor || "#3CC51F"
      })
    }
  }
};
publicFun.paymentMoney = function(that) {
  //减价时候，sub_total是没有计算过减价的价格，加价时候是已经计算加价的价格
  // 加减价
  let float_amount = (that.data.paymentData.order.float_amount * 1 > 0) ? 0 : (that.data.paymentData.order.float_amount * 1)
  //总价
  // let total = (that.data.paymentData.order.float_amount * 1 > 0) ? that.data.paymentData.order.total : (that.data.paymentData.order.sub_total * 1)
  let total = that.data.paymentData.order.sub_total * 1;
  //折扣
  let discount = (that.data.discountPrice * 1) ? (that.data.discountPrice * 1) : 0;
  //运费
  let postage = that.data.paymentData.order.postage * 1 > 0 ? that.data.paymentData.order.postage * 1 : 0;
  //税费 华骏
  let predict_order_tax = that.data.paymentData.order.predict_order_tax * 1 > 0 ? that.data.paymentData.order.predict_order_tax * 1 : 0;
  //应付价格
  that.data.paymentMoney = total + float_amount - that.data.rewardPrice * 1 - that.data.couponMoney * 1 - that.data.integralPricePage * 1 - discount - that.data.presaleReducePrice + postage + predict_order_tax;
  //如果减价后应付金额小于邮费，金额直接取邮费
  if (float_amount < 0 && that.data.paymentMoney <= postage) {
    that.data.paymentMoney = postage;
  }
  that.setData({
    paymentMoney: (that.data.paymentMoney).toFixed(2) ? (that.data.paymentMoney).toFixed(2) : 0
  })
}
publicFun.dataCode = function(data, type) { //日期时间戳---格式任选
  var date = new Date(data);
  var Y = date.getFullYear();
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
  var h = date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours();
  var m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes();
  var s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds();
  console.log(h, m, s)
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

publicFun.orderType = function(item) { // 订单类型标签
  if (item.order_product_list && item.order_product_list[0] && item.order_product_list[0].special_product_type == '98') {
    return "周期购"
  }
  if (item.order_product_list && item.order_product_list[0] && item.order_product_list[0].special_product_type == '97') {
    return "商品券"
  }
  switch (item.type * 1) {
    case 0:
      return '普通';
      break;
    case 1:
      return '代付';
      break;
    case 2:
      return '送礼';
      break;
    case 3:
      return item.type_name;
      break;
    case 4:
      return '活动';
      break;
    case 5:
      return '批发';
      break;
    case 6:
      return '拼团';
      break;
    case 7:
      return '预售';
      break;
    case 10:
      return '预约';
      break;
    case 50:
      return '砍价';
      break;
    case 51:
      return '一元夺宝';
      break;
    case 53:
      return '秒杀';
      break;
    case 55:
      return '降价拍';
      break;
    case 56:
      return '抽奖合集';
      break;
    case 57:
      return '摇一摇';
      break;
    case 58:
      return '微聚力';
      break;
    case 61:
      return '集字游戏';
      break;
    case 62:
      return '摇钱树游戏';
      break;

  }

};

publicFun.url_add_param = function(url, key, value) {
  var key = (key || 't') + '='; //默认是"t"
  var reg = new RegExp(key + '\\d+'); //正则：t=1472286066028
  var param = value || (+new Date());
  if (url.indexOf(key) > -1) { //有时间戳，直接更新
    return url.replace(reg, key + param);
  } else { //没有时间戳，加上时间戳
    if (url.indexOf('\?') > -1) {
      var urlArr = url.split('\?');
      if (urlArr[1]) {
        return urlArr[0] + '?' + key + param + '&' + urlArr[1];
      } else {
        return urlArr[0] + '?' + key + param;
      }
    } else {
      if (url.indexOf('#') > -1) {
        return url.split('#')[0] + '?' + key + param + '#' + url.split('#')[1];
      } else {
        return url + '?' + key + param;
      }
    }
  }
}

publicFun.getType = function(url, obj_nav) {

  var r = {
    url
  };

  if(!url){
    r.type='';
    r.url='';
    return r;
  }

  const {
    wxapp_ticket
  } = getApp().globalData;
  let ticket = wxapp_ticket || wx.getStorageSync('ticket');

  if (url.includes('webapp/wapindex/#/intMall/')) {
    r.type = 'navigate'
    r.url = '/pages/webview/index?url=' + encodeURIComponent(publicFun.url_add_param(url, 'wxapp_ticket', ticket))
  } else if (url.includes('wap/drp_register')) {
    r.type = 'navigate'
    // if(common.is_fx){
    r.url = '/pages/distribution/index'
    // }else{
    //     r.url = '/pages/distribution/create_distribution'
    // }
  } else if (url.includes('goods_category') || url.includes('goodsCategory')) {
    r.type = 'goods_category';
    r.id = 0;
    r.url = '/pages/goods_category/index'
  } else if (url.indexOf('wap/page.php') > 0) {
    r.type = 'page';
    var reTag = /.*wap\/page\.php\?id=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    if (obj_nav && obj_nav.is_group1 == 1) {
      r.url = '/pages/CLIST/pages/group/groupLeft?page_id=' + r.id;
      if (obj_nav.title) {
        wx.setStorage({
          key: 'groupName',
          data: obj_nav.title,
        })
      }
    } else {
      r.url = '/pages/index/page?page_id=' + r.id;
    }
  } else if (url.indexOf('equity') > 0) {
    let store_type=wx.getStorageSync('store_type');
    r.id = 0;
    let urlType;
    if(obj_nav == 'home'){
      urlType = obj_nav
    }
    if(store_type == 0){//普通模式

    }else if(store_type == 1){//礼包
      r.url = '/pages/giftMember/giftuser/user?showback=' + r.id + '&type=' + urlType;
    }else if(store_type == 2){//拉粉
      r.url = '/pages/user/vip/vip?showback=' + r.id + '&type=' + urlType;
    }else if(store_type == 3){//社区团购

    }
    
  } else if (url.indexOf('wap/good.php') > 0) {
    r.type = 'good';
    var reTag = /.*wap\/good\.php\?id=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    r.url = '/pages/product/details?product_id=' + r.id;
  } else if (url.indexOf('wap/goodcat.php') > 0) {
    r.type = 'goodcat';
    var reTag = /.*wap\/goodcat\.php\?id=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    r.url = '/pages/SHOPGOODS/pages/product/goodcat?product_id=' + r.id;
  } else if (url.indexOf('wap/home.php') > 0) {
    r.type = 'switchTab';
    var reTag = /.*wap\/home\.php\?id=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    r.url = '/pages/index/index';
  } else if (url.indexOf('wap/ucenter.php') > 0) {
    r.type = 'switchTab';
    r.id = 0;
    r.url = '/pages/user/index';
  } else if (url.indexOf('webapp/wapindex/#/shopProduct') > 0) {
    r.type = 'shopProduct';
    r.id = 0;
    r.url = '/pages/product/productList';
  } else if (url.indexOf('webapp/groupbuy') != -1) {
    r.type = 'groupbuy'
    var reTag = /.*groupbuy\/\#\/details\/(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    r.url = '/pages/GOODSDETAILS/pages/details/index?tuan_id=' + r.id;
  } else if (url.indexOf('wap/bargain.php') != -1) {
    r.type = 'bargain'
    var id = '';
    var reTag = /.*wap\/bargain\.php\?action=detail&id=(\d*).*/g;
    id = url.replace(reTag, '$1');

    r.id = id;
    if (isNaN(id)) {
      r.url = '/pages/GOODSDETAILS/pages/bargain/index';
    } else {
      r.url = '/pages/GOODSDETAILS/pages/bargain/details?id=' + r.id;
    }
  } else if (url.indexOf('wap/seckill.php') != -1) {
    r.type = 'seckill'
    var reTag = /.*wap\/seckill\.php\?seckill_id=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    if (isNaN(parseInt(id))) {
      var reTag2 = /.*wap\/seckill\.php\?id=(\d*).*/g;
      id = url.replace(reTag2, '$1');
    }

    r.id = id;
    r.url = '/pages/GOODSDETAILS/pages/seckill/index?id=' + r.id;

  } else if (url.indexOf('wap/presale.php') != -1) {
    r.type = 'presale'
    var reTag = /.*wap\/presale\.php\?action=detail&id=(\d*).*/g;
    var id = url.replace(reTag, '$1');

    r.id = id;
    r.url = '/pages/GOODSDETAILS/pages/presale/index?id=' + r.id;

  } else if (url.indexOf('wap/store_coupon.php') != -1) {
    r.type = 'store_coupon';
    var reTag = /.*wap\/store_coupon\.php\?couponid=(\d*).*/g;
    var id = url.replace(reTag, '$1');
    r.id = id;
    r.url = '/pages/index/coupons?coupon_id=' + r.id;
  } else if (url.indexOf('wap/new_user.php') > 0) {
    r.id = id;
    r.url = '/pages/new_user/index';
  } else if (url.indexOf('wap/membersDetails.php') > 0) {
    r.id = id;
    r.url = '/pages/user/vip/vip';
  } else if (url.indexOf('live_list') > 0) {
    // 图片广告链接到直播
    r.url = '/pages/LIVEVIDEO/pages/liveVideo/liveVideoList';
  } else if (url.indexOf('ad_scan') > 0) {
    // 扫码购
    r.url = 'ad_scan';
  } else if (url.indexOf('goodsSort.php') > 0) {
    r.type = 'goods_category_list';
    var reTag = /.*wap\/goodsSort\.php\?cid=(\d.*)\&fid=(\d.*)/g;
    var cid = url.replace(reTag, '$1');
    var fid = url.replace(reTag, '$2');
    r.cid = cid;
    r.url = '/pages/product/productList?cid=' + cid+'&fid='+fid;
  }else {
    /*r.type = 'switchTab';
    r.url = '/pages/index/index';*/
  }
  //判断当前导航配置
  getApp().globalData.store_nav_list.forEach(item => {
    if (r.url && r.url.includes(item.pagePath)) {
      r.type = 'switchTab'
    }
  })
  return r;
}
publicFun.mapData = function(that, e) {
  let physical_id = e.target.dataset.physical;
  common.post('app.php?c=store&a=physical_detail&physical_id=' + physical_id, '', mapData, '');

  function mapData(res) {
    if (res.err_code == 0) {
      that.setData({
        mapData: res.err_msg
      })
      wx.openLocation({
        latitude: that.data.mapData.store_physical.tencent_lat,
        longitude: that.data.mapData.store_physical.tencent_lng,
        name: that.data.mapData.store_physical.name,
        address: that.data.mapData.store_physical.address,
        scale: 28
      })

    }


  }
}

publicFun.parseParams = function(data) {
  try {
    var tempArr = [];
    for (var i in data) {
      var key = encodeURIComponent(i);
      var value = encodeURIComponent(data[i]);
      tempArr.push(key + '=' + value);
    }
    var urlParamsStr = tempArr.join('&');
    return urlParamsStr;
  } catch (err) {
    return '';
  }
}
publicFun.userCall = function(res, app, that) {
  console.log('登录');
  if(app.globalData.loginAgain){
    console.log('登录2');
    app.globalData.loginAgain = false;
    let _res=res;
    wx.getUserInfo({
      withCredentials:true,
      success: function (res) {
        const { encryptedData, iv}=res;
        console.log("获取用户信息res>>", res)
        publicFun.callFun(res, app, that, encryptedData, iv);
      },
      fail: function (_res, app, that){
        publicFun.callFun(_res, app, that);
      }
    });
    setTimeout(function(){
      app.globalData.loginAgain = true;
    },3000);
  }
}

publicFun.callFun = function (res, app, that, encryptedData,iv) {

  const {
    wxapp_ticket,
    login
  } = app.globalData;

  let _userInfo = encryptedData ? res['userInfo'] : res.detail['userInfo'];
  if (_userInfo) {
    var ticket = wxapp_ticket || wx.getStorageSync('ticket');
    wx.showLoading({
      title: '正在登录',
      mask: true,
    });
    //11.14tc 淘有卖问题，多次点击登录会出现手机号以使用问题。解决方法：登录中关闭弹窗以防止多次点击，
    that.setData({
      showLoginModal: false
    })

    // 新增----------
    let login_info = wx.getStorageSync('str_login');
    let g_code = '';
    if (login_info) {
      login_info = login_info ? JSON.parse(login_info) : {};
      g_code = login_info.code;
    }
    // 以上新增--------------

    let data = {};
    let _encryData = encryptedData ? encodeURI(encryptedData) : (res.detail.encryptedData);
    let _iv = iv ? encodeURI(iv) : (res.detail.iv);
    wx.checkSession({
      success(res) {
        console.log('code未过期')
      },
      fail(err) {
        // session_key 已经失效，需要重新执行登录流程
        console.log('code过期,重新获取')
        wx.login({
          success: res => {
            app.globalData.login == res
          }
        });
      }
    })
    data = {
      code: encodeURI(app.globalData.login.code || g_code),
      codes: encodeURI(app.globalData.login.code || g_code),
      encryptedData: _encryData,
      iv: _iv,
      wxapp_ticket: ticket,
    };

    //是开启淘有卖登录模式，并且登录模式为2时，验证填写信息
    if (app.globalData.tym_open && app.globalData.loginData.type == 2) {
      //1、没手机号 直接弹注册  [即原来模式2，无需判断]
      //2、无上级、有手机号，只需要填邀请码//【get_login_config接口返回是否手机号来判断这种情况】//.app.globalData.loginData.phone//
      if (app.globalData.loginData.phone) {
        app.globalData.new_numInput = app.globalData.loginData.phone

        if (!(app.globalData.invite_code)) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '请正确填写邀请码',
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
          encryptedData: _encryData,
          iv: _iv,
          wxapp_ticket: ticket,
          phone: app.globalData.new_numInput,
          // sms_code: app.globalData.sms_code,
          invite_code: app.globalData.invite_code
        };
      } else {
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
          encryptedData: _encryData,
          iv: _iv,
          wxapp_ticket: ticket,
          phone: app.globalData.new_numInput,
          sms_code: app.globalData.sms_code,
          invite_code: app.globalData.invite_code
        };
      }


    }
    app.setAddres().then(res => {
      var location = {
        "location": res.longitude + "," + res.latitude,
        leader_id: wx.getStorageSync("leader_id") || app.globalData.leader_id
      };
      common.post('app.php?c=lbs&a=switch_substore', location, function () {
        console.log('切换门店');
        // 后台切换门店
        app.globalData.switch_store = true;
      }, '');
    });
    console.log("**********public.js store_login", data);
    common.post('app.php?c=wxapp&a=store_login', data, setUserInfo, '');

    function setUserInfo(result) {
      const { err_code, err_msg } = result;
      if (err_code!=0){
        wx.hideLoading();
        if(that && that.data){
          that.setData({
            showLoginModal:false
          })
        }
        wx.showModal({
          title: '',
          content: err_msg,
          showCancel:false,
          confirmText:'知道了'
        })
        return;
      }
      that = that || this;
      console.log("public登录返回参数;", result)
      if (result.err_code != 0) {
        wx.showModal({
          title: '',
          content: result.err_msg,
          showCancel: false
        })
        that.setData({
          showLoginModal: false
        })
        wx.setStorageSync('ticket', '');
        app.globalData.wxapp_ticket = '';
        wx.hideLoading();
        return;
      }
      app.globalData.my_uid = result.err_msg.user.uid;
      wx.hideLoading()

      try {
        wx.setStorageSync('ticket', result.err_msg.wxapp_ticket)
        app.globalData.wxapp_ticket = result.err_msg.wxapp_ticket;
      } catch (e) { }
      app.globalData.userInfo = result.err_msg.user;
      wx.setStorageSync('openId', result.err_msg.user.openId);
      if (result.err_msg.unlogin != undefined) {
        app.globalData.unlogin = result.err_msg.unlogin;
        wx.setStorageSync('unlogin', result.err_msg.unlogin)
      }

      typeof app.globalData.storge.callbackObj == "function" && app.globalData.storge.callbackObj(app.globalData.userInfo);

      //判断店铺是否开启强制选择门店
      if(result.err_msg && result.err_msg.userphysical){
        const {open_physical_choose,physical_id}=result.err_msg.userphysical;
        wx.setStorageSync('open_physical_choose', open_physical_choose);//判断是否开启强制门店选择
        wx.setStorageSync('physical_id', physical_id);//门店id
      }

      publicFun.addFans();

      var store_openid = result.err_msg.user.store_openid || result.err_msg.store_openid;
      if (store_openid) {
        refresh_page(app.globalData.storge.refreshConfig,'',that.data.liveId);
      } else {
        if (that.data.liveId) {//直播列表页登录后直接跳转到详情页
          wx.navigateTo({
            url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          })
          // if (that.data.onlyAppletLive.only_applet_live) {//仅官方
          //   wx.navigateTo({
          //     url: that.data.officialListData.list[that.data.liveIndex].page_url,
          //   })
          // } else if (that.data.onlyAppletLive.unable_applet_live) {//仅原生
          //   wx.navigateTo({
          //     url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          //   })
          // } else {//都有
          //   if (that.data.tabIndex == 2) {
          //     wx.navigateTo({
          //       url: that.data.officialListData.list[that.data.liveIndex].page_url,
          //     })
          //   } else {
          //     wx.navigateTo({
          //       url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          //     })
          //   }
          // }  
          return false;
        }
        if (that) {
          that.setData({
            userLoginUrl: common.Url + `wap/reh5.php?store_id=${app.globalData.store_id ? app.globalData.store_id : app.globalData.root_store_id}&request_from=wxapp&wxapp_ticket=${result.err_msg.wxapp_ticket}#wechat_redirect`
          })
        }

      }
      // 验证邀请码11.8 淘有卖升级该接口不需要调用
      // publicFun.check_invite_code(app)
    
    }




    //登陆跳转到之前页面
    function refresh_page(refreshConfig, config, liveId) {
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
        if (that.data.liveId) {//直播列表页登录后直接跳转到详情页
          wx.navigateTo({
            url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          })
          // if (that.data.onlyAppletLive.only_applet_live) {//仅官方
          //   wx.navigateTo({
          //     url: that.data.officialListData.list[that.data.liveIndex].page_url,
          //   })
          // } else if (that.data.onlyAppletLive.unable_applet_live) {//仅原生
          //   wx.navigateTo({
          //     url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          //   })
          // } else {//都有
          //   if (that.data.tabIndex == 2) {
          //     wx.navigateTo({
          //       url: that.data.officialListData.list[that.data.liveIndex].page_url,
          //     })
          //   } else {
          //     wx.navigateTo({
          //       url: '/pages/LIVEVIDEO/pages/liveVideo/liveVideoDetail?isShare=1&live_id=' + that.data.liveId,
          //     })
          //   }
          // }
          return false;
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

publicFun.addFans = function() {
  if (getApp().globalData.share_uid != "") {
    let data = {
      store_id: getApp().globalData.store_id,
      share_uid: getApp().globalData.share_uid,
      source: getApp().globalData.shareType ? getApp().globalData.shareType : 2
    }
    let _unlogin = true;
    let _value = wx.getStorageSync('unlogin');
    if ((_value !== undefined && _value !== "") || _value === false) {
      _unlogin = _value;
    } else {
      _unlogin = getApp().globalData.unlogin;
    }
    if (_unlogin == true) {
      data.uid = getApp().globalData.my_uid
    }
    common.post("app.php?c=drp&a=add_fans", data, function callBack(res) {
      console.log("add_fans>>>>>>>>>>>>>>>>>>>>", res);
    }, '')
  }
}
publicFun.loginLoaded = function(e, app, that) {
  if (e.detail.src.indexOf('redirect_h5.php') > 0) {
    that.setData({
      userLoginUrl: null
    })
    bus.$emit(bus.events.login, app.globalData.storge.refreshConfig)
  }
}
//web-view加载失败返回原页面
publicFun.errorLoaded = function(e) {
  wx.navigateBack({
    delta: 1
  })
}

publicFun.onLoad = function(app, that) { //授权页面


  that && (that.userCall = function(res) {
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        if (!getApp().isLoginFun(that)) { //判断用户是否登录
          //登录code过期
          //重新登录

          wx.login({
            success: function(responce) {
              if (responce) {
                app.globalData.login = responce;
                let str_login = JSON.stringify(responce);
                console.log("~~~~~public.login11", str_login)
                wx.setStorageSync('str_login', str_login);
                publicFun.userCall(res, app, that);
              }
            }
          });
        } else {
          publicFun.userCall(res, app, that);
        }

      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        //重新登录
        wx.login({
          success: function(responce) {
            if (responce) {

              app.globalData.login = responce;
              let str_login = JSON.stringify(responce);
              console.log("~~~~~public.login222", str_login)
              wx.setStorageSync('str_login', str_login);
              publicFun.userCall(res, app, that);
            }
          }
        });
      }
    });
  })

  that && (that.loginLoaded = function(e) {
    publicFun.loginLoaded(e, app, that)
  })
  that && (that.closeModal = function(e) {
    if (that) {
      that.setData({
        showLoginModal: false,
        showgetPhone:false
        // phoneYz: false,
        // codeInput: "",
        // inviteInput: "",
        // butDisabled: false
      })
    }
  })
  //////新登录模式
  that && (that.numInput = function(e) {
    app.globalData.new_numInput = e.detail.value
    console.log(app.globalData.new_numInput, "   app.globalData.new_numInput   app.globalData.new_numInput   app.globalData.new_numInput")
    that.setData({
      phone: app.globalData.new_numInput
    })
  })
  that && (that.getCode = function(e) {

    if (!(/^1\d{10}$/.test(app.globalData.new_numInput))) {
      wx.showToast({
        title: '手机号有误',
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      that.setData({
        coden: ''
      })
      var coden = 60 // 定义60秒的倒计时
      var codeV = setInterval(function() {
        that.setData({ // _this这里的作用域不同了
          btntext: '重新获取' + (--coden) + 's',
          coden: ''
        })
        if (coden == -1) { // 清除setInterval倒计时，这里可以做很多操作，按钮变回原样等
          clearInterval(codeV)
          that.setData({
            btntext: '获取验证码',
            coden: 'getCode'
          })
        }
      }, 1000) //  1000是1秒

      common.post('app.php?c=wxapp&a=sentMsg', {
        phone: app.globalData.new_numInput
      }, res => {
        console.log(res, "wwwwwwwwwwww验证码wwwwww")
        if (res.err_code == 0) {} else {
          wx.showModal({
            title: '提示',
            content: '验证码获取失败，请重新获取',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }

      }, '')

    }

  })
  that && (that.codeInput = function(e) {
    app.globalData.sms_code = e.detail.value
    that.setData({
      codeInput: e.detail.value
    })
  })
  that && (that.inviteInput = function(e) {
    app.globalData.invite_code = e.detail.value
    that.setData({
      inviteInput: e.detail.value
    })
  })
  //失去焦点验证手机号
  that && (that.phoneYz = function(e) {
    //如果用户有手机号无上级 则不需要验证手机号
    if (!app.globalData.loginData.phone) {
      if (!(/^1\d{10}$/.test(app.globalData.new_numInput))) {
        wx.showToast({
          title: '手机号有误',
          icon: 'none',
          duration: 2000
        })
        that.setData({
          phoneYz: false
        })
      } else {
        that.setData({
          phoneYz: true
        })
      }
    }
  })
  //阅读用户须知
  that && (that.read = function(e) {
    let index = e.currentTarget.dataset.idx
    console.log(e, "阅读用户须知阅读用户须知阅读用户须知阅读用户须知阅读用户须知")
    // getApp().globalData.loginData,
    let readTit = getApp().globalData.loginData.agreement_list[index].name
    let readCom = getApp().globalData.loginData.agreement_list[index].content
    // 富文本处理todo
    // let agreement_list = getApp().globalData.loginData.agreement_list;
    wxParse.wxParse('readCom', 'html', readCom, that, 5);

    // // 富文本处理
    that.setData({
      agreementShow: true,
      readTit: readTit
    })

  })

  //关闭用户协议弹窗
  that && (that.closeAgreementShowBox = function(e) {
    that.setData({
      agreementShow: false,
    })
  })
  //同意用户协议
  that && (that.radioChange = function(e) {
    console.log(e.detail.value, "checkedcheckedcheckedchecked")
    if (e.detail.value.length) {
      that.setData({
        butDisabled: true,
      })
      console.log("wwwwwwwwwww1")
    } else {
      that.setData({
        butDisabled: false,
      })
      console.log("wwwwwwwwwww2")
    }
  })
  that && (that.yanz = function(e) {
    //如果用户有手机号无上级 则不需要验证手机号
    if (!app.globalData.loginData.phone) {
      if (!(/^1\d{10}$/.test(app.globalData.new_numInput))) {
        wx.showToast({
          title: '手机号有误',
          icon: 'none',
          duration: 2000
        })
  
        return false;
      } else {
        wx.showToast({
          title: '请正确填写信息',
          icon: 'none',
          duration: 2000
        })

      }
    }
  })
}

publicFun.setBarBgColor = function(app, that, flag) { //修改导航条背景色
  var bgcolor = app.globalData.navigateBarBgColor;
  var barType = app.globalData.navigatorBarType;
  var store_nav_list = app.globalData.store_nav_list;
  let strs = JSON.stringify(store_nav_list);
  wx.setStorage({
    key: 'navdata',
    data: strs,
  })
  var applet_guide_subscribe = app.globalData.applet_guide_subscribe || false;
  if (bgcolor != '') {
    let tabBarArr = [],
      pageTheme = '';

    function tabBarStyle(selectedColor) {
      if (barType == 1) { //素雅版
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff'
        });
      } else if(flag === 'white'){ //设置白色导航
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: '#ffffff'
        });
      } else { //普通版
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: selectedColor
        });
      }
      app.globalData.navigateBarBgColor = selectedColor;
    }

    var pageThemeMap = {
      '#000000': 'blackTheme',
      '#DA2026': 'redTheme',
      '#FF5C1C': 'orangeTheme',
      '#0098F8': 'blueTheme',
      '#FF007C': 'pinkDarkTheme',
      '#7948FD': 'purpleTheme',
      '#B7A392': 'brownTheme'
    }

    pageTheme = pageThemeMap[bgcolor];
    pageTheme = pageTheme || '#DA2026';
    tabBarStyle(bgcolor)

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
      var currentPages = getCurrentPages()
      var currentPage = currentPages.pop()
      var currentRoute = currentPage.route
      var param = publicFun.parseParams(currentPage.options)
      if (param) {
        currentRoute += ('?' + param)
      }
      var store_nav_list_show = false;
      store_nav_list = store_nav_list.filter(function(item) {
        return item.status == 1
      })
      store_nav_list.forEach(item => {
        item.pagePath = publicFun.getType(item.pagePath, item).url
        if (item.pagePath.includes(currentRoute) || `/${currentRoute}`.includes(item.pagePath)) {
          item.active = true
          if (item.status == 1) {
            store_nav_list_show = true
          }
        } else {
          item.active = false
        }
      })
      if (currentRoute == 'pages/distribution/create_distribution') {
        store_nav_list_show = true;
        store_nav_list.forEach(item => {
          item.pagePath = publicFun.getType(item.pagePath).url;
          if (item.pagePath == '/pages/distribution/index') {
            item.active = true;
          }

        })
      }
      let model = wx.getSystemInfoSync().model.toLowerCase()
      let isIpx = ''
      if (model.includes("iphone x") || model.includes("iphone 11")) {
        isIpx = "iphonex"
      }
      // console.log("store_nav_list========", store_nav_list)
      that.setData({
        barType: barType,
        pageTheme: pageTheme,
        themeColorValue: bgcolor,
        store_nav_list,
        applet_guide_subscribe,
        store_nav_list_show,
        isIpx,
        BASE_IMG_URL: 'https://s.404.cn/applet/', //图片访问地址
      })
    }

  } else {
    console.log('警告：app.globalData.navigateBarBgColor 为空！')
  }
  publicFun.onLoad(app, that);
}
publicFun.formateNumber = function(a) { //数字超过万则显示为 ‘万+’
  a = a * 1 >= 10000 ? parseInt((a * 1) / 10000) + '万+' : a;
  return a
}
publicFun.productPrice = function(min, max) { //商品价格处理
  if (min == max) {
    return min
  } else {
    return min + '~' + max
  }
}
publicFun.getCurrentPages = function(sid) {
  let pages = getCurrentPages(), //获取加载的页面
    currentPage = pages[pages.length - 1], //获取当前页面的对象
    url = currentPage.route, //当前页面url
    options = currentPage.options, //如果要获取url中所带的参数可以查看options
    pageType = 'page';
  getApp().globalData.store_nav_list.forEach(item => {
    if (url.includes(item.pagePath)) {
      pageType = 'tab'
    }
  })
  return {
    url: url,
    pageType: pageType,
    param: options,
  }
}
publicFun.checkAuthorize = function(obj) { // 判断是否需要授权
  var pageData = obj.pageData,
    callbackFunc = obj.callbackFunc ? obj.callbackFunc : '',
    app = obj.app ? obj.app : null;
  const {
    wxapp_ticket
  } = getApp().globalData
  let wx_ticket = wxapp_ticket || wx.getStorageSync('ticket');

  if (wx_ticket) {
    if (pageData != '') {
      publicFun.setUrl('')
    }
  } else {
    try {
      var config_data = publicFun.getCurrentPages();
      // console.log(config_data)
      app.getUserInfo({
        pageThat: that,
        refreshConfig: config_data,
        callback: callbackFunc,
      });
    } catch (e) {}

  }
};

/**
 * 保存已经获取的图片大小
 * @param src
 * @param width
 * @param height
 * 数据结构为: {"url":{width:"",height:""}}
 */

publicFun.saveImageSize = ({
  src,
  width,
  height
}) => {
  try {
    let imageSizes = wx.getStorageSync('imageSizes');
    if (!imageSizes) {
      imageSizes = {}
    } else {
      imageSizes = JSON.parse(imageSizes);
    }
    imageSizes[src] = {
      w: width,
      h: height
    }
    wx.setStorageSync('imageSizes', JSON.stringify(imageSizes));
  } catch (e) {
    console.log(e)
  }
}
/**
 * 根据图片的地址,获取保存在storage里面的图片真实大小
 * @param src
 * @returns {*}
 */

publicFun.getImageSize = ({
  src
}) => {
  try {
    let imageSizes = wx.getStorageSync('imageSizes');
    if (!imageSizes) {
      wx.setStorage({
        key: "imageSizes",
        data: "{}"
      });
      return null
    } else {
      return JSON.parse(imageSizes)[src]
    }
  } catch (e) {

  }
}


publicFun.imageLoad = function(e, that) {
  var $width = e.detail.width, //获取图片真实宽度
    $height = e.detail.height,
    ratio = $width / $height; //图片的真实宽高比例
  var image_ad = that.data.shopHomeData.custom_field_list[e.target.dataset.t_index]; // e.target.dataset.t_index：模块在custom_field_list中的index值
  var viewWidth = 750; // 不考虑宽度
  if (image_ad.content.image_size != 0) {
    viewWidth = 345;
  }
  var viewHeight = viewWidth / ratio; //计算的高度值
  if (viewHeight > 750) {
    viewHeight = 750;
  }
  image_ad.content.nav_list[e.target.dataset.index].width = viewWidth;
  image_ad.content.nav_list[e.target.dataset.index].height = viewHeight;

  publicFun.saveImageSize({
    src: image_ad.content.nav_list[e.target.dataset.index].image,
    width: viewWidth,
    height: viewHeight
  });

  // 处理轮播高度
  var swiperHeight = 0;
  var max = 0; // max取所有图片中最高的一张的高度
  if (image_ad.content.image_size == 0 && ratio < 1) {
    max = $height;
  } else {

    for (var i = 0; i < image_ad.content.nav_list.length; i++) {
      if (max < image_ad.content.nav_list[i].height) {
        max = image_ad.content.nav_list[i].height;
      }

    }
  }
  image_ad.content.swiperHeight = max;
  that.setData({
    shopHomeData: that.data.shopHomeData
  })
}
publicFun.formSubmit = function(param) { // 生成下发模板消息所需的formId存于服务器
  param.callBack && param.callBack();
  // common.post('app.php?c=wxapp&a=get_fromid&f_id=' + param.e.detail.formId + '&store_id=' + common.store_id, '', getFormIdCallBack, ''); //购买记录
  // function getFormIdCallBack(res) {
  //   param.callBack && param.callBack();
  // }
}
/**
 * 腾讯地图转百度地图坐标
 * @param gg_lat
 * @param gg_lon
 * @returns {Object}
 * @constructor
 */
publicFun.MapabcEncryptToBdmap = function(gg_lat, gg_lon) {
  var point = new Object();
  var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  var x = new Number(gg_lon);
  var y = new Number(gg_lat);
  var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  var bd_lon = z * Math.cos(theta) + 0.0065;
  var bd_lat = z * Math.sin(theta) + 0.006;
  point.lng = bd_lon;
  point.lat = bd_lat;
  return point;
}

publicFun.chooseWXAddress = function(param) { // 一键使用微信收货地址
  var that = param.that;
  param.go = param.go ? param.go : "";
  wx.chooseAddress({
    success: function(res) { // 触发选择完成
      var province_code = '';
      var city_code = '';
      var area_code = res.nationalCode;
      city_code = (area.area[area_code] && area.area[area_code][1]) ? area.area[area_code][1] : '';
      province_code = (area.area[city_code] && area.area[city_code][1]) ? area.area[city_code][1] : '';
      // city_code = res.cityName ? res.cityName:'';
      // province_code = res.provinceName ? res.provinceName:'';
      //添加到会员地址 start
      var data = {};
      data.address_id = 0;
      data.name = res.userName;
      data.tel = res.telNumber;
      data.province = province_code;
      data.city = city_code;
      data.area = area_code;
      data.address = res.detailInfo;
      data.zipcode = res.postalCode;
      common.post('app.php?c=address&a=save', data, saveBack, '');

      function saveBack(result) {
        if (param.go == 'go') { //是否是支付页面修改的地址
          let address_id = result.err_msg.address_id;
          let e = 0;
          publicFun.defaultAddress(e, that, address_id, 'pay');
        } else {
          // wx.redirectTo({ url: '/pages/user/address/index' });
          param.callback && param.callback({
            address_id: result.err_msg.address_id
          });
        }
      }

    },
    fail: function(res) {
      console.log(res)
      if (res.errMsg.includes('auth deny')) {
        that.setData({
          'dialog.dialogHidden': false
        })
      }
    }
  })
}
publicFun.formatDuring = function(mss) {
  var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = (mss % (1000 * 60)) / 1000;
  if (mss <= 24 * 60 * 60 * 1000) {
    return hours + "小时" + minutes + "分钟" + seconds + "秒";
  } else {
    var days = parseInt(mss / (1000 * 60 * 60 * 24));
    return days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒";
  }
}
//处理周期购信息中的序号，如果是延期，则显示"-"
publicFun.setDeliverDataIndexNum = function(deliver_list) {
  let indexNum = 1;
  deliver_list.forEach(item => {
    if (parseInt(item.status) !== -1) {
      item.indexNum = indexNum
      indexNum++
    } else {
      item.indexNum = "-"
    }
  })
  return deliver_list
}

//店铺浮窗通知提醒
// 下单 store_order_id=店铺ID|最新订单ID
// 浏览 product_browse_str=店铺ID|商品ID|最新记录ID
// 购买 buy_product_str=店铺ID|商品ID|最新订单ID
// 类型 type (1 下单) 默认全部
publicFun.storeNotice = function(that, product_id, order_notice_open, order_notice_time) {

  if (!(order_notice_open * 1)) {
    return false
  }

  let types = [
    "下了一笔订单",
    "也浏览了此商品",
    "购买了此商品"
  ]

  let params = `&store_order_id=${common.store_id}`
  if (product_id) {
    params += `&product_browse_str=${common.store_id}|${product_id}&buy_product_str=${common.store_id}|${product_id}`
  } else {
    params += '&type=1'
  }
  getNotice(params)

  function closeNotice() {
    let t1 = setTimeout(function() {
      that.setData({
        '__store_notice_config.show': false
      })
      clearTimeout(t1)
    }, order_notice_time * 1000 - 300)
  }

  function getNotice(postParams) {
    const {
      wxapp_ticket
    } = getApp().globalData;
    var ticket = wxapp_ticket || wx.getStorageSync('ticket');
    if (!ticket) {
      return false
    }
    common.post('app.php?c=order&a=notice' + postParams, {}, function(res) {
      if (res.err_code == 0 && res.err_msg && res.err_msg.has_data) {
        let {
          order_notice,
          browse_notice,
          buy_notice
        } = res.err_msg
        let timeOutCount = 0;
        [order_notice, browse_notice, buy_notice].forEach(function(item, index) {
          if (item) {
            let t2 = setTimeout(function() {
              that.setData({
                __store_notice_config: {
                  show: true,
                  type: types[index],
                  ...item
                }
              })
              clearTimeout(t2)
              timeOutCount += order_notice_time * 1000
              closeNotice()
            }, timeOutCount)
          }
        })
        that.noticeTimeout1 = setTimeout(function() {
          let params = "";
          if (!product_id) {
            params += '&type=1'
          }
          if (order_notice) {
            params += '&store_order_id=' + order_notice.store_order_id
          }
          if (browse_notice) {
            params += '&product_browse_str=' + browse_notice.product_browse_id
          }
          if (buy_notice) {
            params += '&buy_product_str=' + buy_notice.product_browse_id
          }
          getNotice(params)
        }, timeOutCount + order_notice_time * 1000)
      }
    }, '')
  }
}
/**
 * 打开地图
 */
publicFun.oppeMap = function(e) {
  let latitude = parseFloat(e.target.dataset.lat)
  let longitude = parseFloat(e.target.dataset.long)

  wx.openLocation({
    latitude,
    longitude,
    scale: 18
  })
}
/**
 * 拨打电话
 */
publicFun.oppePhone = function(e) {
  let number = e.currentTarget.dataset.number
  console.log(number)
  wx.makePhoneCall({
    phoneNumber: number
  })
}


// 通过获取系统信息计算导航栏高度        
publicFun.setNavSize=function (that) {
  if (!that)return;
  var sysinfo = wx.getSystemInfoSync()
    , statusHeight = sysinfo.statusBarHeight
    , isiOS = sysinfo.system.indexOf('iOS') > -1
    , navHeight;
  if (!isiOS) {
    navHeight = 48;
  } else {
    navHeight = 44;
  }
  that.setData({
    status: statusHeight,
    navHeight: navHeight
  })
}
// 视频切换暂停其他播放
publicFun.videoPlay= function(that,e) {
  var curIdx = e.currentTarget.dataset.index;
  if (!that.data.playIndex) {//判断是否有播放的视频
    if (that.data.playIndex == 0) {
      that.videoContext.pause();
    }
    that.setData({
      playIndex: curIdx
    }, function () {//没有视频播放时
      that.videoContext = wx.createVideoContext('video' + curIdx);
      that.videoContext.play();
    })
  } else {
    that.videoContext.pause();
    that.setData({
      playIndex: curIdx
    }, function () {
      that.videoContext = wx.createVideoContext('video' + curIdx);
      that.videoContext.play();
    })
  }
}


//积分商品打开购物袋
publicFun.oppenShoppingP = function(e, that) { //开启购物袋遮罩层
  if (!getApp().isLoginFun(that)) { //判断用户是否登录
    return false;
  }

  let current_tartget = e.currentTarget.dataset;
  let son_target = e.target.dataset;
  let product_id = current_tartget.baby ? current_tartget.product : son_target.product;
  let type = current_tartget.baby ? current_tartget.type : son_target.type;
  let buttonTxt = '下一步';
  if (type == 'add_cart') {
    buttonTxt = '加入购物袋';
  }else if(type == 'self_buy0'){
    buttonTxt = '立即兑换';
  }

  that.setData({
    'shoppingData.buttonTxt': buttonTxt,
    'shoppingData.type': type,
    'shoppingData.shoppingNum': 1,

    'shoppingData.specList[0].vid': '',
    'shoppingData.value[0]': '',
    'shoppingData.specList[1].vid': '',
    'shoppingData.value[1]': '',
    'shoppingData.specList[2].vid': '',
    'shoppingData.value[2]': ''
  });
  // console.log(that.data.shoppingData);
  wx.showToast({
    icon: "loading",
    title: "加载中...",
    mask: true
  })
  common.post('app.php?c=goods&a=info&product_id=' + product_id + '&from_point_shop=1' + '&live_id=' + that.data.live_id, '', shoppingData, '');

  function shoppingData(result) { //购物袋数据
    wx.hideToast()
    if (result.err_code == 0) {
      if (type == 'make') {
        result.err_msg.custom_field_list = result.err_msg.reservation_custom_fields;
      }
      if (type == 'add_cart') {
        if (result.err_msg.product.union_ticket_code != '') {
          return publicFun.warning('此商品不能加入购物袋', that);
        }
      }
      for (var i in result.err_msg.custom_field_list) {
        result.err_msg.custom_field_list[i].value = '';
        if (result.err_msg.custom_field_list[i].field_type == 'date') {
          // result.err_msg.custom_field_list[i].date = publicFun.setDateDay('');
          // result.err_msg.custom_field_list[i].dateDay = publicFun.setDateDay('');
          // result.err_msg.custom_field_list[i].time = publicFun.setDateTime();
        }
        if (result.err_msg.custom_field_list[i].field_type == 'time') {
          // result.err_msg.custom_field_list[i].date = publicFun.setDateDay('');
        }
        if (result.err_msg.custom_field_list[i].field_type == 'image') {
          result.err_msg.custom_field_list[i].imgList = [];
        }
      }

      // 单规格 默认选中处理
      let single_sku_single_value = false;
      let sku_id = '';
      if (result.err_msg.sku_list && result.err_msg.sku_list.length == 1) {
        sku_id = result.err_msg.sku_list[0].sku_id;
        that.data.shoppingData.sku_id;
        single_sku_single_value = true;
        //单规格如果有规格图片，设置规格图
        if (result.err_msg.property_list &&
          result.err_msg.property_list[0] &&
          result.err_msg.property_list[0].values &&
          result.err_msg.property_list[0].values[0] &&
          result.err_msg.property_list[0].values[0].image) {
          result.err_msg.product.image = result.err_msg.property_list[0].values[0].image
        }
      }
      that.setData({
        'shoppingData.shoppingCatData': result.err_msg,
        'shoppingData.sku_id': sku_id,
        'shoppingData.single_sku_single_value': single_sku_single_value
      });
      result.err_msg.sku_list && result.err_msg.sku_list[0] && result.err_msg.sku_list[0].deliver_phase && that.setData({
        'shoppingData.shoppingCatData.product.deliver_phase': result.err_msg.sku_list[0].deliver_phase
      })

      if ((type == 'add_cart') && (that.data.shoppingData.shoppingCatData.sku_list == '' || that.data.shoppingData.shoppingCatData.sku_list == undefined) && (that.data.shoppingData.shoppingCatData.custom_field_list == '' || that.data.shoppingData.shoppingCatData.custom_field_list == undefined)) {
        publicFun.payment(that, e);
        return
      }

      that.setData({
        'shoppingData.shoppingShow': true
      });

    }
  }
};

//积分商品添加订单

publicFun.paymentP = function(that, e, page_name) { //去支付
  publicFun.skuPrice(that);
  let type = e.target.dataset.type || e.currentTarget.dataset.type;
  let is_add_cart = 0;
  let addType = 0;
  var emailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, // 邮箱正则
    idcardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  let reservation_custom = {}
  //    console.log(type);
  if (that.data.shoppingData.shoppingNum * 1 == 0) {
    return publicFun.warning('请选择购买数量', that);
  }
  if (that.data.shoppingData.sku_id == '' && (that.data.shoppingData.shoppingCatData.sku_list != '' && that.data.shoppingData.shoppingCatData.sku_list != undefined)) {
    return publicFun.warning('请选择商品规格', that);
  }
  if (type == 'add_cart') {
    is_add_cart = 1;
  }
  let param = '';
  if (type == 'make') { //预约
    addType = 10;
    param = '&store_id=' + that.data.shoppingData.shoppingCatData.product.store_id;
  }
  let custom_field_list = that.data.shoppingData.shoppingCatData.custom_field_list;
  /*检测留言信息start*/
  for (var i in custom_field_list) {
    reservation_custom[i] = {};
    if (custom_field_list[i].field_type == 'time') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].date;
      continue
    }
    if (custom_field_list[i].field_type == 'date') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].date + ' ' + custom_field_list[i].time;
      continue
    }
    if (custom_field_list[i].field_type == 'image') {
      reservation_custom[i]['name'] = custom_field_list[i].field_name;
      reservation_custom[i].type = custom_field_list[i].field_type;
      reservation_custom[i].value = custom_field_list[i].imgList;
      if (reservation_custom[i].value == '' || reservation_custom[i].value == []) {
        return publicFun.warning('请上传' + custom_field_list[i].field_name, that)
      }
      continue
    }
    if (custom_field_list[i].required * 1 && custom_field_list[i].value == '') {
      return publicFun.warning('请输入' + custom_field_list[i].field_name, that)
    }
    var is_required = custom_field_list[i].required != 0
    if (custom_field_list[i].field_name == '联系方式' && is_required) {
      if (!(custom_field_list[i].value).match(/\d{11}/)) {
        return publicFun.warning('请填写合法手机号', that);
      }
    }
    if (custom_field_list[i].field_type == 'id_no' && is_required) {
      if (!idcardReg.test(custom_field_list[i].value) && custom_field_list[i].value) {
        return publicFun.warning('请正确输入身份证格式留言内容', that)
      }
    }
    if (custom_field_list[i].field_type == 'email' && is_required) {
      if (!emailReg.test(custom_field_list[i].value) && custom_field_list[i].value) {
        // console.log(custom_field_list[i].value);
        return publicFun.warning('请正确输入邮箱格式留言内容', that)
      }
    }
    if (custom_field_list[i].field_type == 'number' && is_required) {
      if (!/^\d+(\.\d+)?$/.test(custom_field_list[i].value) && custom_field_list[i].value) {
        return publicFun.warning('请正确输入数字格式留言内容', that)
      }
    }
    reservation_custom[i]['name'] = custom_field_list[i].field_name;
    reservation_custom[i]['type'] = custom_field_list[i].field_type;
    reservation_custom[i]['value'] = custom_field_list[i].value;
  }
  /*检测留言信息end*/
  let data = {};
  data = {
    quantity: that.data.shoppingData.shoppingNum,
    sku_id: that.data.shoppingData.sku_id,
    send_other: 0,
    is_add_cart: is_add_cart,
    type: addType,
    custom: reservation_custom,
    product_id: that.data.shoppingData.shoppingCatData.product.product_id,
  };
  var product = that.data.shoppingData.shoppingCatData.product;
  if (product.special_product_type == 98) {
    data.cycle_select_date = product.deliver_date[that.data.shoppingData.deliver_date_index]
    data.cycle_type = 1
  }
  if (type == 'add_cart') { //加入购物袋
    // publicFun.warning('订单处理中，请稍后...', that);
  } else {
    publicFun.warning('订单处理中，请稍后...', that);
  }
  that.setData({
    is_paying: true
  })
  common.post('app.php?c=order&a=add' + param + '&from_point_shop=1', data, payment, '');

  function payment(result) { //去支付
    if(result.err_code == 30002){
      that.setData({
        showgetPhone: true
      });
    }else{
      that.setData({
        is_paying: false
      })
      if (type == 'add_cart') { //加入购物袋
        that.setData({
          'shoppingData.shoppingShow': false,
          'shoppingCatNum': true
        });
  
        wx.showToast({
          title: '添加成功',
          image: '../../images/successIcon.png',
          icon: 'success',
          duration: 2000
        });
        return
      }
      if (result.err_code == 1010) {
        publicFun.promptMsg(result.err_msg.msg_txt, '知道了', '', right);
  
        function right() {
          wx.redirectTo({
            url: '/pages/user/order/index?order=' + result.err_msg
          })
        }
      }
      if (result.err_code == 0) {
        var order_no = result.err_msg;
        publicFun.paymentGo(order_no, page_name,e)
      }
    }
    
  };


};

// 替换emoji表情
publicFun.filterEmoji = function (name) {
  var str = name.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");
  return str;
}
// 替换空格键2
publicFun.filterSpace = function (name) {
  var str = name.replace(/\s+/g, '');
  return str;
}

//判断是否是社区团购模式
publicFun.open_community_group=function(that){
  try {
    var value = wx.getStorageSync('open_community_group')
    console.log(value,"valuevaluevaluevaluevaluevaluevalue")
    if (value) {
      that.setData({
        open_community_group: value
      })
    }
  } catch (e) {
  }
}
// 订阅消息订单支付成功
publicFun.alreadyPay=function(that){
    let tmpid,typebus;
    if(that.data.goodsType == 'presale'){//预售
      typebus = 7
      tmpid = 4487
    }else if(that.data.goodsType == 'appoint'){//预约
      typebus = 6
      tmpid = 279
    }
    let url = 'app.php?c=subscribe_message&a=add_subscription_info',
    data = {
      store_id: getApp().globalData.store_id || common.store_id,
      uid: getApp().globalData.my_uid,
      subscription_info:[{
        temptid: tmpid,
        openid: wx.getStorageSync('openId'),
        type: typebus,
        business_id: that.data.order_no
      }]
    };
    common.post(url, data, function (result) {
      console.log(result.err_msg,'添加成功');
    })
}
// 订阅消息未支付
publicFun.unPay=function(that,payTypes){
  console.log('未支付')
  let paymentData = that.data.paymentData,
  myDate = new Date(),
  year = myDate.getFullYear(),    //获取完整的年份(4位,1970-????)
  month = myDate.getMonth() + 1,
  months = month < 10 ? '0' + month : month,
  date = myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate(),
  hours = myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours(),
  minutes = myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes();
  let nowtime = year + '年' + months + '月' + date + '日' + ' ' + hours + ':' + minutes
  console.log(nowtime);
  let strLen
  if(paymentData.product_list.length>1){
    strLen = publicFun.cutLen(paymentData.product_list[0].name,paymentData.product_list[0].name.length,13) + '...等' + paymentData.product_list.length + '件';
  }else{
    strLen = publicFun.cutLen(paymentData.product_list[0].name,paymentData.product_list[0].name.length,17) + '...';
  }
  let url = 'app.php?c=subscribe_message&a=send_message',
  data={}
  if(payTypes == 'offline'){//货到付款
    data = {
      openid: wx.getStorageSync('openId'),
      store_id: getApp().globalData.store_id || common.store_id,
      template_tid: 3509,
      data: {
        thing3:{value:strLen},
        amount4:{value: that.data.paymentMoney},
        character_string1:{value:that.data.order_no},
        date2:{value:nowtime},
        thing5:{value:'您已成功下单！祝您购物愉快'}
      },
      page: '/pages/user/order/index?order=' + that.data.order_no
    };
  }else{
    data = {
      openid: wx.getStorageSync('openId'),
      store_id: getApp().globalData.store_id || common.store_id,
      template_tid: 387,
      data: {
        thing1:{value:strLen},
        number2:{value: that.data.paymentMoney},
        character_string5:{value:that.data.order_no},
        date6:{value:nowtime},
        thing4:{value:'您的订单还未完成支付，请及时支付！'}
      },
      page: '/pages/user/order/index?order=' + that.data.order_no
    };
  }
  common.post(url, data, function (result) {
    console.log(result.err_msg,'发送回调成功');
  });
}
// 截取长度
publicFun.cutLen=function(Str, len, limitLen){
  if(typeof Str == 'string'){
    if (len > limitLen) {
      return Str.slice(0, limitLen);
    }
  }  
  return Str;
}
// 基础版本库
publicFun.compareVersion=function (v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);
  while (v1.length < len) {
    v1.push('0')
  };
  while (v2.length < len) {
    v2.push('0')
  };
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  };
  return 0;
}
// 获取图片的高
publicFun.imgHeight=function(e,that){
  let oldImgW = e.detail.width;//原图的宽
  let oldImgH = e.detail.height;//原图的高
  let imgScale = oldImgW/oldImgH;//原图的宽高比
  let nowImgH = wx.getSystemInfoSync().windowWidth*2/imgScale;
  that.setData({
    nowImgH:nowImgH
  });
}
// 判断两个数组是否有相同值
publicFun.getTheSame = function(attendUid,dataattendUid) {
  var result = new Array();
  var c = dataattendUid.toString();
  for (var i = 0; i < attendUid.length; i++) {
    if (c.indexOf(attendUid[i].toString()) > -1) {
      for (var j = 0; j < dataattendUid.length; j++) {
        if (attendUid[i] == dataattendUid[j]) {
          result.push(attendUid[i]);
          break;
        }
      }
    }
  }
  return result;
}

module.exports = publicFun
