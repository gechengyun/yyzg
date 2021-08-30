
var common = require('../../../../utils/common.js');
var publicFun = require('../../../../utils/public.js');
var app = getApp();
Page({
  data: {
    path_pid: "",
    provinceShow: false,
    cityShow: false,
    shopShow: true,
    activeSite: "请选择",
    userLocation: false
  },

  onLoad: function (e) {

    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    publicFun.setBarBgColor(app, that); // 设置导航条背景色
    let url = '/pages/index/index';
    let latitude = '';
    let longitude = '';
    let param = '';
    if (e != undefined && e != '' && e.pid) {
      param += '&product_id=' + e.pid;
      that.setData({
        path_pid: e.pid // 当前页面路径参数商品id
      })
    }
    if (e.rounter) {
      that.setData({
        rounter: e.rounter
      })
    }
    publicFun.setUrl(url);
    publicFun.height(that);
    publicFun.barTitle('选择门店');

  },
  onReady: function (e) { },

  onShow: function () {
    let that = this
    //获取用户上次打开小程序距重新获取地理位置
    app.getTimeDifference();
    //获取用户授权信息
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          that.getLocation()
        } else {
          that.selectSite()
        }
      }
    })

    if (this.data.userData == '') {
      this.onReady(e);
    } else {
      publicFun.setUrl('')
    }
  },

  shopHomeData: function (result) {
    console.log('shujus', result)
    var that = this
    if (result.err_code == 0) {
      this.setData({
        shopHomeData: result.err_msg,
      })
      //console.log(publicFun.expressDistance('37.820587', '118.820587'));
      // publicFun.expressDistance(alats, alongs, lats, longs);

    }
  },

  wxSearchFn: function (e) {
    var that = this;
    var page = 'shopHome';
    publicFun.wxSearchFn(that, e, page);
  },
  wxSearchInput: function (e) {
    var that = this;
    publicFun.wxSearchInput(that, e)
  },
  cancelSearch: function (e) {
    var that = this;
    cancelSearch(that);
  },
  goShopList: function (e) {
    var that = this;
    // console.log(e)
    setTimeout(function () {
      let id = e.currentTarget.dataset.id;
      let city = e.currentTarget.dataset.city;
      let shopName = e.currentTarget.dataset.shopname;
      wx.setStorageSync('city', city)
      wx.setStorageSync('shopName', shopName)
      //用户没有登录的情况下保存门店id
      let _unlogin = wx.getStorageSync('unlogin') || getApp().globalData.unlogin;
      if (_unlogin != undefined) {
        if (_unlogin) {
          wx.setStorageSync('real_physical_id', id)
        }
      }
      let status = e.currentTarget.dataset.status;
      if (status * 1 != 1) {
        return publicFun.warning('该门店已打烊', that);
      } else {
        let data = {
          physical_id: id
        }
        common.post('app.php?c=lbs&a=switch_substore&type=1', data, shopHomeData, '');

        function shopHomeData(result) {
          if (result.err_code == 0) {
             //更改强选参数
             wx.setStorageSync('open_physical_choose', 0)

            app.globalData.switch_store = true;
            if (that.data.path_pid != undefined && that.data.path_pid != '') {
              wx.navigateTo({
                url: '/pages/product/details?product_id=' + that.data.path_pid,
              })
            } else {
              if (that.data.rounter == 'shopcat') {
                wx.navigateTo({
                  url: '/pages/shoppingCat/index'
                })
              } else {
                var openType = "redirectTo";
                var nav_list = that.data.store_nav_list;
                for (var i = 0; i < nav_list.length; i++) {
                  var navListElement = nav_list[i];
                  if (navListElement.pagePath.indexOf('pages/index/index') > -1 && navListElement.status == 1) {
                    openType = "reLaunch"
                  }
                }
                wx[openType]({
                  url: '/pages/index/index?'
                })
              }

            }
          }
        }
      }
    }, 500)


  },
  getLocation: function () {
    var that = this;
    console.log('获取位置信息44ssssssss');
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log('获取位置信息44', res);
        let url = 'app.php?c=lbs&a=tx_to_baidu'
        that.setPosition(res.latitude, res.longitude, '', url);
      },
      fail: function (res) {
        wx.showToast({
          title: '定位失败，请稍后重试',
          icon: 'none'
        })
      }
    })
  },
  getLocation2: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res)
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

        let param = '';
        try {
          latitude = wx.getStorageSync('latitude')
          longitude = wx.getStorageSync('longitude')
          param = '&lat=' + latitude + '&lng=' + longitude;
        } catch (e) {

        }
        common.post('app.php?c=lbs&a=substore_index' + param, '', "shopHomeData", that);

      },
      fail: function (res) {
        publicFun.warning('定位失败，请稍后重试', that);
      }
    })
  },
  setPosition(latitude, longitude, positionname, url) {
    let that = this;
    let data = {
      lat: latitude,
      lng: longitude,
      lbs_type: 'wgs84'
    }
    common.post(url, data, function (res) {
      let latitudetrs = '';
      let longitudetrs = '';
      let nowPosition = '';
      let activeSite = '';
      let active = '';
      if (res.err_code == 0) {
        if (res.err_msg) {
          if (res.err_msg.status == 0) {

            if (!positionname) {
              nowPosition = res.err_msg.result.formatted_address;
              latitudetrs = res.err_msg.result.location.lat;
              longitudetrs = res.err_msg.result.location.lng;
              active = res.err_msg.result.addressComponent.city
            } else {
              latitudetrs = res.err_msg.result[0].y;
              longitudetrs = res.err_msg.result[0].x;              
              nowPosition = positionname;
            }
            //如果緩存有city取缓存中的
            activeSite = wx.getStorageSync('city') ? wx.getStorageSync('city') : active

            that.setData({
              nowPosition: nowPosition,
              activeSite: activeSite
            }, function () {
              wx.hideLoading()
            });
          }
        }
        latitudetrs=latitudetrs.toString();
        longitudetrs=longitudetrs.toString();
        wx.setStorageSync("longitude", longitudetrs);
        wx.setStorageSync("latitude", latitudetrs);
        let param = '';
        param += '&lat=' + latitudetrs + '&lng=' + longitudetrs + "&city=" + activeSite;
        common.post('app.php?c=lbs&a=substores' + param, '', "shopHomeData", that)
      } else {

      }

    }, '');
  },
  // 选择位置
  chooseLocation: function (e) {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log('选择的地址', res)
        let positionName = res.name;
        let url = 'app.php?c=lbs&a=other_to_baidu';
        that.setPosition(res.latitude, res.longitude, positionName, url);
      },

    })
  },

  /**
   * 8.15
   */
  //全部省
  allProvince: function () {
    let that = this
    common.post('app.php?c=lbs&a=get_province_city_list', {}, function (result) {
      console.log('地區', result);

      if (result.err_code == 0) {
        that.setData({
          provinceList: result.err_msg,
        }, function () {
          wx.hideLoading()
        })
      }
    }, '');

  },
  //省code=>市
  provinceClick: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let cityList = e.target.dataset.citylist;
    let provinceName = e.target.dataset.name;
    that.setData({
      cityList: cityList,
      activeSite: provinceName,
      provinceShow: false,
      cityShow: true,
      shopShow: false,
    }, function () {
      wx.hideLoading()
    })
    console.log(cityList, "-----cityList")
  },
  //切换市
  cityClick: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let cityCode = e.currentTarget.dataset.citycode;
    let cityName = e.currentTarget.dataset.name;
    let latitudetrs =wx.getStorageSync('latitude');
    let longitudetrs=wx.getStorageSync("longitude");
    let param = '';
    param += '&lat=' + latitudetrs + '&lng=' + longitudetrs;

    let url = 'app.php?c=lbs&a=substores&city_code=' + cityCode+param
    common.post(url, {}, function (result) {
      console.log('选择地区', result);
      if (result.err_code == 0) {
        that.setData({
          shopHomeData: result.err_msg,
          activeSite: cityName,
          provinceShow: false,
          cityShow: false,
          shopShow: true,
        }, function () {
          wx.hideLoading()
        })
      }
    }, '');
  },
  //导航地图
  oppeMap: function (e) {
    publicFun.oppeMap(e);
  },
  //重新选择
  selectSite: function () {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    that.allProvince()
    that.setData({
      provinceShow: true,
      cityShow: false,
      shopShow: false,
      activeSite: "请选择"
    })

  },
  //去商店详情
  goStoresDetails: function (e) {
    let that = this
    let physical_id = e.currentTarget.dataset.pigcmsid;
    //todo e.currentTarget.dataset.pigcmsid;??? e.target.dataset.pigcmsid
    wx.navigateTo({
      url: '/pages/storesDetails/storesDetails?physical_id=' + physical_id
    })
  },


})