// pages/setpassword/index.js
let publicFun = require('../../utils/public.js');
let common = require('../../utils/common')
let app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        message:'',//密码提示
        pwd:'',//密码
        pwd1:'',//确认密码
        isTypePwd:true,//显示密文
        isLoading:false,//按钮前面显示加载状态

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that=this;
        publicFun.setBarBgColor(app, that); // 设置导航条背景色
        console.log(options,'设置密码')
        if(options.setpas){
            that.setData({
                setpas: options.setpas
            });
        }
    },

    // 新增保存名密码
    keppPwdFun(){
        let self=this;
        if(self.ruleCheck()){
            // 更改按钮加载状态
            if(self.data.isLoading)return;
            var st=setTimeout(() => {
                self.setData({
                    isLoading:false
                })
            }, 6000);
            self.setData({
                isLoading:true,
                message:'校验通过'
            })
            
            // 存储设置密码
            common.post('app.php?c=cash&a=set_balance_pay_pwd',{
                pay_pwd:self.data.pwd
            },"savePwd",self)
        }
    },
    // 规则校验
    ruleCheck(){
        let pwd=this.data.pwd;
        let pwd1=this.data.pwd1;
        let flag=true;
        if(pwd.length==0 || pwd1.length==0){
            this.setData({
                message:'密码或确认密码不能为空'
            })
            flag=false;
        }else if(pwd!==pwd1){
            this.setData({
                message:'两次密码不一致'
            })
            flag=false;
        }else if(pwd.length<6 || pwd1.length<6){
            this.setData({
                message:'请输入6位有效数字'
            })
            flag=false;
        }else{
            this.setData({
                message:'校验通过'
            })
        }
        return  flag;
    },
    //输入离焦存储值
    inputPwd(e){
        this.setValue(e);
    },
    // 监听输入变化
    pwdStatus(e){
        this.setData({message:''});
        this.setValue(e);
    },
    setValue(e){
        if(e){
            const {value} =e.detail;
            const {type}=e.currentTarget.dataset;
            if(type=="pwd"){
                this.setData({
                    pwd:value.trim()
                })
            }else{
                this.setData({
                    pwd1:value.trim()
                })
            }
        }
    },
    //显示明文密文
    changePwdStatus(){
        this.setData({
            isTypePwd:!this.data.isTypePwd
        })
    },
    // 保存密码
    savePwd(result){
        let that = this
        console.log("reuslt==",result)
        const {err_code,err_msg}=result;
        if(err_code==0){
            wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000
            });
           
            var st=setTimeout(() => {
                this.setData({
                    isLoading:false
                })
                clearTimeout(st);
            }, 6000);
            var tout=setTimeout(function () {
                if(that.data.setpas == 1){
                    let nowpages = getCurrentPages(); //获取上一个页面信息栈(a页面)
                    let prevPage = nowpages[nowpages.length - 2];
                    if (prevPage) {
                        prevPage.setData({
                            is_set_pwd: 1
                        });
                    }
                }
                wx.navigateBack();
                clearTimeout(tout);
            },2000)
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

    
})