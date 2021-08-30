// index.js
var app = getApp();
var _url = app.globalData.SUB_PACKAGE_BACK;
var common = require(_url+'../../utils/common.js');
var publicFun = require(_url+'../../utils/public.js');
var wxParse = require(_url+'../../wxParse/wxParse.js');
// var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        commentData: {},
        swiperCurrent: 0,
        indicatorDots: false,
        autoplay: true,
        interval: 5000,
        duration: 500,
        userInfo: {},
        // showView: false, // 会话弹窗显示控制（已废弃）
        is_FX: false, // 是否是分销商
        currentTab: 0,
        productList: 5,   //评论类型
    },
    onReady: function () {
        var that = this;
        publicFun.height(that);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        console.log(e)
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色
        publicFun.barTitle('旅游分销');
        publicFun.height(that);
        var product_id = '';
        var preview = 0;

        if (e.scene != undefined) {
            var scene_id = decodeURIComponent(e.scene);
            console.log("USERS/travel",scene_id);
            if (scene_id) { // 预览模式
                // product_id = scene.split(',')[1];
                // preview = 1;
                // app.globalData.store_id = scene.split(',')[0];
                common.post(url, data ,function(result){
                    //console.log("123先",result);
                    if(result.err_code == 0){
                      product_id = result.err_msg.product_id;
                      preview = 1;
                      app.globalData.store_id = result.err_msg.store_id;                              
                    }
                  },'');  
            }
        } else { // 正常模式
            if (e.store_id != undefined && e.store_id != '') {
                app.globalData.store_id = e.store_id;
            } else if ((e.store_id == undefined || e.store_id == '') && app.globalData.store_id == '') {
                app.globalData.store_id = common.store_id;
            }
            product_id = e.product_id;
        }

        that.setData({
            product_id: product_id,
            preview: preview,
        });
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      getApp().globalData.share_uid = e.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;
    },
    onShow: function () {
        var that = this;
        let url = '/app.php?c=travel&a=index&store_id=' + app.globalData.store_id + '&id=' + that.data.product_id + '&preview=' + that.data.preview;
        common.post(url, '', "travelDataCall", that);
    },
    //获取评论信息
    getComment: function (page, type, image) {
        //type评论类型，HAO:好评，ZHONG:中评，CHA:差评，IMAGE:有图片的评论，必传
        var that = this;
        let data = {
            type: 'PRODUCT',
            data_id: that.data.product_id,
            page: page
        }
        if (type) {
            data.tab = type
        }
        if (image) {
            data.image = image
        }
        common.post('app.php?c=comment&a=comment_list', data, "getCommentCall", that);
    },
    travelDataCall: function (res) {
        var that = this;
        // console.log(res);
        if (res.err_code == 0 && res.err_msg) {
            //获取评论信息
            that.getComment(1);
            //处理字符串
            for (let i = 0; i < res.err_msg.product.dates.length; i++) {
                var s = res.err_msg.product.dates[i].date;
                res.err_msg.product.dates[i].year = s.substr(0, 4);
                res.err_msg.product.dates[i].text = s.slice(5);
            }
            //分销处理
            let fx_url = '';
            if (res.err_msg.fx_data.type == 'FX') {
              fx_url = '/pages/USERS/pages/travel/distribution';
            } else if (res.err_msg.fx_data.type == 'OTHER'){
                fx_url = '/pages/distribution/create_distribution';
            } else {
                fx_url = '';
            }
            //活动链接处理
            if (res.err_msg.activites != undefined && res.err_msg.activites.length > 0) {
                let activites = res.err_msg.activites;
                for (let i = 0; i < activites.length; i++) {
                    var url = activites[i].url;
                    activites[i].path = publicFun.getType(activites[i].url)
                    // console.log(activites[i].path.url)
                }
            }
            //好评率处理
            let perfect_rate = res.err_msg.comment_data.t3 * 100 / res.err_msg.comment_data.total * 1;
                perfect_rate = perfect_rate.toFixed(2) + '%';
            that.setData({
                productData: res.err_msg,
                is_FX: res.err_msg.fx_data.is_fx,
                fx_url: fx_url,
                perfect_rate: perfect_rate
            })
            wx.setStorageSync('roadId', res.err_msg.product.product_id);
            // wx.setStorageSync('productInfo',res.err_msg.product);
        }

    },
    getCommentCall: function (res) {
        var that = this;
        if (res.err_code == 0) {
            that.setData({ commentData: res.err_msg })
        }

    },

    //轮播图的切换事件
    swiperChange: function (e) {
        //只要把切换后当前的index传给<swiper>组件的current属性即可 
        this.setData({
            swiperCurrent: e.detail.current
        })
    },

    //点击指示点切换 
    dotEvent: function (e) {
        this.setData({
            swiperCurrent: e.currentTarget.id
        })
    },

    //容器滚动监听事件
    scroll: function (e) {
        var that = this;
        let scroll_top = e.detail.scrollTop;

    },

    // 标签切换
    switchNav: function (e) {
        var that = this;
        let page = 1;
        let current = e.target.dataset.current;
        if (current * 1 == 0) {

        }
        if (current * 1 == 1) {

        }
        if (current * 1 == 2) {
            console.log('评论列表')
        }
        publicFun.swichNav(e, that); //切换
    },

    // 点击咨询
    phoneCall: function (e) {
        var that = this;
        // console.log(e.currentTarget)
        let tel = e.currentTarget.dataset.tel;
        // console.log(tel)
        publicFun.calling(tel);
        // that.changeConsultPop(e);
    },

    // 显示咨询窗口
    //   changeConsultPop: function(e) {
    //     var that = this;
    //     let type = e.currentTarget.dataset.statu;
    //     if (type == 'open') {
    //         that.setData({
    //             'showView': true
    //         })
    //     } else {
    //         that.setData({
    //             'showView': false
    //         })
    //     }
    //   },

    // 分享图标事件
    shareClick: function (e) {
        var that = this;
        // publicFun.shear(that)
        wx.showShareMenu({
            withShareTicket: false
        })
    },

    //收藏商品
    collect: function (e) {
        var that = this;
        publicFun.collect(that, e)
    },

    //切换评价类型
    productListSwichNav: function (e) {
        var that = this;
        let type = e.currentTarget.dataset.tab;
        let productlist = e.currentTarget.dataset.productlist;

        if (that.data.productlist == e.currentTarget.dataset.productlist) {
            that.getComment(1);
            that.setData({ productlist: 5 })
        } else {
            that.getComment(1, type);
            that.setData({ productlist: productlist })
        }
        // console.log('productlist',that.data.productlist);
    },
    //查看限购说明
    showQuotaDesc: function () {
        var that = this;
        let people_quota_desc = that.data.productData.product.people_quota_desc;
        people_quota_desc = people_quota_desc ? people_quota_desc : '限购说明为空!';
        if (people_quota_desc != '' && people_quota_desc != undefined) {
            people_quota_desc = wxParse.wxParse('people_quota_desc', 'html', people_quota_desc, that, 5);
        }
        that.setData({
            people_quota_desc: people_quota_desc
        })
        publicFun.richText({
            title: '限购提示',
            content: that.data.people_quota_desc,
            footer: '知道了'
        }, that)
    },
    
    hideRichTexBox: function() {
        publicFun.hideRichTexBox(this)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    // 右上角分享按钮事件
    onShareAppMessage: function () {
        return {
            title: this.data.productData.product.name,
            desc: this.data.productData.product.name + '，物美价廉，购物必选',
          path: '/pages/USERS/pages/travel/index?product_id=' + this.data.product_id + '&store_id=' + app.globalData.store_id+ "&share_uid=" + getApp().globalData.my_uid + "&shareType=1",
        }
    },

})