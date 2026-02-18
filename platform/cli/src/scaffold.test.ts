import { toTitleCase } from './scaffold.js';
import { describe, expect, test } from 'bun:test';

describe('toTitleCase', () => {
  test('converts hyphenated name to space-separated title case', () => {
    expect(toTitleCase('my-cool-plugin')).toBe('My Cool Plugin');
  });

  test('capitalizes a single word', () => {
    expect(toTitleCase('slack')).toBe('Slack');
  });

  test('handles two-part names', () => {
    expect(toTitleCase('my-plugin')).toBe('My Plugin');
  });
});
