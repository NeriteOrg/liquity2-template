import { NextResponse } from "next/server";
import { z } from "zod";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price" +
  "?ids=gnosis,savings-xdai,wrapped-bitcoin,stakewise-staked-gno-2" +
  "&vs_currencies=usd";

const FIVE_MIN_SECONDS = 5 * 60;

const CoinGeckoSimplePriceSchema = z.object({
  gnosis: z.object({ usd: z.number() }).optional(),
  "savings-xdai": z.object({ usd: z.number() }).optional(),
  "wrapped-bitcoin": z.object({ usd: z.number() }).optional(),
  "stakewise-staked-gno-2": z.object({ usd: z.number() }).optional(),
});

const PricesSchema = z.object({
  prices: z.object({
    EVRO: z.string(),
    WXDAI: z.string(),
    GNO: z.string(),
    SDAI: z.string(),
    WWBTC: z.string(),
    OSGNO: z.string(),
  }),
});

type PricesResponse = z.infer<typeof PricesSchema>;

function getCacheControlHeader(seconds: number) {
  return `public, s-maxage=${seconds}, max-age=${seconds}, stale-while-revalidate=60`;
}

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, {
      next: { revalidate: FIVE_MIN_SECONDS },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const parsed = CoinGeckoSimplePriceSchema.parse(json);

    if (
      parsed.gnosis?.usd === undefined ||
      parsed["savings-xdai"]?.usd === undefined ||
      parsed["wrapped-bitcoin"]?.usd === undefined ||
      parsed["stakewise-staked-gno-2"]?.usd === undefined
    ) {
      throw new Error("Missing required price(s) from CoinGecko response");
    }
    const prices: PricesResponse["prices"] = {
      EVRO: "1",
      WXDAI: "1",
      GNO: parsed.gnosis.usd.toString(),
      SDAI: parsed["savings-xdai"].usd.toString(),
      WWBTC: parsed["wrapped-bitcoin"].usd.toString(),
      OSGNO: parsed["stakewise-staked-gno-2"].usd.toString(),
    };

    const body: PricesResponse = { prices };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": getCacheControlHeader(FIVE_MIN_SECONDS),
      },
    });
  } catch (error) {
    console.error("[/api/prices] CoinGecko fetch failed:", error);

    let errorType = "unknown";
    let errorMessage = "Failed to fetch prices";
    if (error instanceof z.ZodError) {
      errorType = "validation_error";
      errorMessage = error.message;
    } else if (error instanceof Error) {
      if (error.message.startsWith("CoinGecko error:")) {
        errorType = "coingecko_api_error";
        errorMessage = error.message;
      } else {
        errorType = "network_or_internal_error";
        errorMessage = error.message;
      }
    }
    return NextResponse.json(
      {
        error: "Failed to fetch prices",
        errorType,
        errorMessage,
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
