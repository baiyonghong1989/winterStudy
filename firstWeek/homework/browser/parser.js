const EOF = Symbol('EOF');
module.exports.parseHTML = function (html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
};

function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c === EOF) {
    return;
  } else {
    return data;
  }
}

function tagOpen(c) {
  if (c === '/') {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]%/)) {
    return tagName(c);
  } else {
    return;
  }
}
