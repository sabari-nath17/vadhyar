export function canReserve(seats) {
  return Number.isInteger(seats) && seats >= 0;
}
