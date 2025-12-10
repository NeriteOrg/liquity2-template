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

    const prices: PricesResponse["prices"] = {
      EVRO: "1",
      WXDAI: "1",
      GNO: parsed.gnosis?.usd.toString() ?? "0",
      SDAI: parsed["savings-xdai"]?.usd.toString() ?? "0",
      WWBTC: parsed["wrapped-bitcoin"]?.usd.toString() ?? "0",
      OSGNO: parsed["stakewise-staked-gno-2"]?.usd.toString() ?? "0",
    };

    const body: PricesResponse = PricesSchema.parse({ prices });

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": getCacheControlHeader(FIVE_MIN_SECONDS),
      },
    });
  } catch (error) {
    console.error("[/api/prices] CoinGecko fetch failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch prices" },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
