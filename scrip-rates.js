/* Owner-approved indicative SELLER rates per individual scrip, 18 October 2026.
   Public buying rates only: never put costs or credentials here.
   Slabs use an inclusive minimum and exclusive maximum, except the final maximum.
   Set validUntil to an ISO timestamp with timezone if these rates should expire. */
(function (root) {
  const rates = {
    updatedAt: '2026-10-18T00:00:00+05:30',
    validUntil: null,
    slabs: [
      { min: 0, max: 1000, percent: 75 },
      { min: 1000, max: 10000, percent: 85 },
      { min: 10000, max: 100000, percent: 90 },
      { min: 100000, max: 500000, percent: 95 },
      { min: 500000, max: 5000000, maxInclusive: true, percent: 99 }
    ],
    schemes: {
      rodtep: { enabled: true },
      rosctl: { enabled: true }
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = rates;
  else root.YuvglobalScripRates = rates;
})(typeof window === 'undefined' ? globalThis : window);
