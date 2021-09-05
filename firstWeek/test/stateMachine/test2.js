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
    return start;
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
    return foundA1;
  } else {
    return start(input);
  }
}
function foundA1(input) {
  if (input == 'a') {
    return foundB1;
  } else {
    return start(input);
  }
}
function foundB1(input) {
  if (input == 'b') {
    return foundX;
  } else {
    return start(input);
  }
}
function foundX(input) {
  if (input == 'x') {
    return end;
  } else {
    return foundC(input);
  }
}
function end() {
  return end;
}
console.log(match('abcabcabxz'));
