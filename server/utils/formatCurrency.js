/**
 * Currency formatting utilities.
 * NOTE: These are server-side helpers only — the React frontend handles
 * display formatting ("Rs. X,XXX"). These are used for notification
 * message generation and report labels only.
 */

/**
 * Format a number as Sri Lankan Rupees (e.g. 50000 → "Rs. 50,000")
 * @param {number} amount
 * @returns {string}
 */
const formatRs = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

/**
 * Format a plain number with thousands separators.
 * @param {number} amount
 * @returns {string}
 */
const formatNumber = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  return amount.toLocaleString('en-LK');
};

module.exports = { formatRs, formatNumber };
