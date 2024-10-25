# birdeye
birdeye api


work in progress. 

Get api key here: 
https://docs.birdeye.so/docs/authentication-api-keys 

API Reference: 
https://docs.birdeye.so/reference


# Usage Example


```ts
import "dotenv/config";
import { Birdeye } from "./src/birdeye";
import moment from "moment";

async function test() {
  
  const b = new Birdeye(process.env.BIRDEYE_KEY ?? "");

  console.log(await b.networks());



  console.log(
    await b.defi_price({
      address: "So11111111111111111111111111111111111111112",
    })
  );

  console.log(
    await b.defi_price({
      address: "So11111111111111111111111111111111111111112",
      include_liquidity: true,
      check_liquidity: 100,
    })
  );

  // Token List	          /defi/tokenlist
  console.log(await b.defi_token_list());

  // Price - Historical	  /defi/history_price
  console.log(
    await b.defi_history_price({
      address: "So11111111111111111111111111111111111111112",
      address_type: "token",
      type: "15m",
      time_from: moment(new Date()).subtract(1, "days").toDate(),
      time_to: new Date(),
    })
  );

  // PREMIUM
  return;

  console.log(
    await b.defi_multi_price({
      list_address: [
        "So11111111111111111111111111111111111111112",
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      ],
      include_liquidity: true,
      check_liquidity: 100,
    })
  );
}

test();
```