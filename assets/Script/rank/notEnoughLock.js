let util = require('util');
let common = require('common');
cc.Class({
    extends: cc.Component,

    properties: {
        indexScript: Object
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    closeNotEnough(){
        this.node.getChildByName('fragment_not_content').runAction(util.zoomOutAction(()=>{
            this.node.active = false;
        }));
    },

    share(){
        // let shareData ;
        // util.getShareContent((share)=>{
        //         shareData = share;
        //         wx.shareAppMessage({
        //             title : shareData.title,
        //             imageUrl : shareData.img_src
        //         })
        //     }
        // )
        // util.pullRequest('shareAddScore',{openid:this.openid,type:1},(res)=>{
        //     if(res.code == 1){
        //         common.userInfo.score += res.score;
        //         // 分享后等2秒提示加碎片
        //         var that = this;
        //         setTimeout(function(){
        //             wx.showToast({
        //                 title : '碎片+' + res.score,
        //                 icon : 'success',
        //                 duration : 1000
        //             })
        //             that.indexScript.fragmentNum.string = common.userInfo.score; 
        //         },3000)
        //     }
        // });
        
    },

    watchVideo(){
        // let self = this;

        // util.showVedioAd1(this.openid,()=>{

        // },(res)=>{
        //     wx.showToast({
        //         title : '观看成功',
        //         icon : 'success',
        //         duration : 500,
        //         success : ()=>{
        //             if(self.indexScript.fragmentNum){
        //                 self.indexScript.fragmentNum.string = parseInt(self.indexScript.fragmentNum.string) + res.score ; 
        //                 common.userInfo.score += res.score ;
        //                 this.node.getChildByName('fragment_not_content').runAction(util.zoomOutAction(()=>{
        //                     this.node.active = false;
        //                 }));
        //             }
        //         }
        //     })
        // });
    },

    start () {

    },

    onEnable(){
        this.indexScript.stopButtons();
    },

    onDisable(){
        this.indexScript.activeButtons();
    }
    // update (dt) {},
});
