const app = require("./app.js");

// Start Database server then Start our server 
const port = process.env.PORT;

app.listen(port, () => console.log("application is ready"))