// pages/activityModule/index.js
let publicFun = require('../../utils/public.js');
const app = getApp()
const common = require('../../utils/common')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [
            {index: 0, name: "全部", activityType: 0, active: true},
            {index: 1, name: "拼团", activityType: 2, active: false},
            {index: 2, name: "砍价", activityType: 4, active: false},
            {index: 3, name: "秒杀", activityType: 5, active: false},
            {index: 4, name: "预售", activityType: 1, active: false},
        ],
        filterActivitiesList: [],
        listStyle: "",
        currentPage: 1,
        nextPage: true,
        activity_time_style: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options && typeof options.nav !== 'undefined') {
            let tabs = this.data.tabs.filter(item => options.nav.includes('' + item.activityType))
            if (options.nav === "") {
                tabs = [this.data.tabs[0]]
            }
            tabs[0].active = true
            let listStyle = "";
            if (tabs.length === 1) {
                listStyle = "height:100vh;margin-top:0;"
            }
            this.setData({
                tabs,
                listStyle
            })
        }
        let barTitle = "活动模块";
        if (options && options.title) {
            barTitle = options.title
        }
        publicFun.setBarBgColor(app, this)// 设置导航条背景色
        publicFun.barTitle(decodeURIComponent(barTitle))
        this.getActivities()
    },
    /**
     * 用户点击右上角分享
     */
    getActivities() {
        let page = this.data.currentPage
        let type = this.data.tabs.find(item => item.active === true).activityType
        common.post(`app.php?c=activity&a=get_activity_list&store_id=${common.store_id}`, {
            type, page
        }, 'activityHomeData', this);
    },
    activityHomeData(result) {
        this.setData({
            filterActivitiesList: [...(this.data.filterActivitiesList || []), ...result.err_msg.content],
            nextPage: result.err_msg.next_page
        })
    },
    clickTab(event) {
        let tabIndex = event.currentTarget.dataset.t_index
        this.switchTab(tabIndex)
    },
    switchTab(tabIndex) {
        let currentTab = this.data.tabs.find(item => item.index === tabIndex)
        if (currentTab.active) return false
        let tabs = this.data.tabs.map(item => {
            item.active = item.index === tabIndex;
            return item
        })
        this.setData({
            currentPage: 1,
            tabs,
            filterActivitiesList: [],
            nextPage: true
        })
        this.getActivities()
    },
    /**
     * 活动结束时候的回调
     * @param options 1:未开始，灰色，3:已结束:灰色,宽度：100rpx
     */
    _onActivityStatusChange: function (options) {
        let {detail: {status, activityId}} = options
        let activityIndex = this.data.filterActivitiesList.findIndex(item=>item.pigcms_id == activityId)
        if (status === 1) {
            this.setData({
                [`filterActivitiesList[${activityIndex}].activity_time_style`]: "background-color:#999999;"
            })
        } else if (status === 2) {
            this.setData({
                [`filterActivitiesList[${activityIndex}].activity_time_style`]: ""
            })
        }
        else if (status === 3) {
            this.setData({
                [`filterActivitiesList[${activityIndex}].activity_time_style`]: "width:95rpx;background-color:#999999;"
            })
        }
    },

    scrollToLower: function () {
        console.log('加载更多')
        if (this.data.nextPage) {
            this.setData({
                currentPage: ++this.data.currentPage
            })
            this.getActivities()
        }
    }

})