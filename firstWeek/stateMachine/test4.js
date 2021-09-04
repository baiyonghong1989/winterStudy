function getKmpPosList(patternStr) {
  let kmpPosList = new Array(patternStr.length).fill(0);
  let i = 1;
  let j = 0;
  while (i < patternStr.length) {
    if (patternStr[j] === patternStr[i]) {
      j++;
      i++;
      kmpPosList[i] = j;
    } else {
      if (j > 0) {
        j = kmpPosList[j];
      } else {
        i++;
      }
    }
  }
  console.log(kmpPosList);
  return kmpPosList;
}
getKmpPosList('aabcaaaxb');
