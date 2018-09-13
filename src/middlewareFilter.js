export default function middlewareFilter (action, {
  id,
  middleware,
  match = (action, id) => action[`$${id}`]
}) {
  return match(action, id) ? middleware : undefined;
}
