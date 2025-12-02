/**
 * WHITE-LABEL CONFIGURATION
 *
 * This is the master configuration file for customizing the platform for different clients.
 * When creating a new fork, update all values in this file according to the client's requirements.
 */

export const WHITE_LABEL_CONFIG = {
  brandColors: {
    primary: "black:700" as const, // #1d1c1f (shark dark)
    primaryContent: "white" as const,
    primaryContentAlt: "gray:300" as const,

    secondary: "silver:100" as const,
    secondaryContent: "black:700" as const,
    secondaryContentAlt: "black:400" as const,

    accent1: "evro:orange" as const, // #efa960 (Evro brand orange)
    accent1Content: "white" as const,
    accent1ContentAlt: "white" as const,

    accent2: "evro:blue" as const, // #7176ca (vivid blue for CTAs/links)
    accent2Content: "white" as const,
    accent2ContentAlt: "evro:blueLight" as const,
  },

  // ===========================
  // TYPOGRAPHY
  // ===========================
  typography: {
    // Font family for CSS (used in Panda config)
    fontFamily: "Oswald, Lexend Zetta, sans-serif",
    // Next.js font import name (should match the import)
    fontImport: "Oswald, Lexend Zetta" as const,
  },

  // ===========================
  // UNIFIED TOKENS CONFIGURATION
  // ===========================
  tokens: {
    // Main protocol stablecoin
    mainToken: {
      name: "EVRO",
      symbol: "EVRO" as const,
      ticker: "EVRO",
      decimals: 18,
      description: "Euro-pegged stablecoin by EVRO Finance",
      icon: "main-token",
      // Core protocol contracts (deployment addresses TBD)
      deployments: {
        100: {
          token: "0x08b8a74e622f810ef67e4850c102b3093627f630",
          collateralRegistry: "0x78f975dafc51ffce9eda2e6559adf742cf4fe518",
          governance: "0x09d5bd4a4f1da1a965fe24ea54bce3d37661e056",
          hintHelpers: "0x619f3e62aad50f647f445ab1de8daaf0e60362fd",
          multiTroveGetter: "0x593c9d9fd8320a2392404fc7b0b581f2fb54d0ba",
          exchangeHelpers: "0x0000000000000000000000000000000000000000",
        },
      },
    },

    evro: {
      name: "EVRO",
      symbol: "EVRO" as const,
      ticker: "EVRO",
      icon: "evro",
      decimals: 18,
      description: "Euro-pegged stablecoin by EVRO Finance",
      deployments: {
        100: {
          token: "0x08b8a74e622f810ef67e4850c102b3093627f630",
          collateralRegistry: "0x78f975dafc51ffce9eda2e6559adf742cf4fe518",
          governance: "0x09d5bd4a4f1da1a965fe24ea54bce3d37661e056",
          hintHelpers: "0x619f3e62aad50f647f445ab1de8daaf0e60362fd",
          multiTroveGetter: "0x593c9d9fd8320a2392404fc7b0b581f2fb54d0ba",
          exchangeHelpers: "0x0000000000000000000000000000000000000000",
        },
      },
    },

    // Governance token (exists but no functionality at launch)
    governanceToken: {
      name: "EVRO Governance Token",
      symbol: "GOV" as const,
      ticker: "GOV",
      icon: "main-token",
      // Only used as collateral, no governance features
      deployments: {
        100: {
          token: "0x0000000000000000000000000000000000000000",
          staking: "0x0",
        },
      },
    },

    // Collateral tokens (for borrowing) - Multi-chain support
    collaterals: [
      {
        symbol: "WXDAI" as const,
        name: "wxDAI",
        icon: "wxdai",
        collateralRatio: 1.1, // 110% MCR
        maxDeposit: "100000000", // $100M initial debt limit
        maxLTV: 0.9091, // 90.91% max LTV
        deployments: {
          100: {
            collToken: "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
            leverageZapper: "0x0000000000000000000000000000000000000000",
            stabilityPool: "0x172b2bb699c354a8758075b00c121126a4a6ee18",
            troveManager: "0x9c7987c8bed7a669b6857f014459e0e98ebd723d",
          },
        },
      },
      {
        symbol: "GNO" as const,
        name: "Gnosis",
        icon: "gno",
        collateralRatio: 1.4, // 140% MCR
        maxDeposit: "25000000", // $25M initial debt limit
        maxLTV: 0.7143, // 71.43% max LTV
        deployments: {
          100: {
            collToken: "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
            leverageZapper: "0x0000000000000000000000000000000000000000",
            stabilityPool: "0x7cb2a8624f3bbc25c46d251d097ce971840eb0a5",
            troveManager: "0x7e3f9edf299aa789e7b69af6d4f3c599ccaac4e6",
          },
        },
      },
      {
        symbol: "SDAI" as const,
        name: "Savings xDAI",
        icon: "sdai",
        collateralRatio: 1.3, // 130% MCR
        maxDeposit: "25000000", // $25M initial debt limit
        maxLTV: 0.7692, // 76.92% max LTV
        deployments: {
          100: {
            collToken: "0xaf204776c7245bf4147c2612bf6e5972ee483701",
            leverageZapper: "0x0000000000000000000000000000000000000000",
            stabilityPool: "0x4feb230c602a813674f261072ea2d31115ce1ab3",
            troveManager: "0x5c21c09b120907262824a542d4cfd818e9e1a32f",
          },
        },
      },
      {
        symbol: "WWBTC" as const,
        name: "Gnosis xDai Bridged WBTC",
        icon: "wwbtc",
        collateralRatio: 1.15, // 115% MCR
        maxDeposit: "25000000", // $25M initial debt limit
        maxLTV: 0.8696, // 86.96% max LTV
        deployments: {
          100: {
            collToken: "0x95c0302bd25fb04258377d280e3d7f9c96d7b407",
            leverageZapper: "0x0000000000000000000000000000000000000000",
            stabilityPool: "0xf653fa22fa6e4d982db4f084e54ad0f39cbf73b3",
            troveManager: "0x0b99b1a449160af496d4b50885c08d11704f2583",
          },
        },
      },
      {
        symbol: "OSGNO" as const,
        name: "StakeWise Staked GNO",
        icon: "osgno",
        collateralRatio: 1.4, // 140% MCR
        maxDeposit: "25000000", // $25M initial debt limit
        maxLTV: 0.7143, // 71.43% max LTV
        deployments: {
          100: {
            collToken: "0xf490c80aae5f2616d3e3bda2483e30c4cb21d1a0",
            leverageZapper: "0x0000000000000000000000000000000000000000",
            stabilityPool: "0x434696ce4b3c3d02e82931c37de7b9a8fa208fbd",
            troveManager: "0x4d83ac3a1131c6ca5b0add168bde6d24a3ad889a",
          },
        },
      },
    ],

    // Other tokens in the protocol
    otherTokens: {
      // ETH for display purposes
      eth: {
        symbol: "ETH" as const,
        name: "ETH",
        icon: "eth",
      },
      // SBOLD - yield-bearing version of the main token
      sbold: {
        symbol: "SBOLD" as const,
        name: "sEVRO Token",
        icon: "sbold",
      },
      // Staked version of main token
      staked: {
        symbol: "sEVRO" as const,
        name: "Staked EVRO",
        icon: "main-token",
      },
      lusd: {
        symbol: "LUSD" as const,
        name: "LUSD",
        icon: "legacy-stablecoin",
      },
    },
  },

  // ===========================
  // BRANDING & CONTENT
  // ===========================
  branding: {
    // Core app identity
    appName: "EVRO Portal", // Full app name for titles, about pages
    brandName: "EVRO", // Core brand name for protocol/version references
    appTagline: "Multi-chain stablecoin protocol",
    appDescription: "Borrow EVRO against multiple collateral types",
    appUrl: "https://app.evro.finance/",

    // External links
    links: {
      docs: {
        base: "https://docs.evro.finance/",
        redemptions: "https://docs.evrofinance.com/redemptions",
        liquidations: "https://docs.evro.finance/liquidations",
        delegation: "https://docs.evro.finance/delegation",
        interestRates: "https://docs.evro.finance/interest-rates",
        earn: "https://docs.evro.finance/earn",
        staking: "https://docs.evro.finance/staking",
      },
      dune: "https://dune.com/evrofinance",
      discord: "https://discord.gg/evrofinance",
      github: "https://github.com/evrofinance/evrofinance",
      x: "https://x.com/evrofinance",
      friendlyForkProgram: "https://evro.finance/ecosystem",
    },

    // Feature flags and descriptions
    // features: {
    //   showV1Legacy: false, // No V1 legacy content
    //   friendlyFork: {
    //     enabled: true,
    //     title: "Learn more about the Friendly Fork Program",
    //     description: "A program for collaborative protocol development",
    //   },
    // },

    // Navigation configuration
    navigation: {
      showBorrow: true,
      showEarn: true,
      showStake: false,
    },

    // Menu labels (can be customized per deployment)
    menu: {
      dashboard: "Dashboard",
      borrow: "Borrow",
      multiply: "Multiply",
      earn: "Earn",
      stake: "Stake",
    },

    // Common UI text
    ui: {
      connectWallet: "Connect",
      wrongNetwork: "Wrong network",
      loading: "Loading...",
      error: "Error",
    },
  },

  // ===========================
  // EARN POOLS CONFIGURATION
  // ===========================
  earnPools: {
    enableStakedMainToken: false,

    // Enable/disable stability pools for collaterals
    enableStabilityPools: true,

    // Custom pools configuration (beyond collateral stability pools)
    customPools: [] as Array<{
      symbol: string;
      name: string;
      enabled: boolean;
    }>,
  },
};

// Type exports for TypeScript support
export type WhiteLabelConfig = typeof WHITE_LABEL_CONFIG;

// Utility functions for dynamic configuration
export function getAvailableEarnPools() {
  const pools: Array<{
    symbol: string;
    name: string;
    type: "stability" | "staked" | "custom";
  }> = [];

  // Add stability pools for enabled collaterals
  if (WHITE_LABEL_CONFIG.earnPools.enableStabilityPools) {
    WHITE_LABEL_CONFIG.tokens.collaterals.forEach((collateral) => {
      pools.push({
        symbol: collateral.symbol.toLowerCase(),
        name: `${collateral.name} Stability Pool`,
        type: "stability",
      });
    });
  }

  // Add custom pools
  WHITE_LABEL_CONFIG.earnPools.customPools.forEach((pool) => {
    if (pool.enabled) {
      pools.push({
        symbol: pool.symbol.toLowerCase(),
        name: pool.name,
        type: "custom",
      });
    }
  });

  return pools;
}

export function getEarnPoolSymbols() {
  return getAvailableEarnPools().map((pool) => pool.symbol);
}

export function getCollateralSymbols() {
  return WHITE_LABEL_CONFIG.tokens.collaterals.map((collateral) =>
    collateral.symbol.toLowerCase()
  );
}
