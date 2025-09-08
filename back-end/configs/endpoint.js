const endpoint = {
  development: {
    clientEndpoint: process.env.ENDPOINT_CLIENT,
    serverEndpoint: process.env.ENDPOINT_SERVER,
  },
  production: {
    clientEndpoint: process.env.ENDPOINT_CLIENT,
    serverEndpoint: process.env.ENDPOINT_SERVER,
  },
};

module.exports = endpoint[process.env.NODE_ENV || "development"];
