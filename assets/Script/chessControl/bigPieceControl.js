// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let common = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
        chessNode : {
            default : null,
            type : cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on('touchstart',this.touchStartAction,this);
        this.node.on('touchmove',this.touchMoveAction,this);
        this.node.on('touchend',this.touchEndAction,this);
    },

    init(){
        this.node.setPosition(cc.v2(-100,-200));
    },

    start () {

    },

    showShadow(){
        let positonArr = this.node.children.map((node)=>{
            return node.x.toString() + node.y ;
        });

        this.node.children.forEach((node)=>{
            let downPosition = node.y - node.height;
            let rightPosition = node.x + node.width;

            node.getChildByName('shadow_right').active = true ;
            node.getChildByName('shadow_down').active = true ;

            if(positonArr.includes(node.x.toString() + downPosition)){
                node.getChildByName('shadow_down').active = false ;
            }
            if(positonArr.includes(rightPosition.toString() + node.y)){
                node.getChildByName('shadow_right').active = false ;
            }
        });
    },

    hideShadow(){
        this.node.children.forEach((node)=>{
                node.getChildByName('shadow_right').active = false ;
                node.getChildByName('shadow_down').active = false ;
        });
    },

    touchStartAction(event){
        if(common.canTouch){
            let startPoint = event.touch['_startPoint'];
            let curPoint = event.touch['_point'];
            
            //触点相对于本节点锚点的偏移量        
            this.startVec = this.node.convertToNodeSpaceAR(startPoint);

            this.node.zIndex = common.zIndex++ ;
        }
    },

    touchMoveAction(event){ 
        event.stopPropagation();

        if(common.canTouch){
            let startPoint = event.touch['_startPoint'];
            let curPoint = event.touch['_point'];
            
            //要去位置相对于棋盘的位置
            let curVec = this.chessNode.convertToNodeSpaceAR(curPoint);
            this.node.setPosition(curVec.sub(this.startVec));
        }
    },

    touchEndAction(event){
        //这个行为直接冒泡到上层去
    }

    // update (dt) {},
});
