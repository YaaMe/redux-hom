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


export const simpleBatchMiddleware = store => next => action => {
  const nextAction = next(action);
  const { $batch }= action;
  $batch.forEach(child => {
    store.dispatch({
      type: `${action.type}:${child}`
    });
  });

  return nextAction;
};


export const batchMiddleware = store => next => action => {
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

const streamHandler = async (tasks, dispatch) => {
  if (tasks.length > 0) {
    const task = tasks.pop();
    const action = await streamHandler(tasks, dispatch);
    dispatch(action)
    return await task(action);
  }
  return
}

export const streamMiddleware = store => next => action => {
  streamHandler(action.$stream, store.dispatch);
  return next(action);
};


