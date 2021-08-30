// 18-04-24 created by cms_ssa
let app = getApp();
let canvas = {};

// 将绘图单位转换为rpx
canvas.px2rpx = function (o) {
    let dpr = app.globalData.dpr || 2;
    let obj = {};
    if (o && typeof (o) == 'object') {
      for (var key in o) {
        obj[key] = o[key] / dpr;
      }
    }
    return obj;
};

// 绘制图片
canvas.drawImage = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w } = o;
    let obj = this.px2rpx({ x, y, h, w });
    o = Object.assign({}, o, obj);
    ctx.drawImage(o.img, o.x, o.y, o.w, o.h);
};

// 画圆形
canvas.circle = function (o) {
    let ctx = o.ctx;
    let color = o.color || '#ddd';
    let { x, y, r } = o;
    let obj = this.px2rpx({ x, y, r });
    o = Object.assign({}, o, obj);
    ctx.beginPath();
    let d = 2 * o.r;
    let cx = o.x + o.r;
    let cy = o.y + o.r;
    // 获得圆形区域
    ctx.arc(cx, cy, o.r, 0, 2 * Math.PI);
    ctx.setStrokeStyle(color);
    ctx.stroke();
    ctx.closePath();
};

// 画圆形图
canvas.circleImg = function (o) {
    let ctx = o.ctx;
    let { x, y, r } = o;
    let obj = this.px2rpx({ x, y, r });
    o = Object.assign({}, o, obj);
    // 对之前画布内容存档
    ctx.save();
    ctx.beginPath();
    let d = 2 * o.r;
    let cx = o.x + o.r;
    let cy = o.y + o.r;
    // 获得圆形区域
    ctx.arc(cx, cy, o.r, 0, 2 * Math.PI);
    // 剪切接下来圆形区域内的绘图
    ctx.clip();
    ctx.drawImage(o.img, o.x, o.y, d, d);
    // 恢复之前存档的绘图内容
    ctx.restore();
    ctx.closePath();
};

// 绘制单行文本
canvas.drawText = function (o) {
    let ctx = o.ctx;
    let { x, y, fontSize } = o;
    let obj = this.px2rpx({ x, y, fontSize });
    o = Object.assign({}, o, obj);
    // 设置基本信息
    let _fontSize = Math.floor(o.fontSize) || 12;   // 避免不是整数的fontSize，设置格式无效
    let color = o.color || '#000';
    let baseline = o.baseline || 'top';
    let align = o.align || 'left';                      // 文本x轴对齐方式，根据x坐标为基准点
    ctx.setFontSize(_fontSize);                     // 设置文本字体大小
    ctx.setFillStyle(color);                            //  设置文本字体颜色
    ctx.setTextBaseline(baseline);      //  垂直对齐方式
    ctx.textBaseline = baseline;
    ctx.setTextAlign(align);                //  设置文本居中方式 ,可选：'left', 'center', 'right'
    ctx.textAlign = align;
    ctx.font = `${_fontSize}px PingFang-SC-Bold`;
    if (o.underLine) {
        const metrics = ctx.measureText(o.text).width;
        ctx.beginPath();
        ctx.setLineWidth(1);
        let xMap = {
            left: 0,
            center: -0.5,
            right: -1
        };
        let yMap = {
            top: 2,
            middle: 1,
            normal: -2,
            bottom: -2
        };
        let x1 = xMap[align] * metrics + o.x;
        let y1 = o.y + _fontSize / yMap[baseline];
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + metrics, y1);
        ctx.setStrokeStyle(color)
        ctx.stroke()
        ctx.closePath();
    }
    ctx.fillText(o.text, o.x, o.y);
};

// 绘制多行文本
canvas.drawMultiText = function (o) {
    let text = o.text;
    // 行与行的间距
    let gap = o.gap || 0;
    let textArr = text.split('\n');
    if (textArr.length > 1) {
        let baseY = o.y;
        for (let i = 0; i < textArr.length; i++) {
            let y = baseY + (o.fontSize + gap) * (i);
            o = Object.assign({}, o, { y: y });
            o.text = textArr[i];
            this.drawText(o);
        }
    }
};

// canvas转换成制定大小图片
canvas.canvasToTempFilePath = function (o) {
    return new Promise(function (resolve, reject) {
        wx.canvasToTempFilePath({
            x: o.x || 0,
            y: o.y || 0,
            width: o.w,
            height: o.h,
            destWidth: o.targetW,
            destHeight: o.targetH,
            canvasId: o.id,
            success: function (res) {
                resolve(res);
            },
            fail: function (err) {
                reject(err);
            }
        });
    });
};

// 保存图片
canvas.saveImageToPhotosAlbum = function (o) {
    return new Promise(function (resolve, reject) {
        wx.saveImageToPhotosAlbum({
            filePath: o.imgSrc,
            success: function (res) {
                resolve(res);
            },
            fail: function (err) {
                reject(err);
            }
        });
    });
};

// 绘制阴影矩形
canvas.shadowRect = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w, blur, offset } = o;
    let obj = this.px2rpx({ x, y, h, w, blur, offset });
    o = Object.assign({}, o, obj);
    let bg = o.bg || '#fff';
    let shadow = o.shadow || 'rgba(180,180,180,.4)';
    // 加save和restore方法，避免影响其他部分
    ctx.save();
    ctx.beginPath();
    ctx.setFillStyle(bg)
    ctx.setShadow(0, 0, blur, shadow);
    // 计算偏移量
    let _offset = o.offset || 0;
    ctx.rect(o.x + _offset, o.y + _offset, o.w - _offset * 2, o.h - _offset * 2);
    ctx.fill()
    ctx.setShadow(0, 0, 0, '#ffffff');
    ctx.restore();
    ctx.closePath();
};

// 绘制透明背景层
canvas.bgRect = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w } = o;
    let obj = this.px2rpx({ x, y, h, w });
    o = Object.assign({}, o, obj);
    let bg = o.bg || 'rgba(255, 255, 255, .85)';
    ctx.setFillStyle(bg);
    ctx.fillRect(o.x, o.y, o.w, o.h);
};

// 画圆角矩形安卓手机有较大兼容性问题，暂未使用
canvas.roundRects = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w, r } = o;
    let obj = this.px2rpx({ x, y, h, w, r });
    o = Object.assign({}, o, obj);
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(o.x + o.r, o.y);
    ctx.arcTo(o.x + o.w, o.y, o.x + o.w, o.y + o.h, o.r);
    ctx.arcTo(o.x + o.w, o.y + o.h, o.x, o.y + o.h, o.r);
    ctx.arcTo(o.x, o.y + o.h, o.x, o.y, o.r);
    ctx.arcTo(o.x, o.y, o.x + o.w, o.y, o.r);
    ctx.setFillStyle(o.bg)
    ctx.fill()
    ctx.closePath();
};

// 画圆角矩形
canvas.roundRect = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w, r, blur } = o;
    let obj = this.px2rpx({ x, y, h, w, r, blur });
    o = Object.assign({}, o, obj);
    let shadow = o.shadow || '#fff';
    let _blur = o.blur || 0;
    let bg = o.bg || '#fff';
    ctx.beginPath();
    if (o.drawImg) {
        ctx.save();
    }
    ctx.setShadow(0, 0, _blur, shadow);
    ctx.moveTo(o.x + o.r, o.y);
    ctx.lineTo(o.x + o.w - o.r, o.y);
    ctx.arc(o.x + o.w - o.r, o.y + o.r, o.r, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(o.x + o.w, o.y + o.h - o.r);
    ctx.arc(o.x + o.w - o.r, o.y + o.h - o.r, o.r, 0, 0.5 * Math.PI);
    ctx.lineTo(o.x + o.r, o.y + o.h);
    ctx.arc(o.x + o.r, o.y + o.h - o.r, o.r, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(o.x, o.y + o.r);
    ctx.arc(o.x + o.r, o.y + o.r, o.r, Math.PI, 1.5 * Math.PI);
    ctx.setFillStyle(bg);
    ctx.fill();
    ctx.setShadow(0, 0, 0, '#fff');
    if (o.drawImg) {
        // ctx.clip();
        ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, o.x, o.y, o.w, o.h);
        // 是否设置底部蒙层
        if (o.cover) {
            this.bgRect(o.coverObj)
        }
        ctx.restore();
    }
    ctx.closePath();
};

// 绘制圆角矩形只有边框
canvas.roundBorderRect = function (o) {
    let ctx = o.ctx;
    let { x, y, h, w, r, blur } = o;
    let obj = this.px2rpx({ x, y, h, w, r, blur });
    o = Object.assign({}, o, obj);
    let border = o.border || '#fff';
    ctx.beginPath();
    ctx.moveTo(o.x + o.r, o.y);
    ctx.lineTo(o.x + o.w - o.r, o.y);
    ctx.arc(o.x + o.w - o.r, o.y + o.r, o.r, 1.5 * Math.PI, 2 * Math.PI);
    ctx.lineTo(o.x + o.w, o.y + o.h - o.r);
    ctx.arc(o.x + o.w - o.r, o.y + o.h - o.r, o.r, 0, 0.5 * Math.PI);
    ctx.lineTo(o.x + o.r, o.y + o.h);
    ctx.arc(o.x + o.r, o.y + o.h - o.r, o.r, 0.5 * Math.PI, Math.PI);
    ctx.lineTo(o.x, o.y + o.r);
    ctx.arc(o.x + o.r, o.y + o.r, o.r, Math.PI, 1.5 * Math.PI);
    ctx.setStrokeStyle(border)
    ctx.stroke()
    ctx.closePath();
};

// 绘制圆角矩形图片
canvas.roundImg = function (o) {
    o.drawImg = true;
    if (o.cover) {
        let _h = o.coverH || 140;
        let obj = {
            ctx: o.ctx,
            x: o.x,
            y: o.y + o.h - _h,
            w: o.w,
            // 蒙层高度
            h: _h
        }
        o.coverObj = obj;
    }
    this.roundRect(o);
};
// 绘制渐变半透明背景层
canvas.blackBgRect = function (o) {
  let ctx = o.ctx;
  let { x, y, h, w } = o;
  let obj = this.px2rpx({ x, y, h, w });
  o = Object.assign({}, o, obj);
  let grd = ctx.createCircularGradient(w/4, h/4,h/4);
  grd.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  grd.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  grd.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  let bg = o.bg || 'rgba(0, 0, 0, .2)';
  ctx.setFillStyle(grd);
  ctx.fillRect(o.x, o.y, o.w, o.h);
};


module.exports = canvas;