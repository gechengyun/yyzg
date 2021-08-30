/***@author wangmu***/
/*拼团功能单独的公共方法publicFun*/
var publicFun = require('../../utils/Tpublic.js');
var common = require('../../utils/common.js');
var app = getApp();
Page({
    data: {
        postage: true,
        index: 0
    },
    onLoad: function(e) { // 页面渲染完成
      publicFun.setBarBgColor(app);// 设置导航条背景色
        console.log(e);
        var that = this;
        this.setData({
            id: e.id,
            order_no: e.order,
            returnid: e.returnid
                /*            id: '3808',
                            order_no: 'PIG20161227164014468138',
                            returnid: 0*/

        });
    },
    onReady: function(e) {
        var that = this;
        common.tuanPost('app.php?c=return&a=wxapp_detail&pigcms_id=' + this.data.id + '&order_no=' + this.data.order_no + '&id=' + this.data.returnid, '', "returnData", that);
    },

    returnData: function(result) {
        let list = [];
        if (result.err_code == 0) {
            this.setData({
                returnData: result.err_msg
            })
            if (this.data.returnData.return_detail.status == 3) {
                for (var i in this.data.returnData.express_lit) {
                    list.push(this.data.returnData.express_lit[i].name)
                }
                this.setData({
                    express_lit: list
                })
            }
            let return_list = this.data.returnData.return_list
            for (var i in return_list) {
                console.log(return_list[i].dateline)
                return_list[i].dateline = publicFun.dataCode(return_list[i].dateline * 1000);
            }
            this.setData({
                'returnData.return_list': return_list
            })
            console.log(this.data.returnData.return_detail);

        };

    },
    bindPickerlogistics: function(e) {
        this.setData({
            index: e.detail.value
        })
    },
    cancelReturn: function(result) { //取消退货
        var that = this;
        let return_id = that.data.returnData.return_detail.return_id;
        publicFun.cancelReturn(that, return_id)
    },
    logistics: function(e) { //查看物流信息
        var that = this;
        publicFun.logistics(e, that)
    },
    logisticsCode: function(e) { //填写物流订单
        console.log(e.detail.value)
        this.setData({
            logisticsCode: e.detail.value
        })
    },
    submitLogistics: function(e) { //提交物流信息 
        var that = this;
        let returnid = this.data.returnData.return_detail.return_id;
        let express_code = this.data.returnData.express_lit[that.data.index].code;
        let logisticsCode = that.data.logisticsCode;
        let flag = publicFun.logisticsCode(that, logisticsCode);

        if (flag) {
            let data = {
                return_id: returnid,
                express_code: express_code,
                express_no: logisticsCode
            }
            console.log(data);

            common.tuanPost('app.php?c=return&a=express', data, submitLogistics, '');

            function submitLogistics() {
                publicFun.promptMsg('成功提交物流信息', '返回', '', publicFun.goBack());

            }

        }
    },
    returnGo: function(e) { //跳转查看退货页面
        publicFun.returnGo(e)
    }


})
