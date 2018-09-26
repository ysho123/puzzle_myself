let util = require('util');
let common = require('common');

let localStorageSys = require('localStorageSys');
let questionStorage = require('question');

cc.Class({
    extends: cc.Component,

    properties: {
        bgNodeArr : {
            default : [],
            type : [cc.Node]
        },
        fragmentNum:{
            default : null,
            type : cc.Label
        },
        coinNum : {
            set(value){
                this._coinNum = value;
                this.fragmentNum.string = value;
            },
            get(){
                return this._coinNum;
            }
        },
        pageView: cc.PageView,
        pageFab : cc.Prefab,
        rankFab : cc.Prefab,
        fragmentEnoughNode :{
            default : null,
            type : cc.Node
        },
        fragmentNotEnoughNode:{
            default : null,
            type : cc.Node
        },
        totalFragment:{
            default : null,
            type : cc.Label
        },
        currentFragment:{
            default : null,
            type : cc.Label
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
        contentNode :{
            default : null,
            type : cc.Node
        },


        titleSpriteFrames : {
            default : [],
            type : [cc.SpriteFrame]
        },
        userRankInfo : {
            set(value){
                this._userRankInfo = value;
                let allRankList = questionStorage.rankList;
                let dataForShow = [];

                allRankList.forEach((rank,key)=>{
                    if( rank.typeid == value[key].typeid){
                        let data = Object.assign({}, rank, value[key]);//将A、B对象的属性合并到新对象
                        data.spriteFrame = this.titleSpriteFrames[key]
                        dataForShow.push(data);
                    }
                });

                this.generateRankList(dataForShow);
            },
            get(){
                return this._userRankInfo;
            }
        }
    },

    onLoad () {
        this.fixScreen();

        //加载主题列表
        this.loadRankList();

        //设定音乐
        // this.setMusic();

        //加载用户金币
        this.loadUserCoin();

        //控制传递
        this.controlDeliver();

        // 监听子集点击事件
        this.registerListener();

        //判断用户来源，用于计量 暂不介入
        // util.judgetWhereFrom(this.openid);
    },

    registerListener(){
        this.node.on('startGame', this.startGameListener,this);
        this.node.on('enoughModal', this.enoughModalListener,this);
        this.node.on('unlock_yes',this.unlockRank,this);
        this.node.on('notEnoughModal', this.notEngoughCoin,this);
    },

    notEngoughCoin(){
        event.stopPropagation();
        this.showNotEnoughModal();
    },

    controlDeliver(){
        this.fragmentEnoughNode.getComponent('enoughLock').indexScript = this;
        this.fragmentNotEnoughNode.getComponent('notEnoughLock').indexScript = this;
    },

    startGameListener(event){
        event.stopPropagation();
        common.typeid = event.target.getComponent('rankItem').typeid;
        cc.director.loadScene('Game'); 
    },

    enoughModalListener(event){
        event.stopPropagation();

        let typeid = event.detail.typeid;
        let needCoin = event.detail.needCoinNum;
        let curMoney = localStorageSys.getCoinNum();
        let curClickRankItem = event.target;

        this.enoughScript = this.fragmentEnoughNode.getComponent('enoughLock');
        this.enoughScript.unlockInfo = {
            typeid,
            needCoin,
            curMoney,
            curClickRankItem
        }

        this.fragmentEnoughNode.active = true;  
        this.fragmentEnoughNode.getChildByName('fragment_content').runAction(util.zoomInAction());
    },

    fixScreen(){
        util.fiexScreenSize(this.canvas,this.bgNodeArr);
        common.sysInfo.ScreenHeight = this.bgNodeArr[0].height;
        common.sysInfo.ScreenWidth = this.bgNodeArr[0].width;
    },

    loadUserCoin(){
        this.coinNum = localStorageSys.getCoinNum();
    },

    loadRankList(){
        this.userRankInfo = localStorageSys.getRankInfo();
    },

    generateRankList(rankInfoForShow){
        let imgLength = rankInfoForShow.length; //主题总数
        let maxImageNum = 6;//一个页面显示的主题数量
        let pageNum = Math.ceil(imgLength / maxImageNum); //页数

        this.setRankInfo(rankInfoForShow,pageNum,maxImageNum)
    },

    // 设置主题列表
    setRankInfo(rankInfoForShow,pageLength,maxImageNum){
        console.log(rankInfoForShow,pageLength,maxImageNum);
        for(let i=0; i < pageLength ; i++){   
            let newPage = cc.instantiate(this.pageFab);

            let upLimitNum = (rankInfoForShow.length >= (i+1)*maxImageNum) ? 
                maxImageNum : rankInfoForShow.length % maxImageNum ;
                    
            for(let j=0;j<upLimitNum;j++){
                let newRank = cc.instantiate(this.rankFab);//关卡
                let rankScript = newRank.getComponent('rankItem');
                
                rankScript.itemInfo = rankInfoForShow[i*maxImageNum+j];

                newPage.addChild(newRank);
            }
            this.pageView.addPage(newPage);       
        }
    },

    setMusic(){
        if(common.musicOn){
            this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOn;
        }else{
            this.musicNode.getComponent('cc.Sprite').spriteFrame = this.musicOff;
        }
    },

    unlockRank(event){
        event.stopPropagation();

        let typeid = event.detail.typeid;
        let costMonet = event.detail.needCoinNum;
        let curClickRankItemNode = event.detail.curNode;
        let curRankItemScript = curClickRankItemNode.getComponent('rankItem');

        wx.showToast({
            title : '解锁成功',
            icon : 'success',
            duration : 1000,
            success : ()=>{
                //1、解锁界面
                curRankItemScript.isLock = 0 ;
                //2、扣钱
                console.log('this.coinNum',this.coinNum);
                console.log('costMonet',costMonet);
                this.coinNum -= costMonet ;
                //3、修改本地记录
                localStorageSys.unlockRank(typeid);
                localStorageSys.minusCoin(costMonet);
                //4、关弹窗
                this.closeEnoughModal();    
            }
        })
    },

    closeEnoughModal(){
        this.fragmentEnoughNode.getChildByName('fragment_content').runAction(util.zoomOutAction(()=>{
            this.fragmentEnoughNode.active = false;
        }));
    },

    // 碎片不足显示的弹框
    showNotEnoughModal(){
        this.fragmentNotEnoughNode.active = true;
        this.fragmentNotEnoughNode.getChildByName('fragment_not_content').runAction(util.zoomInAction());
    },

    // 返回首页
    returnIndex(){
        cc.director.loadScene('Index');
    },

    start() {
    },

    stopButtons(){
        // 返回和音乐按钮控制
        this.node.getChildByName('topNode').children.forEach((item)=>{
            item.getComponent(cc.Button).interactable = false;
        });
        this.pageView.onDisable(); //page不可滑动

        this.contentNode.children.forEach((page)=>{
            page.children.forEach((itemNode)=>{
                itemNode.getComponent('cc.Button').interactable = false;
            })
        })
    },

    activeButtons(){
        this.node.getChildByName('topNode').children.forEach((item)=>{
            item.getComponent(cc.Button).interactable = true;
        });
        this.pageView.onEnable();//page可滑动

        this.contentNode.children.forEach((page)=>{
            page.children.forEach((itemNode)=>{
                itemNode.getComponent('cc.Button').interactable = true;
            })
        })
    }

});
