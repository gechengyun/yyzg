const {formatDuring} = require('../../utils/public')
Component({
    behaviors: [],
    properties: {
        endTime: {
            type: Number,
            value: 0,
        },
        startTime: {
            type: Number,
            value: 0
        },
        activityType: {
            type: Number,
            value: 1
        },
        activityId: {
            type:String,
            value:0
        },
        customFieldIndex: {
            type:String,
            value:0
        }
    },
    data: {
        timeString: "",
        remainMS: 0,
        timer: null,
        status: 0//1:未开始 2：进行中 3：已结束
    },
    attached(){
        this.getTimeString()
        this.checkInterval()
    },
    moved: function () {
    },
    detached: function () {
    },
    methods: {
        getTimeString: function () {
            let {endTime, startTime, activityId,customFieldIndex} = this.properties
            let status;
            let currentTime = Date.now()
            endTime = endTime * 1000//php返回的时间戳是秒为单位
            startTime = startTime * 1000
            let timeString = "", remainMS = 0
            if (startTime > currentTime) {
                remainMS = Math.floor((startTime - currentTime) / 1000) * 1000
                timeString = '距开始：' + formatDuring(remainMS)
                status = 1
            } else if (endTime > currentTime && startTime < currentTime) {
                remainMS = Math.floor((endTime - currentTime) / 1000) * 1000
                timeString = '距结束：' + formatDuring(remainMS)
                status = 2
            } else {
                timeString = '已结束'
                status = 3
            }
            if (status !== this.data.status) {
                this.triggerEvent("_onActivityStatusChange", {status, activityId, customFieldIndex})
            }
            this.setData({
                remainMS,
                timeString,
                status
            })
        },
        checkInterval: function () {
            let that = this;
            that.data.timer = setInterval(function () {
                that.getTimeString()
                if (that.data.timeString === "已结束") {
                    clearInterval(that.data.timer)
                }
            }, 1000)
        },
    }

})