const configSchema = {
  rco_import: {
    type: Boolean,
    required: true,
    default: 250,
  },
  affelnet_diffusion: {
    type: Boolean,
    required: true,
    default: false,
  },
  parcoursup_export: {
    type: Boolean,
    required: true,
    default: false,
  },
  parcoursup_limit: {
    type: Number,
    required: true,
    default: 250,
  },
};

module.exports = configSchema;
