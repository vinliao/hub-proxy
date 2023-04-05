const request = require("supertest");
const app = require("./index");

describe("POST /to-farcaster-time", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/to-farcaster-time")
      .send({ msTimestamp: 1649133661000 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/to-farcaster-time")
      .send({ msTimestamp: "invalid" });

    expect(response.status).toBe(400);
  });
});

describe("POST /from-farcaster-time", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/from-farcaster-time")
      .send({ farcasterTimestamp: 70160902 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/from-farcaster-time")
      .send({ farcasterTimestamp: "invalid" });

    expect(response.status).toBe(400);
  });
});

describe("POST /bytes-to-hex-string", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/bytes-to-hex-string")
      .send({ byteArray: [1, 2, 3] });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/bytes-to-hex-string")
      .send({ byteArray: "invalid" });

    expect(response.status).toBe(400);
  });
});

describe("POST /hex-string-to-bytes", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/hex-string-to-bytes")
      .send({ hexString: "0x010203" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/hex-string-to-bytes")
      .send({ hexString: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /bytes-to-utf8-string", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/bytes-to-utf8-string")
      .send({ byteArray: [72, 101, 108, 108, 111] });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/bytes-to-utf8-string")
      .send({ byteArray: "Hello" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-signer", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app).post("/get-signer").send({
      fid: 2,
      signerPubKeyHex:
        "5feb9e21f3df044197e634e3602a594a3423c71c6f208876074dc5a3e0d7b9ce",
    });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-signer")
      .send({ fid: "2", signerPubKeyHex: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-signers-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-signers-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-signers-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-all-signer-messages-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-all-signer-messages-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-all-signer-messages-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-user-data", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-user-data")
      .send({ fid: 2, userDataType: "USER_DATA_TYPE_DISPLAY" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-user-data")
      .send({ fid: "2", userDataType: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-user-data-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-user-data-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-user-data-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-all-user-data-messages-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-all-user-data-messages-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-all-user-data-messages-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-id-registry-event", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-id-registry-event")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-id-registry-event")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-name-registry-event", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-name-registry-event")
      .send({ fname: "v" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-name-registry-event")
      .send({ fname: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-cast", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-cast")
      .send({ fid: 2, hash: "460a87ace7014adefe4a2944fb62833b1bf2a6be" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-cast")
      .send({ fid: "2", hash: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-casts-by-fid", () => {
  jest.setTimeout(10000);
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-casts-by-mention", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-mention")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-mention")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-casts-by-parent", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-parent")
      .send({ fid: 2, hash: "ee04762bea3060ce3cca154bced5947de04aa253" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-casts-by-parent")
      .send({ fid: "2", hash: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-all-cast-messages-by-fid", () => {
  jest.setTimeout(10000);
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-all-cast-messages-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-all-cast-messages-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-reaction", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-reaction")
      .send({
        fid: 8150,
        reactionType: "REACTION_TYPE_LIKE",
        castId: {
          fid: 2,
          hash: "ee04762bea3060ce3cca154bced5947de04aa253",
        },
      });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-reaction")
      .send({
        fid: "8150",
        reactionType: "REACTION_TYPE_LIKE",
        castId: {
          fid: 2,
          hash: "ee04762bea3060ce3cca154bced5947de04aa253",
        },
      });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-reactions-by-cast", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-reactions-by-cast")
      .send({
        reactionType: "REACTION_TYPE_LIKE",
        castId: { fid: 2, hash: "ee04762bea3060ce3cca154bced5947de04aa253" },
      });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-reactions-by-cast")
      .send({ reactionType: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-reactions-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-reactions-by-fid")
      .send({ fid: 2, reactionType: "REACTION_TYPE_LIKE" });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-reactions-by-fid")
      .send({ fid: "2", reactionType: 12345 });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-all-reaction-messages-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-all-reaction-messages-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-all-reaction-messages-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-verification", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app).post("/get-verification").send({
      fid: 2,
      address: "0x2D596314b27dcf1d6a4296e95D9a4897810cE4b5",
    });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app).post("/get-verification").send({
      fid: "2",
      address: 12345,
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-verifications-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-verifications-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-verifications-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});

describe("POST /get-all-verification-messages-by-fid", () => {
  test("Should return 200 with valid input", async () => {
    const response = await request(app)
      .post("/get-all-verification-messages-by-fid")
      .send({ fid: 2 });

    expect(response.status).toBe(200);
  });

  test("Should return 400 with invalid input", async () => {
    const response = await request(app)
      .post("/get-all-verification-messages-by-fid")
      .send({ fid: "2" });

    expect(response.status).toBe(400);
  });
});
