import { z } from "zod";
import { uriencode } from "./uriencode";

const networks_zod = z.strictObject({
  success: z.boolean(),
  data: z.array(z.string()),
});

type Networks = z.infer<typeof networks_zod>;

const defi_price_zod = z.strictObject({
  success: z.boolean(),
  data: z.strictObject({
    value: z.number(),
    updateUnixTime: z.number(),
    updateHumanTime: z.coerce.date(),
    liquidity: z.number().optional(),
  }),
});

type DefiPrice = z.infer<typeof defi_price_zod>;

const token_list_zod = z.strictObject({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.strictObject({
    updateUnixTime: z.number(),
    updateTime: z.coerce.date(),
    tokens: z.array(
      z.strictObject({
        address: z.string(),
        decimals: z.number(),
        lastTradeUnixTime: z.number(),
        liquidity: z.number().optional(),
        logoURI: z.string(),
        mc: z.number(),
        name: z.string().nullable(),
        symbol: z.string().nullable(),
        v24hChangePercent: z.number().nullable(),
        v24hUSD: z.number(),
      })
    ),
    total: z.number(),
  }),
});

type TokenList = z.infer<typeof token_list_zod>;

const defi_history_price_zod = z.strictObject({
  success: z.boolean(),
  data: z.strictObject({
    items: z.array(
      z.strictObject({
        unixTime: z.number(),
        value: z.number(),
      })
    ),
  }),
});

type DefiHistoryPrice = z.infer<typeof defi_history_price_zod>;

const defi_multi_price_zod = z.strictObject({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .strictObject({
      value: z.number(),
      updateUnixTime: z.number(),
      updateHumanTime: z.coerce.date(),
      liquidity: z.number().optional(),
    })

    .array()
    .optional(),
});

type DefiMultiPrice = z.infer<typeof defi_multi_price_zod>;

/** API for https://docs.birdeye.so/reference
 * For free accounts you can only access the following endpoints:
 * - /defi/networks
 * - /defi/price
 * - /defi/tokenlist
 * - /defi/history_price
 */
export class Birdeye {
  private apikey: string;
  private headers: Record<string, string>;

  constructor(apikey: string) {
    this.apikey = apikey;
    this.headers = { accept: "application/json", "X-API-KEY": apikey };
  }

  /** Get a list of all supported networks. */
  public async networks(): Promise<{
    success: boolean;
    data: string[];
  }> {
    return await fetch("https://public-api.birdeye.so/defi/networks", {
      method: "GET",
      headers: this.headers,
    })
      .then((res) => res.json())
      .then((data) => networks_zod.parse(data));
  }

  /** Get price update of a token. */
  public async defi_price(props: {
    address: string;
    chain?: string;
    check_liquidity?: number;
    include_liquidity?: boolean;
  }): Promise<{
    success: boolean;
    data: {
      value: number;
      updateUnixTime: number;
      updateHumanTime: Date;
      liquidity?: number | undefined;
    };
  }> {
    return fetch(
      `https://public-api.birdeye.so/defi/price?${uriencode({
        address: props.address,
        check_liquidity: props.check_liquidity?.toString(),
        include_liquidity: props.include_liquidity?.toString(),
      })}`,
      {
        method: "GET",
        headers: {
          ...this.headers,
          "x-chain": props.chain ?? "solana",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => defi_price_zod.parse(data));
  }

  public async defi_token_list(props?: {
    /** Defaults to v24hUSD */
    sort_by?: "v24hUSD" | "mc" | "v24hChangePercent";
    /** Defaults to desc */
    sort_type?: "asc" | "desc";
    /** Defaults to 0 */
    offset?: number;
    /** Defaults to 100 */
    min_liquidity?: number;
    /** Defaults to solana */
    chain?: string;
  }): Promise<{
    success: boolean;
    data: {
      updateUnixTime: number;
      updateTime: Date;
      tokens: {
        symbol: string | null;
        address: string;
        decimals: number;
        lastTradeUnixTime: number;
        logoURI: string;
        mc: number;
        name: string | null;
        v24hChangePercent: number | null;
        v24hUSD: number;
        liquidity?: number | undefined;
      }[];
      total: number;
    };
    message?: string | undefined;
  }> {
    return fetch(
      `https://public-api.birdeye.so/defi/tokenlist?${uriencode({
        sort_by: props?.sort_by,
        sort_type: props?.sort_type,
        offset: props?.offset,
        min_liquidity: props?.min_liquidity,
      })}`,
      {
        method: "GET",
        headers: {
          ...this.headers,
          "x-chain": props?.chain ?? "solana",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return token_list_zod.parse(data);
      });
  }

  /** PREMIUM Get historical price line chart of a token. */
  public async defi_history_price(props: {
    address: string;
    address_type: "token" | "pair";
    type:
      | "1m"
      | "3m"
      | "5m"
      | "15m"
      | "30m"
      | "1H"
      | "2H"
      | "4H"
      | "6H"
      | "8H"
      | "12H"
      | "1D"
      | "3D"
      | "1W"
      | "1M";
    /** Specify the start time using Unix timestamps in seconds */
    time_from: Date;
    /** Specify the start time using Unix timestamps in seconds */
    time_to: Date;
    chain?: string;
  }): Promise<{
    success: boolean;
    data: {
      items: {
        value: number;
        unixTime: number;
      }[];
    };
  }> {
    return fetch(
      `https://public-api.birdeye.so/defi/history_price?${uriencode({
        address: props.address,
        address_type: props.address_type,
        type: props.type,
        time_from: Math.floor(props.time_from.getTime() / 1000),
        time_to: Math.floor(props.time_to.getTime() / 1000),
      })}`,
      {
        method: "GET",
        headers: { ...this.headers, "x-chain": props.chain ?? "solana" },
      }
    )
      .then((res) => res.json())
      .then((data) =>
        z
          .strictObject({
            success: z.boolean(),
            data: z.strictObject({
              items: z.array(
                z.strictObject({
                  unixTime: z.number(),
                  value: z.number(),
                })
              ),
            }),
          })
          .parse(data)
      );
  }

  /** PREMIUM Get price updates of multiple tokens in a single API call. Maximum 100 tokens */
  public async defi_multi_price(props: {
    list_address: string[];
    chain?: string;
    check_liquidity?: number;
    include_liquidity?: boolean;
  }): Promise<{
    success: boolean;
    message?: string | undefined;
    data?:
      | {
          value: number;
          updateUnixTime: number;
          updateHumanTime: Date;
          liquidity?: number | undefined;
        }[]
      | undefined;
  }> {
    return fetch(
      `https://public-api.birdeye.so/defi/multi_price?${uriencode({
        list_address: props.list_address.join(","),
        check_liquidity: props.check_liquidity?.toString(),
        include_liquidity: props.include_liquidity?.toString(),
      })}`,
      {
        method: "GET",
        headers: {
          ...this.headers,
          "x-chain": props.chain ?? "solana",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        return defi_multi_price_zod.parse(data);
      });
  }
}
