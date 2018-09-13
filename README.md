# redux-hom
redux HigherOrderMiddleware
[![npm version](https://img.shields.io/npm/v/redux-hom.svg?style=flat-square)](https://www.npmjs.com/package/redux-hom)

> it's wait for more information

## Installation

```
npm install --save redux-hom
```

## Usage

#### define middleware

```js
const { applyMiddleware } = require('redux');
const { higherOrderMiddleware } = require('redux-hom');

const services = [{
    id: 'featureA',
    middleware: featureMiddlewareA
}, {
    id: 'featureB',
    middleware: featureMiddlewareB
}];

export default applyMiddleware(
    ...middlewares,
    higherOrderMiddleware({ services })
);
```

#### define action
```js
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

#### if you want diy match

```js
const services = [{
    id: 'featureA',
    middleware: featureMiddlewareA,
    match: (action, id) => new RegExp(`:${id}`).test(action.type)
}]

const action = {
    type: 'ACTION:featureA:featureB'
}
```

#### 

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

### Why?

It's a extension for action -> middleware

here's the [history](https://medium.com/@jacobp100/you-arent-using-redux-middleware-enough-94ffe991e6)

##### for example 1: storage case

###### 1. you want to have a storage

```js
const someFunction = value => {
  // ...
  localStorage.setItem(key, value)
}
```

###### 2. you think you should use middleware

```js
const storageMiddleware = store => next => action => {
  switch(action.type) {
  case 'LOGIN:success': localStorage.setItem('USER', JSON.stringify(action.payload.data));break;
  default:;
  }
  return next(action);
}

dispatch({ type: 'LOGIN' })
fetch().then(() => dispatch({type: 'LOGIN:success'}))
```

###### 2.1 and then

```js
const storageMiddleware = store => next => action => {
  switch(action.type) {
  case 'LOGIN:success': localStorage.setItem('USER', JSON.stringify(action.payload.data));break;
  case 'PAGE:success': localStorage.setItem('KEY', JSON.stringify(action.payload.data));break;
  case 'SOME_ACTION': ...;break;
  case '...': ...;break;
  // ...
  default:;
  }
  return next(action);
}

```

###### 3 switch to regexp

```js
const storageMiddleware = store => next => action => {
  const reg = /:success$/;
  const match = action.type.match(reg) || [];
  switch(match[1]) {
  case 'LOGIN': localStorage.setItem('USER', JSON.stringify(action.payload.data));break;
  case '...': localStorage.setItem('KEY', JSON.stringify(action.payload.data));break;
  // ...
  default:;
  }
  switch(action.type) {
  case 'SOME_ACTION': ...;break;
  default:;
  }
  return next(action);
}

const fetchSuccess = (action, data) => ({type: `${action.type}:success`, ...data})
```

###### 4 implements action
```js
const storageMiddleware = store => next => action => {
  localStorage.setItem(action.$storage, action.payload.data);
  return next(action)
}

dispatch({
  type: 'ACTION',
  $storage: 'USER',
  payload: {
    data: {}
  }
})
```

##### for more examples

```js
import {batchActions, enableBatching} from 'redux-batched-actions';

// wrap actions
const doThing = createAction('DO_THING')
const doOther = createAction('DO_OTHER')
// wrap reducer
const store = createStore(enableBatching(reducer), initialState)
// dispatch wrapped function
dispatch(batchActions([doThing(), doOther(), 'DO_BOTH']))
```

```js
// serialize in batchMiddleware

dispatch({
  type: 'DO_BOTH',
  $batch: [
    async () => ({type: 'ACTION2'}),
    async () => ({type: 'ACTION3'}),
  ]
})
```

*****

```js
import {createStore, applyMiddleware} from 'redux';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';

const client = axios.create({ //all axios can be used, shown in axios documentation
  baseURL: 'http://localhost:8080/api',
  responseType: 'json'
});

let store = createStore(
  reducers, //custom reducers
  applyMiddleware(
    //all middlewares
    ...
    axiosMiddleware(client), //second parameter options can optionally contain onSuccess, onError, onComplete, successSuffix, errorSuffix
    ...
  )
)

// multi case

const client2 = axios.create({
  baseURL: 'http://localhost:8081/api',
  responseType: 'json'
})

multiClientMiddleware(
   clients, // described below
   options // optional, this will be used for all middleware if not overriden by upper options layer
 )
 
dispatch({
  type: 'FETCH_1',
  payload: {
    client: 'default',
    request:{
      url:'/categories'
    },
    onError: () => {....}
  }
});
dispatch({
  type: 'FETCH_2',
  payload: {
    client: 'default',
    request:{
    url:'/categories'
    },
    onError: () => {....}
}
})

```

```js
const client1Middleware = store => next => action => {
  const {
    request,
    onSuccess = data => store.dispatch({type: `${action.type}_SUCCESS_`, data}), // you can set default here
    onError = () => {...} 
  } = action.$client1;
  client1(request).then(onSuccess).catch(onError);
  return next(action);
}

dispatch({
  type: 'SOME_ACTION',
  $client1: {
    request: { url },
  },
  $client2: {
    request: { url },
  }
})

// it depends on how you write your middleware
dispatch({
  type: 'SOME_ACTION',
  $stream: [
    () => ({
      type: 'TO_CLIENT1', 
      $storageAfterFetch: 'key'
    }),
    async () => ({
      type: 'TO_CLIENT2', 
      $client2: options
    }),
    async (prev) => ({
      type: 'STORAGE_CLIENT2',
      $storage: 'key'
    })
  ]
})
```

### Motivation

> [higherOrderFunction](https://en.wikipedia.org/wiki/Higher-order_function#JavaScript)

> higherOrderComponent

```js
<Parent>
  <Child/>
</Parent>
```

> higherOrderReducer

```js
combineReducers({
  ...,
  combineReducers({
    ...,
  }),
})
```



### TODO

+ more detail about usage
+ need example
+ try to merge feature like `redux-batch-action` or `redux-pack`
+ add circle ci
+ maybe something more
+ finish them & build module
+ testing common services
