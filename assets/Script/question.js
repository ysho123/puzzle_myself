let localStorageSys = require('localStorageSys');

let question = [
	[
		{picUrl : 'https://game-1256868251.cos.ap-guangzhou.myqcloud.com/puzzleGame/picSource/0/1_1/',frames : 52 , framesSpeed : 9},
		{picUrl : 'https://',frames : 22 , framesSpeed : 9},
		{picUrl : 'https://',frames : 44 , framesSpeed : 9},
		{picUrl : 'https://',frames : 11 , framesSpeed : 9},
	],
	[	{picUrl : 'https://',frames : 33 , framesSpeed : 9},
		{picUrl : 'https://',frames : 22 , framesSpeed : 9},
		{picUrl : 'https://',frames : 44 , framesSpeed : 9},
		{picUrl : 'https://',frames : 11 , framesSpeed : 9},
	],
];

function getDetailRankSourceByTypeid(typeid){
	let allUserRankInfo = localStorageSys.getRankInfo();
	let curUserRankInfo = allUserRankInfo[typeid];
	let curUserLevel = curUserRankInfo.curLevel; //当前完成的关卡数
	let allLevel = curUserRankInfo.allLevel; //包含的所有关卡数

	let curSource ;
	console.log('curUserLevel',curUserLevel)
	console.log('allLevel',allLevel)
	console.log('curUserLevel',curUserLevel)
	console.log('curUserLevel',curUserLevel)

	if(curUserLevel<allLevel){
		curSource = question[typeid][curUserLevel-1];//-1因为上方question的数组下标从0开始
	}else{
		let num = parseInt(Math.random()*allLevel)
		curSource = question[typeid][num];
	}

	return curSource;
}

let rankList = [{
	typeid : 0,
	name : '城市',
	unLockCost : 100,
	totalNum : 5,
},
{
	typeid : 1,
	name : '动漫',
	unLockCost : 11,	
	totalNum : 5,
},
{
	typeid : 2,
	name : '狗哥',
	unLockCost : 22,	
	totalNum : 5,
},
{
	typeid : 3,
	name : '大狗哥',
	unLockCost : 33,	
	totalNum : 5,
},
{
	typeid : 4,
	name : '大大狗哥',
	unLockCost : 22,	
	totalNum : 5,
},
{
	typeid : 5,
	name : '狗狗狗',
	unLockCost : 33,	
	totalNum : 5,
},
{
	typeid : 6,
	name : '小狗狗',
	unLockCost : 66,	
	totalNum : 5,
}]


module.exports = {
    question,
    rankList,
    getDetailRankSourceByTypeid
}
