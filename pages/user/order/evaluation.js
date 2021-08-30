/***@author wangmu***/
var publicFun = require('../../../utils/public.js');
var common = require('../../../utils/common.js');
var app = getApp();
Page({
    data: {
        index: 0,
        numIndex: 0,
        numList: '',
        postage: true,
        imgList: [],
        common_list_index:0,
        showBigPic: false,
    },
    onLoad: function(e) { // 页面渲染完成
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        this.setData({
            id: e.id,
            order_id: e.order_id,
      

        });
    },
    onReady: function(e) {
        var that = this;
        common.post('app.php?c=comment&a=order_info&order_id=' + this.data.order_id, '', "evaluationData", that);
    },
    evaluationData: function(result) {
        var that = this;
        if (result.err_code == 0) {
            let list = result.err_msg.order_product_list;
            for (var i in list) {
                list[i].comment.dateline = publicFun.setDate(list[i].comment.dateline);
                for (var j = 0; j < list[i].comment.attachment_list.length; j++) {
                    console.log(list[i].comment.attachment_list[j])
                    that.data.imgList.push({ 'file': list[i].comment.attachment_list[j]});
                }
            }
            that.setData({
                evaluationData: result.err_msg,
                imgList: that.data.imgList,
            });
        };

    },
    showBigPic: function (e) {// 查看大图
        var that = this;
        that.setData({
            'common_list_index': e.target.dataset.index,
            'showBigPic': true
        })
        console.log(that.data)
    },
    hideBigPic: function () {// 隐藏大图
        var that = this;
        that.setData({
            'showBigPic': false
        })
    }




})
