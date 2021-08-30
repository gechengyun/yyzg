/**
 * 
 * Created by GHJ on 2018/3/22.
 */
/** */
var canvasFun = {};
// 定义X轴中心坐标
canvasFun.getCenterX = function (o) {
    let that = o.that;
    let x = (that.data.canvasData.canvasWidth / 2) - o.r;
    return x
}
canvasFun.formatText = function (str, limit) {
    if (!limit) console.error('Function formatText() limit is required.')
    if (str.length > limit) {
        str = str.substring(0, limit) + '...';
    }
    return str
}
canvasFun.formatPrice = function (p) {
    if (p * 1 > 9999999.99) {
        p = (p / 10000).toFixed(1) + '万';
        return p
    } else if (p * 1 > 9999.99) {
        p = (p / 10000).toFixed(2) + '万';
        return p
    } else {
        return p
    }
}
// 绘制单行文本
canvasFun.createLine = function(o) {
    let that = o.that, ctx = o.ctx;
    o.stroke_color = o.stroke_color ? o.stroke_color : '#000000';
    if (!o.x0 || !o.x1 || !o.y0 || !o.y1) console.error('方法canvasFun.createLine 需要传入起始点和终点坐标!');
    ctx.setStrokeStyle(o.stroke_color);
    ctx.moveTo(o.x0, o.y0);
    ctx.lineTo(o.x1, o.y1);
    ctx.stroke();
    ctx.setStrokeStyle('#000000');
}

// 绘制单行文本
canvasFun.createText = function(o) {
    let that = o.that, ctx = o.ctx;
    ctx.setFontSize(o.fontSize) // 设置文本字体大小
    ctx.setFillStyle(o.color) // 设置文本字体颜色
    ctx.setTextAlign(o.position); // 设置文本居中方式  end和start模拟器中有效，真机貌似无效
    if (o.position == 'start') {
        let x = o.x ? o.x : 10;
        ctx.fillText(o.text, x, o.y);
    } else if (o.position == 'end') {
        let x = o.x ? that.data.canvasData.canvasWidth - o.x : that.data.canvasData.canvasWidth - 10;
        ctx.fillText(o.text, x, o.y);
    } else {
        ctx.fillText(o.text, canvasFun.getCenterX({ that: that, r: 0 }), o.y)
    }
    ctx.setFillStyle('#000000')
}

// 绘制多行文本
canvasFun.createMultiText = function(o) { // position: 'start'、'end'、'left'、'center'、'right'
    if (!o.text) return
    let that = o.that, ctx = o.ctx;
    o.fontSize = o.fontSize ? o.fontSize : 14;
    o.color = o.color ? o.color : '#000000';
    o.position = o.position ? o.position : 'start';
    o.x = o.x ? o.x : 0;
    o.y = o.y ? o.y : 0;

    let text = o.text;
    let textArr = text.split('\n');
    if (textArr.length > 1) {
        for (let i = 0; i < textArr.length; i++) {
            canvasFun.createText({
                that: that,
                ctx: ctx,
                text: textArr[i],
                fontSize: o.fontSize,
                color: o.color,
                position: o.position,
                x: o.x,
                y: o.y + (o.fontSize + 10) * (i + 1)
            })
        }
    } else {
        canvasFun.createText({
            that: that,
            ctx: ctx,
            text: o.text,
            fontSize: o.fontSize,
            color: o.color,
            position: o.position,
            x: o.x,
            y: o.y
        })
    }
}

// 画圆形图
canvasFun.circleImg = function(o) {
    let that = o.that, 
        ctx = o.ctx,
        img = o.img,
        x = o.x,
        y = o.y,
        r = o.r;
    ctx.save();
    ctx.beginPath();
    var d = 2 * r;
    var cx = x + r;
    var cy = y + r;
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(img, x, y, d, d);
    ctx.restore();
    ctx.closePath();
}

// 绘制方形图片
canvasFun.rectImg = function(o) { // 貌似没必要封装 = =!
    let that = o.that, ctx = o.ctx;
    o.y = o.y ? o.y : 0;
    o.width = o.width ? o.width : 0;
    o.height = o.height ? o.height : 0;
    let x;
    if (o.position == 'left') {
        x = o.x ? o.x : 10;
    } else if (o.position == 'right') {
        x = o.x ? o.x : that.data.canvasData.canvasWidth - 10;
    } else if (o.position == 'center') {
        x = (that.data.canvasData.canvasWidth - o.width) / 2;
    } else if (o.position == 'auto') {
        x = o.x ? o.x : 0;
    }
    ctx.drawImage(o.img, x, o.y, o.width, o.height);
}

// 绘制圆角方形
canvasFun.roundRect = function(o) {
    let that = o.that, ctx = o.ctx,
        paddingLeft = o.paddingLeft ? o.paddingLeft : 0,
        paddingTop = o.paddingTop ? o.paddingTop : 0,
        r = o.radius ? o.radius : 10,
        y = paddingTop ? paddingTop : 10,
        bg_color = o.bg_color ? o.bg_color : '#ffffff',
        x = o.x ? o.x : paddingLeft,
        w = o.w ? o.w : that.data.canvasData.canvasWidth - paddingLeft * 2,
        h = o.h ? o.h : that.data.canvasData.canvasHeight - paddingTop * 2,
        shadow = o.shadow ? o.shadow : 'rgba(180,180,180,.4)';
    ctx.save();
    ctx.beginPath();
    ctx.setFillStyle('#ffffff');
    ctx.setShadow(0, 0, 20, shadow);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.setFillStyle(bg_color);
    ctx.fill();
    ctx.setShadow(0, 0, 0, '#ffffff');
    if (o.img) {
        ctx.clip();
        ctx.drawImage(o.img, o.img_x, o.img_y, o.img_w, o.img_h);
    }
    ctx.closePath();
    ctx.restore();
    
}

// 设置画布背景及容器样式
canvasFun.setPostStyle = function (o) {
    let that = o.that, 
        ctx = o.ctx,
        paddingLeft = o.paddingLeft,
        paddingTop = o.paddingTop,
        radius = o.radius,
        bg_color = o.bg_color,
        bgPath = o.bgPath;
    // 设置背景图片或颜色
    ctx.drawImage(bgPath, 0, 0, that.data.canvasData.canvasWidth, that.data.canvasData.canvasHeight);
    
    // 绘制圆角方形
    canvasFun.roundRect({
        that: that,
        ctx: ctx,
        paddingLeft: paddingLeft,
        paddingTop: paddingTop,
        radius: radius,
        bg_color: bg_color
    })
}

// 画布转成图片
canvasFun.canvasToTempFilePath = function (o) {
    let that = o.that, canvasId = o.canvasId;
    wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: that.data.canvasData.canvasWidth,
        height: that.data.canvasData.canvasHeight,
        destWidth: '1600', //1125', //that.data.canvasData.canvasWidth,
        destHeight: '1920', // '1440', // that.data.canvasData.canvasHeight,
        canvasId: canvasId,
        success: function (res) {
            console.log('canvasToTempFilePath success')
            that.data.canvasData.shareImgSrc = res.tempFilePath;
            that.setData({
                canvasData: that.data.canvasData
            })
            wx.hideLoading();
            // 保存图片提示
            if (that.data.canvasData.status) { // 画布执行状态： true才保存图片，false不执行
                canvasFun.saveImageToPhotosAlbum({
                    that: that,
                    callback: o.callback,
                })
            }
        },
        fail: function (res) {
            console.log('canvasToTempFilePath fail')
        }
    })
}

// 保存图片提示
canvasFun.saveImageToPhotosAlbum = function(o) {
    let that = o.that;
    wx.saveImageToPhotosAlbum({
        filePath: that.data.canvasData.shareImgSrc,
        success(res) {
            console.log('saveImageToPhotosAlbum success')
            wx.showModal({
                title: '存图成功',
                content: '图片成功保存到相册了，去发圈噻~',
                showCancel: false,
                confirmText: '好哒',
                confirmColor: '#72B9C3',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定');
                        o.callback && o.callback();
                    }
                }
            })
        },
        fail(res) {
            console.log('saveImageToPhotosAlbum fail')
        }
    })
}

// 下载失败处理
canvasFun.loadFailTap = function(that, timer) {
    that.data.canvasData.loadFailTapStatus = true;
    that.setData({
        canvasData: that.data.canvasData
    })
    clearInterval(timer)
    wx.hideLoading();
    wx.showModal({
        title: '提示',
        content: '生成海报的时候出错啦，请返回重试~',
        showCancel: false,
        confirmText: '知道了',
        confirmColor: '#999999',
        success: function (res) {
            if (res.confirm) {
                console.log('用户点击确定');
                that._cancelEvent();
            }
        }
    })
}

canvasFun.loadImageFileByUrl = url => {
    return new Promise((resolve,reject)=>{
        wx.downloadFile({
            url,
            success:resolve,
            fail:reject
        })
    })
}

// 画图结束
module.exports = canvasFun