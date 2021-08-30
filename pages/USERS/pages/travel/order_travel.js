// order_travel.js
var url='../../';
var common = require(url+'../../utils/common.js');
var publicFun = require(url+'../../utils/public.js');
// var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        productid: '',
        allMoney: '',     //当前总金额
        chosenMoney: '', //当前选择日期对应的金额
        chosenDay: '',   //当前选择的日期
        cur_year: '',   //当前年份
        cur_month: '',   //当前月份
        nowArray: '',    //当前选中日期的产品价格
        contact: [],
        personInfo: [1, 2],
        hasEmptyGrid: false,
        agreement: false,      //默认已阅读旅游合同
        adultNum: 2,          //成人数量
        childNum: 1,           //儿童数量
        contactInfo: { name: '', phone: '', email: '' },           //联系人信息
        idCardArray: []       //出行人身份证号码

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this;
        publicFun.height(that);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
        console.log(options)
        var that = this;
        publicFun.setBarBgColor(app, that);// 设置导航条背景色

        if (options.date) {
            let s = options.date;
            that.setData({
                chosenDay: s.slice(-2) * 1,
                cur_month: s.slice(5).substr(0, 2) * 1,
                cur_year: s.substr(0, 4) * 1
            })
        }
        if (options.productId) {
            that.setData({ productid: options.productId })
        } else {
            that.setData({ productid: wx.getStorageSync('roadId') })
        }

        common.post('app.php?c=travel&a=order&id=' + that.data.productid + '&preview=' + options.preview, '', "productData", that);
        
      //拉粉注册分享人id  分享来源1商品 2本店推广；
      getApp().globalData.share_uid = e.share_uid || '';
      getApp().globalData.shareType = e.shareType || 2;

    },
    productData: function (res) {
        var that = this;
        if (res.err_code == 0) {
            // console.log(that.data.cur_year, that.data.cur_month, that.data.chosenDay)
            for (let i = 0; i < res.err_msg.months.length; i++) {
                if (res.err_msg.months[i].value == that.data.cur_month) {
                    res.err_msg.months[i].checked = true
                    //初始化日历组件
                    if (that.data.cur_year == '') {
                        that.data.cur_year = res.err_msg.months[i].year * 1;
                    }
                    if (that.data.cur_month == '') {
                        that.data.cur_month = res.err_msg.months[i].value * 1;
                    }
                    if (that.data.chosenDay == '') {
                        that.data.chosenDay = res.err_msg.months[i].travel_days[0].day * 1;
                    }
                    this.calculateDays(that.data.cur_year, that.data.cur_month, res.err_msg.months[i]);
                } else if (!that.data.cur_month) {
                    res.err_msg.months[0].checked = true
                } else {
                    res.err_msg.months[i].checked = false
                }
            }
            that.setData({
                detail: res.err_msg,
                contact: res.err_msg.custom_fields,
            });
        }

        //初始化日历组件
        if (that.data.cur_year == '') {
            that.data.cur_year = res.err_msg.months[0].year * 1;
        }
        if (that.data.cur_month == '') {
            that.data.cur_month = res.err_msg.months[0].value * 1;
        }
        if (that.data.chosenDay == '') {
            that.data.chosenDay = res.err_msg.months[0].travel_days[0].day * 1;
        }
        this.calculateDays(that.data.cur_year, that.data.cur_month, res.err_msg.months[0]);
        const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
        this.calculateEmptyGrids(that.data.cur_year, that.data.cur_month);
        this.setData({
            cur_year: that.data.cur_year,
            cur_month: that.data.cur_month,
            chosenDay: that.data.chosenDay,
            weeks_ch: weeks_ch,
        })
        this.setPageData();
        that.contactInfo();   //初始化表单
    },
    contactInfo: function () {
        for (let i = 0; i < this.data.contact.length; i++) {
            this.data.contact[i].value = '';
            switch (this.data.contact[i].field_type) {
                case 'text':
                    this.data.contact[i].type = 'text';
                    this.data.contact[i].maxlength = 999;
                    this.data.contact[i].placeholder = '请输入' + this.data.contact[i].field_name;
                    break;
                case 'number':
                    this.data.contact[i].type = 'number';
                    if (this.data.contact[i].field_name == '手机') {
                        this.data.contact[i].maxlength = 11;
                    } else {
                        this.data.contact[i].maxlength = 999;
                    }
                    this.data.contact[i].placeholder = '请输入' + this.data.contact[i].field_name;
                    break;
                case 'email':
                    this.data.contact[i].type = 'text';
                    this.data.contact[i].maxlength = 999;
                    this.data.contact[i].placeholder = '必填，用于接收旅游合同';
                    break;
                default:
                    this.data.contact[i].type = 'text';
                    this.data.contact[i].maxlength = 999;
                    this.data.contact[i].placeholder = '请输入' + this.data.contact[i].field_name;
            }
        }
        this.setData({
            contact: this.data.contact
        })
    },
    //已阅读旅游合同
    goAgreement: function () {
        this.setData({ agreement: !this.data.agreement })
    },
    //增加人数
    addPerson: function (e) {
        var that = this;
        var nowArray = that.data.nowArray;

        for (let i = 0; i < nowArray.length; i++) {
            if (nowArray[i].sku_id == e.currentTarget.dataset.skuid) {
                let oldnum = nowArray[i].num * 1;
                let limitnum = nowArray[i].quantity * 1;
                //判断是否超过库存
                if (oldnum < limitnum) {
                    nowArray[i].num++;
                    //如果是成人，则出行人数组变化
                    if (e.currentTarget.dataset.type == 0 || e.currentTarget.dataset.type == '成人') {
                        that.data.idCardArray.push('');
                    }
                } else {
                    publicFun.warning('超过了最大库存', that);
                }
            }
        }
        that.setData({
            nowArray: nowArray,
            idCardArray: that.data.idCardArray
        })
        that.getAllMoney();

    },
    //减少人数
    reducePerson: function (e) {
        var that = this;
        var nowArray = that.data.nowArray;

        for (let i = 0; i < nowArray.length; i++) {
            if (nowArray[i].sku_id == e.currentTarget.dataset.skuid) {
                let oldnum = nowArray[i].num * 1;
                if (oldnum == 0) {
                    return;
                } else {
                    nowArray[i].num--;
                    //如果是成人，则出行人数组变化
                    if (e.currentTarget.dataset.type == 0 || e.currentTarget.dataset.type == '成人') {
                        that.data.idCardArray.pop();
                    }
                }
            }
        }
        that.setData({
            nowArray: nowArray,
            idCardArray: that.data.idCardArray
        })
        that.getAllMoney();

    },
    //计算总金额
    getAllMoney: function () {
        var that = this;
        var nowArray = that.data.nowArray;
        let all = 0;
        for (let i = 0; i < nowArray.length; i++) {
            all = all + parseInt(nowArray[i].num) * (nowArray[i].price * 100) / 100;
        }
        that.setData({ allMoney: all });
    },
    //联系人信息输入
    bindInfoInput: function (e) {
        var that = this;
        let index = e.currentTarget.dataset.index;
        that.data.contact[index].value = e.detail.value;
        that.setData({ contact: that.data.contact });
    },
    //出行人身份证号码输入
    idCardInput: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        that.data.idCardArray[index] = e.detail.value;
        that.setData({ idCardArray: that.data.idCardArray });

    },
    //验证字段合法性方法
    testStr: function (type, str) {
        var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        var cardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if (type == 'phone') {
            if (str.length < 5) {
                return false
            }
        } else if (type == 'email') {
            if (!emailReg.test(str)) {
                return false
            }

        } else if (type == 'idcard') {
            if (!cardReg.test(str)) {
                return false
            }
        }
        return true
    },
    goPay: function () {
        var that = this;
        if (!that.data.agreement) {
            publicFun.warning('请阅读并接受旅游合同！', that);
            return
        }
        const contactInfo = that.data.contact;
        //判断联系人信息
        for (let i = 0; i < contactInfo.length; i++) {
            if (contactInfo[i].required == 1) {
                //为必填字段
                if (contactInfo[i].value == '') {
                    publicFun.warning('请输入' + contactInfo[i].field_name, that);
                    return;
                } else if (contactInfo[i].field_name == '手机') {
                    if (!that.testStr('phone', contactInfo[i].value)) {
                        publicFun.warning('请输入正确手机号！', that);
                        return
                    }
                } else if (contactInfo[i].field_name == '邮箱') {
                    if (!that.testStr('email', contactInfo[i].value)) {
                        publicFun.warning('请输入正确邮箱！', that);
                        return
                    }
                }
            } else {
                //为非必填字段
                if (contactInfo[i].value != '') {
                    if (contactInfo[i].field_name == '手机') {
                        if (!that.testStr('phone', contactInfo[i].value)) {
                            publicFun.warning('请输入正确手机号！', that);
                            return
                        }
                    } else if (contactInfo[i].field_name == '邮箱') {
                        if (!that.testStr('email', contactInfo[i].value)) {
                            publicFun.warning('请输入正确邮箱！', that);
                            return
                        }
                    }
                }
            }

        }
        // console.log('that.data.idCardArray', that.data.idCardArray);
        //判断是否输入完整的出行人身份信息
        for (let m = 0; m < that.data.idCardArray.length; m++) {
            if (that.data.idCardArray[m] == '') {
                publicFun.warning('请输入出行人身份证号码', that);
                return
            }
            if (!that.testStr('idcard', that.data.idCardArray[m])) {
                publicFun.warning('请输入正确身份证号码', that);
                return
            }
        }

        // console.log('success!!!!!');

        let data = {};
        let nowArray = that.data.nowArray;
        data.product_id = that.data.productid;
        data.is_add_cart = 0; //是否加入购物袋
        data.send_other = 0;
        data.sku_id = [];
        data.custom = [];
        data.quantity = 0;
        for (let t = 0; t < that.data.nowArray.length; t++) {
            data.quantity = data.quantity * 1 + that.data.nowArray[t].num * 1;
            let obj = {};
            if (that.data.nowArray[t].num == 0) {
                continue
            }
            obj[that.data.nowArray[t].sku_id] = that.data.nowArray[t].num;
            data.sku_id.push(obj);
        }
        //判断预订人数是否在限制内
        var productData = that.data.detail.product;
        if (productData.people_quota_min && data.quantity == 0 && data.quantity * 1 < productData.people_quota_min * 1) {
            publicFun.warning('最小预订人数' + productData.people_quota_min + '人', that);
            return
        } else if (productData.people_quota_max && data.quantity * 1 > productData.people_quota_max * 1) {
            publicFun.warning('最大预订人数' + productData.people_quota_max + '人', that);
            return
        }
        for (let p = 0; p < that.data.contact.length; p++) { //联系人信息
            let obj = {};
            obj['name'] = that.data.contact[p].field_name;
            obj['type'] = that.data.contact[p].field_type;
            obj['value'] = that.data.contact[p].value;
            data.custom.push(obj);
        }

        data.peoples = that.data.idCardArray; //出行人身份证
        common.post('app.php?c=order&a=add', data, "getOrder", that);




    },
    getOrder: function (res) {
        if (res.err_code == 0) {
            wx.redirectTo({ url: '/pages/payment/index?order_no=' + res.err_msg })
        }

    },
    //设置当前日期的页面数据
    setPageData: function () {
        var that = this;
        const nowYear = that.data.cur_year;
        const nowMonth = that.data.cur_month;
        const nowDay = that.data.chosenDay;
        const monthArray = that.data.detail.months;
        console.log(monthArray)
        console.log('nowDay: ' ,nowDay)
        console.log('nowMonth: ', nowMonth)
        //设置当前日期的票价
        for (let i = 0; i < monthArray.length; i++) {
            if (monthArray[i].value == nowMonth) {
                for (let m = 0; m < monthArray[i].travel_days.length; m++) {
                    if (monthArray[i].travel_days[m].day == nowDay) {
                        that.setData({
                            chosenMoney: monthArray[i].travel_days[m].info[0].price,
                            //当前选择日期的产品参数
                            nowArray: monthArray[i].travel_days[m].info
                        })
                    }
                }
            }
        }
        //为当前产品参数添加数量num这一属性
        for (let j = 0; j < that.data.nowArray.length; j++) {
            that.data.nowArray[j].num = 0;
        }
        that.setData({ nowArray: that.data.nowArray, idCardArray: [] })
        that.getAllMoney();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.detail.product.name,
            desc: this.data.detail.product.name + '，物美价廉，购物必选',
          path: '/pages/USERS/pages/travel/order_travel/?product_id' + this.data.productid+ "&share_uid=" + getApp().globalData.my_uid + "&shareType=1",
        }
    },
    chooseDate(e) {
        var that = this;
        if (that.data.chosenDay == e.currentTarget.dataset.index) { //如果点击的日期是当天
            return;
        }
        let chosenDay = e.currentTarget.dataset.index;
        const monthArray = that.data.detail.months;
        var hasDay = false; //判断当前选择日期是否可选

        for (let i = 0; i < monthArray.length; i++) {
            if (monthArray[i].checked == true) {
                //判断当前月份数组中是否包含该日期
                for (let m = 0; m < monthArray[i].travel_days.length; m++) {
                    if (monthArray[i].travel_days[m].day == chosenDay) {
                        hasDay = true;
                    }
                }

            }
        }
        if (hasDay) {
            that.setData({ chosenDay: e.currentTarget.dataset.index });
            that.setPageData();
        } else {
            publicFun.warning('该日期不在选择范围', that);
        }

    },

    getThisMonthDays(year, month) {
        return new Date(year, month, 0).getDate();
    },
    getFirstDayOfWeek(year, month) {
        return new Date(Date.UTC(year, month - 1, 1)).getDay();
    },

    // 计算每月在表格中为空的数据
    calculateEmptyGrids(year, month) {
        const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
        let empytGrids = [];
        if (firstDayOfWeek > 0) {
            for (let i = 0; i < firstDayOfWeek; i++) {
                empytGrids.push(i);
            }
            this.setData({
                hasEmptyGrid: true,
                empytGrids
            });
        } else {
            this.setData({
                hasEmptyGrid: false,
                empytGrids: []
            });
        }
    },

    //计算当前月天数以循环
    calculateDays(year, month, cur_month_data) {
        let days = [];
        const thisMonthDays = this.getThisMonthDays(year, month);
        for (let i = 1; i <= thisMonthDays; i++) {
            let day_obj = {};
            for (let j = 0; j < cur_month_data.travel_days.length; j++) {
                if (i == cur_month_data.travel_days[j].day) {
                    day_obj.canChooseDay = i;
                }
                day_obj.index = i;
            }
            days.push(day_obj);
        }

        this.setData({
            days
        });
    },

    //更新日历
    handleCalendar(e) {
        //1.更新日历头部
        var that = this;
        const targetMonth = e.currentTarget.dataset.month;
        const targetYear = e.currentTarget.dataset.year;

        for (let i = 0; i < that.data.detail.months.length; i++) {
            if (that.data.detail.months[i].value == targetMonth) {
                this.calculateDays(targetYear, targetMonth, that.data.detail.months[i]);
                that.data.chosenDay = that.data.detail.months[i].travel_days[0].day;
                that.data.detail.months[i].checked = true;
            } else {
                that.data.detail.months[i].checked = false;
            }
        }

        //2.更新日历主体
        const cur_year = this.data.cur_year;
        const cur_month = this.data.cur_month;
        
        this.calculateEmptyGrids(targetYear, targetMonth);

        this.setData({
            chosenDay: that.data.chosenDay,
            cur_year: targetYear,
            cur_month: targetMonth,
            detail: that.data.detail
        })
        this.setPageData();
    },

})