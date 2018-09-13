import compose from './compose';
import middlewareFilter from './middlewareFilter';

export default function higherOrderMiddleware (options) {
  return store => next => action => {
    const {
      services = [],
      filter = middlewareFilter
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
}
