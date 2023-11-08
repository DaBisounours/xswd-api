import { describe, it, expect, beforeAll, beforeEach } from "bun:test";
import Api from "../src/xswd";
import { AppInfo } from "../src/types/types";
import { generateAppId, to } from "../src/utils";
import { Result } from "../src/types/response";
import { fail } from "assert";
import { DERO, NAME_SERVICE, installSC } from "./utils";
import { sleep } from "bun";
import { gasEstimateSCArgs, scinvokeSCArgs } from "../src/types/request";

const TIMEOUT = 40000;
const skip = it.if(false);

describe("utils", () => {
  it("generates app id", () => {
    const id = generateAppId("appName");
    expect(id.length).toBe(64);
  });
});

const appName = "test";
const appInfo: AppInfo = {
  id: "ed606a2f4c4f499618a78ff5f7c8e51cd2ca4d8bfa7e2b41a27754bb78b1df1f", //generateAppId(appName),
  name: appName,
  description: "A brief testing application",
  url: "http://localhost",
};

const TEST_SC = `
Function Initialize() Uint64
  10 RETURN 0
End Function
`;

async function installTestSC(): Promise<{ txid: string }> {
  return installSC("http://127.0.0.1:30000/install_sc", TEST_SC);
}

let xswd = new Api(appInfo);
let scid: string;
let address: string;
let transfer: string;

async function createCaptainName() {
  return await xswd.wallet.scinvoke(
    {
      scid: NAME_SERVICE,
      ringsize: 2,
      sc_rpc: [
        {
          name: "entrypoint",
          datatype: "S",
          value: "Register",
        },
        {
          name: "name",
          datatype: "S",
          value: "captain",
        },
      ],
    },
    true
  );
}

beforeAll(async () => {
  const result = await xswd.initialize();
  if (!result) throw "error initializing";
  const { txid } = await installTestSC();
  scid = txid;
  const addressResponse = await xswd.wallet.GetAddress();
  address = "result" in addressResponse ? addressResponse.result.address : "";
  await createCaptainName();
  const transferResponse = await xswd.wallet.transfer(
    {
      scid: DERO,
      amount: 1000,
      destination: address,
    },
    true
  );
  if ("result" in transferResponse) {
    transfer = transferResponse.result.txid;
  } else throw "could not transfer";
});

describe("commands", () => {
  describe("node", () => {
    it("wrong format", async () => {
      //@ts-ignore
      const response = await xswd.node.Echo({});
      expect("error" in response).toBe(true);
    });

    it("DERO.Echo", async () => {
      const echoStrings = ["hello", "world"];
      const response = await xswd.node.Echo(echoStrings);
      expect(response).toMatchObject({
        result: `DERO ${echoStrings.join(" ")}`,
      });
    });

    it("DERO.Ping", async () => {
      const response = await xswd.node.Ping();
      expect(response).toMatchObject({ result: "Pong " });
    });

    it("DERO.GetInfo", async () => {
      const response = await xswd.node.GetInfo();

      const [error, resultResponse] = to<"daemon", "DERO.GetInfo", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetBlock", async () => {
      const response = await xswd.node.GetBlock({});
      const [error, resultResponse] = to<"daemon", "DERO.GetBlock", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetBlockHeaderByTopoHeight", async () => {
      const response = await xswd.node.GetBlockHeaderByTopoHeight({
        topoheight: 0,
      });
      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetBlockHeaderByTopoHeight",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetBlockHeaderByHash", async () => {
      const hashResponse = await xswd.node.GetBlockHeaderByTopoHeight({
        topoheight: 0,
      });
      if ("result" in hashResponse) {
        const hash = hashResponse.result.block_header.hash;
        const response = await xswd.node.GetBlockHeaderByHash({
          hash,
        });
        const [error, resultResponse] = to<
          "daemon",
          "DERO.GetBlockHeaderByHash",
          Result
        >(response);
        expect(error).toBeUndefined();
        expect(resultResponse?.result.status).toBe("OK");
      } else {
        throw "GetBlockHeaderByTopoHeight failed for GetBlockHeaderByHash";
      }
    });

    it("DERO.GetTxPool", async () => {
      const response = await xswd.node.GetTxPool();
      const [error, resultResponse] = to<"daemon", "DERO.GetTxPool", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetRandomAddress", async () => {
      const response = await xswd.node.GetRandomAddress();
      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetRandomAddress",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetTransaction", async () => {
      const response = await xswd.node.GetTransaction({
        txs_hashes: [],
      });
      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetTransaction",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
      expect(resultResponse?.result.txs).toBeEmpty();
    });

    it("DERO.SendRawTransaction", async () => {
      // TODO untested
    });

    it("DERO.GetHeight", async () => {
      const response = await xswd.node.GetHeight();
      const [error, resultResponse] = to<"daemon", "DERO.GetHeight", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetBlockCount", async () => {
      const response = await xswd.node.GetBlockCount();
      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetBlockCount",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetLastBlockHeader", async () => {
      const response = await xswd.node.GetLastBlockHeader();
      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetLastBlockHeader",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetBlockTemplate", async () => {
      const response = await xswd.node.GetBlockTemplate({
        wallet_address: address,
        block: true,
        miner: address,
      });

      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetBlockTemplate",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it("DERO.GetEncryptedBalance", async () => {
      const response = await xswd.node.GetEncryptedBalance({
        address,
        topoheight: -1,
      });

      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetEncryptedBalance",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.status).toBe("OK");
    });

    it(
      "DERO.GetSC",
      async () => {
        const response = await xswd.node.GetSC(
          {
            scid,
            code: true,
            variables: true,
          },
          true
        );

        const [error, resultResponse] = to<"daemon", "DERO.GetSC", Result>(
          response
        );

        expect(error).toBeUndefined();
        expect(resultResponse?.result.code == TEST_SC);
      },
      TIMEOUT * 3
    );

    it("DERO.GetGasEstimate", async () => {
      const response = await xswd.node.GetGasEstimate({
        sc_rpc: gasEstimateSCArgs(scid, "Initialize", []),
        signer: address,
      });

      const [error, resultResponse] = to<
        "daemon",
        "DERO.GetGasEstimate",
        Result
      >(response);

      expect(error).toBeUndefined();
      expect(resultResponse?.result.gasstorage).toBeGreaterThan(0);
    });

    it("DERO.NameToAddress", async () => {
      const response = await xswd.node.NameToAddress({
        name: "captain",
        topoheight: -1,
      });
      const [error, resultResponse] = to<
        "daemon",
        "DERO.NameToAddress",
        Result
      >(response);
      expect(error).toBeUndefined();
      expect(resultResponse?.result.address).toBe(address);
    });
  });

  describe("wallet", () => {
    it("Echo", async () => {
      const echoStrings = ["hello", "world"];
      const response = await xswd.wallet.Echo(echoStrings);
      expect(response).toMatchObject({
        result: `WALLET ${echoStrings.join(" ")}`,
      });
    });
    it("GetAddress", async () => {
      const response = await xswd.wallet.GetAddress();

      const [error, resultResponse] = to<"wallet", "GetAddress", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.address).not.toBeEmpty();
    });
    it("GetBalance", async () => {
      const response = await xswd.wallet.GetBalance();

      const [error, resultResponse] = to<"wallet", "GetBalance", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.balance).toBeGreaterThan(0);
    });
    it("GetHeight", async () => {
      const response = await xswd.wallet.GetHeight();
      const [error, resultResponse] = to<"wallet", "GetHeight", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.height).toBePositive();
    });
    it("GetTransferbyTXID", async () => {
      const response = await xswd.wallet.GetTransferbyTXID({
        txid: transfer,
      });

      const [error, resultResponse] = to<"wallet", "GetTransferbyTXID", Result>(
        response
      );
      expect(error).toBeUndefined();
    });
    it("GetTransfers", async () => {
      const response = await xswd.wallet.GetTransfers({
        out: true,
        in: true,
      });

      const [error, resultResponse] = to<"wallet", "GetTransfers", Result>(
        response
      );
      expect(error).toBeUndefined();
      expect(resultResponse?.result.entries).not.toBeUndefined();
    });

    skip(
      "MakeIntegratedAddress",
      async () => {
        const response = await xswd.wallet.MakeIntegratedAddress({
          address,
          payload_rpc: {
            name: "Comment",
            datatype: "S",
            value: "Hello from integrated address !",
          },
        }); //! Unsolved Error invalid parameters

        const [error, resultResponse] = to<
          "wallet",
          "MakeIntegratedAddress",
          Result
        >(response);
        expect(error).toBeUndefined();
        //expect(resultResponse?.result.entries).toBeEmpty();
      },
      TIMEOUT
    );

    skip("SplitIntegratedAddress", async () => {});

    it("QueryKey", async () => {
      const response = await xswd.wallet.QueryKey({
        key_type: "mnemonic",
      });

      const [error, resultResponse] = to<"wallet", "QueryKey", Result>(
        response
      );
      expect(error).toBeUndefined();
      //expect(resultResponse?.result.entries).toBeEmpty();
    });

    it("transfer", async () => {
      const response = await xswd.wallet.transfer({
        scid: DERO,
        amount: 1000,
        destination: address,
      });

      const [error, resultResponse] = to<"wallet", "transfer", Result>(
        response
      );
      expect(error).toBeUndefined();
    });
    it("transfer2", async () => {
      const response = await xswd.wallet.transfer({
        transfers: [],
        sc_rpc: scinvokeSCArgs("Initialize", []),
        ringsize: 32,
      });

      const [error, resultResponse] = to<"wallet", "transfer", Result>(
        response
      );
      expect(error).toBeUndefined();
    });

    it(
      "scinvoke",
      async () => {
        const response = await xswd.wallet.scinvoke({
          scid,
          sc_rpc: scinvokeSCArgs("Initialize", []),
        });

        const [error, resultResponse] = to<"wallet", "scinvoke", Result>(
          response
        );

        const getSCresponse = expect(error).toBeUndefined();
      },
      TIMEOUT
    );
  });
});
