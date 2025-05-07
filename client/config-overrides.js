module.exports = function override(config, env) {
  config.devServer = {
    allowedHosts: 'all',
    host: 'localhost',
    port: 3000
  };
  return config;
}; 