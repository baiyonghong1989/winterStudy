function match(inputString) {
  let state = start;
  for (let s of inputString) {
    state = state(s);
  }
  return state === end;
}

function start(input) {
  if (input == 'a') {
    return foundB;
  } else {
    return start(input);
  }
}
function foundB(input) {
  if (input == 'b') {
    return foundC;
  } else {
    return start(input);
  }
}
function foundC(input) {
  if (input == 'c') {
    return end;
  } else {
    return start(input);
  }
}
function end(input) {
  return end;
}
console.log(match('aabcdg'));
