const { buildBranding } = require('./branding');
const a4Strip = require('./templates/a4_80mm_strip');
const reportA4 = require('./templates/report_a4');
const restaurant80 = require('./templates/restaurant_80mm');

/**
 * @param {object} inv invoice payload
 * @param {object|null} branding from buildBranding / loadBrandingForRequest
 * @returns {Promise<string>} path to temp PDF file
 */
function generateInvoicePDF(inv, branding) {
  const B = branding || buildBranding(null);
  switch (B.template) {
    case 'report_a4':
      return reportA4.generate(inv, B);
    case 'restaurant_80mm':
      return restaurant80.generate(inv, B);
    case 'a4_80mm_strip':
    default:
      return a4Strip.generate(inv, B);
  }
}

module.exports = { generateInvoicePDF };
