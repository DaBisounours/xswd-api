import { Method, JSONRPCRequestBody } from "./types/request";
import { AuthResponse, EventResponse, Response } from "./types/response";
import { AppInfo, Entity, EventType } from "./types/types";

import makeDebug from "./debug";
import { sleep } from "./utils";
const debug = makeDebug("connection");

export enum ConnectionState {
  Initializing = "initializing",
  WaitingAuth = "waitingAuth",
  Accepted = "accepted",
  Refused = "refused",
  Closed = "closed",
}

// TODO programmable timeouts
const AUTH_TIMEOUT = 30000;
const METHOD_TIMEOUT = 20000;
const BLOCK_TIMEOUT = 20000;
const INTERVAL = 100;

export default class Connection {
  websocket: WebSocket | undefined;
  ip = "localhost";
  port = 44326;
  state = ConnectionState.Initializing;
  responses: { [id: number]: null | any } = {};
  events = {
    new_topoheight: {
      processed: true,
      value: 0,
    },
    new_balance: {
      processed: true,
      value: 0,
    },
    new_entry: {
      processed: true,
      value: "",
    },
  };
  appInfo: AppInfo;
  id = 1;
  buffer: string = "";

  constructor(appInfo: AppInfo) {
    this.appInfo = appInfo;
  }

  async initialize() {
    return new Promise<boolean>((resolve, reject) => {
      debug("initialize");
      if (
        this.websocket !== undefined &&
        this.websocket.readyState == WebSocket.OPEN
      ) {
        throw "WebSocket is aleady alive";
      }
      this.state = ConnectionState.Initializing;

      try {
        const url = `ws://${this.ip}:${this.port}/xswd`;
        this.websocket = new WebSocket(url);
        debug("websocket created for " + url);
      } catch (e) {
        reject(e);
        return;
      }

      this.websocket.onmessage = (message) => {
        let data:
          | AuthResponse
          | EventResponse
          | Response<Entity, Method<Entity>, "error">
          | Response<Entity, Method<Entity>, "result">;

        // fragmented messages handling
        try {
          // default parsing a single message
          data = JSON.parse(message.data.toString());
        } catch (error) {
          // sometimes the result is split in multiple message so we need to buffer
          this.buffer = this.buffer + message.data.toString();
          try {
            // we keep parsing the buffer after updating it to check if the result is complete
            data = JSON.parse(this.buffer);
            // success => we empty the buffer
            this.buffer = "";
          } catch (error) {
            // not parsable yet, better luck next message
            return;
          }
        }

        if ("accepted" in data) {
          if (data.accepted === true) {
            this.state = ConnectionState.Accepted;
            debug("connection accepted");
            resolve(true);
          } else if (data.accepted === false) {
            this.state = ConnectionState.Refused;
            debug("connection refused", data);
            resolve(false);
          }
        } else if ("error" in data) {
          const errorData: Response<Entity, Method<Entity>, "error"> = data;
          console.error(errorData.error.message);
          resolve(false);
          this.handle(data);
        } else if ("result" in data) {
          if (
            typeof data.result == "object" &&
            data.result !== null &&
            "event" in data.result
          ) {
            this.handleEvent(data as EventResponse);
          } else {
            this.handle(data);
          }
        }
      };

      this.websocket.onerror = (error) => {
        this.state = ConnectionState.Closed;
        console.error(error);
        reject(error);
      };

      this.websocket.onopen = () => {
        debug("websocket connection opened, authorizing...");
        this.authorize(this.appInfo);
        this.state = ConnectionState.WaitingAuth;
        setTimeout(() => reject("authorisation timeout"), AUTH_TIMEOUT);
      };

      this.websocket.onclose = () => {
        this.state = ConnectionState.Initializing;
        this.websocket = undefined;
        debug("connection closed");
        resolve(false);
      };

      debug("websocket handlers are set");
    });
  }

  private authorize(appInfo: AppInfo) {
    const data = { ...appInfo };
    debug("sending authorisation: ", { data });
    this.websocket?.send(JSON.stringify(data));
  }
  private handle(data: any) {
    this.responses[Number(data.id)] = data;
  }

  private handleEvent(data: EventResponse) {
    this.events[data.result.event].value = data.result.value;
    this.events[data.result.event].processed = false;
  }

  send(
    entity: Entity,
    method: Method<typeof entity>,
    body: Omit<JSONRPCRequestBody<typeof entity, typeof method>, "id">
  ): number {
    console.error("\n\n----------- REQUEST -------", entity, method, "\n");
    if (this.state == ConnectionState.Accepted) {
      const id = this.id;
      this.id += 1;
      const bodyWithId: JSONRPCRequestBody<typeof entity, typeof method> = {
        ...body,
        id,
      };

      this.websocket?.send(JSON.stringify(bodyWithId));
      this.responses[id] = null;
      return id;
    } else {
      throw "sending without being connected";
    }
  }

  async sendSync<E extends Entity, M extends Method<E>>(
    entity: E,
    method: M,
    body: Omit<JSONRPCRequestBody<typeof entity, typeof method>, "id">,
    waitOnEvent?: EventType
  ): Promise<Response<E, M, "error"> | Response<E, M, "result">> {
    debug("sendSync:", { body });

    const id = this.send(entity, method, body);

    await this._checkResponse(id);
    const data = this.responses[id];
    console.warn(data);
    delete this.responses[id];
    if (waitOnEvent) {
      await this._checkEvent(waitOnEvent);
    }
    return data;
  }

  private _checkResponse(id: number) {
    return new Promise<void>(async (resolve, reject) => {
      setTimeout(() => reject("request timeout"), METHOD_TIMEOUT);
      for (let attempts = 1; ; attempts++) {
        await sleep(INTERVAL * attempts); // double the time at each new attempts
        debug("checking response", id);

        if (this.responses[id] !== null && this.responses[id] !== undefined) {
          debug(`response ${id}`, this.responses[id]);

          resolve();
        }
      }
    });
  }

  _checkEvent(eventType: EventType) {
    return new Promise<any>(async (resolve, reject) => {
      setTimeout(() => reject("event check timeout"), BLOCK_TIMEOUT);
      for (let attempts = 1; ; attempts++) {
        await sleep(INTERVAL * attempts); // double the time at each new attempts
        debug("checking event", eventType);

        if (!this.events[eventType].processed) {
          this.events[eventType].processed = true;
          debug("checked event", eventType);
          resolve(this.events[eventType].value);
        }
      }
    });
  }
}
