// Disclosed teaching seed: an event with zero seats is incorrectly reservable.
export function canReserve(remainingSeats) {
  return remainingSeats >= 0;
}
