import assert from 'node:assert/strict';
import test from 'node:test';
import { canReserve } from '../src/reservation.js';

test('available seats permit a reservation', () => assert.equal(canReserve(2), true));
test('zero remaining seats deny a reservation', () => assert.equal(canReserve(0), false));
test('negative remaining seats deny a reservation', () => assert.equal(canReserve(-1), false));
