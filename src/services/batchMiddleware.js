const batchMiddleware = store => next => action => {
  const nextAction = next(action);
  const { $batch }= action;
  $batch.forEach(child => {
    switch (typeof child) {
      case 'string': store.dispatch({ type: `${action.type}:${child}`}); break;
      case 'function':
        if (child.constructor.name === 'AsyncFunction') {
          child(action).then(asyncAction => store.dispatch(asyncAction));
        } else {
          store.dispatch(child(action));break;
        }
      default: break;
    };
  });

  return nextAction;
};

export default batchMiddleware;
