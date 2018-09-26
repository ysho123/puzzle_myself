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
        unlockInfo : {
            set(value){
                this._unlockInfo = value;

                this.curCoinText.string = '您当前有' + value.curMoney + '片碎片';
                this.costCoinText.string = '是否使用' + value.needCoin + '碎片解锁次关' ;
                this.typeid = value.typeid;
            },
            get(){
                return this._unlockInfo;
            }
        },
        curCoinText :{
            default : null,
            type : cc.Label
        },
        costCoinText :{
            default : null,
            type : cc.Label
        },
        yes_btn : {
            default : null,
            type : cc.Node
        },
        no_btn : {
            default : null,
            type : cc.Node
        },
        indexScript : Object
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.yes_btn.on('click',this.unlock_yes,this);
    },

    unlock_yes(){
        let event = new cc.Event.EventCustom('unlock_yes',true);
        event.detail = {
            curCoinNum : this.unlockInfo.curMoney,
            needCoinNum : this.unlockInfo.needCoin,
            typeid : this.typeid,
            curNode : this.unlockInfo.curClickRankItem
        }

        // 向父节点派送事件
        this.node.dispatchEvent( event ); 
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
