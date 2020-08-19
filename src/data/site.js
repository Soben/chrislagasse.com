let environment = "production";
if (process.env.ELEVENTY_ENV) {
  environment = process.env.ELEVENTY_ENV;
}

module.exports = {
  environment,
};
