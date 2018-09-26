let util = require('util');
let common = require('common');
cc.Class({
    extends: cc.Component,

    properties: {
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on('click', this.musicTap, this);
    },

    musicTap(){
    	common.musicOn = !common.musicOn;
    	if(common.musicOn){
	       this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOn;
	       common.innerAudioContext.play();
	    }else{
	       this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOff;
	       common.innerAudioContext.pause();
	    }
    },

    start () {

    },
    // update (dt) {},
});
