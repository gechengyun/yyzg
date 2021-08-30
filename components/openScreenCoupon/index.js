const common = require('../../utils/common')
const app = require('../../app.js')
Component({

  behaviors: [],

  properties: {
    openScreen: { // 属性名
      type: Object, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: null // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
  },
  data: {
    show: true,
    scrollY: true,
    zoom: "In",
    BASE_IMG_URL: 'https://s.404.cn/applet/',
    isClick: true,//是否可以点击
  }, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    moved: function() {},
    detached: function() {},
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function() {}, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function() {

  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {},
  },

    methods: {
       
        closeCoupon() {
            console.log('关闭');
            this.setData({
                zoom: 'Out',
                isClick: false
            });
            let coupon_ids = []
            let coupon_list = this.data.openScreen.coupon_list
            for(let key in coupon_list){
                if(coupon_list.hasOwnProperty(key)){
                    coupon_ids.push(coupon_list[key].id)
                }
            }
            common.post('app.php?c=coupon&a=one_key_collection', {
                screen_id: this.properties.openScreen.screen_id,
                coupon_ids
            }, result=>{
                if (result.err_code === 0) {
                    setTimeout(() => {
                        this.setData({
                            show: false
                        })
                        wx.showToast({
                            title: '领取成功',
                            icon: 'none',
                            duration: 1000
                        })
                    }, 800)
                } else {
                  if (result.err_code == 10000 || result.err_code == 20000) {
                    this.setData({
                      showLoginModal: true
                    })
                  }
                    wx.showToast({
                        title: result.err_msg,
                        icon: 'none',
                        duration: 1000
                    })  
                }
            },'')
    }
    
  }
})