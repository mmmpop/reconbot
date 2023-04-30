module.exports = {
  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "https://api.imagga.com/v2/tags",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    },    
    // headers: {
    //   "Access-Control-Allow-Origin": "http://localhost:3000",
    //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    //   "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    //   "Access-Control-Allow-Credentials": "true"
    // },
    proxy: {
      '/video': {
        'target': 'http://192.168.1.19/mjpeg/1',
        'changeOrigin': true,
        "pathRewrite": {
          "/video": ""
        },
        'secure': false,
      }
    },
  }
};