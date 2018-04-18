const streamHandler = async (tasks, dispatch) => {
  const task = tasks.pop();
  if (tasks.length > 0) {
    const action = await streamHandler(tasks, dispatch);
    dispatch(action);
    return await task(action);
  }
  return await task();
};

const streamMiddleware = store => next => action => {
  streamHandler(action.$stream, store.dispatch).then(last => store.dispatch(last));
  return next(action);
};

export default streamMiddleware;
