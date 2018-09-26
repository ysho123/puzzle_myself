function getCoinNum(){
	return getLocalInfo('coin');
}	

function setCoinNum(value){
	setLocalInfo('coin',value)
}

function minusCoin(value){
	let money = getCoinNum();
	setCoinNum(money-value);
}

function addCoin(value){
	let money = getCoinNum();
	setCoinNum(money+value);
}

function getRankInfo(){
	return getLocalInfo('rankInfo');
}

function setRankInfo(value){
	setLocalInfo('rankInfo',value)
}

function unlockRank(typeid){
	let curRankData = getRankInfo();

	curRankData[typeid].isLock = 0;

	setRankInfo(curRankData);
}

function loadUserInfo(){
	let hasInfo = getLocalInfo('firstPlay'); //是否有记录
	console.log('hasInfohasInfo',hasInfo);

	if(hasInfo){
		console.log('有缓存，从缓存里拿');
	}else{
		init();
		setLocalInfo('firstPlay',true);
	}
}

//初始化信息
function init(){
	let coinNum = 100 ;
	let rankInfo = [
		{
			typeid : 0,
			isLock : 0,
			curLevel : 1,
			allLevel : 5,
		},
		{
			typeid : 1,
			isLock : 1,
			curLevel : 2,
			allLevel : 5,
		},
		{
			typeid : 2,
			isLock : 0,
			curLevel : 3,
			allLevel : 5,
		},
		{
			typeid : 3,
			isLock : 1,
			curLevel : 4,
			allLevel : 5,
		},
		{
			typeid : 4,
			isLock : 0,
			curLevel : 5,
			allLevel : 5,
		},
		{
			typeid : 5,
			isLock : 1,
			curLevel : 1,
			allLevel : 5,
		},
		{
			typeid : 6,
			isLock : 0,
			curLevel : 1,
			allLevel : 5,
		}
	]

	setCoinNum(coinNum);
	setRankInfo(rankInfo);
}



function getLocalInfo(key,defaultValue){
	let data = wx.getStorageSync(key);

	// if(data){
		return data;
	// }else{
	// 	if(defaultValue){
	// 		return defaultValue;
	// 	}
	// }
}

function setLocalInfo(key, value){
	wx.setStorageSync(key,value);
}

module.exports = {
	getCoinNum,
	setCoinNum,
	minusCoin,
	addCoin,
	getRankInfo,
	setRankInfo,
	unlockRank,
	loadUserInfo,
}