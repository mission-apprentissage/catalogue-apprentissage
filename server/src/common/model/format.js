const siretFormat = /^[0-9]{14}$/;

const uaiFormat = /^[0-9]{7}[A-Z]{1}$/;

const mef10Format = /^[0-9]{10}$/;

const cfdFormat = /^[0-9]{8}$/;

const rncpFormat = /^(RNCP)?[0-9]{2,5}$/;

module.exports = { rncpFormat, siretFormat, uaiFormat, mef10Format, cfdFormat };
