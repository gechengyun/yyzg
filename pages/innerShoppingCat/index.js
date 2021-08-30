var common = require('../../utils/common.js');
var publicFun = require('../../utils/public.js');
var app = getApp()
Page({
    data: {
        shoppingData: {
            shoppingShow: false,
            shoppingCatData: '',
            specList: [{
                'vid': 1
            }, {
                'vid': 1
            }, {
                'vid': 1
            }],
            value: '',
            sku_id: '',
            shoppingNum: 1,
        },
        shoppingCatMoney: 0,
        shoppingCatNum: 0,
        shoppingCatTotalNum: 0,
        isActive: '',
        clickable:true,   //购物袋是否能点击

    },
    onLoad: function() {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        let url = '/pages/shoppingCat/index'
        publicFun.setUrl(url);
    },
    onReady: function() {

    },
    onShow: function() {
        var that = this;
        common.post('app.php?c=cart&a=cart_list', '', "shoppingCatData", that);
    },
    shoppingCatData: function(result) {
        var that = this;
        if (result.err_code == 0) {
            this.setData({
                shoppingCatData: result.err_msg,
            })
            var cart_list = that.data.shoppingCatData.cart_list;
            for (var i = 0; i < cart_list.length; i++) {
                cart_list[i].isActive = 0;
            }
            publicFun.shoppingMoney(that);
            publicFun.barTitle(this.data.shoppingCatData.store_name); //修改头部标题
        }
    },
    oppenShopping: function(e) { //加入购物袋
        var that = this
        publicFun.oppenShopping(e, that);
    },
    plus: function(e) { //加
        var that = this;
        if(that.data.clickable){
            that.setData({clickable:false})
            publicFun.operation(that, e, 'plus');
            setTimeout(function(){
                that.setData({clickable:true})
            },500)
        }
        

    },
    reduce: function(e) { //减
        var that = this;
        if(that.data.clickable){
            that.setData({clickable:false})
            publicFun.operation(that, e, 'reduce');
            setTimeout(function(){
                that.setData({clickable:true})
            },500)
        }
        
    },
    shoppingBlur: function(e) { //输入框
        var that = this;
        publicFun.operation(that, e, 'input');
    },
    shoppingVid: function(e) { //选择商品规格
        var that = this;
        publicFun.shoppingVid(e, that);
    },
    payment: function() { //下一步,去支付
        var that = this;
        publicFun.payment(that, e)
    },
    goTopFun: function(e) { //回到顶部滚动条
        var that = this;
        publicFun.goTopFun(e, that)
    },
    closeShopping: function(e) { //关闭提示框遮罩层
        var that = this;
        publicFun.closeShopping(that);
    },
    choiceShopping: function(e) { //选择购物袋按钮
        var that = this;
        publicFun.choiceShopping(that, e);
    },
    settlement: function(e) { //结算购物袋
        var that = this;
        var catId = '';
        var cart_list = that.data.shoppingCatData.cart_list;
        for (var i = 0; i < cart_list.length; i++) {
            if (cart_list[i].isActive == 1) {
                catId += cart_list[i].pigcms_id + ',';
            }
        }
        if (catId == '') {
            return publicFun.warning('请选择要购买的商品', that);
        }
        catId = catId.substring(0, catId.length - 1);
        common.post('app.php?c=cart&a=pay&cart_id=' + catId, '', shoppingCatData, '');

        function shoppingCatData(result) {
            publicFun.paymentGo(result.err_msg)
        }
        //        console.log(catId);
    },
    formSubmit: function (e) { // 生成下发模板消息所需的formId存于服务器
        var that = this;
        publicFun.formSubmit({
            e: e,
            that: that
        });
    },

})
