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
  userDataTypeFromJSON,
} = require("@farcaster/hub-nodejs");

// Create an instance of the Express application
const app = express();
const hubRpcEndpoint = "testnet1.farcaster.xyz:2283";

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

/**
 * Get an active signer message for a given fid and signer's public key.
 * @route POST /get-signer
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.signerPubKeyHex - The public key of the signer as a hexadecimal string.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-signer \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "fid": 2,
 *     "signerPubKeyHex": "5feb9e21f3df044197e634e3602a594a3423c71c6f208876074dc5a3e0d7b9ce"
 *   }'
 */
app.post("/get-signer", async (req, res) => {
  if (
    typeof req.body.fid !== "number" ||
    typeof req.body.signerPubKeyHex !== "string"
  ) {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for signerPubKeyHex.",
    });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid, signerPubKeyHex } = req.body;
  const signer = hexStringToBytes(signerPubKeyHex)._unsafeUnwrap();

  const signerResult = await client.getSigner({ fid, signer });
  res.json({ ...signerResult._unsafeUnwrap() });
});

/**
 * Get all active signers created by a given fid in reverse chronological order.
 * @route POST /get-signers-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-signers-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-signers-by-fid", async (req, res) => {
  if (typeof req.body.fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  const signersResult = await client.getAllSignerMessagesByFid({ fid });
  res.json({ ...signersResult._unsafeUnwrap() });
});

/**
 * Get all active and inactive signers created by a given fid in reverse chronological order.
 * @route POST /get-all-signer-messages-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-all-signer-messages-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-all-signer-messages-by-fid", async (req, res) => {
  if (typeof req.body.fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  const signersResult = await client.getAllSignerMessagesByFid({ fid });
  res.json({ ...signersResult._unsafeUnwrap() });
});

/**
 * Get a specific piece of metadata about the user.
 * @route POST /get-user-data
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.userDataType - The type of user metadata (e.g., "DISPLAY").
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-user-data \
 *   --header 'Content-Type: application/json' \
 *   --data '{
 *     "fid": 2,
 *     "userDataType": "USER_DATA_TYPE_DISPLAY"
 *   }'
 */
app.post("/get-user-data", async (req, res) => {
  console.log(req.body);

  if (
    typeof req.body.fid !== "number" ||
    typeof req.body.userDataType !== "string"
  ) {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for userDataType.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  try {
    const userDataResult = await client.getUserData({
      fid,
      userDataType: userDataTypeFromJSON(req.body.userDataType),
    });
    res.json({ ...userDataResult._unsafeUnwrap() });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/**
 * Get all metadata about a user by their fid.
 * @route POST /get-user-data-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-user-data-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-user-data-by-fid", async (req, res) => {
  if (typeof req.body.fid !== "number") {
    return res.status(400).json({
      error: "Invalid input. Expected a number for fid.",
    });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  const userDataResult = await client.getAllUserDataMessagesByFid({ fid });
  res.json({ ...userDataResult._unsafeUnwrap() });
});

/**
 * Get all metadata about a user by their fid (alias for getUserDataByFid).
 * @route POST /get-all-user-data-messages-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-all-user-data-messages-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-all-user-data-messages-by-fid", async (req, res) => {
  if (typeof req.body.fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  const userDataResult = await client.getAllUserDataMessagesByFid({ fid });
  res.json({ ...userDataResult._unsafeUnwrap() });
});

/**
 * Get the on-chain event most recently associated with changing an fid's ownership.
 * @route POST /get-id-registry-event
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-id-registry-event \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-id-registry-event", async (req, res) => {
  if (typeof req.body.fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fid } = req.body;

  const idResult = await client.getIdRegistryEvent({ fid });
  res.json({ ...idResult._unsafeUnwrap() });
});

/**
 * Get the on-chain event most recently associated with changing an fname's ownership.
 * @route POST /get-name-registry-event
 * @param {string} req.body.fname - The fname of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-name-registry-event \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fname": "v"}'
 */
app.post("/get-name-registry-event", async (req, res) => {
  if (typeof req.body.fname !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a string for fname." });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const { fname } = req.body;
  const fnameBytes = new TextEncoder().encode(fname);

  const nrResult = await client.getNameRegistryEvent({ name: fnameBytes });
  res.json({ ...nrResult._unsafeUnwrap() });
});

/**
 * TODO:
 *    getCast
 *    getCastsByFid
 *    getCastsByMention
 *    getCastsByParent
 *    getReaction
 *    getReactionsByCast
 *    getReactionsByFid
 *    getAllReactionMessagesByFid
 *    getVerification
 *    getVerificationsByFid
 *    getAllVerificationMessagesByFid
 */

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
