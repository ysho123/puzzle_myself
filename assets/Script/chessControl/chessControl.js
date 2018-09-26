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
        TextureSource :{
            default : [],
            type : [cc.SpriteFrame]
        }

    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.node.on('touchend',this.touchEndAction,this);
        this.node.on('touchstart',this.touchStartAction,this);
    },

    start () {

    },

    gameReady(source){
        let defaultInfo = {
            xNum : 5 ,
            yNum : 5 ,
            picWidth : 100 ,
            picPieceQuestion :  [[12,17,16,18],[13,14,19,23],[11,10,15,20],[0,5],[1,2,3,7],[4,8,9]], //题目 ： 下标从0开始
            staticPoint : [22,24,21,6], //固定的提示
        }

        let levelInfo = source || defaultInfo ;
        // source || ;

        this.xNum = levelInfo.xNum;
        this.yNum = levelInfo.yNum;
        this.picWidth = levelInfo.picWidth;
        this.picPieceQuestion = levelInfo.picPieceQuestion;
        this.staticPoint = levelInfo.staticPoint;
        this.maxWidth = levelInfo.xNum * levelInfo.picWidth;
        this.maxLength = levelInfo.yNum * levelInfo.picWidth;

        this.initChess();
    },

    initChess(){
        //初始化棋盘属性数组
        this.chessIndexArr = [];
        for(let i=0;i<this.xNum*this.yNum;i++){ //注意 ： 这个25要变的
            let obj = {
                realAnsIndex : i , //正确答案下标
                access : this.staticPoint.includes(i.toString()) ? false : true,  //是否可用
                curIndex : this.staticPoint.includes(i.toString()) ? i : NaN ,    //当前里面的东西的下标
                curNode : null
            }
            this.chessIndexArr.push(obj);
        }
    },

    releaseLoaderCache(){
        if(this.TextureSource && this.TextureSource.length > 0 ){
            this.TextureSource.forEach( texture =>{
                cc.loader.release(texture);
            });
        }
    },

    touchStartAction(event){
        event.stopPropagation();

        if(!common.canTouch) return; //防止游戏结束后还能拖动

        let touchTarget = event.target;
        if( touchTarget.name != 'module' ) return; //如果触点不发生在大块内，就取消

        let bigPiece = touchTarget.parent.parent;
        //如果触点发生在大块内，但是大块不在棋盘内部，也取消
        if( !this.judgeIfInTheChess(bigPiece.getPosition()) ) return;

        //大块的子节点们如果不在棋盘内，也放弃 
        if( !this.ifAllInChess(bigPiece) ) return;

        //如果大块没有在准确的格子里 放弃
        if ( !this.ifPlacedInChess(bigPiece) ) return;

        //找到当前块位于棋盘的哪个位置
        let curChessIndexArr = this.getIndexInChess(bigPiece);

        //如果又正好放到了整点上 获取棋盘的这些位置里是否有被占用(除了自己之外)
        let ifCurGridBeOccuied = curChessIndexArr.some((value)=>{
            return this.chessIndexArr[value.indexToChess].curIndex != value.realIndex &&
               !this.staticPoint.includes(value.indexToChess) ;
        })

        //如果有点被占用了 直接返回 
        if( ifCurGridBeOccuied ) return;

        //干掉棋盘的归属数据
        curChessIndexArr.forEach( (value)=>{
            this.chessIndexArr[value.indexToChess].access = true ;
            this.chessIndexArr[value.indexToChess].curIndex = NaN;
            this.chessIndexArr[value.indexToChess].curNode = null;
        })

        bigPiece.getComponent('bigPieceControl').showShadow()
    },

    touchEndAction(event){
        event.stopPropagation();

        if(!common.canTouch) return; //防止游戏结束后还能拖动

        let touchTarget = event.target;

        if( touchTarget.name != 'module' ) return; //如果触点不发生在大块内，就取消

        let bigPiece = event.target.parent.parent;

        //大块的锚点不在棋盘范围内的全部放弃
        if( !this.judgeIfInTheChess(bigPiece.getPosition()) ) return;

        //大块的子节点们如果不在棋盘内，也放弃 
        if( !this.ifAllInChess(bigPiece) ) return;

        //获得当前点在棋盘里最接近的位置，并返回其子节点的占用位置组成一个数组 如果没有接近的点直接返回
        let curChessIndexArr = this.getIndexInChess(bigPiece);

        if( !curChessIndexArr ) return;

        let filter = curChessIndexArr.some((obj)=>{
            return obj.indexToChess > this.xNum * this.yNum - 1 || obj.indexToChess < 0
        });
        if(filter) return;

        //从棋盘里判断，是否当前移进来的大块 在棋盘中都能放的进 不存在被占用 如果有被占用的   返回
        if( !this.ifAccess(curChessIndexArr,this.chessIndexArr,this.staticPoint) ) return;

        //把大块放进棋盘
        this.placeBigPieceIn(bigPiece,curChessIndexArr,this.chessIndexArr);

        //检测是否游戏结束
        this.checkGameOver();
    },

    checkGameOver(){
        let result = this.chessIndexArr.every((item)=>{
            return item.access==false && item.curIndex == item.realAnsIndex ;
        });

        if(result){
            common.canTouch = false ;

            this.node.dispatchEvent(new cc.Event.EventCustom('gameOver', true));
        }
    },

    placeBigPieceIn(bigPiece,curArr,wholeArr){
        bigPiece.zIndex = 1;

        //修改掉棋盘数组的值
        curArr.forEach( (value)=>{
            wholeArr[value.indexToChess].access = false ;
            wholeArr[value.indexToChess].curIndex = value.realIndex;
            wholeArr[value.indexToChess].curNode = value.curNode;
        });

        //把大块吸到目标位置
        let BigIndex = curArr[0].indexToChess; //锚点的位置，就是第一个子节点的位置

        let x = (BigIndex%this.xNum) * this.picWidth ;
        let y = parseInt(BigIndex/this.xNum) * this.picWidth ;
 
        bigPiece.setPosition(cc.v2(x,y));
        bigPiece.getComponent('bigPieceControl').hideShadow();
    },

    ifAccess(curArr,wholeArr,staticArr){
        let access = curArr.every( (value,key)=>{
            return wholeArr[value.indexToChess].access && !staticArr.includes(value.indexToChess);//判断是否都可用并且不是静态节点 都可用返回true 否则返回false 
        });

        return access ;
    },

    ifAllInChess(bigPiece){
        let children = bigPiece.children;

        let bigPiecePosition = bigPiece.getPosition();

        let ifAllInChess = children.every( (node,key)=>{
            let littlePiecePosition = bigPiecePosition.add(node.getPosition());

            let resultItem = this.judgeIfInTheChess(littlePiecePosition) ;
            return resultItem;
        });

        return ifAllInChess ;
    },

    judgeIfInTheChess(positon){
        if( positon.x < 0 - 30) return false; //给一个-20的偏移范围作为误差
        if( positon.x >= this.maxWidth - this.picWidth + 30) return false;
        if( positon.y < 0 - 30) return false; //给一个-20的偏移范围作为误差
        if( positon.y >= this.maxLength - this.picWidth + 30) return false;

        return true;
    },

    ifPlacedInChess(bigPiece){
        let x = bigPiece.x;
        let y = bigPiece.y;

        if( x % this.picWidth != 0 || y % this.picWidth != 0 ) return false;

        return true ;
    },

    getIndexInChess(bigPiece){
        let x = bigPiece.x;
        let y = bigPiece.y;

        let x_index = Math.round(x/this.picWidth); //四舍五入 横坐标
        let y_index = Math.round(y/this.picWidth) //四舍五入 纵坐标

        let index = y_index * this.xNum + x_index ; //找到了他四舍五入应该去的那个点

        //如果落点距离离他大概要去的距离大于特定偏差值 ，直接返回false ，行为取消 否则，返回他及他的子节点占用的位置   暂定特定偏差值为20
        let nearPointPosition = cc.v2(x_index*this.picWidth, y_index*this.picWidth);
        let curPointPosition = bigPiece.getPosition();
        //API  Vec2.sub() 向量相减  mag() 返回向量的长度
        let ifInTheDistance = nearPointPosition.sub(curPointPosition).mag() < this.picWidth/2;

        if(ifInTheDistance){
            return this.countChildrenIndex(bigPiece,index);
        }else{
            return false ;
        }
    },

    countChildrenIndex(bigPiece,index){
        let childrenArr = [];

        let children = bigPiece.children ;

        children.forEach((child , key)=>{
            let x = child.x;
            let y = child.y;

            let x_index = x / this.picWidth ;
            let y_index = y / this.picWidth ;

            let childIndexToChess = y_index * this.xNum + x_index + index ; 

            let obj = {
                indexToChess : childIndexToChess,   //当前这个点放到棋盘里对应的下标
                realIndex : child.getComponent('littlePieceControl').trueIndex,  //他的正确下标
                curNode : child //当前节点 
            }

            childrenArr.push(obj);
        });

        return childrenArr;
    },

    resetBigPiecePosition(){
        this.node.children.forEach((node)=>{
            if(node.name == 'Bigpiece'){
                node.x = (Math.random()*400);
                node.y = (-1)^parseInt(Math.random()*2+1)*(Math.random()*150);

                node.getComponent('bigPieceControl').showShadow();

                this.initChess();
            }
        })
    },

    hint(callback){
        //1、找到棋盘下所有的大块节点
        let bigPieces = this.node.children.filter((node)=>{ 
            return node.name == 'Bigpiece';
        })

        //2、判断大块节点是否在棋盘内填正确了，如果填正确了，去下一个
        for(let i=0;i<bigPieces.length;i++){
            let ifCorrect = ifInRightPosition.call(this,bigPieces[i]);
            if(!ifCorrect){
                let myIndexArr = findOutMyPositon(bigPieces[i]);//找到自己要去的位置

                removeTheNative.call(this,myIndexArr);//把要去的位置的原住民拆迁(有原住民就拆，没有就算了)

                removeMySelf.call(this,bigPieces[i])//自己要拆迁出来 如果自己在别人的家园的话  没有就算了

                //搬进应该去的地方
                moveInNewHouse.call(this,bigPieces[i],myIndexArr);

                bigPieces[i].getComponent('bigPieceControl').hideShadow();

                this.checkGameOver();

                callback && callback();

                //一次搬一个就够了
                break;
            }
        }

        //大块是否在正确位置
        function ifInRightPosition(curBigPiece){
            let trueIndex = curBigPiece.children[0].getComponent('littlePieceControl').trueIndex ;//大块第一个子节点的下标对应的位置，就是其正确的位置
            let trueIndexConverToPosition_x = (trueIndex % this.xNum) * this.picWidth ;
            let trueIndexConverToPosition_y = parseInt(trueIndex /this.xNum) * this.picWidth ;

            let trueIndexConverToPosition = cc.v2(trueIndexConverToPosition_x,trueIndexConverToPosition_y);

            let curPosition = curBigPiece.getPosition();

            return trueIndexConverToPosition.equals(curPosition);
        }

        function findOutMyPositon(curPiece){
            let myPositionArr = curPiece.children.map((node)=>{
                return {
                    index : node.getComponent('littlePieceControl').trueIndex,
                    node : node
                };
            });

            return myPositionArr;
        }

        function removeTheNative(myIndexArr){
            for(let i=0;i<myIndexArr.length;i++){
                let curChessIndexArrItem = this.chessIndexArr[myIndexArr[i].index] ;

                if(!curChessIndexArrItem.access){//如果被占用
                    let nativeBigPiece = curChessIndexArrItem.curNode.parent ;//从身份证找到这个人，再找到他爹
                    nativeBigPiece.getComponent('bigPieceControl').init();//让他爹和他一起回老家(位置移动)

                    //根据儿子找到全家的信息
                    let indexArrInChess = getIndexInChessByChild.call(this,curChessIndexArrItem.curNode,curChessIndexArrItem.realAnsIndex);
                    //从户籍上干掉他们的信息
                    indexArrInChess.forEach((index)=>{
                        this.chessIndexArr[index].access = true ;
                        this.chessIndexArr[index].curIndex = NaN;
                        this.chessIndexArr[index].curNode = null;
                    });
                }
            }
        }

        function removeMySelf(bigPiece){
            //判断自己占没占用民宅
            if( bigPiece.x % this.picWidth != 0 || bigPiece.y % this.picWidth !=0){
                return;
            }   

            let index_x = bigPiece.x / this.picWidth ;
            let index_y = bigPiece.y / this.picWidth ;

            let index = index_x + index_y * this.yNum ;

            //如果确定占了民宅，就拆自己
            if(this.chessIndexArr[index] && !this.chessIndexArr[index].access){
                let indexArrInChess = getIndexInChessByChild.call(this,bigPiece.children[0],index);

                //从户籍上干掉他们的信息
                indexArrInChess.forEach((index)=>{
                    this.chessIndexArr[index].access = true ;
                    this.chessIndexArr[index].curIndex = NaN;
                    this.chessIndexArr[index].curNode = null;
                });
            }
        }

        function moveInNewHouse(bigPiece,realIndexArr){
            let x = (realIndexArr[0].index % this.xNum) * this.picWidth ;
            let y = parseInt(realIndexArr[0].index / this.xNum) * this.picWidth ;

            let newPosition = cc.v2(x,y);

            bigPiece.setPosition(newPosition);

            realIndexArr.forEach((obj)=>{
                this.chessIndexArr[obj.index].access = false ;
                this.chessIndexArr[obj.index].curIndex = obj.index;
                this.chessIndexArr[obj.index].curNode = obj.node;
            });
        }

        function getIndexInChessByChild( childNode , curChildIndex ){
            let returnArr = [];

            let allNodes = childNode.parent.children ;
            allNodes.forEach((child , key)=>{
                let x = child.x;
                let y = child.y;

                let x_index = (x-childNode.x) / this.picWidth ;
                let y_index = (y-childNode.y) / this.picWidth ;

                let childIndexToChess = y_index * this.xNum + x_index + curChildIndex ; 

                returnArr.push(childIndexToChess);
            });

            return returnArr;
        }
    },

    // update (dt) {},
});
