import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import swap_swap from "../assets/swap_swap.png";
import suiIcon from "../assets/sui_swap.png";
import usdcIcon from "../assets/usdc_swap.png";
import { AggregatorClient } from "@cetusprotocol/aggregator-sdk";

const TREASURY_IDS = {
  SUI: "0x6a8c7f91b5dd6a4a026bc8800d4903392eb18c18e60d5a89b454cd2c72470fd1",
  USDC: "0x989b2401f023c0b03ca22e23a0a8ab0d847af705018eab08594446a3a0d5c62a",
};

const FEE_MODULE_ADDRESS =
  "0xf6e33c23ef17c81796b8995b493e906a7446686a3dce763bb3259e2fe59df737";
const GAS_BUDGET = 50_000_000;

const aggregatorClient = new AggregatorClient({
  network: "mainnet",
});

const tokens = [
  {
    symbol: "SUI",
    icon: suiIcon,
    type: "0x2::sui::SUI",
    decimals: 9,
  },
  {
    symbol: "USDC",
    icon: usdcIcon,
    type: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    decimals: 6,
  },
];

function TokenSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedToken = tokens.find((t) => t.symbol === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center bg-white hover:bg-gray-50 shadow-sm px-3 py-2 border rounded-md w-full"
      >
        <div className="flex items-center gap-2">
          <img src={selectedToken.icon} alt="" className="w-5 h-5" />
          <span>{selectedToken.symbol}</span>
        </div>
        <svg
          className="ml-2 w-4 h-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="z-10 absolute bg-white shadow-lg mt-1 border rounded-md w-full">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer"
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
            >
              <img src={token.icon} alt="" className="w-5 h-5" />
              <span>{token.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SwapTokens() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("SUI");
  const [toToken, setToToken] = useState("USDC");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [balances, setBalances] = useState({ SUI: "0.00", USDC: "0.00" });
  const [actualBalances, setActualBalances] = useState({ SUI: 0n, USDC: 0n });
  const [slippage] = useState(0.5);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  useEffect(() => {
    if (!currentAccount) {
      setBalances({ SUI: "0.00", USDC: "0.00" });
      return;
    }

    const fetchBalances = async () => {
      try {
        const suiCoins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: "0x2::sui::SUI",
        });

        const usdcCoins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType:
            "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
        });

        const suiBalance = suiCoins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );
        const usdcBalance = usdcCoins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );

        setActualBalances({ SUI: suiBalance, USDC: usdcBalance });

        setBalances({
          SUI: (Number(suiBalance) / 1e9).toFixed(2),
          USDC: (Number(usdcBalance) / 1e6).toFixed(2),
        });
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setRouteError("");
      return;
    }

    const fetchRoute = async () => {
      setIsFetchingRoute(true);
      setRouteError("");
      try {
        const fromTokenData = tokens.find((t) => t.symbol === fromToken);
        const toTokenData = tokens.find((t) => t.symbol === toToken);

        const amountInRaw = BigInt(
          Math.floor(
            parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals)
          )
        );

        console.log("Finding best swap route via Cetus...");
        const route = await aggregatorClient.findRouters({
          from: fromTokenData.type,
          target: toTokenData.type,
          amount: amountInRaw.toString(),
          byAmountIn: true,
        });

        console.log("Route raw result:", route);

        if (route && route.amountOut && !route.insufficientLiquidity) {
          const estimatedOut =
            Number(route.amountOut.toString()) /
            Math.pow(10, toTokenData.decimals);
          setToAmount(estimatedOut.toFixed(6));
          setRouteError("");
          console.log(`Route found: ${route.paths?.length || 1} path(s)`);
          console.log(`Estimated output: ${estimatedOut} ${toToken}`);
        } else {
          setToAmount("");
          setRouteError("No route available");
          console.log("No swap route found");
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
        setToAmount("");
        setRouteError("Failed to fetch route");
      } finally {
        setIsFetchingRoute(false);
      }
    };

    const debounce = setTimeout(fetchRoute, 800);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSwapping(true);

    try {
      const fromTokenData = tokens.find((t) => t.symbol === fromToken);
      const toTokenData = tokens.find((t) => t.symbol === toToken);

      let swapAmount = parseFloat(fromAmount);

      const amountInRaw = BigInt(
        Math.floor(swapAmount * Math.pow(10, fromTokenData.decimals))
      );

      console.log(
        `Swapping ${swapAmount.toFixed(6)} ${fromToken} to ${toToken}`
      );
      console.log(`Amount in raw: ${amountInRaw}`);

      const suiCoins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: "0x2::sui::SUI",
      });

      if (suiCoins.data.length === 0) {
        throw new Error("No SUI coins found for gas fees");
      }

      const totalSuiBalance = suiCoins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      );

      let swapCoinIds = [];
      let gasPayment = null;

      if (fromToken === "SUI") {
        if (totalSuiBalance < amountInRaw) {
          throw new Error(
            `Insufficient SUI balance. Need ${(
              Number(amountInRaw) / 1e9
            ).toFixed(6)} SUI, have ${(Number(totalSuiBalance) / 1e9).toFixed(
              6
            )}`
          );
        } else {
          const actualSwapBalance = actualBalances[fromToken];
          if (actualSwapBalance < amountInRaw) {
            throw new Error(
              `Insufficient ${fromToken} balance. Need ${(
                Number(amountInRaw) / Math.pow(10, fromTokenData.decimals)
              ).toFixed(6)}, have ${(
                Number(actualSwapBalance) / Math.pow(10, fromTokenData.decimals)
              ).toFixed(6)}`
            );
          }
        }
        const sortedCoins = [...suiCoins.data].sort((a, b) => {
          const balanceA = BigInt(a.balance);
          const balanceB = BigInt(b.balance);
          return balanceA > balanceB ? -1 : balanceA < balanceB ? 1 : 0;
        });

        if (sortedCoins.length === 1) {
          gasPayment = null;
          swapCoinIds = [sortedCoins[0].coinObjectId];
        } else {
          const largestCoin = sortedCoins[0];

          gasPayment = null;
          swapCoinIds = [largestCoin.coinObjectId];

          let totalForSwap = BigInt(largestCoin.balance);
          let coinIndex = 1;

          while (totalForSwap < amountInRaw && coinIndex < sortedCoins.length) {
            swapCoinIds.push(sortedCoins[coinIndex].coinObjectId);
            totalForSwap += BigInt(sortedCoins[coinIndex].balance);
            coinIndex++;
          }

          console.log(
            `Using ${swapCoinIds.length} SUI coin(s) for swap+gas, total: ${(
              totalForSwap / BigInt(1e9)
            ).toString()} SUI`
          );
        }
      } else {
        if (totalSuiBalance < BigInt(GAS_BUDGET)) {
          throw new Error(
            `Insufficient SUI for gas. Need at least ${(
              GAS_BUDGET / 1e9
            ).toFixed(2)} SUI, have ${(Number(totalSuiBalance) / 1e9).toFixed(
              2
            )}`
          );
        }

        const swapTokenCoins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: fromTokenData.type,
        });

        if (swapTokenCoins.data.length === 0) {
          throw new Error(`No ${fromToken} coins found in wallet`);
        }

        const totalSwapBalance = swapTokenCoins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );

        if (totalSwapBalance < amountInRaw) {
          throw new Error(
            `Insufficient ${fromToken} balance. Need ${(
              Number(amountInRaw) / Math.pow(10, fromTokenData.decimals)
            ).toFixed(6)}, have ${(
              Number(totalSwapBalance) / Math.pow(10, fromTokenData.decimals)
            ).toFixed(6)}`
          );
        }

        swapCoinIds = swapTokenCoins.data.map((c) => c.coinObjectId);

        console.log(
          `Found ${swapCoinIds.length} ${fromToken} coin(s), total: ${(
            Number(totalSwapBalance) / Math.pow(10, fromTokenData.decimals)
          ).toFixed(4)}`
        );
      }

      console.log("Finding best swap route via Cetus...");
      const route = await aggregatorClient.findRouters({
        from: fromTokenData.type,
        target: toTokenData.type,
        amount: amountInRaw.toString(),
        byAmountIn: true,
      });

      if (!route) {
        throw new Error("No swap route found via Cetus aggregator");
      }

      console.log(`Route found: ${route.paths.length} path(s)`);

      const txb = new Transaction();
      txb.setGasBudget(GAS_BUDGET);

      if (gasPayment && gasPayment.length > 0) {
        txb.setGasPayment(gasPayment);
      }

      let coinForSwap;

      if (fromToken === "SUI" && !gasPayment) {
        console.log("Single SUI coin - using tx.gas...");
        const [swapCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInRaw)]);
        coinForSwap = swapCoin;
      } else {
        const baseCoin = txb.object(swapCoinIds[0]);
        if (swapCoinIds.length > 1) {
          const otherCoins = swapCoinIds.slice(1).map((id) => txb.object(id));
          txb.mergeCoins(baseCoin, otherCoins);
        }

        const [swapCoin] = txb.splitCoins(baseCoin, [
          txb.pure.u64(amountInRaw),
        ]);
        coinForSwap = swapCoin;
      }

      console.log("Taking platform fee...");
      const treasuryId = TREASURY_IDS[fromToken];

      if (!treasuryId) {
        throw new Error(
          `Treasury not initialized for ${fromToken}. Please initialize it first.`
        );
      }

      const [coinAfterFee] = txb.moveCall({
        target: `${FEE_MODULE_ADDRESS}::fee_router::take_fee_and_return`,
        typeArguments: [fromTokenData.type],
        arguments: [txb.object(treasuryId), coinForSwap],
      });

      const outputCoin = await aggregatorClient.routerSwap({
        router: route,
        txb: txb,
        inputCoin: coinAfterFee,
        slippage: slippage,
      });

      console.log("Swap transaction built successfully");

      txb.transferObjects([outputCoin], currentAccount.address);

      console.log("Signing and executing transaction...");
      const result = await signAndExecuteTransaction({
        transaction: txb,
      });

      console.log("Swap completed successfully!");
      console.log("Transaction digest:", result.digest);

      alert(
        `Swap successful!\n\nTX: ${result.digest.slice(
          0,
          16
        )}...\n\nView on explorer:\nhttps://suiscan.xyz/mainnet/tx/${
          result.digest
        }`
      );

      setFromAmount("");
      setToAmount("");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Swap failed:", error);

      let errorMessage = "Swap failed: ";

      if (error.message?.includes("Insufficient")) {
        errorMessage += error.message;
      } else if (
        error.message?.includes("No route") ||
        error.message?.includes("No swap route")
      ) {
        errorMessage += "No swap route found for this pair";
      } else if (error.message?.includes("Slippage")) {
        errorMessage +=
          "Slippage tolerance exceeded. Try increasing slippage or reducing amount";
      } else if (error.message?.includes("gas")) {
        errorMessage += "Insufficient gas. Make sure you have enough SUI";
      } else {
        errorMessage += error.message || String(error);
      }

      alert(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    if (fromToken === "SUI") {
      const actualSuiBalance = Number(actualBalances.SUI) / 1e9;
      const maxAmount = Math.max(0, actualSuiBalance - GAS_BUDGET / 1e9);
      setFromAmount(maxAmount.toFixed(6));
    } else {
      const actualUsdcBalance = Number(actualBalances.USDC) / 1e6;
      setFromAmount(actualUsdcBalance.toFixed(6));
    }
  };

  const isMaxAmountEntered = () => {
    if (fromToken !== "SUI" || !fromAmount) return false;

    const actualSuiBalance = Number(actualBalances.SUI) / 1e9;
    const actualMaxAmount = Math.max(0, actualSuiBalance - GAS_BUDGET / 1e9);
    const actualMaxFormatted = actualMaxAmount.toFixed(6);

    return fromAmount === actualMaxFormatted;
  };

  return (
    <div className="bg-white shadow-md mx-auto p-6 rounded-lg w-full h-full">
      <div className="m-auto w-[fit-content]">
        <h2 className="mb-4 font-bold text-xl text-center">Swap Tokens</h2>
        <p className="mb-4 text-gray-500 text-sm text-center">
          Exchange your tokens instantly with the best rates
        </p>
        <div className="space-y-4 p-4 rounded-md ring-2 ring-gray-500">
          {/* From */}
          <div>
            <label className="block font-medium text-gray-700 text-sm">
              From
            </label>
            <div className="flex gap-2 mt-1">
              <div>
                <TokenSelect value={fromToken} onChange={setFromToken} />
                <p className="mt-1 text-gray-500 text-xs">
                  Balance: {balances[fromToken]}
                </p>
              </div>

              <div className="flex flex-col">
                <input
                  type="number"
                  className="px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isSwapping}
                />
                <button
                  className="px-2 font-semibold text-indigo-600 text-sm text-right"
                  onClick={handleMaxClick}
                  disabled={isSwapping}
                >
                  MAX
                </button>
              </div>
            </div>
            {fromToken === "SUI" && isMaxAmountEntered() && (
              <p className="mt-2 text-gray-500 text-xs">
                0.05 SUI is reserved to cover gas fees
              </p>
            )}
          </div>

          {/* Flip */}
          <div className="flex justify-center">
            <button
              className="rounded-full"
              onClick={handleFlip}
              disabled={isSwapping}
            >
              <img src={swap_swap} alt="swap coins" className="h-16" />
            </button>
          </div>

          {/* To */}
          <div>
            <label className="block font-medium text-gray-700 text-sm">
              To{" "}
              {isFetchingRoute && (
                <span className="text-xs text-gray-400">(Calculating...)</span>
              )}
              {routeError && (
                <span className="text-xs text-red-500 ml-2">
                  ({routeError})
                </span>
              )}
            </label>
            <div className="flex gap-2 mt-1">
              <TokenSelect value={toToken} onChange={setToToken} />
              <input
                type="number"
                className="px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500"
                value={toAmount}
                readOnly
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              Balance: {balances[toToken]}
            </p>
          </div>

          {/* Swap Button */}
          <button
            className="bg-[#00076C] hover:bg-indigo-700 px-4 py-2 rounded-md w-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSwap}
            disabled={
              isSwapping ||
              !currentAccount ||
              !fromAmount ||
              isFetchingRoute ||
              routeError !== ""
            }
          >
            {isSwapping
              ? "Swapping..."
              : !currentAccount
              ? "Connect Wallet"
              : routeError
              ? "No Route Available"
              : "Swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
