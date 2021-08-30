// index.js
var common = require('../../utils/common.js');
var wxCharts = require('../../utils/wxcharts.js');
var publicFun = require('../../utils/public.js');
var app = getApp();
var lineChart = null;
var pieChart = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeData: {}, // 佣金数据
        loginStatus: true,
        width: 0,
        height: 0,
        lineChartType: [], // 折线图类型数组
        currentTab: 0 ,// 折线图标签值
        barTil:""
        
    }, 
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;   
        publicFun.setBarBgColor(app, that);// 设置导航条背景色 
        publicFun.setNavSize(that) // 通过获取系统信息计算导航栏高度
        common.post('app.php?c=my&a=index', '',"userData", that); 
        common.post('app.php?c=drp_ucenter&a=user_team', '',"teamId", that); 
        //获取系统信息  
        wx.getSystemInfo({
            //获取系统信息成功----系统窗口的宽高 
            success: function (res) {
                that.width = res.windowWidth
                that.setData({
                    'width': res.windowWidth,
                    'height': res.windowHeight,
                })
            }
        });
        if (!common.is_fx) {
          wx.reLaunch({
            url: '/pages/distribution/create_distribution'
          })
        }
    }, 
    userData: function (result) {
      if (result.err_code == 0) {
        this.setData({
          barTil: result.err_msg.fx_name
        })
        console.log(this.data.barTil) 
      };
    },
    teamId:function(result){
      if (result.err_code == 0) {
        this.setData({
          team_id: result.err_msg.drp_team_id
        }) 
      }else if(result.err_code == 1010){
        console.log(result,99999)
        this.setData({
          team_id: 0
        }) 
      }
  },
    skip_page:function(){
      wx.navigateTo({
        url: '/pages/user/index'
      })
    },
    go_yong:function(){
      wx.navigateTo({
        url: '/pages/distribution/detail'
      }) 
    },
    go_user:function(){
      wx.navigateTo({
        url: '/pages/distribution/fans_manage'
      })
    },
    fansGong:function(){
      wx.navigateTo({
        url: '/pages/distribution/fans_manage?selectedIndex=' + 2,
      })
    }, 
    click_tixian:function(){
      wx.navigateTo({
        url: '/pages/distribution/detail?currentTab=' + 1,
      })
    },
    goExit:function(){
      wx.navigateTo({
        url: '/pages/distribution/pro_details',
      })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
       var that = this;  
       common.post('app.php?c=drp_ucenter&a=profit_index&store_id=' + common.store_id,'', "distributionData", that);
    }, 

    // 佣金数据
    distributionData: function(res) {
        var that = this;
        if (!common.is_fx) {
          wx.reLaunch({
            url: '/pages/distribution/create_distribution'
          })
          return;
        }



        if (res.err_code == 0) {
            //测试代码开始
            // res.err_msg.store.withdrawal_amount = 10.00;
            // res.err_msg.store.balance = 100.00;
            // res.err_msg.store.unbalance = 1000.00;

            // res.err_msg.yaxis = ['100.00', '150.00', '280.22', '390.00'];
            //测试代码结束 xaxis

            res.err_msg.store.withdrawal_amount = res.err_msg.store.withdrawal_amount.toFixed(2);
            // res.err_msg.store.balance = res.err_msg.store.balance.toFixed(2);
            // res.err_msg.store.unbalance = res.err_msg.store.unbalance.toFixed(2);
            for (let i = 0; i < res.err_msg.yaxis.length; i++) {
                res.err_msg.yaxis[i] = res.err_msg.yaxis[i]*1;
            }
            that.setData({
                'storeData': res.err_msg,  
            })

            //提取圆饼数据
            let cakeChartArray = [];
            let cakeBool = that.data.storeData.store.withdrawal_amount * 1 == 0 && that.data.storeData.store.balance * 1 == 0 && that.data.storeData.store.unbalance*1 == 0;
            if (cakeBool) {
                cakeChartArray = [{
                    name: '尚无佣金',
                    data: 1,
                    color: '#f9f9f9',
                    stroke: true,
                }]
            } else {
                cakeChartArray = [{
                    data: that.data.storeData.store.withdrawal_amount*1,
                    name: '已提现',
                    color: '#ffad4d',
                    stroke: false,
                }, {
                    data: that.data.storeData.store.balance*1,
                    name: '待提现',
                    color: '#6f7cff',
                    stroke: false,
                }, {
                    data: that.data.storeData.store.unbalance*1,
                    name: '已结算',
                    color: '#56f1dc',
                    stroke: false,
                }]
            }
            that.cakeChart(cakeChartArray);

            // 设定折线图类型
            let lineChart_type = [
                { type: 'yesterday', title: '昨日' },
                { type: 'week', title: '本周' },
                { type: 'month', title: '本月' }
            ];
            that.setData({
                'lineChartType': lineChart_type
            })

            // 提取折线图数据
            let lineChartArray = that.data.storeData.yaxis;
            let lineChartXaxis = that.data.storeData.xaxis;

            that.lineChart({
                canvasId: 'lineChart_yesterday',
                lineChartArray: lineChartArray,
                lineChartXaxis: lineChartXaxis
            });
        }
        else{
          wx.reLaunch({
            url: '/pages/distribution/create_distribution?code=1010'
          })
          return;
        }
    },

    // 圆饼图
    cakeChart: function (cakeChartArray) {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }

        //提取数据
        pieChart = new wxCharts({
            animation: true,
            canvasId: 'pieCanvas',
            type: 'ring',
            series: cakeChartArray,
            width: windowWidth,
            height: 150,
            dataLabel: false,
            legend: false,
        });
    },

    // 折线图
    lineChart: function (options) {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        let themeColor = app.globalData.navigateBarBgColor ? app.globalData.navigateBarBgColor : '#ffad4d';
        lineChart = new wxCharts({
            canvasId: 'lineChart',
            type: 'line',
            animation: true,
            categories: options.lineChartXaxis,
            series: [{
                name: '佣金',
                data: options.lineChartArray,
                color: themeColor,
                format: function (val) {
                    return val;
                },
            }],
            yAxis: {
                title: '佣金 (元)',
                format: function (val) {
                    return val;
                },
                min: 0,
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            dataPointShape: true,
            legend: false,
            // 曲折线
            // extra: {
            //     lineStyle: 'curve',
            // }
        });
    },
    
    // 标签切换
    switchNav: function (e) {
        var that = this;
        let page = 1;
        let currentIndex = e.target.dataset.current;
        let currentType = e.target.dataset.type;
        let currentId = e.target.dataset.id;
        switch (currentType) {
            case 'yesterday':
                that.getLineChartData({ label: 0})
                break;
            case 'week':
                that.getLineChartData({ label: 1 })
                break;
            case 'month':
                that.getLineChartData({ label: 2 })
                break;
        }

       // publicFun.swichNav(e, that); //切换
    },

    // 切换折线图，提取折现数据
    getLineChartData: function(options) {
        var that = this;
        let url = 'app.php?c=drp_ucenter&a=profit_index&label=' + options.label;
        common.post(url, '', "getData", that);
    },

    getData: function (res) {
        var that = this;
        if(res.err_code == 0) {
            //测试代码开始
            // res.err_msg.yaxis = ['100.00', '150.00', '280.22', '390.00'];
            //测试代码结束 xaxis
            
            for (let i = 0; i < res.err_msg.yaxis.length; i++) {
                res.err_msg.yaxis[i] = res.err_msg.yaxis[i] * 1;
            }
            // 提取折线图数据
            let lineChartArray = res.err_msg.yaxis;
            let lineChartXaxis = res.err_msg.xaxis;
            // 
            that.lineChart({
                lineChartArray: lineChartArray,
                lineChartXaxis: lineChartXaxis
            });
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.isLoginFun(this, 1);//判断用户是否登录
        if(this.data._unlogin){
          return;
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

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
})