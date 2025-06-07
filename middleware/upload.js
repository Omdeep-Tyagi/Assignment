const multer = require("multer");

const storage = multer.memoryStorage(); // We'll read the buffer directly
const upload = multer({ storage });

module.exports = upload;
