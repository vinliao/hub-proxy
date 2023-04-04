// Require the Express module
const express = require("express");
const {
  getFarcasterTime,
  toFarcasterTime,
  fromFarcasterTime,
  bytesToHexString,
  hexStringToBytes,
  bytesToUtf8String,
  getSSLHubRpcClient,
} = require("@farcaster/hub-nodejs");

// Create an instance of the Express application
const app = express();

// Use JSON middleware
app.use(express.json());

// Define a route for the home page
app.get("/", (req, res) => {
  res.json({ message: "hello world" });
});

/**
 * Get the current Farcaster timestamp.
 * @route GET /get-farcaster-time
 * @returns {Object} res - The JSON response object.
 * @example
 * curl --request GET \
 *   --url http://localhost:3000/get-farcaster-time
 */
app.get("/get-farcaster-time", (req, res) => {
  res.json({ ...getFarcasterTime() });
});

/**
 * Converts a Unix timestamp to a Farcaster timestamp.
 * @route POST /to-farcaster-time
 * @param {number} req.body.msTimestamp - The Unix timestamp in milliseconds.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/to-farcaster-time \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "msTimestamp": 1649133661000
 *   }'
 */
app.post("/to-farcaster-time", (req, res) => {
  const msTimestamp = req.body.msTimestamp;
  if (typeof msTimestamp !== "number") {
    return res.status(400).json({ error: "Invalid input. Expected a number." });
  }
  res.json({ ...toFarcasterTime(msTimestamp) });
});

/**
 * Convert a Farcaster timestamp to a Unix timestamp.
 * @route POST /from-farcaster-time
 * @param {number} req.body.farcasterTimestamp - The Farcaster timestamp in milliseconds.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/from-farcaster-time \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "farcasterTimestamp": 70160902
 *   }'
 */
app.post("/from-farcaster-time", (req, res) => {
  const farcasterTimestamp = req.body.farcasterTimestamp;
  if (typeof farcasterTimestamp !== "number") {
    return res.status(400).json({ error: "Invalid input. Expected a number." });
  }
  res.json({ ...fromFarcasterTime(farcasterTimestamp) });
});

/**
 * Convert a byte array to a hex string.
 * @route POST /bytes-to-hex-string
 * @param {Uint8Array} req.body.byteArray - The byte array to convert.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/bytes-to-hex-string \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "byteArray": [1, 2, 3]
 *   }'
 */
app.post("/bytes-to-hex-string", (req, res) => {
  const byteArray = new Uint8Array(req.body.byteArray);
  if (!(byteArray instanceof Uint8Array)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a Uint8Array." });
  }
  res.json({ ...bytesToHexString(byteArray) });
});

/**
 * Convert a hex string to a byte array.
 * @route POST /hex-string-to-bytes
 * @param {string} req.body.hexString - The hex string to convert.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/hex-string-to-bytes \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "hexString": "0x010203"
 *   }'
 */
app.post("/hex-string-to-bytes", (req, res) => {
  const hexString = req.body.hexString;
  if (typeof hexString !== "string") {
    return res.status(400).json({ error: "Invalid input. Expected a string." });
  }
  res.json({ ...hexStringToBytes(hexString) });
});

/**
 * Convert a byte array to a UTF-8 string.
 * @route POST /bytes-to-utf8-string
 * @param {Uint8Array} req.body.byteArray - The byte array to convert.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/bytes-to-utf8-string \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "byteArray": [72, 101, 108, 108, 111]
 *   }'
 */
app.post("/bytes-to-utf8-string", (req, res) => {
  const byteArray = new Uint8Array(req.body.byteArray);
  if (!(byteArray instanceof Uint8Array)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a Uint8Array." });
  }
  res.json({ ...bytesToUtf8String(byteArray) });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
