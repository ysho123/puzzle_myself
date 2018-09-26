let common = require('common');

const URL = {
    login : "https://www.xc82.cn/puzzle/User/login",
    getUserInfo : "https://www.xc82.cn/puzzle/User/getUserInfo", //获取用户碎片数
    getTypeList : "https://www.xc82.cn/puzzle/Game/getTypeList",//获取主题页面信息
    unlock : "https://www.xc82.cn/puzzle/Index/islock",//解锁减碎片
    shareAddScore : "https://www.xc82.cn/puzzle/Index/shareAddScore",//分享或看视频加碎片
    getRandshareJump : "https://www.xc82.cn/puzzle/Index/getRandshareJump",//首页随机获取跳转的游戏路径等
    getShareImg : "https://www.xc82.cn/puzzle/Index/getShareImg",//获取分享语和分享图片
    getMusic : "https://www.xc82.cn/puzzle/Index/getMusic",//获取音乐

    getGameDetailInfo : "https://www.xc82.cn/puzzle/Game/getGameDetailInfo",//获取题目信息
    minusMoneyForHint : "https://www.xc82.cn/puzzle/Game/minusMoneyForHint",//提示减金币
    unlockOnly : 'https://www.xc82.cn/puzzle/Index/unlockOnly',//解锁当前关卡，不扣金币

    getTzxcxInfo : "https://www.xc82.cn/puzzle/Index/getTzxcxInfo",//外部小程序导量记录
}

const XID = 26;
const KEY1 = 'openid';
const KEY2 = 'uid';
const noop = function() {};

function pullRequest(urlName,data,successCallBack,failCallBack = noop,completeCallBack = noop){
    wx.request({
        url: URL[urlName],
        method: 'POST',
        data: data,
        success: (res)=>{
            successCallBack(res.data);
        },
        fail: (err)=>{
            failCallBack(err);
        },
        complete: ()=>{
            completeCallBack();
        }
    })
}

// 拿openid
function getOpenId(callback){
    let openId = wx.getStorageSync(KEY1);
    let uid = wx.getStorageSync(KEY2);
    if(openId && uid){
        // console.log('已经有openid了',openId)
        // console.log('已经有uid了',uid)
        callback(openId,uid);
    }else{
        // console.log('还没有openid')
        wx.login({
            success:(data)=>{
                wx.request({
                    url: URL['login'],
                    method: 'POST',
                    data: { code : data.code, xid : XID },
                    success: (res)=>{
                        // console.log('login接收数据：',res.data);
                        if(res.data.code == 1){
                            console.log('openid:',res.data.data.openid);
                            console.log('uid:',res.data.data.uid);
                            wx.setStorageSync(KEY1,res.data.data.openid);
                            wx.setStorageSync(KEY2,res.data.data.uid);
                            callback(res.data.data.openid,res.data.data.uid);
                        }
                    }
                })
            }
        })
    }
}

// 适配屏幕
const fiexScreenSize = function(canvasNode,bgNodeArr){
    if(canvasNode){
        canvasNode.getComponent(cc.Canvas).designResolution = cc.winSize;
    }
    if(bgNodeArr){
        bgNodeArr.forEach((item,key)=>{
            item.width = cc.winSize.width;
            item.height = cc.winSize.height;
        });
    }
}

/**
 * 出现动作
 * @param {func} finished 回调函数
 */
const zoomInAction = function (finished = noop) {
    let callFunc = cc.callFunc(function(){
        finished && finished()
    })

    return cc.sequence(
        cc.fadeTo(-0.01, 1),
        cc.scaleTo(-0.01, 0.3),
        cc.fadeIn(0.3),
        cc.scaleTo(0.3, 1, 1),
        callFunc  
    )
}
/**
 * 消失动作
 * @param {func} finished 回调函数
 */
const zoomOutAction = function (finished = noop) {
    var callFunc = cc.callFunc(function(){
        finished && finished()
    });

    var seq = cc.spawn(
        cc.scaleTo(0.3, 0.4, 0.4),
        cc.fadeOut(0.5)
    )
    return cc.sequence(seq, callFunc);
}

/**
 * 从远程加载一组图片
 * @param {图片路径} imgPath
 * @param {当前节点} targetNode
 */
const loadRemoteImageArr = function (sourceArr,callback = noop) {
    let tmpArr = [] ;
    cc.loader.load(sourceArr,(error, results)=>{
        for(let item in results.map){    
            let spriteFrame = new cc.SpriteFrame(results.map[item].content);
            tmpArr.push(spriteFrame);
        }
        callback(tmpArr);
    });
}

// 不同的背景音乐
const getMusicSrc = function(callback){
    pullRequest('getMusic',{},(res)=>{
       callback(res);
    });
}

const judgetWhereFrom = function(openid){
    let hasCounted = wx.getStorageSync('ENTER');

    if(hasCounted){
        return;
    }
    else{
        let enterData = wx.getLaunchOptionsSync();

        let scene = enterData.scene;
        let query = enterData.query;
        var queryArr = Object.getOwnPropertyNames(query);

        if(queryArr.length == 0){
            console.log('no参数,啥都不干')
        }else{
            let data = {
                cxid : XID,
                tzid : query.tzid,
                scene : scene,  //场景来源
                openid : openid 
            }
            pullRequest('getTzxcxInfo',data,(res)=>{
                if(res.errcode == 1){
                    wx.setStorageSync('ENTER',true);
                }
            });
        }
    }
}

let shareToFriend = function(callback){
    shareData = share;
    wx.shareAppMessage({
        title : shareData.title,
        imageUrl : shareData.img_src
    })
}


let videoAdInstance1 = null;

const showVedioAd1 =function(openid,callback1,callback){
    if(!videoAdInstance1){
        videoAdInstance1 = wx.createRewardedVideoAd({
            adUnitId: 'adunit-186ca7a2c2f45202'
        });

        videoAdInstance1.onClose((res)=>{
            if(res.isEnded){ 
                pullRequest('shareAddScore',{openid : openid , type : '2'},(res)=>{
                    if(res.code == 1){
                        callback(res);

                        wx.showToast({
                            title : '领取成功',
                            icon : 'success',
                            duration : 1000,
                        })
                    }
                },(err)=>{
                    wx.showToast({
                        title : '网络失败',
                        icon : 'loading',
                        duration : 1000,
                    })
                },);
            }else{
                wx.showToast({
                    title : '观看不完整',
                    icon : 'loading',
                    duration : 1000,
                })
            }
        });
    }

    videoAdInstance1.load() 
    .then(() => {
        videoAdInstance1.show();
        callback1 && callback1();                
    })
    .catch((err) => {
         wx.showToast({
            title : '今日已上限',
            icon : 'loading',
            duration : 1000,
            success : () => callback1 && callback1()
        })
    });
}

let bannerAd = null ;

const createBannerAd = function(){
    let systemInfo = wx.getSystemInfoSync();
    let bannerWidth = systemInfo.windowWidth;
    let bannerHeight = 40;
    bannerAd = wx.createBannerAd({
      adUnitId: 'adunit-3bef72c10ea7b0c1',
      style: {
        left: 0,
        top: systemInfo.windowHeight - bannerHeight,
        width: bannerWidth
      }
    })
    bannerAd.show();
    bannerAd.onResize(res => {
        bannerAd.style.top = systemInfo.windowHeight - bannerAd.style.realHeight;
    })
}

const showBannerAd = function(){
    bannerAd.show();
}

const hideBannerAd = function(){
    bannerAd.hide();
}

module.exports = {
    getOpenId,
    pullRequest,
    fiexScreenSize,
    zoomInAction,
    zoomOutAction,
    loadRemoteImageArr,
    getMusicSrc,
    judgetWhereFrom,
    showVedioAd1,
    createBannerAd,
    showBannerAd,
    hideBannerAd,
}