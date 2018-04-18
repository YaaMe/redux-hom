const streamHandler = async (tasks, dispatch) => {
  if (tasks.length > 0) {
    const task = tasks.pop();
    const action = await streamHandler(tasks, dispatch);
    dispatch(action);
    return await task(action);
  }
  return undefined;
};

export default streamMiddleware = store => next => action => {
  streamHandler(action.$stream, store.dispatch);
  return next(action);
};


