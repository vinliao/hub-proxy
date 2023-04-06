# Farcaster Hub Proxy

A temporary proxy to fetch data from Farcaster Hub. Please note that this is only a temporary solution and will be replaced by language-specific packages and modules to talk to Farcaster Hub.

Please head to [index.js](index.js) to see the available endpoints. It provides all read-only functions from [hub-nodejs](https://github.com/farcasterxyz/hub-monorepo/tree/main/packages/hub-nodejs). All the functions are well-documented, you should be able to get up and running quickly.

Example usage:

```bash
curl --request POST \
  --url https://hub-proxy-production.up.railway.app/get-reactions-by-cast \
  --header 'Content-Type: application/json' \
  --data '{
    "reactionType": "REACTION_TYPE_LIKE",
    "castId": {
      "fid": 2,
      "hash": "ee04762bea3060ce3cca154bced5947de04aa253"
    }
  }'

```

To deploy the proxy pointing at your own Hub, put a `MAINNET_HUB_RPC_URL` in your `.env` file.
