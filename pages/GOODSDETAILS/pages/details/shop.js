var WxSearch = require('../../../wxSearch/wxSearch.js')
var common = require('../../../../utils/common.js');
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../../../utils/Tpublic.js');
var app = getApp();
let page = 2;
Page({
    data: {

    },
    onLoad: function(e) {
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        this.setData({
            store_id: e.store_id,
            // store_id: '33',
        });
        publicFun.height(that);
    },
    onReady: function() {
        var that = this;
        let store_id = that.data.store_id;
        common.tuanPost('webapp.php?c=tuan&a=store_list&store_id=' + store_id, '', 'setIndexData', that);
    },
    setIndexData: function(result) {
        if (result.err_code == 0) {
            this.setData({
                storeData: result.err_msg
            })
        }
    },
    bindDownLoad: function() {
        var that = this;
        let store_id = that.data.store_id;
        if (that.data.storeData.next_page == false) {
            console.log('没有更多数据了');
            return
        }
        page++;
        common.tuanPost('webapp.php?c=tuan&a=store_list&store_id=' + store_id + '&page=' + page, '', 'setPushData', that);

    },
    setPushData: function(result) {
        var that = this;
        let list = that.data.storeData.tuan_list;
        for (var i = 0; i < result.err_msg.tuan_list.length; i++) {
            list.push(result.err_msg.tuan_list[i]);
        }
        that.setData({
            'storeData.tuan_list': list,
            'storeData.next_page': result.err_msg.next_page
        });
    },
    detailsGo: function(e) { //跳转详情页面
        publicFun.detailsGo(e)
    },
    scroll: function(event) {
        this.setData({
            scrollTop: event.detail.scrollTop
        });
    },

})
