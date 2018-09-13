# redux-hom
redux HigherOrderMiddleware

> it's wait for building npm

## usage

```js
const { applyMiddleware, createStore, combineReducers } = require('redux');
const { higherOrderMiddleware } = require('redux-hom');

const middlewareA = store => next => action => {
    // some logic
    return next(action);
};

const middlewareB = store => next => action => {
    // some logic
    return next(action);
};

const middlewares = [middlewareA, middlewareB];

const featureMiddlewareA = store => next => action => {
    // some interesting logic;
    return next(action);
};

const featureMiddlewareB = store => next => action => {
    // some interesting logic;
    return next(action);
};

const services = [{
    id: 'featureA',
    middleware: featureMiddlewareA
}, {
    id: 'featureB',
    middleware: featureMiddlewareB
}];
export default higherOrderMiddleware({ services })

const normalAction = {
    type: 'DO_NORMAL'
};

const featureAction = {
    type: 'NEED_SOME_FEATURE',
    $featureA: []
};

const multiFeatureAction = {
    type: 'NEED_MULTI_FEATURE',
    $featureA: [],
    $featureB: []
};
```

### service example

```js

// const action = {
//     type: 'test',
//     $storage: 'someKey',
//     data: 'someValue'
// }
const storageMiddleware = store => next => action => {
  console.log(`storage ${action['$storage']}`, action.data);
  // localStorage.setItem(action['$storage'], action.data);
  return next(action);
};


// const action = {
//   type: 'test',
//   $batch: ['step-1', 'step-2']
// };
const easyBatchMiddleware = store => next => action => {
  const nextAction = next(action);
  const { $batch }= action;
  $batch.map(child => {
    store.dispatch({
      type: `${action.type}:${child}`
    });
  });

  return nextAction;
};

// const action = {
//   type: 'test',
//   $batch:  [
//     'step-1',
//     action => ({ type: `${action.type}:left` }),
//     async action => {
//       function timeout(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//       }
//       const asyncFunc = () => new Promise((resolv, reject) => {
//         setTimeout(
//           resolv({
//             type: `${action.type}:async`
//           })
//           , 2000);
//       });
//       const asyncAction = await asyncFunc();
//       return asyncAction;
//     }
//   ]
// };
const batchMiddleware = store => next => action => {
  const AsyncFunction = (async () => {}).constructor;
  const nextAction = next(action);
  const { $batch }= action;
  $batch.forEach(child => {
    switch (typeof child) {
    case 'string': store.dispatch({ type: `${action.type}:${child}`}); break;
    case 'function':
      if (child instanceof AsyncFunction) {
        child(action).then(asyncAction => store.dispatch(asyncAction));
      } else {
        store.dispatch(child(action));break;
      }
    default: break;
    };
  });

  return nextAction;
};

const services = [{
  id: 'storage',
  middleware: storageMiddleware
}, {
  id: 'batch',
  middleware: batchMiddleware
}];


// axios fetch
export const fetchMiddleware = store => next => action => {
  const {
    requestBody,
    onSuccess = (...args) => ({ type: `${action.type}:success`}),
    onError = (...args) => ({ type: `${action.type}:error`})
  } = action.$fetch;
  // server.request(requestBody)
  //   .then((...resp) => store.dispatch(onSuccess(...resp)))
  //   .catch((...resp) => store.dispatch(onError(...resp)))
  return next(action);
};


```



### TODO

+ more detail about usage
+ need example
+ try to merge feature like `redux-batch-action` or `redux-pack`
+ add circle ci
+ maybe something more
+ finish them & build module
+ clean babel plugin
