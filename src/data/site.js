let environment = "development";
if (process.env.ELEVENTY_ENV) {
  environment = process.env.ELEVENTY_ENV;
}

module.exports = {
  environment,
};
