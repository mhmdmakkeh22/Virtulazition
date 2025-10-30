import { describe, expect, it } from '@jest/globals';
import { helloWorld } from './hello-world';

describe('typeScript test suite', () => {
  it('should return "Hello world!"', () => {
    expect.assertions(1);
    expect(helloWorld()).toBe('Hello, World!');
  });
});
