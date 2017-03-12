const keys = obj => Object.keys(obj)

module.exports.dissoc = (str, obj) =>
      keys(obj).reduce((acc, k) => k !== str ? (acc[k] = obj[k], acc) : acc, {})
