/**
 * Smoke tests for figma-clone-engine
 * Basic functionality tests to verify core features work
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('Figma Clone Engine - Smoke Tests', () => {
  it('should render without crashing', () => {
    render(<App />);
    expect(screen).toBeDefined();
  });

  it('should have basic app structure', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
