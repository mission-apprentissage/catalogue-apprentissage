const paginate = async (Model, query, options = {}) => {
  let total = await Model.countDocuments(query);
  let page = options.page || 1;
  let limit = options.limit || 10;
  let skip = (page - 1) * limit;

  return {
    find: Model.find(query, options.select || {})
      .sort(options.sort || {})
      .skip(skip)
      .limit(limit)
      .lean(),
    pagination: {
      page,
      resultats_par_page: limit,
      nombre_de_page: Math.ceil(total / limit) || 1,
      total,
    },
  };
};

module.exports = {
  paginate,
};
