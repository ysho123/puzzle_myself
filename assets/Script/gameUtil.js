/**
    游戏界面 工具类
*/
let util = require('util');
let common = require('common');

let GameDetailInfo = null ;

const noop = function(){};

const getQuestionInfo = function(){
    let promise = new Promise((resolve,reject)=>{
        if(GameDetailInfo){
            //如果游戏信息列表存在，直接返回
            return resolve(GameDetailInfo);
        }else{
            util.pullRequest('getGameDetailInfo',{},(res)=>{
                if(res.code == 1){
                    GameDetailInfo = res.data;
                    return resolve(GameDetailInfo);
                }
            },(err)=>{
                reject(err);
            })
        }
    });

    return promise;
}

const getDropAction = function (finished = noop) {
    let callFunc = cc.callFunc(function(){
        finished && finished()
    })

    let action = cc.moveTo(1,0,-417);
    action.easing(cc.easeBounceOut());

    return cc.sequence(
        action,
        callFunc  
    )
}

module.exports = {
    getQuestionInfo,
    getDropAction,
}