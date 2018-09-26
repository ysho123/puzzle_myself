let util = require('util');
let common = require('common');
let localStorageSys = require('localStorageSys');

cc.Class({
    extends: cc.Component,

    properties: {
        bgNodeArr : {
            default : [],
            type : [cc.Node]
        },
        musicNode:{
            default : null,
            type : cc.Node
        },
        musicOn:{
            default : null,
            type : cc.SpriteFrame
        },
        musicOff:{
            default : null,
            type : cc.SpriteFrame
        },
        startNode : {
        	default : null,
            type : cc.Node
        },
        fragmentNum: {
        	default : null,
            type : cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:



    onLoad () {
    	// 加载界面信息
        this.fiexScreen();

        //加载用户信息
        this.loadUserInfo();

        //音乐节点
        this.adjustMusic();

        //展示金币
        this.getCoinNum();

        //设置右上角分享
        this.setShareMenu();

        //创建流量主广告 目前没有
        // this.createBannerAd();    

        cc.director.preloadScene("Rank", function () {
            console.log("Rank scene preloaded");
        });
    },

    loadUserInfo(){
        localStorageSys.loadUserInfo();
    },

    adjustMusic(){
        // if(!common.musicOn){
        //     if(common.musicFirstLoad){
        //         util.getMusicSrc((musicSoc)=>{
        //                 common.innerAudioContext = wx.createInnerAudioContext();
        //                 common.innerAudioContext.loop = true;
        //                 common.innerAudioContext.src = musicSoc.src;
        //                 common.innerAudioContext.play();
        //                 common.musicOn = true;
        //                 common.musicFirstLoad = false ;
        //             }
        //         )
        //         this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOn;
        //     }else{
        //         this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOff;
        //     }
        // }
    },

    fiexScreen(){
        util.fiexScreenSize(this.canvas,this.bgNodeArr);
        common.sysInfo.ScreenHeight = this.bgNodeArr[0].height;
        common.sysInfo.ScreenWidth = this.bgNodeArr[0].width;
    },

    getCoinNum(){
        let coinNum = localStorageSys.getCoinNum();
        console.log('coinNumcoinNumcoinNum',coinNum);
        common.coinNum = coinNum;
        this.fragmentNum.string = coinNum;
    },

    setShareMenu(){
        // wx.showShareMenu();
        // let shareData ;
        // util.getShareContent((share)=>{
        //         shareData = share;
        //     }
        // )
        // wx.onShareAppMessage((res)=>{
        //     return {
        //         title : shareData.title,
        //         imageUrl : shareData.img_src
        //     }
        // });
    },

    createBannerAd(){
        
    },

    // 开始游戏
    startRank(){
    	cc.director.loadScene('Rank');
    },

    start () {
    },

    // 跳转到其他小程序
    goOtherGame(){
        let otherPrograme = {};
   
        wx.navigateToMiniProgram({
            appId : otherPrograme.appid,
            path : otherPrograme.page
        })
    },

 	share(){
    },
    // update (dt) {},
});
