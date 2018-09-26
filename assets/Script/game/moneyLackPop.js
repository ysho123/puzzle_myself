// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let util = require('util');
let common = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
       gameScript : null,
       coinLabel : {
         default : null,
         type : cc.Label
       }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.openid = common.userInfo.openid ;
    },

    start () {

    },

    // update (dt) {},
    share(){
        let shareData = util.getShareContent();
        wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic
        })

       util.pullRequest('shareAddScore',{openid:this.openid,type:1},(res)=>{
        if(res.code == 1){
            var that = this;
            common.userInfo.score += res.data.score;
            that.coinLabel.string = common.userInfo.score;
            wx.showToast({
                title : '碎片+' + res.data.score,
                icon : 'success',
                duration : 1000,
                success : ()=>{
                    that.closeNotEnough();
                }
            });
        }
       });
    },

    watchVideo(){
        wx.showToast({
                title : '暂未开通',
                icon : 'loading',
                duration : 1000,
        });
    },

    closeNotEnough(){
        this.node.getChildByName('fragment_not_content').runAction(util.zoomOutAction(()=>{
            this.node.active = false;
        }));
    },

    onEnable(){
        this.gameScript.buttonUnClickable();

        common.canTouch = false ;
        this.node.getChildByName('fragment_not_content').runAction(util.zoomInAction());
    },

    onDisable(){
        common.canTouch = true;
        this.gameScript.buttonClickable();
    }
});
