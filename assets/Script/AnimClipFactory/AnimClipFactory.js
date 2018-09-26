// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
let  util = require('util');
let common = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
        progressNode : {
            default : null,
            type : cc.Node 
        },
        progressBar : {
            default : null,
            type : cc.ProgressBar 
        },
        modulePrefab : {
            default : null,
            type : cc.Prefab
        },
        modulePrefab1 : {
            default : null,
            type : cc.Prefab
        },
        staticModulePrefab : {
            default : null,
            type : cc.Prefab
        },
        progressLabel : {
            default : null,
            type : cc.Label
        },
        chessBGNode : {
            default : null,
            type : cc.Node 
        },
        chessSpriteArr : {
            default : [],
            type : [cc.SpriteFrame]
        },
        chessBorderBgArr : {
            default : [],
            type : [cc.SpriteFrame]
        },

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    // },

    /**
        source
    */
    loadSource(source){
        let defaultInfo = {
            xNum : 5 ,
            yNum : 5 ,
            picWidth : 100 ,
            picPieceQuestion :  [[12,17,16,18],[13,14,19,23],[11,10,15,20],[0,5],[1,2,3,7],[4,8,9]], //题目 ： 下标从0开始
            staticPoint : [22,24,21,6], //固定的提示
            framesLength : 48,
            sourceUrl : 'https://xcx-base.oss-cn-hangzhou.aliyuncs.com/puzzleGame/AnimClipSource/level1/',
            
            playSpeed : 30
        }

        let levelInfo = source || defaultInfo ;

        this.xNum = levelInfo.xNum;
        this.yNum = levelInfo.yNum;
        this.picWidth = levelInfo.picWidth;
        this.picPieceQuestion = levelInfo.picPieceQuestion;
        this.staticPoint = levelInfo.staticPoint;
        this.length = levelInfo.framesLength;
        this.sourceUrl = levelInfo.sourceUrl;
        this.playSpeed = levelInfo.playSpeed;

        //调整棋盘的大小和棋盘的图片
        this.modifyChessBorderPicAndSize();

        //加载游戏所用资源
        let sourceArr = [];
        for(let i=1;i<=this.length;i++){
            sourceArr.push(this.sourceUrl + 'pic(' + i  + ').jpg');
        }

        cc.loader.load(sourceArr,this.downloadProgress.bind(this),this.completeProgress.bind(this));
    },

    modifyChessBorderPicAndSize(){
        this.node.width = this.xNum * this.picWidth;    
        this.node.height = this.yNum * this.picWidth;
        this.node.x = - parseInt(this.xNum * this.picWidth / 2);
        this.node.y = - parseInt(this.yNum * this.picWidth / 2) + 50 ;

        if(this.xNum == 5 && this.yNum == 5){
            this.node.getComponent('cc.Sprite').spriteFrame = this.chessSpriteArr[0];
            this.chessBGNode.getComponent('cc.Sprite').spriteFrame = this.chessBorderBgArr[0];
            this.chessBGNode.width = 562;
            this.chessBGNode.height = 562;
        }else if(this.xNum == 6 && this.yNum == 5){
            this.node.getComponent('cc.Sprite').spriteFrame = this.chessSpriteArr[1];
            this.chessBGNode.getComponent('cc.Sprite').spriteFrame = this.chessBorderBgArr[1];
            this.chessBGNode.width = 662;
            this.chessBGNode.height = 562;
        }else if(this.xNum == 7 && this.yNum == 4){
            this.node.getComponent('cc.Sprite').spriteFrame = this.chessSpriteArr[2];
            this.chessBGNode.getComponent('cc.Sprite').spriteFrame = this.chessBorderBgArr[2];
            this.chessBGNode.width = 622;
            this.chessBGNode.height = 382;
        }else if(this.xNum == 7 && this.yNum == 5) {
            this.node.getComponent('cc.Sprite').spriteFrame = this.chessSpriteArr[3];
            this.chessBGNode.getComponent('cc.Sprite').spriteFrame = this.chessBorderBgArr[3];
            this.chessBGNode.width = 622;
            this.chessBGNode.height = 462;
        }
    },

    downloadProgress(completedCount ,totalCount ,item ){
        if( completedCount == parseInt(totalCount/3)){
            this.progressBar.progress = 0.33;
            this.progressLabel.string = '33%';
        }
        if(completedCount == parseInt(totalCount*2/3)){
            this.progressBar.progress = 0.66;
            this.progressLabel.string = '66%';
        }
        if(completedCount == totalCount){
            this.progressBar.progress = 1;
            this.progressLabel.string = '100%';
        }
    },

    completeProgress (error, results) {
        let tmpArr = [] ;

        for(let item in results.map){                
            let spriteFrame = new cc.SpriteFrame(results.map[item].content);
            tmpArr.push(spriteFrame);
        }

        this.node.getComponent('chessControl').TextureSource = tmpArr ; //把资源记录下来，方便释放

        let clip = cc.AnimationClip.createWithSpriteFrames(tmpArr, this.playSpeed);

        //至此资源下载完毕
        this.generatePicPiece(clip);
        this.generateStaticPic(clip);

        this.progressNode.active = false;

        //1.5秒后碎片拆分
        setTimeout(()=>{
            let bigPieceArr = this.node.children.filter((node)=>{ 
                return node.name == 'Bigpiece';
            })

            bigPieceArr.forEach((pieceNode)=>{
                pieceNode.getComponent('bigPieceControl').showShadow();
                pieceNode.x = (Math.random()*400);
                pieceNode.y = (-1)^parseInt(Math.random()*2+1)*(Math.random()*150);
            });

            common.canTouch = true;
        },1500);
    },


    generateStaticPic(clip){
        this.staticPoint.forEach((item,key)=>{
            let littlePieceNode = cc.instantiate(this.staticModulePrefab);

            this.adjustLittleInfo(littlePieceNode,item,clip,true);
            this.setStaticPieceNodePositon(item,littlePieceNode);
            littlePieceNode.parent = this.node ;
        });
    },

    //picPiece : [[12,17,16,18,22],[13,14,19,23,24],[11,10,15,20,21],[0,5,6],[1,2,3,7],[4,8,9]] 注意：下标从0开始
    generatePicPiece(clip){
        this.picPieceQuestion.forEach((item,key)=>{
            //生成大块
            let pieceNode = this.getBigPieceNode(item);

            let originIndex;
            item.forEach((value,index)=>{
                //生成小块
                let littlePieceNode = cc.instantiate(this.modulePrefab1);

                this.adjustShadowSize(littlePieceNode);
  
                //设置小块的基本信息
                this.adjustLittleInfo(littlePieceNode.getChildByName('module'),value,clip);

                if(index == 0){
                    //第一个小块的位置相对大块设为(0,0)
                    littlePieceNode.x = 0 ;
                    littlePieceNode.y = 0 ;
                    originIndex = value ;
                }else{
                    //设置小块的位置信息
                    this.setLittlePieceNodePosition(originIndex,value,littlePieceNode);
                }

                littlePieceNode.parent = pieceNode ;
            });

            pieceNode.getComponent('bigPieceControl').hideShadow();
        });
    },

    adjustShadowSize(littlePieceNode){
        littlePieceNode.width = this.picWidth;
        littlePieceNode.height = this.picWidth;
        littlePieceNode.anchorX = 0;
        littlePieceNode.anchorY = 0;

        littlePieceNode.getChildByName('shadow_right').height = this.picWidth;
        littlePieceNode.getChildByName('shadow_right').x = this.picWidth;
        littlePieceNode.getChildByName('shadow_down').width = this.picWidth + 4;
        littlePieceNode.getChildByName('shadow_down').y = -4;
    },

    getBigPieceNode(item){
        let pieceNode = new cc.Node('Bigpiece');
        pieceNode.anchorX = 0;
        pieceNode.anchorY = 0;

        //大块挂上脚本
        let bigPieceScript = pieceNode.addComponent('bigPieceControl');
        bigPieceScript.chessNode = this.node;

        //大块成为棋盘的子节点
        pieceNode.parent = this.node;

        //将大块的位置设置为第一个小块应该在的正确的位置
        this.setBigPieceNodePositon(item[0],pieceNode);  

        return pieceNode;
    },

    setBigPieceNodePositon(index,pieceNode){
        //确定x坐标
        pieceNode.x = (index % this.xNum) * this.picWidth ;

        //确定y坐标
        pieceNode.y = Math.floor(index / this.xNum) * this.picWidth ;
    },

    setStaticPieceNodePositon(index,pieceNode){
        //确定x坐标
        pieceNode.x = (index % this.xNum) * this.picWidth ;

        //确定y坐标
        pieceNode.y = parseInt(index / this.xNum) * this.picWidth ;
    },

    //设置小块的信息  参数分别为:littlePieceNode小块本身 value当前小节点位于棋盘的索引 clip动画资源
    adjustLittleInfo(littlePieceNode,value,clip,ifStatic){
        littlePieceNode.width = this.picWidth;
        littlePieceNode.height = this.picWidth;
        littlePieceNode.anchorX = 0;
        littlePieceNode.anchorY = 0;
        
        //小块里的动画节点
        let animNode = littlePieceNode.getChildByName('anim');
        animNode.width = this.xNum*this.picWidth ;
        animNode.height = this.yNum*this.picWidth ;
        //动画资源
        let animation = animNode.getComponent('cc.Animation');
        animation.addClip(clip,'animationClip');
        let animationState = animation.play('animationClip');  
        animationState.wrapMode  = cc.WrapMode.Loop;
        animationState.repeatCount = Infinity;
        //设置小块的动画节点的位置，让遮罩遮掉其他部分
        this.setAnimNodePosition(value,animNode);

        //脚本控制
        let littlePieceScript ;
        if(ifStatic){
            littlePieceScript = littlePieceNode.getComponent('staticPieceControl');
        }else{
            littlePieceScript = littlePieceNode.parent.getComponent('littlePieceControl');
        }
        littlePieceScript.trueIndex = value; //正确答案下标
    },

    setLittlePieceNodePosition(originIndex,curIndex,littlePieceNode){
        let originIndex_x = originIndex % this.xNum ;
        let curIndex_x = curIndex % this.xNum ;
        littlePieceNode.x = this.picWidth*(curIndex_x - originIndex_x);

        let originIndex_y = Math.floor(originIndex / this.xNum);
        let curIndex_y = Math.floor(curIndex / this.xNum);
        littlePieceNode.y = this.picWidth*(curIndex_y - originIndex_y);
    },

    setAnimNodePosition(index,animNode){
        animNode.x =  -this.picWidth*(index % this.xNum);
        animNode.y =  -this.picWidth*Math.floor(index / this.xNum);
    },

    start () {

    },

    update (dt) {

    },
});
