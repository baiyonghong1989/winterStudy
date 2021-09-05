function getKmpNext(pattern){
  let next =new Array(pattern.length).fill(0);
  let j = 0;
  let i =1;
  while(i<pattern.length){
      if (pattern[i] === pattern[j]){
          i++;
          j++;
          next[i] =j;
      } else if(j>0){
          j = next[j]
      } else {
          i++
      }

  }
  return next;
}
function getStateFunList(pattern,kmpNext){
  let stateFunList = [];
  for(let i=0;i<pattern.length;i++){
    stateFunList[i] = (input)=>{
      if(input === pattern[i]){
        return stateFunList[i+1];
      } else if(i!==0){
        return stateFunList[kmpNext[i]](input);
      } else {
        return stateFunList[0];
      }
    }
  }
  stateFunList[pattern.length] =()=>{
    return stateFunList[pattern.length];
  }
  return stateFunList;
}
function match(str,pattern){
  let kmpNext = getKmpNext(pattern);
  let stateFunList = getStateFunList(pattern,kmpNext);
  let state = stateFunList[0];
  for (let input of str){
    state = state(input)
  }
  return state === stateFunList[pattern.length];
}
console.log(match('aabaaabaad','aabaad'))
