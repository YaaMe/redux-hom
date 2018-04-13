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

const someReducer = (state, action) => {
	switch (action.type) {
		case 'DO_THING': return 'thing';
		case 'DO_OTHER': return 'other';
		default: return state;
	};
};

const store = createStore(
    combineReducers({
        someReducer
    }),
    applyMiddleware(
        ...middlewares,
        higherOrderMiddleware({ services })
    )
);

const normalAction = {
    type: 'DO_NORMAL'
};
store.dispatch(normalAction);

const featureAction = {
    type: 'NEED_SOME_FEATURE',
    $featureA: []
};
store.dispatch(featureAction);

const multiFeatureAction = {
    type: 'NEED_MULTI_FEATURE',
    $featureA: [],
    $featureB: []
};
```


### TODO

+ more detail about usage
+ try to merge feature like `redux-batch-action` or `redux-pack`
+ add test case & ci
+ maybe something more
+ finish them & build module
