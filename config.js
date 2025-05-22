const { config } = require("dotenv").config();

exports.PORT = process.env.PORT || 3000;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.DB_NAME = process.env.DB_NAME;
exports.DB_PORT = process.env.DB_PORT;
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
exports.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
exports.GROQ_API_KEY = process.env.GROQ_API_KEY;
exports.OPENAI_API_URL = process.env.OPENAI_API_URL;
exports.CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
exports.PASSPORT_CLIENT_ID = process.env.PASSPORT_CLIENT_ID;
exports.PASSPORT_CLIENT_SECRET = process.env.PASSPORT_CLIENT_SECRET;


