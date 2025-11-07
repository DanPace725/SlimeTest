export function resolveControllerAction({
  useController,
  controller,
  buildObservation,
  observationArgs = []
}) {
  if (!useController || !controller) {
    return { mode: 'heuristic' };
  }

  const observation = buildObservation(...observationArgs);
  const action = controller.act(observation);

  return {
    mode: 'controller',
    action,
    observation
  };
}
