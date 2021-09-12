let util = {
  isEmptyChar(c) {
    return c.match(c.match(/^[\t\n\f ]$/));
  },
  isLetter(c) {
    return c.match(/^[a-zA-Z]$/);
  },
};
module.exports = util;
