import assert from 'node:assert/strict';
import { resolveControllerAction } from '../src/systems/controllerAction.js';

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

await test('resolveControllerAction returns heuristic when disabled', () => {
  const result = resolveControllerAction({
    useController: false,
    controller: null,
    buildObservation: () => {
      throw new Error('should not build observation');
    }
  });

  assert.deepEqual(result, { mode: 'heuristic' });
});

await test('resolveControllerAction produces action when enabled', () => {
  const controller = {
    actedWith: null,
    act(obs) {
      this.actedWith = obs;
      return { foo: 'bar' };
    }
  };

  const result = resolveControllerAction({
    useController: true,
    controller,
    buildObservation: (a, b) => ({ agent: a, res: b }),
    observationArgs: ['agent', 'resource']
  });

  assert.equal(result.mode, 'controller');
  assert.deepEqual(result.action, { foo: 'bar' });
  assert.deepEqual(result.observation, { agent: 'agent', res: 'resource' });
  assert.deepEqual(controller.actedWith, { agent: 'agent', res: 'resource' });
});
