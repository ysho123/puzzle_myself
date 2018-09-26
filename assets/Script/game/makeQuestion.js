
    let xNum ;
    let yNum ;

    //每一个格子 表示为(0,0)坐标系
    class gridObj{
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.index = x + y*xNum ;
            this.available = true ;
        }
    }

    function getQuestion(xNum , yNum){
        xNum = xNum;
        yNum = yNum;

        //1、得到一个棋盘
        let chessArr = [];
        for(let i=0;i<xNum;i++){
            for(let j=0;j<yNum;j++){
                let grid = new gridObj(j,i);
                chessArr.push(grid);
            }
        }

        let countFlag = true ;

        let pieceArr = [];//碎块数组

        while(true){
            let ifAllFull = checkOver(chessArr);
            if(ifAllFull){
                //都被占满了以后，开始检测小碎块的数量，达标再出循环
                let canAnswerUsed = checkStaticPointNum(pieceArr);
                if(canAnswerUsed){
                    //如果结果达标，跳出循环
                    break;
                }else{
                    //如果结果不达标，清理两个起始条件，重头再来
                    chessArr.forEach((gridObj)=>{
                        gridObj.available = true;
                    });
                    pieceArr = [];
                }
            }else{
                let oneRouter = getOneRouter(chessArr);
                if(oneRouter.length > 0){
                    pieceArr.push(oneRouter);
                }
            }
        }

        //拿到的结果处理格式
        console.log('chessArr',chessArr);
        console.log('pieceArr',pieceArr);
        
        return {
            chessArr,
            pieceArr
        }

    }

    function checkStaticPointNum(pieceArr){
        let filterArr = pieceArr.filter((arr)=>{
            return arr.length <= 2 ;
        });

        return filterArr.length <= 3
    }

    function checkOver(chessArr){
        let allGridFull = chessArr.every((gridObj)=>{
            return !gridObj.available ;
        });

        return allGridFull;
    }

    function getOneRouter(chessArr){
        //1、随便得到一个没用过的点
        let startPoint = getARandomPoint(chessArr);

        //2、从这个点随便开始往外找路  路径可以是3 也可以是4 还可以是固定的5 还可以是无路可走的1和2
        let way = findAway(startPoint,chessArr);

        //3、把路径标出来
        return way;
    }

    function getARandomPoint(chessArr){
        while(true){
            let point = parseInt(Math.random()*(xNum*yNum));
        
            if(chessArr[point].available){
                return chessArr[point];
            }
        }
    }

    function findAway(startPoint,chessArr){ 
        let way = [];

        chessArr[startPoint.index].available = false;
        way.push(startPoint);

        let choice = parseInt(Math.random()*10 + 1);//路径长度可以是3 也可以是4 还可以是固定的5 还可以是无路可走的1和2

        if(choice<=2){
            //1和2 生成固定的5  也有两种形态
            let result = canMakeAFiveGrids(startPoint,chessArr);

            if(result){
                result.forEach((gridObj)=>{
                    chessArr[gridObj.index].available = false;
                    way.push(gridObj);
                });
                console.log('wwwwwwwwwwwwwwwwwwwwww',result);
            }else{
                console.log('qqqqqqqqqqqqqqq');
            }
        }else if(choice<=5){
            //345 生成长度为3的小块
            getRouterFromOnePoint(way,chessArr,startPoint,3);

        }else if(choice<=10){
            //678910 生成长度为4的
            getRouterFromOnePoint(way,chessArr,startPoint,4);
        }

        return way;
    }

    function canMakeAFiveGrids(startPoint,chessArr){
        let randomNum = parseInt(Math.random()*10);

        if( randomNum<5 ){
            //模式1
            if(startPoint.x > xNum-3 || startPoint.y > yNum-2 || startPoint.y < 1){
                return false;
            }

            let point2 = chessArr[startPoint.index + 1] ;
            let point3 = chessArr[startPoint.index + 2] ;
            let point4 = chessArr[startPoint.index + xNum + 1]  ;
            let point5 = chessArr[startPoint.index - xNum + 1] ;

            if(!point2.available || !point3.available || !point4.available || !point5.available){
                return false;
            }else{
                let pointArr = [point2,point3,point4,point5];
                return pointArr;
            }
        }else if( randomNum<10 ){
            //模式2
            if(startPoint.x > xNum-3 || startPoint.y < 1){
                return false;
            }

            let point2 = chessArr[startPoint.index - xNum] ;
            let point3 = chessArr[startPoint.index - xNum + 1]  ;
            let point4 = chessArr[startPoint.index - xNum + 2]  ;
            let point5 = chessArr[startPoint.index + 2] ;

            if(!point2.available || !point3.available || !point4.available || !point5.available){
                return false;
            }else{
                let pointArr = [point2,point3,point4,point5];
                return pointArr;
            }
        }
    }

    function getRouterFromOnePoint(wayArr,chessArr,startPoint,length){
        if(wayArr.length == length){
            //长度够了 返回数组
            return wayArr;
        }

        let amITrapped = judgeIfTrapped(startPoint,chessArr);

        if(amITrapped){
            //无路可走了 返回数组 
            return wayArr;
        }

        let nextPoint = null;
        //开始找下一个点
        while(true){
            let direction = parseInt(Math.random()*4+1) ;//1 向右 2 向上  3向左  4向右

            if(direction==1){
                if(startPoint.x + 1 >= xNum){
                    continue;
                }

                let rightPoint = chessArr[startPoint.index+1];
                if(rightPoint.available){
                    nextPoint = rightPoint;
                    break;
                }else{
                    continue;
                }
            }else if(direction==2){
                if(startPoint.y + 1 >= yNum){
                    continue;
                }

                let topPoint = chessArr[startPoint.index+xNum];
                if(topPoint.available){
                    nextPoint = topPoint;
                    break;
                }else{
                    continue;
                }
            }else if(direction==3){
                if(startPoint.x - 1  < 0){
                    continue;
                }

                let leftPoint = chessArr[startPoint.index-1];
                if(leftPoint.available){
                    nextPoint = leftPoint;
                    break;
                }else{
                    continue;
                }
            }else if(direction==4){
                if(startPoint.y - 1  < 0){
                    continue;
                }

                let downPoint = chessArr[startPoint.index-xNum];
                if(downPoint.available){
                    nextPoint = downPoint;
                    break;
                }else{
                    continue;
                }
            }
        }

        chessArr[nextPoint.index].available = false;
        wayArr.push(nextPoint);

        getRouterFromOnePoint(wayArr,chessArr,nextPoint,length);
    }

    function judgeIfTrapped(startPoint,chessArr){
        let rightBlocked = (startPoint.x >= xNum-1 || !chessArr[startPoint.index+1].available);
        let topBlocked = (startPoint.y >= yNum-1 || !chessArr[startPoint.index+xNum].available);
        let leftBlocked = (startPoint.x <= 0 || !chessArr[startPoint.index-1].available);
        let downBlocked = (startPoint.y <= 0 || !chessArr[startPoint.index-xNum].available);

        //判断是否无路可走了
        return (rightBlocked && topBlocked && leftBlocked && downBlocked);
    }

module.exports = {
    getQuestion,
}
