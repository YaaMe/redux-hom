export default function compose(...funcs) {
  switch (funcs.length) {
    case 0: return arg => arg;
    case 1: return funcs[0];
    default: return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
}
