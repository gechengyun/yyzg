/***@author wangmu***/
var publicFun = require('../../../utils/public.js');
var common = require('../../../utils/common.js');
var app = getApp();
Page({
    data: {
        postage: true,
        index: 0,
        showBigPic: false,
        imgList: [],// 退货图片列表
        showMessage: false, // 查看留言信息
    },
    onLoad: function(e) { // 页面渲染完成
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        this.setData({
            id: e.rightid,
            order_no: e.order_no,
            pid: e.pid,
            
            /*id: '3808',
            order_no: 'PIG20161227164014468138',
            returnid: 0*/

        });
    },
    onReady: function(e) {
        var that = this;
        common.post('app.php?c=rights&a=detail&id=' + this.data.id + '&order_no=' + this.data.order_no + '&pigcms_id=' + this.data.pid, '', "returnData", that);
    },

    returnData: function(result) {
        let list = [];
        if (result.err_code == 0) {
            result.err_msg.product_list = [];
            result.err_msg.orderInfo = true;
            result.err_msg.product_list[0] = result.err_msg.rights;
            result.err_msg.product_list[0].comment_arr = result.err_msg.rights.comment;// 留言
            // 整理维权图片
            let img_list = result.err_msg.rights.images;
            for (let i = 0; i < img_list.length; i++) {
                this.data.imgList.push({ 'file': img_list[i] });
            }
            this.setData({
                returnData: result.err_msg,
                imgList: this.data.imgList,
            })
            console.log(this.data.returnData)
            if (this.data.returnData.rights.status == 3) {
                for (var i in this.data.returnData.express_lit) {
                    list.push(this.data.returnData.express_lit[i].name)
                }
                this.setData({
                    express_lit: list
                })
            }
            let return_list = this.data.returnData.return_list
            for (var i in return_list) {
                return_list[i].dateline = publicFun.dataCode(return_list[i].dateline * 1000);
            }
            this.data.returnData.rights.dateline_txt = publicFun.setDate(this.data.returnData.rights.dateline);
            this.setData({
                'returnData': this.data.returnData
            })

        };

    },
    bindPickerlogistics: function(e) {
        this.setData({
            index: e.detail.value
        })
    },
    cancelReturn: function(result) { //取消维权
        var that = this;
        let return_id = that.data.returnData.rights.return_id;
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
        let returnid = this.data.returnData.rights.return_id;
        let express_code = this.data.returnData.express_lit[that.data.index].code;
        let logisticsCode = that.data.logisticsCode;
        let flag = publicFun.logisticsCode(that, logisticsCode);

        if (flag) {
            let data = {
                return_id: returnid,
                express_code: express_code,
                express_no: logisticsCode
            }

            common.post('app.php?c=return&a=express', data, submitLogistics, '');

            function submitLogistics() {
                publicFun.promptMsg('成功提交物流信息', '返回', '', publicFun.goBack());

            }

        }
    },
    returnGo: function(e) { //跳转查看维权页面
        publicFun.returnGo(e)
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
    }


})
