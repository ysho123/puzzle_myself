
let util = require('util');
let common = require('common');
let gameUtil = require('gameUtil');

let question = require('question');
let localStorageSys = require('localStorageSys');
let makeQuestion = require('makeQuestion');

cc.Class({
    extends: cc.Component,

    properties: {
        bgArr : {
            default : [],
            type : [cc.Node]
        },
        progressNode : {
            default : null,
            type : cc.Node
        },
        chessControlNode : {
            default : null,
            type : cc.Node
        },
        fragmentNumLabel : {
            default : null,
            type : cc.Label
        },
        buttonInteracable : {
            default : [],
            type : [cc.Button]
        },
        moneylackPopNode : {
            default : null,
            type : cc.Node
        },
        btnControl1 : {
            default : null,
            type : cc.Node
        },
        btnControl2 : {
            default : null,
            type : cc.Node
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
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        if(common.musicOn){
            this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOn;
        }else{
            this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOff;
        }
        util.fiexScreenSize(null,this.bgArr);

        this.typeid = common.typeid; //从上一个页面传过来的

        let userCoinNum = localStorageSys.getCoinNum();
        this.fragmentNumLabel.string = userCoinNum;

        this.chessControlScript = this.chessControlNode.getComponent('chessControl'); //棋盘控制器
        this.AnimClipFactory = this.chessControlNode.getComponent('AnimClipFactory'); //资源加载器
        this.moneylackPopNode.getComponent('moneyLackPop').gameScript = this;//控制器传递

        this.startGame(this.typeid);

        this.node.on('gameOver',this.gameOver,this)
    },

    startGame(typeid){
        this.progressNode.active = true; //把进度条弄出来先

        //两组按钮
        this.btnControl1.active = true;
        this.btnControl2.active = false ;
        this.btnControl2.setPosition(cc.v2(0,600)); 

        let picSource = question.getDetailRankSourceByTypeid(this.typeid);
        console.log(picSource);

        let rankInfo = this.generateQuestionData(picSource);
        console.log(rankInfo)
       

        // this.AnimClipFactory.loadSource(rankInfo);
        // this.chessControlScript.gameReady(rankInfo);

        common.canTouch = true;
    },

    generateQuestionData(picSource){
        let num = parseInt(Math.random()*4);

        let xNum;
        let yNum;

        switch(num){
            case 0 : 
                xNum = 5 ;
                yNum = 5 ;
                break;
            case 1 :
                xNum = 5 ;
                yNum = 6 ;
                break;
            case 2 :
                xNum = 7 ;
                yNum = 6 ;
                break;
            case 3 : 
                xNum = 7 ;
                yNum = 7 ;
                break;
        }

        return makeQuestion.getQuestion(xNum,yNum);
    },

    start () {

    },

    backToRank(){
        cc.director.loadScene("Rank");
    },

    hint(){
        if( common.userInfo.score >= 50){
            this.chessControlScript.hint((res)=>{
                util.pullRequest('minusMoneyForHint',{openid : this.openid,uid : this.uid },(res)=>{
                    if(res.code == 1){
                        common.userInfo.score = res.data.score ;
                        this.fragmentNumLabel.string = res.data.score;
                    }   
                })
            });
        }else{
             this.moneylackPopNode.active = true ;
        }
    },

    watchVedio(){

    },

    share(){

    },

    closeLackMoneyPop(){
        this.moneylackPopNode.getChildByName('fragment_not_content').runAction(util.zoomOutAction(()=>{
            this.moneylackPopNode.active = false ;
        }));
    },

    resetGame(){
        this.btnControl1.active = true;
        this.btnControl2.active = false ;

        this.btnControl2.setPosition(cc.v2(0,600));

        this.chessControlScript.resetBigPiecePosition();
    },

    gameOver(event){
        event.stopPropagation();

        wx.showToast({
            title : '请求中',
            icon : 'loading',
            mask : true
        })

        this.lockOnly(); 
    },

    lockOnly(){
        util.pullRequest('unlockOnly',{openid : this.openid,typeid : this.typeid},(res)=>{
            if(res.code == 1){
                wx.hideToast();

                this.finished = res.data.finish ;

                this.btnControl1.active = false;
                this.btnControl2.active = true ;

                this.btnControl2.runAction(gameUtil.getDropAction());
            }
        },(err)=>{
            this.lockOnly();
        });
    },

    over_resetGame(){
        this.btnControl1.active = true;
        this.btnControl2.active = false;

        common.canTouch = true;

        this.btnControl2.setPosition(cc.v2(0,600));

        this.chessControlScript.resetBigPiecePosition();
    },

    nextLevel(){
        if(this.finished){
            cc.director.loadScene('Rank');
        }else{
            this.chessControlNode.children.forEach((node)=>{
                node.destroy();//销毁所有当前节点，并释放资源
            });

            this.chessControlScript.releaseLoaderCache();

            this.startGame(this.typeid);
        }
    },

    backHome(){
        cc.director.loadScene("Index");
    },

    //按钮都不能点了
    buttonUnClickable(){
        this.buttonInteracable.forEach((button)=>{
            button.intercable = false ;
        });
    },

    //按钮激活
    buttonClickable(){
        this.buttonInteracable.forEach((button)=>{
            button.intercable = true ;
        });
    },

    // update (dt) {},
});
