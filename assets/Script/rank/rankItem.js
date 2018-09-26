
let util = require('util');
let common = require('common');
let localStorageSys = require('localStorageSys');

cc.Class({
    extends: cc.Component,

    properties: {
        itemInfo:{
            set(value){   
                this._itemInfo = value;
                this.isLock = value.isLock;
                this.sprite.spriteFrame = value.spriteFrame;
                this.lockText.string = value.unLockCost + '碎片解锁';
                this.rankName.string = value.name;
                this.currentNum.string = value.curLevel;
                this.total.string = value.totalNum;
                this.typeid = value.typeid;
            },
            get(){
                return this._itemInfo;
            }
        },
        isLock :  {
            set(value){
                this._isLock = value;
                this.lockNode.active = value;
            },
            get(){
                return this._isLock;
            }
        },
        lockNode : cc.Node,
        sprite: cc.Sprite,
        lockText : cc.Label,
        rankName : cc.Label,
        currentNum : cc.Label,
        total : cc.Label,
        typeid : NaN
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {

    },

    fragmentClick(){  
        // console.log('关卡点击的-信息：',this._itemInfo);
        if(this.isLock){
            let userCoin = localStorageSys.getCoinNum();

            if(userCoin >= this.itemInfo.unLockCost){
                let event = new cc.Event.EventCustom('enoughModal',true);
                event.detail = {
                    curCoinNum : userCoin,
                    needCoinNum : this.itemInfo.unLockCost,
                    typeid : this.typeid
                }

                // 向父节点派送事件
                this.node.dispatchEvent( event ); 
            }else{
                this.node.dispatchEvent( new cc.Event.EventCustom('notEnoughModal', true) );  
            }
        }else{
            this.node.dispatchEvent( new cc.Event.EventCustom('startGame', true) ); 
        }   
    },
    start () {

    },

    // update (dt) {},
});
