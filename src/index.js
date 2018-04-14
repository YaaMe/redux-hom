const compose = (...funcs) => {
  switch(funcs.length) {
  case 0: return arg => arg;
  case 1: return funcs[0];
  default: return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
};

const filterMiddleware = (action, {
  id,
  middleware,
  match = (action, id) => action[`$${id}`]
}) => match(action, id) ? middleware : undefined;

const higherOrderMiddleware = options => store => next => action => {
  const {
    services = [],
    filter = filterMiddleware
  } = options;

  let chain = services.reduce((register, service) => {
    let middleware = filter(action, service);
    if (middleware) {
      register.push(middleware(store));
    }
    return register;
  }, []);

  return compose(...chain)(next)(action);
};

module.exports = {
  higherOrderMiddleware,
  filterMiddleware
};
