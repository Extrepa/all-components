/**
 * Test setup file for errl-forge---asset-remixer
 * Configures test environment and global mocks
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
