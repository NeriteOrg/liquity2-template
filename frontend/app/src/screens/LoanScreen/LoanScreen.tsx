"use client";

import type { Dnum, PositionLoanCommitted } from "@/src/types";

import { useBreakpoint } from "@/src/breakpoints";
import { InlineTokenAmount } from "@/src/comps/Amount/InlineTokenAmount";
import { ErrorBox } from "@/src/comps/ErrorBox/ErrorBox";
import { Field } from "@/src/comps/Field/Field";
import { LinkTextButton } from "@/src/comps/LinkTextButton/LinkTextButton";
import { Screen } from "@/src/comps/Screen/Screen";
import content from "@/src/content";
import { WHITE_LABEL_CONFIG } from "@/src/white-label.config";
import { getBranchContract } from "@/src/contracts";
import { dnum18 } from "@/src/dnum-utils";
import { TROVE_EXPLORER_0, TROVE_EXPLORER_1 } from "@/src/env";
import { fmtnum, formatDate } from "@/src/formatting";
import { getCollToken, getPrefixedTroveId, parsePrefixedTroveId, useLoan } from "@/src/liquity-utils";
import { usePrice } from "@/src/services/Prices";
import { useStoredState } from "@/src/services/StoredState";
import { useTransactionFlow } from "@/src/services/TransactionFlow";
import { isPrefixedtroveId } from "@/src/types";
import { useAccount } from "@/src/wagmi-utils";
import { css } from "@/styled-system/css";
import { addressesEqual, Button, HFlex, IconExternal, InfoTooltip, Tabs, TextButton, TokenIcon, Tooltip, VFlex } from "@liquity2/uikit";
import { a, useTransition } from "@react-spring/web";
import * as dn from "dnum";
import { notFound, useRouter, useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { useState } from "react";
import { match, P } from "ts-pattern";
import { zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { LoanScreenCard } from "./LoanScreenCard";
import { PanelClosePosition } from "./PanelClosePosition";
import { PanelInterestRate } from "./PanelInterestRate";
import { PanelUpdateBorrowPosition } from "./PanelUpdateBorrowPosition";
import { PanelUpdateLeveragePosition } from "./PanelUpdateLeveragePosition";

const troveExplorers = [
  ...(TROVE_EXPLORER_0 ? [TROVE_EXPLORER_0] : []),
  ...(TROVE_EXPLORER_1 ? [TROVE_EXPLORER_1] : []),
];

function TroveExplorerLink(props: {
  troveExplorer: { name: string; url: string };
  collTokenName: string;
  troveId: bigint;
  last?: boolean;
}) {
  const href = props.troveExplorer.url
    .replace("{branch}", props.collTokenName)
    .replace("{troveId}", props.troveId.toString());

  return (
    <LinkTextButton
      label={<>{props.troveExplorer.name} {props.last && <IconExternal size={16} />}</>}
      href={href}
      external
    />
  );
}

const TABS = [
  {
    label: "Update Loan",
    labelCompact: "Update",
    id: "colldebt",
  },
  {
    label: "Interest rate",
    labelCompact: "Rate",
    id: "rate",
  },
  {
    label: "Close loan",
    labelCompact: "Close",
    id: "close",
  },
];

export type LoanLoadingState =
  | "error"
  | "loading"
  | "not-found"
  | "success";

export function LoanScreen() {
  const router = useRouter();
  const action = useSelectedLayoutSegment() ?? "colldebt";
  const searchParams = useSearchParams();
  const paramPrefixedId = searchParams.get("id");
  const storedState = useStoredState();

  const [compactMode, setCompactMode] = useState(false);
  useBreakpoint(({ medium }) => {
    setCompactMode(!medium);
  });

  if (!isPrefixedtroveId(paramPrefixedId)) {
    notFound();
  }
  const { troveId, branchId } = parsePrefixedTroveId(paramPrefixedId);

  const loan = useLoan(branchId, troveId);
  const loanMode = storedState.loanModes[paramPrefixedId] ?? loan.data?.type ?? "borrow";

  const collToken = getCollToken(loan.data?.branchId ?? null);
  const collPriceUsd = usePrice(collToken?.symbol ?? null);

  const fullyRedeemed = loan.data
    && loan.data.status === "redeemed"
    && dn.eq(loan.data.indexedDebt, 0);

  const isLiquidated = loan.data?.status === "liquidated";
  const account = useAccount();

  const collSurplus = useReadContract({
    ...getBranchContract(branchId, "CollSurplusPool"),
    functionName: "getCollateral",
    args: [loan.data?.borrower ?? zeroAddress],
    query: {
      enabled: Boolean(loan.data?.borrower && isLiquidated),
      select: dnum18,
    },
  });

  const loadingState = match([
    loan,
    collPriceUsd.data ?? null,
    // only include collSurplus in loading check if the loan is liquidated
    isLiquidated ? collSurplus : { status: "success" },
  ])
    .returnType<LoanLoadingState>()
    .with(
      P.union(
        [P.any, null, P.any],
        [{ status: "pending" }, P.any, P.any],
        [{ fetchStatus: "fetching", data: null }, P.any, P.any],
        [P.any, P.any, { status: "pending" }],
        [P.any, P.any, { fetchStatus: "fetching", data: undefined }],
      ),
      () => "loading",
    )
    .with([{ status: "error" }, P.any, P.any], () => "error")
    .with([P.any, P.any, { status: "error" }], () => "error")
    .with([{ data: null }, P.any, P.any], () => "not-found")
    .with([{ data: P.nonNullable }, P.any, P.any], () => "success")
    .otherwise(() => "error");

  const contentTransition = useTransition(loadingState, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      mass: 1,
      tension: 2000,
      friction: 120,
    },
  });

  const modeTransition = useTransition(loanMode, {
    from: { translateY: 0 },
    enter: { translateY: 0 },
    leave: { translateY: 0 },
    config: {
      mass: 1,
      tension: 2000,
      friction: 120,
    },
    immediate: true,
  });

  return (
    <Screen
      ready={loadingState === "success"}
      back={{
        href: "/",
        label: "Back",
      }}
      heading={
        <LoanScreenCard
          collateral={collToken}
          collPriceUsd={collPriceUsd.data ?? null}
          loadingState={loadingState}
          loan={loan.data ?? null}
          mode={loanMode}
          onLeverageModeChange={() => {
            storedState.setState(({ loanModes }) => {
              return {
                loanModes: {
                  ...loanModes,
                  [paramPrefixedId]: loanMode === "borrow" ? "multiply" : "borrow",
                },
              };
            });
          }}
          onRetry={() => {
            loan.refetch();
          }}
          troveId={troveId}
        />
      }
    >
      {contentTransition((style, contentStatus) => {
        if (contentStatus === "error") {
          return (
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                gap: 32,
                width: "100%",
                padding: "32px 0",
              })}
            >
              <ErrorBox title="Failed to load loan data">
                <VFlex gap={16}>
                  <div>
                    We encountered an error while loading the loan position details.
                    This could be due to network issues or temporary service unavailability.
                  </div>
                  <div>
                    Please try the following:
                  </div>
                  <ul className={css({ paddingLeft: 20, listStyleType: "disc" })}>
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Try again in a few moments</li>
                  </ul>
                  <HFlex gap={8}>
                    <TextButton
                      label="Retry"
                      onClick={() => {
                        loan.refetch();
                        if (isLiquidated) {
                          collSurplus.refetch();
                        }
                      }}
                    />
                    <TextButton
                      label="Go back"
                      onClick={() => router.push("/")}
                    />
                  </HFlex>
                </VFlex>
              </ErrorBox>
            </div>
          );
        }

        if (contentStatus === "not-found") {
          return (
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                gap: 32,
                width: "100%",
                padding: "32px 0",
              })}
            >
              <ErrorBox title="Loan position not found">
                <VFlex gap={16}>
                  <div>
                    The loan position you're looking for doesn't exist or may have been closed.
                  </div>
                  <div>
                    Possible reasons:
                  </div>
                  <ul className={css({ paddingLeft: 20, listStyleType: "disc" })}>
                    <li>The loan has been fully repaid and closed</li>
                    <li>The position ID is incorrect</li>
                    <li>The position was liquidated</li>
                  </ul>
                  <HFlex gap={8}>
                    <Button
                      label="Go to dashboard"
                      mode="primary"
                      size="medium"
                      onClick={() => router.push("/")}
                    />
                  </HFlex>
                </VFlex>
              </ErrorBox>
            </div>
          );
        }

        if (contentStatus === "loading") {
          return (
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                gap: 32,
                width: "100%",
                padding: "32px 0",
              })}
            >
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 200,
                })}
              >
                <div className={css({ fontSize: 18, color: "contentAlt" })}>
                  Loading loan position...
                </div>
              </div>
            </div>
          );
        }

        return contentStatus === "success" && (
          // this <div> is only needed to prevent a warning when contentTransition
          // would otherwise try to pass a ref to a fragment (for internal tracking),
          // which is not allowed
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              width: "100%",
            })}
          >
            {loan.data && (
              modeTransition((modeStyle) => (
                loan.data && (
                  <a.div
                    className={css({
                      display: "flex",
                      flexDirection: "column",
                      gap: 32,
                    })}
                    style={{
                      opacity: style.opacity,
                      translateY: modeStyle.translateY,
                    }}
                  >
                    {loan.data.status === "liquidated"
                      ? (
                        <ClaimCollateralSurplus
                          accountAddress={account.address ?? null}
                          collSurplus={collSurplus.data ?? null}
                          loan={loan.data}
                        />
                      )
                      : (
                        <>
                          {loan.data.status === "redeemed" && (
                            <div
                              className={css({
                                display: "flex",
                                flexDirection: "column",
                                padding: 16,
                                gap: 8,
                                background: "infoSurface",
                                border: "1px solid token(colors.infoSurfaceBorder)",
                                borderRadius: 8,
                              })}
                            >
                              <p
                                className={css({
                                  display: "flex",
                                  gap: 8,
                                })}
                              >
                                {fullyRedeemed
                                  ? <>Loan fully redeemed.</>
                                  : <>Loan partially redeemed.</>}
                                <InfoTooltip content={content.generalInfotooltips.redeemedLoan} />
                              </p>

                              <p>
                                {loan.data.redemptionCount}{" "}
                                {loan.data.redemptionCount === 1 ? <>redemption</> : <>redemptions</>}{" "}
                                {loan.data.lastUserActionAt > 0 ? (
                                  <>
                                    since last user action on{" "}
                                    <time
                                      dateTime={formatDate(new Date(loan.data.lastUserActionAt), "iso")}
                                      title={formatDate(new Date(loan.data.lastUserActionAt), "iso")}
                                    >
                                      {formatDate(new Date(loan.data.lastUserActionAt), "short")}
                                    </time>.
                                  </>
                                ) : (
                                  <>since opening.</>
                                )}
                                <br />
                                <InlineTokenAmount
                                  symbol={WHITE_LABEL_CONFIG.tokens.mainToken.symbol}
                                  value={loan.data.redeemedDebt}
                                  suffix={` ${WHITE_LABEL_CONFIG.tokens.mainToken.symbol}`}
                                />{" "}
                                repaid in exchange for{" "}
                                <InlineTokenAmount
                                  symbol={collToken?.symbol}
                                  value={loan.data.redeemedColl}
                                  suffix={` ${collToken?.name}`}
                                />.
                              </p>

                              {collToken && troveExplorers.length > 0 && (
                                <p>
                                  See Loan History on {troveExplorers[0] && troveExplorers[1]
                                    ? (
                                      <>
                                        <TroveExplorerLink
                                          troveExplorer={troveExplorers[0]}
                                          collTokenName={collToken.name}
                                          troveId={BigInt(troveId)}
                                        />{" "}
                                        or{" "}
                                        <TroveExplorerLink
                                          troveExplorer={troveExplorers[1]}
                                          collTokenName={collToken.name}
                                          troveId={BigInt(troveId)}
                                          last
                                        />
                                      </>
                                    )
                                    : troveExplorers[0] && (
                                      <TroveExplorerLink
                                        troveExplorer={troveExplorers[0]}
                                        collTokenName={collToken.name}
                                        troveId={BigInt(troveId)}
                                        last
                                      />
                                    )}
                                </p>
                              )}
                            </div>
                          )}
                          <Tabs
                            items={TABS.map(({ label, labelCompact, id }) => ({
                              label: compactMode ? labelCompact : label,
                              panelId: `p-${id}`,
                              tabId: `t-${id}`,
                            }))}
                            selected={TABS.findIndex(({ id }) => id === action)}
                            onSelect={(index) => {
                              if (!loan.data) {
                                return;
                              }
                              const tab = TABS[index];
                              if (!tab) {
                                throw new Error("Invalid tab index");
                              }
                              const id = getPrefixedTroveId(
                                loan.data.branchId,
                                loan.data.troveId,
                              );
                              router.push(
                                `/loan/${tab.id}?id=${id}`,
                                { scroll: false },
                              );
                            }}
                          />

                          {action === "colldebt" && (
                            loanMode === "multiply"
                              ? <PanelUpdateLeveragePosition loan={loan.data} />
                              : <PanelUpdateBorrowPosition loan={loan.data} />
                          )}
                          {action === "rate" && <PanelInterestRate loan={loan.data} />}
                          {action === "close" && <PanelClosePosition loan={loan.data} />}
                        </>
                      )}
                  </a.div>
                )
              ))
            )}
          </div>
        );
      })}
    </Screen>
  );
}

function ClaimCollateralSurplus({
  accountAddress,
  collSurplus,
  loan,
}: {
  accountAddress: null | `0x${string}`;
  collSurplus: null | Dnum;
  loan: PositionLoanCommitted;
}) {
  const txFlow = useTransactionFlow();
  const collToken = getCollToken(loan.branchId);
  const collPriceUsd = usePrice(collToken.symbol);

  const collSurplusUsd = collPriceUsd.data && collSurplus
    ? dn.mul(collSurplus, collPriceUsd.data)
    : null;

  const isOwner = accountAddress && (
    addressesEqual(accountAddress, loan.borrower)
  );

  if (!collSurplus || dn.eq(collSurplus, 0)) {
    return null;
  }

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 40,
      })}
    >
      <section
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "12px 16px",
          fontSize: 16,
          color: "negativeInfoSurfaceContentAlt",
          background: "negativeInfoSurface",
          border: "1px solid token(colors.negativeInfoSurfaceBorder)",
          borderRadius: 8,
        })}
      >
        <h1
          className={css({
            color: "negativeInfoSurfaceContent",
          })}
        >
          This loan has been liquidated
        </h1>
        <div>
          <>
            The collateral has been deducted from this position.
          </>
          {isOwner && (
            <>
              You can claim back the excess collateral accross your liquidated {collToken.name} loans.
            </>
          )}
        </div>
      </section>
      <Field
        label="Remaining collateral"
        field={
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: 16,
              justifyContent: "space-between",
            })}
          >
            <div
              className={css({
                display: "flex",
                gap: 16,
                fontSize: 28,
                lineHeight: 1,
              })}
            >
              <div>{fmtnum(collSurplus ?? 0)}</div>
            </div>
            <div>
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 16px 0 8px",
                  fontSize: 24,
                  background: "fieldSurface",
                  borderRadius: 20,
                  userSelect: "none",
                })}
              >
                <TokenIcon symbol={collToken.symbol} />
                <div>{collToken.name}</div>
              </div>
            </div>
          </div>
        }
        footer={{
          start: (
            <Field.FooterInfo
              label={fmtnum(collSurplusUsd, { preset: "2z", prefix: "$" })}
              value={null}
            />
          ),
        }}
      />
      {isOwner && (() => {
        const shouldShowTooltip = !collSurplus || dn.eq(collSurplus, 0);
        const button = (
          <Button
            disabled={!collSurplus || dn.eq(collSurplus, 0) || !isOwner}
            mode="primary"
            size="large"
            label="Claim remaining collateral"
            onClick={() => {
              if (accountAddress) {
                txFlow.start({
                  flowId: "claimCollateralSurplus",
                  backLink: [
                    `/loan?id=${loan.branchId}:${loan.troveId}`,
                    "Back to the loan",
                  ],
                  successLink: ["/", "Go to the dashboard"],
                  successMessage: "The loan position has been closed successfully.",
                  borrower: loan.borrower,
                  branchId: loan.branchId,
                  collSurplus: collSurplus ?? dnum18(0),
                });
              }
            }}
          />
        );

        return shouldShowTooltip ? (
          <Tooltip
            opener={({ buttonProps, setReference }) => (
              <span ref={setReference} {...buttonProps}>
                {button}
              </span>
            )}
          >
            <div style={{ padding: "8px", fontSize: 14 }}>
              {!collSurplus
                ? "No collateral surplus available"
                : dn.eq(collSurplus, 0)
                ? "All collateral has been claimed"
                : ""}
            </div>
          </Tooltip>
        ) : button;
      })()}
    </div>
  );
}
