import { canReserve } from './reserve.js';
export function confirmReservation(seats) {
  return canReserve(seats);
}
