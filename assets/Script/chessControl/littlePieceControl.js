// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        trueIndex : NaN ,
    },
     
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.registerListener();
    },

    start () {

    },

    registerListener(){
        this.node.on('touchstart',this.touchStartAction,this);
        this.node.on('touchmove',this.touchMoveAction,this);
        this.node.on('touchend',this.touchEndAction,this);
    },

    touchStartAction(event){
    },

    touchMoveAction(event){

    },

    touchEndAction(event){

    },

    // update (dt) {},
});
