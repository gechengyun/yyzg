// var common = require('../../../utils/common.js');
var publicFun = require('../../../utils/public.js');
// var area = require('../../../utils/area.js');
var app = getApp();
Page({
    data: {
        user_address: {},
        address_id: 0,
        index: 0,
        currentTab: 0,
        addressEditData: '',
        province_name_arr: [],
        province_code_arr: [],
        province_index: 0,
        province_code: 0,
        city_name_arr: ['请选择'],
        city_code_arr: [],
        city_index: 0,
        city_code: 0,
        country_name_arr: ['请选择'],
        country_code_arr: [],
        country_index: 0,
        country_code: 0,
        BASE_IMG_URL: 'https://s.404.cn/applet/'
    },
    onLoad: function(e) { // 页面渲染完成
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        let addId = e.addid ? e.addid:'';
        this.setData({
          addId
        })
        if (e.order_no != '' && e.order_no != undefined) {
            that.setData({
                order_no: e.order_no,
                address: e.address,
                paymentPostage: e.paymentPostage
            })
          console.log("order_no==",that.data.order_no)
        }
        publicFun.addressEditGO(that, addId);
    },
    onReady: function() {
        var that = this;
        var address_id = this.data.user_address.address_id;
        if (address_id == 0) {
            publicFun.barTitle('添加新地址'); //修改头部标题
        } else {
            publicFun.barTitle('编辑地址'); //修改头部标题
        }
    },
    onShow:function(){
      let that=this;
      // console.log("that.data=======", that.data.newAddress);
      let obj_address = that.data.newAddress;
      if (obj_address && obj_address.address){
        that.setData({
          change_color:'red'
        });

        wx.showModal({
          title: '请核对省市区信息是否正确',
          content: '',
          showCancel: false,
          confirmText: '知道了'
        })

      }else{
        that.setData({
          change_color: '#666',
          newAddress:[]
        });
      }
    },

    //获取输入框的值
    savaValue:function(e){
      let addId = this.data.addId;
      if (!addId || addId==0){
        let txt_value = e.detail.value.trim();
        let txt_key = e.currentTarget.dataset.name;
        let key = `user_address.${txt_key}`;
        //key值为变量
        this.setData({
          [key]: txt_value
        })
      }
      
    },

    pickerProvince: function(e, p_index) { //省份选择
        var that = this;
        publicFun.pickerProvince(that, e, p_index)
    },

    pickerCity: function(e, c_index) { //市级选择
        var that = this;
        publicFun.pickerCity(that, e, c_index)
    },

    pickerCountry: function(e) { //县区
        var that = this;
        publicFun.pickerCountry(that, e)
    },
    bindPickerChange: function(e) {
        this.setData({
            index: e.detail.value
        })
    },
    // 保存
    addressSave: function(e) {
        var that = this;
        let comFrom = that.data.comFrom ? that.data.comFrom:'';
        if (that.data.order_no) {
          publicFun.addressSave(that, e, 'sid', comFrom) // 携带order信息返回address/index 页面
        } else {
          publicFun.addressSave(that, e, '', comFrom)
        }
    },
    chooseLocation: function (e) {
        publicFun.chooseLocation(this,function (res) {
        })
    }

})
