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
        imgList: []
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
        if (result.err_code == 0) {
            let list = result.err_msg.order_product_list;
            result.err_msg.describe = [];
            result.err_msg.logistics = [];
            result.err_msg.service = [];
            for (var i in list) {
                list[i].satisfied = [];
                list[i].imgList = [];
                list[i].content = '';
                list[i].score = 0;

                for (var j in list[i].tag_list) {
                    list[i].tag_list[j].label = 0
                }
                for (var j = 0; j < 5; j++) {
                    list[i].satisfied[j] = 0
                }
            }
            for (var j = 0; j < 5; j++) {
                result.err_msg.describe[j] = 0
            }
            for (var j = 0; j < 5; j++) {
                result.err_msg.logistics[j] = 0
            }
            for (var j = 0; j < 5; j++) {
                result.err_msg.service[j] = 0
            }
            this.setData({
                evaluationData: result.err_msg,
            });
        };

    },
    label: function(e) {
        let index = e.currentTarget.dataset.index;
        let label = e.currentTarget.dataset.label;
        this.data.evaluationData.order_product_list[index].tag_list[label].label = !this.data.evaluationData.order_product_list[index].tag_list[label].label;
        this.setData({
            evaluationData: this.data.evaluationData
        })
    },
    satisfied: function(e) {
        let index = e.currentTarget.dataset.index;
        let label = e.currentTarget.dataset.label;
        let satisfied = this.data.evaluationData.order_product_list[index].satisfied;
        this.data.evaluationData.order_product_list[index].score = label + 1;
        for (var i in satisfied) {
            if (i <= label) {
                satisfied[i] = 1;
            } else {
                satisfied[i] = 0;
            }
        }
        this.setData({
            evaluationData: this.data.evaluationData
        })
    },
    describe: function(e) {
        let index = e.target.dataset.index;
        let type = e.target.dataset.type;
        let satisfied = '';
        if (type == 'describe') {
            satisfied = this.data.evaluationData.describe;
            this.data.evaluationData.describeScore = index + 1;
        } else if (type == 'logistics') {
            satisfied = this.data.evaluationData.logistics;
            this.data.evaluationData.logisticsScore = index + 1;
        } else {
            satisfied = this.data.evaluationData.service;
            this.data.evaluationData.serviceScore = index + 1;

        }
        for (var i in satisfied) {
            if (i <= index) {
                satisfied[i] = 1;
            } else {
                satisfied[i] = 0;
            }
        }
        this.setData({
            evaluationData: this.data.evaluationData
        })
    },
    addImg: function(e) { //图片上传
        var that = this;
        let index = e.currentTarget.dataset.index;
        console.log(index);
        publicFun.addImg(that, 'evaluation', index)
    },
    // 图片删除
    delFile(e) {
        let that = this;
        wx.showModal({
          title: '温馨提示',
          content: '您确认要删除吗？',
          success(res) {
            if (res.confirm) {
                let delNum = e.currentTarget.dataset.index;
                let indexitem = e.currentTarget.dataset.indexitem;
                that.data.evaluationData.order_product_list[indexitem].imgList.splice(delNum, 1);
                that.setData({
                    evaluationData: that.data.evaluationData
                });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }, 
    published: function(e) {
        var that = this;
        let list = this.data.evaluationData.order_product_list;
        let product = {};
        if (!this.data.evaluationData.describeScore) {
            return publicFun.warning('请给描述打分!', that);
        }
        if (!this.data.evaluationData.logisticsScore) {
            return publicFun.warning('请给物流打分!', that);
        }
        if (!this.data.evaluationData.serviceScore) {
            return publicFun.warning('请给服务打分!', that);
        }
        for (var i = 0; i <list.length; i++) {
            product[i] = {};
            product[i].tag_id_str = [];
            product[i].images_id_str = [];
            if (list[i].content == '') {
                return publicFun.warning('请填写商家评论!', that);
            }
            if (list[i].score == 0) {
                return publicFun.warning('请给商品满意度打分!', that);
            }
            product[i].pid = list[i].pid;
            product[i].relation_id = list[i].product_id;
            product[i].score = list[i].score;
            product[i].content = list[i].content;
            for (var j in list[i].tag_list) { //获得标签数组
                if (list[i].tag_list[j].label) {
                    product[i].tag_id_str[j] = list[i].tag_list[j].tag_id;
                }
            }
            for (var j in list[i].imgList) { //获得图片数组
                product[i].images_id_str[j] = list[i].imgList[j];

            }

        }


        let data = {
            order_id: that.data.order_id,
            product: product,
            store: {
                description_score: this.data.evaluationData.describeScore,
                logistics_score: this.data.evaluationData.logisticsScore,
                service_score: this.data.evaluationData.serviceScore,
            }
        };
        console.log(product)
        console.log(data);
        common.post('app.php?c=comment&a=add_comment', data, evaluationData, '');

        function evaluationData(result) {
            if (result.err_code == 0) {
                wx.redirectTo({ url: '/pages/user/order/evaluation?order_id='+that.data.order_id })

            }
        }

    },
    textarea: function(e) {
        var that = this;
        let value = e.detail.value;
        let index = e.currentTarget.dataset.index;
        this.data.evaluationData.order_product_list[index].content = value;
        that.setData({
            evaluationData: this.data.evaluationData
        });

    }


})
