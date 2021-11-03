export function test(id) {
  return id + 12345;
}

export function ppp(id) {
  let c = test(id);
  return c + '12578';
}
