export type LiveTradeData = {
  p: number;
  t: number;
  v: number;
};

class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: WebSocket;
  private prices: Record<string, LiveTradeData>;

  public constructor() {
    this.prices = {};
    this.socket = new WebSocket(
      `wss://ws.finnhub.io?token=${process.env.NEXT_PUBLIC_FINNHUB_KEY_2}`
    );
    this.socket.addEventListener("message", this.messageHandler);
    this.socket.addEventListener("error", (error) => console.error("WebSocket error:", error));
  }

  static getInstance() {
    if (this.instance) return this.instance;
    this.instance = new WebSocketManager();
    return this.instance;
  }

  public addSubListener(tickerList: string[]) {
    this.socket.addEventListener("open", () => this.subscribe(tickerList));
  }

  private subscribe(tickerList: string[]) {
    tickerList.forEach((ticker) => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "subscribe", symbol: ticker }));
      }
    });
  }

  public unsubscribe(ticker: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: "unsubscribe", symbol: ticker }));
      this.prices = {};
    }
  }

  private parseTradeMessage = (trades: LiveTradeData[]) => {
    let totalVolume = 0;
    let largestTimestamp = 0;
    let totalPrice = 0;
    let count = 0;
    trades.forEach((trade) => {
      totalVolume += trade.v;
      if (trade.t > largestTimestamp) largestTimestamp = trade.t;
      totalPrice += trade.p;
      count += 1;
    });
    const averagePrice = parseFloat((totalPrice / count).toFixed(2));
    return { t: largestTimestamp, p: averagePrice, v: totalVolume };
  };

  private messageHandler = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "trade") {
        const trades = message.data;
        const parsed = this.parseTradeMessage(trades);
        this.prices[trades[0].s] = { t: parsed.t, p: parsed.p, v: parsed.v };
      }
    } catch (error) {
      console.error("Error parsing message data: ", error);
    }
  };

  public getLatestTrade(ticker: string): LiveTradeData {
    return this.prices[ticker] ?? { p: 0, t: 0, v: 0 };
  }
}

export default WebSocketManager;
