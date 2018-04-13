const compose = (...funcs) => {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
};

const filterMiddleware = (action, service) => {
  const {
    id,
    middleware,
    wrapper = middleware => middleware,
    match = (action, id) => action[`$${id}`]
  } = service;

  if (match(action, id)) {
    return wrapper(middleware);
  };

  return undefined;
};

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
