// components/Dialog/dialog.js
let time = null;
Component({
    options: {
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    properties: {
        title: {
            type: String
        },
        // modal取消按钮文字
        cancelText: {
            type: String,
            value: '取消'
        },
        // modal确认按钮文字
        confirmText: {
            type: String
        },
        showFriendCircle:{
            type:String,
            value:'1'
        }
    },

    /**
     * 私有数据,组件的初始数据
     * 可用于模版渲染
     */
    data: {
        // modal显示控制
        isShow: false,
        cls: 'bottom-modal-hide'
    },

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新页面数据的方法类似
     */
    methods: {
        /*
         * 公有方法
         */

        //隐藏弹框
        hideDialog() {
            let that = this;
            // that.setData({
            //     cls: 'bottom-modal-hide'
            // })
            // time = setTimeout(function () {
            that.setData({
                isShow: !that.data.isShow
            })
            // }, 300);
        },
        //展示弹框
        showDialog() {
            this.setData({
                isShow: !this.data.isShow,
                cls: 'bottom-modal-show'
            })
        },
        /*
        * 内部私有方法建议以下划线开头
        * triggerEvent 用于触发事件
        */
        _cancelEvent() {
            //触发取消回调
            this.triggerEvent("_cancelEvent")
        },
        _shareGroup() {
            //分享好友或群
            this.triggerEvent("_shareGroup");
        },
        _shareFriendsCircle() {
            //触发成功回调
            this.triggerEvent("_shareFriendsCircle");
        }
    },

    attached: function () {
        clearTimeout(time);
     },
})