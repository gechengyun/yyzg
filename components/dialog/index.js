Component({
    properties: {
        dialogHidden: {
            type: Boolean,
            value: true
        },

// 这里定义了innerText属性，属性值可以在组件使用时指定
        titleText: {
            type: String,
            value: '提示',
        },
        titleMsg: {
            type: String,
            value: ' ',
        },

        determineBtnTxt:{
            type:String,
            value:"确定"
        },


        inputMsg: {
            type: String,
            value: '',
        },
//确定
        determineBtn: {
            type: String,
            value: 'default value',
        },
//取消
        cancleBtn: {
            type: Boolean,
            value: false,
        },
        openType:{
            type: String,
            value:"openSetting"
        },
        authBtn:{
            type:Boolean,
            value:false
        }
    },

    methods: {

// 这里是一个自定义方法,取消
        cancleBtn: function () {
// Properties pro = new Properties();
            this.setData({
                dialogHidden: true,
            })

        },

// 确定
        determineBtn: function () {

            var determineDetail = this.data.inputValue // detail对象，提供给事件监听函数
            this.triggerEvent('determineevent', determineDetail)
            this.setData({
                inputValue: "",
                dialogHidden: true
            })
        }
    }
})