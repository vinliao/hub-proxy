// Require the Express module
const express = require("express");
const dotenv = require("dotenv");
const {
  getFarcasterTime,
  toFarcasterTime,
  fromFarcasterTime,
  bytesToHexString,
  hexStringToBytes,
  bytesToUtf8String,
  getSSLHubRpcClient,
  userDataTypeFromJSON,
  reactionTypeFromJSON,
} = require("@farcaster/hub-nodejs");
const {
  isNumber,
  isHexString,
  isString,
  isByteArray,
} = require("./validators");

// Load environment variables from .env file
dotenv.config();

// Create an instance of the Express application
const app = express();
const hubRpcEndpoint =
  process.env.MAINNET_HUB_RPC_URL || "testnet1.farcaster.xyz:2283";

console.log(`Connecting to ${hubRpcEndpoint}...`);

// Use JSON middleware
app.use(express.json());

function validationMiddleware(validationRules) {
  return (req, res, next) => {
    for (const [key, validator] of Object.entries(validationRules)) {
      const validationResult = validator(req.body, key);

      if (!validationResult.isValid) {
        return res.status(400).json({ error: validationResult.error });
      }
    }

    next();
  };
}

const returnResult = (res, result) => {
  console.log(res.req.originalUrl);
  console.log(result);
  if (result.isErr()) {
    // not returning 400 because it's not an endpoint params error
    // could be a bad choice...
    res.json({ error: result._unsafeUnwrapErr() });
  } else {
    res.json({ result: result.value });
  }
};

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
  res.json({ result: getFarcasterTime()._unsafeUnwrap() });
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

  returnResult(res, toFarcasterTime(msTimestamp));
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

  returnResult(res, fromFarcasterTime(farcasterTimestamp));
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
  const input = req.body.byteArray;
  if (!Array.isArray(input) || !input.every(Number.isInteger)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected an array of numbers." });
  }

  const byteArray = new Uint8Array(input);
  returnResult(res, bytesToHexString(byteArray));
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

  returnResult(res, hexStringToBytes(hexString));
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
  const input = req.body.byteArray;
  if (!Array.isArray(input) || !input.every(Number.isInteger)) {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected an array of numbers." });
  }

  const byteArray = new Uint8Array(input);
  returnResult(res, bytesToUtf8String(byteArray));
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
  const { fid, signerPubKeyHex } = req.body;
  if (typeof fid !== "number" || typeof signerPubKeyHex !== "string") {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for signerPubKeyHex.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const signerResult = await client.getSigner({
    fid,
    signer: hexStringToBytes(signerPubKeyHex)._unsafeUnwrap(),
  });

  returnResult(res, signerResult);
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
  const fid = req.body.fid;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const signersResult = await client.getAllSignerMessagesByFid({ fid });

  returnResult(res, signersResult);
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
  const fid = req.body.fid;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const signersResult = await client.getAllSignerMessagesByFid({ fid });

  returnResult(res, signersResult);
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
  const { fid, userDataType } = req.body;
  if (typeof fid !== "number" || typeof userDataType !== "string") {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for userDataType.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const userDataResult = await client.getUserData({
    fid,
    userDataType: userDataTypeFromJSON(userDataType),
  });

  returnResult(res, userDataResult);
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
  const fid = req.body.fid;
  if (typeof req.body.fid !== "number") {
    return res.status(400).json({
      error: "Invalid input. Expected a number for fid.",
    });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const userDataResult = await client.getAllUserDataMessagesByFid({ fid });

  returnResult(res, userDataResult);
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
  const fid = req.body.fid;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const userDataResult = await client.getAllUserDataMessagesByFid({ fid });

  returnResult(res, userDataResult);
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
  const { fid } = req.body;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const idResult = await client.getIdRegistryEvent({ fid });

  returnResult(res, idResult);
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
  const { fname } = req.body;
  if (typeof fname !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a string for fname." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const fnameBytes = new TextEncoder().encode(fname);
  const fnameResult = await client.getNameRegistryEvent({ name: fnameBytes });

  returnResult(res, fnameResult);
});

/**
 * Get an active cast for a user.
 * @route POST /get-cast
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.hash - The hash of the cast.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-cast \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2, "hash": "460a87ace7014adefe4a2944fb62833b1bf2a6be"}'
 */
app.post("/get-cast", async (req, res) => {
  const { fid, hash } = req.body;
  if (typeof fid !== "number" || typeof hash !== "string") {
    return res.status(400).json({
      error: "Invalid input. Expected a number for fid and a string for hash.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const castHashBytes = hexStringToBytes(hash)._unsafeUnwrap();
  const castResult = await client.getCast({ fid, hash: castHashBytes });

  returnResult(res, castResult);
});

/**
 * Get active casts for a user in reverse chronological order.
 * @route POST /get-casts-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @param {number?} req.body.pageSize - Number of results per page.
 * @param {Uint8Array?} req.body.pageToken - Token used to fetch the next page, if it exists.
 * @param {boolean?} req.body.reverse - Reverses the chronological ordering.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-casts-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-casts-by-fid", async (req, res) => {
  const { fid, pageSize, pageToken, reverse } = req.body;
  // TODO: additional checks here
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const castsResult = await client.getCastsByFid({
    fid,
    pageSize,
    pageToken,
    reverse,
  });

  returnResult(res, castsResult);
});

/**
 * Get all active casts that mention an fid in reverse chronological order.
 * @route POST /get-casts-by-mention
 * @param {number} req.body.fid - The fid that is mentioned in the casts.
 * @param {number?} req.body.pageSize - Number of results per page.
 * @param {Uint8Array?} req.body.pageToken - Token used to fetch the next page, if it exists.
 * @param {boolean?} req.body.reverse - Reverses the chronological ordering.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-casts-by-mention \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-casts-by-mention", async (req, res) => {
  const { fid, pageSize, pageToken, reverse } = req.body;
  // TODO: additional checks here
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const castsResult = await client.getCastsByMention({
    fid,
    pageSize,
    pageToken,
    reverse,
  });

  returnResult(res, castsResult);
});

/**
 * Get all active casts that are replies to a specific cast in reverse chronological order.
 * @route POST /get-casts-by-parent
 * @param {number} req.body.fid - The fid of the parent cast.
 * @param {string} req.body.hash - The hash of the parent cast.
 * @param {number?} req.body.pageSize - Number of results per page.
 * @param {Uint8Array?} req.body.pageToken - Token used to fetch the next page, if it exists.
 * @param {boolean?} req.body.reverse - Reverses the chronological ordering.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-casts-by-parent \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2, "hash": "ee04762bea3060ce3cca154bced5947de04aa253"}'
 */
app.post(
  "/get-casts-by-parent",
  validationMiddleware({
    // TODO: additional checks for pageSize, pageToken, and reverse
    fid: isNumber,
    hash: isHexString,
  }),
  async (req, res) => {
    const { fid, hash, pageSize, pageToken, reverse } = req.body;
    const client = getSSLHubRpcClient(hubRpcEndpoint);
    const castHashBytes = hexStringToBytes(hash)._unsafeUnwrap();
    const castsResult = await client.getCastsByParent({
      castId: { fid, hash: castHashBytes },
      pageSize,
      pageToken,
      reverse,
    });

    returnResult(res, castsResult);
  }
);

/**
 * Get all active and inactive casts for a user in reverse chronological order.
 * @route POST /get-all-cast-messages-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @param {number?} req.body.pageSize - Number of results per page.
 * @param {Uint8Array?} req.body.pageToken - Token used to fetch the next page, if it exists.
 * @param {boolean?} req.body.reverse - Reverses the chronological ordering.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-all-cast-messages-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post(
  "/get-all-cast-messages-by-fid",
  validationMiddleware({ fid: isNumber }),
  async (req, res) => {
    const { fid, pageSize, pageToken, reverse } = req.body;
    if (typeof fid !== "number") {
      return res
        .status(400)
        .json({ error: "Invalid input. Expected a number for fid." });
    }

    const client = getSSLHubRpcClient(hubRpcEndpoint);
    const castsResult = await client.getAllCastMessagesByFid({
      fid,
      pageSize,
      pageToken,
      reverse,
    });

    returnResult(res, castsResult);
  }
);

/**
 * Get an active reaction of a particular type made by a user to a cast.
 * @route POST /get-reaction
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.reactionType - The type of the reaction.
 * @param {Object} req.body.castId - The cast id.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-reaction \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 8150, "reactionType": "REACTION_TYPE_LIKE", "castId": {"fid": 2, "hash": "ee04762bea3060ce3cca154bced5947de04aa253"}}'
 */
app.post("/get-reaction", async (req, res) => {
  const { fid, reactionType, castId } = req.body;
  // TODO: additional checks here
  if (typeof req.body.fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const hashBytes = hexStringToBytes(castId.hash)._unsafeUnwrap();
  const reactionResult = await client.getReaction({
    fid,
    reactionType: reactionTypeFromJSON(reactionType),
    castId: {
      fid: castId.fid,
      hash: hashBytes,
    },
  });

  returnResult(res, reactionResult);
});

/**
 * Get all active reactions made by users to a cast.
 * @route POST /get-reactions-by-cast
 * @param {string} req.body.reactionType - The type of the reaction.
 * @param {Object} req.body.castId - The cast id.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-reactions-by-cast \
 *   --header 'Content-Type: application/json' \
 *   --data '{"reactionType": "REACTION_TYPE_LIKE", "castId": {"fid": 2, "hash": "ee04762bea3060ce3cca154bced5947de04aa253"}}'
 */
app.post("/get-reactions-by-cast", async (req, res) => {
  const { reactionType, castId } = req.body;
  // TODO: additional checks here
  if (typeof reactionType !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a string for reactionType." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const hashBytes = hexStringToBytes(castId.hash)._unsafeUnwrap();
  const reactionsResult = await client.getReactionsByCast({
    reactionType: reactionTypeFromJSON(reactionType),
    castId: { fid: castId.fid, hash: hashBytes },
  });

  returnResult(res, reactionsResult);
});

/**
 * Get all active reactions made by a user in reverse chronological order.
 * @route POST /get-reactions-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.reactionType - The type of the reaction.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-reactions-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2, "reactionType": "REACTION_TYPE_LIKE"}'
 */
app.post("/get-reactions-by-fid", async (req, res) => {
  const { fid, reactionType } = req.body;
  if (typeof fid !== "number" && typeof reactionType !== "string") {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for reactionType.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const reactionsResult = await client.getReactionsByFid({
    fid,
    reactionType: reactionTypeFromJSON(reactionType),
  });

  returnResult(res, reactionsResult);
});

/**
 * Get all active and inactive reactions made by a user in reverse chronological order.
 * @route POST /get-all-reaction-messages-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-all-reaction-messages-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-all-reaction-messages-by-fid", async (req, res) => {
  const fid = req.body.fid;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }
  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const reactionsResult = await client.getAllReactionMessagesByFid({ fid });

  returnResult(res, reactionsResult);
});

/**
 * Returns an active verification for a specific Ethereum address made by a user.
 * @route POST /get-verification
 * @param {number} req.body.fid - The fid of the user.
 * @param {string} req.body.address - The Ethereum address being verified.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-verification \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2, "address": "0x2D596314b27dcf1d6a4296e95D9a4897810cE4b5"}'
 */
app.post("/get-verification", async (req, res) => {
  const { fid, address } = req.body;
  if (typeof fid !== "number" || typeof address !== "string") {
    return res.status(400).json({
      error:
        "Invalid input. Expected a number for fid and a string for address.",
    });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const addressBytes = hexStringToBytes(address)._unsafeUnwrap();
  const verificationResult = await client.getVerification({
    fid,
    address: addressBytes,
  });

  returnResult(res, verificationResult);
});

/**
 * Returns all active verifications for Ethereum addresses made by a user in reverse chronological order.
 * @route POST /get-verifications-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-verifications-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-verifications-by-fid", async (req, res) => {
  const { fid } = req.body;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const verificationsResult = await client.getVerificationsByFid({ fid });

  returnResult(res, verificationsResult);
});

/**
 * Returns all active and inactive verifications for Ethereum addresses made by a user in reverse chronological order.
 * @route POST /get-all-verification-messages-by-fid
 * @param {number} req.body.fid - The fid of the user.
 * @example
 * curl --request POST \
 *   --url http://localhost:3000/get-all-verification-messages-by-fid \
 *   --header 'Content-Type: application/json' \
 *   --data '{"fid": 2}'
 */
app.post("/get-all-verification-messages-by-fid", async (req, res) => {
  const { fid } = req.body;
  if (typeof fid !== "number") {
    return res
      .status(400)
      .json({ error: "Invalid input. Expected a number for fid." });
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);
  const verificationsResult = await client.getAllVerificationMessagesByFid({
    fid,
  });

  returnResult(res, verificationsResult);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});

module.exports = app;
