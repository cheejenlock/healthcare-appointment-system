const axios = require('axios');

const FDA_BASE = process.env.OPENFDA_BASE_URL || 'https://api.fda.gov';

/**
 * Search drug info via OpenFDA Drug Label API
 * @param {string} name - drug name (e.g. "amoxicillin")
 * @param {number} limit - number of results
 */
async function searchDrug(name, limit = 5) {
  const url = `${FDA_BASE}/drug/label.json`;
  const params = {
    search: `openfda.brand_name:"${name}" OR openfda.generic_name:"${name}"`,
    limit,
  };

  const { data } = await axios.get(url, { params, timeout: 8000 });

  return (data.results || []).map((item) => ({
    brand_name:    item.openfda?.brand_name?.[0] || null,
    generic_name:  item.openfda?.generic_name?.[0] || null,
    manufacturer:  item.openfda?.manufacturer_name?.[0] || null,
    product_type:  item.openfda?.product_type?.[0] || null,
    route:         item.openfda?.route?.[0] || null,
    indications:   item.indications_and_usage?.[0]?.slice(0, 500) || null,
    dosage:        item.dosage_and_administration?.[0]?.slice(0, 500) || null,
    warnings:      item.warnings?.[0]?.slice(0, 300) || null,
  }));
}

/**
 * Lookup by NDC code
 */
async function getByNdc(ndc) {
  const url = `${FDA_BASE}/drug/label.json`;
  const params = { search: `openfda.product_ndc:"${ndc}"`, limit: 1 };

  const { data } = await axios.get(url, { params, timeout: 8000 });
  return data.results?.[0] || null;
}

module.exports = { searchDrug, getByNdc };