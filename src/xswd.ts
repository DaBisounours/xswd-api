import Connection from "./connection";
import {
  Echo,
  GetTransferbyTXID,
  GetTransfers,
  MakeIntegratedAddress,
  QueryKey,
  SplitIntegratedAddress,
  Transfer,
  SCInvoke,
  DEROGetBlock,
  DEROGetBlockHeaderByHash,
  DEROGetBlockHeaderByTopoHeight,
  DEROGetBlockTemplate,
  DEROGetEncryptedBalance,
  DEROGetGasEstimate,
  DEROGetRandomAddress,
  DEROGetSC,
  DEROGetTransaction,
  DERONameToAddress,
  Transfer2,
} from "./types/request";
import { AppInfo, EventType } from "./types/types";
import makeDebug from "./debug";

const debug = makeDebug("xswd");

export default class Api {
  _connection: Connection;

  wallet = {
    _api: this,

    async Echo(params: Echo) {
      return await this._api._connection.sendSync("wallet", "Echo", {
        jsonrpc: "2.0",
        method: "Echo",
        params,
      });
    },
    async GetAddress() {
      return await this._api._connection.sendSync("wallet", "GetAddress", {
        jsonrpc: "2.0",
        method: "GetAddress",
        params: undefined,
      });
    },
    async GetBalance() {
      return await this._api._connection.sendSync("wallet", "GetBalance", {
        jsonrpc: "2.0",
        method: "GetBalance",
        params: undefined,
      });
    },
    async GetHeight() {
      return await this._api._connection.sendSync("wallet", "GetHeight", {
        jsonrpc: "2.0",
        method: "GetHeight",
        params: undefined,
      });
    },
    async GetTransferbyTXID(params: GetTransferbyTXID) {
      return await this._api._connection.sendSync(
        "wallet",
        "GetTransferbyTXID",
        {
          jsonrpc: "2.0",
          method: "GetTransferbyTXID",
          params,
        }
      );
    },
    async GetTransfers(params: GetTransfers = {}) {
      return await this._api._connection.sendSync("wallet", "GetTransfers", {
        jsonrpc: "2.0",
        method: "GetTransfers",
        params,
      });
    },
    async MakeIntegratedAddress(params: MakeIntegratedAddress) {
      return await this._api._connection.sendSync(
        "wallet",
        "MakeIntegratedAddress",
        {
          jsonrpc: "2.0",
          method: "MakeIntegratedAddress",
          params,
        }
      );
    },
    async SplitIntegratedAddress(params: SplitIntegratedAddress) {
      return await this._api._connection.sendSync(
        "wallet",
        "SplitIntegratedAddress",
        {
          jsonrpc: "2.0",
          method: "SplitIntegratedAddress",
          params,
        }
      );
    },
    async QueryKey(params: QueryKey) {
      return await this._api._connection.sendSync("wallet", "QueryKey", {
        jsonrpc: "2.0",
        method: "QueryKey",
        params,
      });
    },
    async transfer(params: Transfer | Transfer2, waitForEntry?: boolean) {
      return await this._api._connection.sendSync(
        "wallet",
        "transfer",
        {
          jsonrpc: "2.0",
          method: "transfer",
          params,
        },
        waitForEntry ? "new_entry" : undefined
      );
    },
    async scinvoke(params: SCInvoke, waitForEntry?: boolean) {
      return await this._api._connection.sendSync(
        "wallet",
        "scinvoke",
        {
          jsonrpc: "2.0",
          method: "scinvoke",
          params,
        },
        waitForEntry ? "new_entry" : undefined
      );
    },
  };
  node = {
    _api: this,

    async Echo(params: Echo) {
      return await this._api._connection.sendSync("daemon", "DERO.Echo", {
        jsonrpc: "2.0",
        method: "DERO.Echo",
        params,
      });
    },
    async Ping() {
      return await this._api._connection.sendSync("daemon", "DERO.Ping", {
        jsonrpc: "2.0",
        method: "DERO.Ping",
        params: undefined,
      });
    },
    async GetInfo() {
      return await this._api._connection.sendSync("daemon", "DERO.GetInfo", {
        jsonrpc: "2.0",
        method: "DERO.GetInfo",
        params: undefined,
      });
    },
    async GetBlock(params: DEROGetBlock) {
      return await this._api._connection.sendSync("daemon", "DERO.GetBlock", {
        jsonrpc: "2.0",
        method: "DERO.GetBlock",
        params,
      });
    },
    async GetBlockHeaderByTopoHeight(params: DEROGetBlockHeaderByTopoHeight) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetBlockHeaderByTopoHeight",
        {
          jsonrpc: "2.0",
          method: "DERO.GetBlockHeaderByTopoHeight",
          params,
        }
      );
    },
    async GetBlockHeaderByHash(params: DEROGetBlockHeaderByHash) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetBlockHeaderByHash",
        {
          jsonrpc: "2.0",
          method: "DERO.GetBlockHeaderByHash",
          params,
        }
      );
    },
    async GetTxPool() {
      return await this._api._connection.sendSync("daemon", "DERO.GetTxPool", {
        jsonrpc: "2.0",
        method: "DERO.GetTxPool",
        params: undefined,
      });
    },
    async GetRandomAddress(params: DEROGetRandomAddress = {}) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetRandomAddress",
        {
          jsonrpc: "2.0",
          method: "DERO.GetRandomAddress",
          params,
        }
      );
    },
    async GetTransaction(params: DEROGetTransaction) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetTransaction",
        {
          jsonrpc: "2.0",
          method: "DERO.GetTransaction",
          params,
        }
      );
    },
    /*async SendRawTransaction(params: DEROSendRawTransaction) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.SendRawTransaction",
        {
          jsonrpc: "2.0",
          method: "DERO.SendRawTransaction",
          params,
        }
      );
    },*/
    async GetHeight() {
      return await this._api._connection.sendSync("daemon", "DERO.GetHeight", {
        jsonrpc: "2.0",
        method: "DERO.GetHeight",
        params: undefined,
      });
    },
    async GetBlockCount() {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetBlockCount",
        {
          jsonrpc: "2.0",
          method: "DERO.GetBlockCount",
          params: undefined,
        }
      );
    },
    async GetLastBlockHeader() {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetLastBlockHeader",
        {
          jsonrpc: "2.0",
          method: "DERO.GetLastBlockHeader",
          params: undefined,
        }
      );
    },
    async GetBlockTemplate(params: DEROGetBlockTemplate) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetBlockTemplate",
        {
          jsonrpc: "2.0",
          method: "DERO.GetBlockTemplate",
          params,
        }
      );
    },
    async GetEncryptedBalance(params: DEROGetEncryptedBalance) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetEncryptedBalance",
        {
          jsonrpc: "2.0",
          method: "DERO.GetEncryptedBalance",
          params,
        }
      );
    },
    async GetSC(params: DEROGetSC, waitForNewBlock?: true) {
      if (waitForNewBlock) {
        debug("waiting for new block");
        await this._api._connection._checkEvent("new_topoheight");
      }
      return await this._api._connection.sendSync("daemon", "DERO.GetSC", {
        jsonrpc: "2.0",
        method: "DERO.GetSC",
        params,
      });
    },
    async GetGasEstimate(params: DEROGetGasEstimate) {
      // use gasEstimateSCArgs() to simplify usage
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.GetGasEstimate",
        {
          jsonrpc: "2.0",
          method: "DERO.GetGasEstimate",
          params,
        }
      );
    },
    async NameToAddress(params: DERONameToAddress) {
      return await this._api._connection.sendSync(
        "daemon",
        "DERO.NameToAddress",
        {
          jsonrpc: "2.0",
          method: "DERO.NameToAddress",
          params,
        }
      );
    },
  };

  constructor(appInfo: AppInfo) {
    debug("creating connection");
    this._connection = new Connection(appInfo);
  }

  async initialize() {
    const initialisation = await this._connection.initialize();
    console.log({ initialisation });

    if (initialisation) {
      const topoHeightSubscription = await this._connection.sendSync(
        "wallet",
        "Subscribe",
        {
          jsonrpc: "2.0",
          method: "Subscribe",
          params: { event: "new_topoheight" },
        }
      );

      const entrySubscription = await this._connection.sendSync(
        "wallet",
        "Subscribe",
        {
          jsonrpc: "2.0",
          method: "Subscribe",
          params: { event: "new_entry" },
        }
      );

      const balanceSubscription = await this._connection.sendSync(
        "wallet",
        "Subscribe",
        {
          jsonrpc: "2.0",
          method: "Subscribe",
          params: { event: "new_balance" },
        }
      );
      console.log({
        topoHeightSubscription,
        entrySubscription,
        balanceSubscription,
        rt: "result" in topoHeightSubscription,
        re: "result" in entrySubscription,
        rb: "result" in balanceSubscription,
      });

      if (
        "result" in topoHeightSubscription &&
        "result" in entrySubscription &&
        "result" in balanceSubscription
      ) {
        return (
          topoHeightSubscription.result &&
          entrySubscription.result &&
          balanceSubscription.result
        );
      }

      return false;
    }
    return initialisation;
  }
}
