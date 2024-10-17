// const JWT_SECRET = "kiratsecret";
// module.exports = JWT_SECRET
require('dotenv').config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET // Ensure this is exactly the same as used to sign the JWTs
};