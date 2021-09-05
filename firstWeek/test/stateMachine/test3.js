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
    return foundA2;
  } else {
    return start(input);
  }
}
function foundA2(input) {
  if (input == 'a') {
    return foundB2;
  } else {
    return start(input);
  }
}
function foundB2(input) {
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
    return foundA2(input);
  }
}
function end() {
  return end;
}
console.log(match('abababcbx'));
