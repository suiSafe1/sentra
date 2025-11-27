import { useState, useEffect, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import swap_swap from "../assets/swap_swap.png";
import sui from "../assets/sui.png";
import wal from "../assets/wal.png";
import deep from "../assets/deep.png";
import usdc from "../assets/usdc.png";
import scal from "../assets/scal.png";
import { AggregatorClient } from "@cetusprotocol/aggregator-sdk";
import confetti from "canvas-confetti";

const TREASURY_IDS = {
  SUI: "0x6a8c7f91b5dd6a4a026bc8800d4903392eb18c18e60d5a89b454cd2c72470fd1",
  USDC: "0x989b2401f023c0b03ca22e23a0a8ab0d847af705018eab08594446a3a0d5c62a",
  WAL: "0xde6569305d2ded577b08c3b036c88fe6d2e994e795293c0aaf9fc0da702cc0cf",
  DEEP: "0x80d455dddb582ce1897635b748872bb63355c85283b57ad86a512f83d7c2c19d",
  SCA: "0x2cd78563f92b51b4a664534e7b71936dcf5d920dfb9fed0ce846b80d3a9e44f3",
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
    icon: sui,
    type: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    decimals: 9,
  },
  {
    symbol: "USDC",
    icon: usdc,
    type: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    decimals: 6,
  },
  {
    symbol: "WAL",
    icon: wal,
    type: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
    decimals: 9,
  },
  {
    symbol: "DEEP",
    icon: deep,
    type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    decimals: 6,
  },
  {
    symbol: "SCA",
    icon: scal,
    type: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    decimals: 9,
  },
];

// --- Components ---

function TokenSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selectedToken = tokens.find((t) => t.symbol === value);

  return (
    <div className="relative min-w-32">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center bg-white hover:bg-gray-50 shadow-sm px-3 py-2 border rounded-md w-full"
      >
        <div className="flex items-center gap-2">
          <img src={selectedToken.icon} alt="" className="h-8" />
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
        <div className="z-10 absolute bg-white shadow-lg mt-1 border rounded-md max-h-40 overflow-y-auto">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 cursor-pointer"
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
            >
              <img src={token.icon} alt="" className="h-8" />
              <span>{token.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TxOverlay({ outcome, onClose }) {
  if (!outcome) return null;

  const isSuccess = outcome.status === "success";
  const title = isSuccess ? "Transaction Successful! 🎉" : "Swap Failed 😔";
  const titleColor = isSuccess ? "text-green-600" : "text-red-600";
  const buttonColor = isSuccess
    ? "bg-indigo-600 hover:bg-indigo-700"
    : "bg-red-500 hover:bg-red-600";
  const digest = outcome.digest;
  const explorerUrl = digest
    ? `https://suiscan.xyz/mainnet/tx/${digest}`
    : null;
  const displayDigest = digest
    ? `${digest.slice(0, 8)}...${digest.slice(-8)}`
    : "N/A";

  useEffect(() => {
    if (isSuccess) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;

      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 9999,
      };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2,
          },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isSuccess]);

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white shadow-2xl p-6 rounded-lg w-full max-w-sm">
        <h3 className={`text-xl font-bold mb-4 text-center ${titleColor}`}>
          {title}
        </h3>
        <div className="mb-4 text-gray-700 text-sm">
          <p className="mb-1 font-semibold">
            {isSuccess ? "Swap Complete" : "Error Details:"}
          </p>
          <p className="bg-gray-50 p-2 rounded max-h-32 overflow-y-auto font-mono break-words">
            {isSuccess
              ? `Swapped successfully. Digest: ${displayDigest}`
              : outcome.message}
          </p>
        </div>

        <div className="flex flex-col space-y-3 mt-4">
          {isSuccess && explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-white py-2 px-4 rounded-md text-center transition duration-150 ${buttonColor}`}
            >
              View on Explorer
            </a>
          )}
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-800 transition duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function SwapTokens() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("SUI");
  const [toToken, setToToken] = useState("USDC");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");

  const [balances, setBalances] = useState({});
  const [actualBalances, setActualBalances] = useState({});

  const [slippage] = useState(0.5);
  const [txOutcome, setTxOutcome] = useState(null);
  const [showConnectBanner, setShowConnectBanner] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const fetchBalances = useCallback(async () => {
    if (!currentAccount) return;

    try {
      const balancePromises = tokens.map(async (token) => {
        const coins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: token.type,
        });

        const totalBalance = coins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );

        return {
          symbol: token.symbol,
          raw: totalBalance,
          formatted: (
            Number(totalBalance) / Math.pow(10, token.decimals)
          ).toFixed(token.decimals === 9 ? 2 : 6),
        };
      });

      const results = await Promise.all(balancePromises);

      const newBalances = {};
      const newActualBalances = {};

      results.forEach((result) => {
        newBalances[result.symbol] = result.formatted;
        newActualBalances[result.symbol] = result.raw;
      });

      setBalances(newBalances);
      setActualBalances(newActualBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (!currentAccount) {
      const emptyBalances = {};
      tokens.forEach((token) => {
        emptyBalances[token.symbol] = "0.00";
      });
      setBalances(emptyBalances);
      setActualBalances({});
      return;
    }

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [currentAccount, fetchBalances]);

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

        const route = await aggregatorClient.findRouters({
          from: fromTokenData.type,
          target: toTokenData.type,
          amount: amountInRaw.toString(),
          byAmountIn: true,
        });

        if (route && route.amountOut && !route.insufficientLiquidity) {
          const estimatedOut =
            Number(route.amountOut.toString()) /
            Math.pow(10, toTokenData.decimals);
          setToAmount(estimatedOut.toFixed(6));
          setRouteError("");
        } else {
          setToAmount("");
          setRouteError("No route available");
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
      setShowConnectBanner(true);
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setTxOutcome({
        status: "failure",
        message: "Please enter a valid amount for the swap.",
      });
      return;
    }

    setIsSwapping(true);

    try {
      const fromTokenData = tokens.find((t) => t.symbol === fromToken);
      const toTokenData = tokens.find((t) => t.symbol === toToken);

      const swapAmount = parseFloat(fromAmount);
      const amountInRaw = BigInt(
        Math.floor(swapAmount * Math.pow(10, fromTokenData.decimals))
      );

      const suiCoins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
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
      }

      const route = await aggregatorClient.findRouters({
        from: fromTokenData.type,
        target: toTokenData.type,
        amount: amountInRaw.toString(),
        byAmountIn: true,
      });

      if (!route) {
        throw new Error("No swap route found via Cetus aggregator");
      }

      const txb = new Transaction();
      txb.setGasBudget(GAS_BUDGET);

      if (gasPayment && gasPayment.length > 0) {
        txb.setGasPayment(gasPayment);
      }

      let coinForSwap;

      if (fromToken === "SUI" && !gasPayment) {
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

      const treasuryId = TREASURY_IDS[fromToken];

      if (!treasuryId || treasuryId.startsWith("0x_YOUR_")) {
        throw new Error(
          `Treasury not initialized for ${fromToken}. Please deploy and update TREASURY_IDS.`
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

      txb.transferObjects([outputCoin], currentAccount.address);

      const result = await signAndExecuteTransaction({
        transaction: txb,
      });

      setTxOutcome({ status: "success", digest: result.digest });
      setFromAmount("");
      setToAmount("");
      await fetchBalances();
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
      } else if (error.message?.includes("Treasury not initialized")) {
        errorMessage += error.message;
      } else if (error.message?.includes("Slippage")) {
        errorMessage +=
          "Slippage tolerance exceeded. Try increasing slippage or reducing amount";
      } else if (error.message?.includes("gas")) {
        errorMessage += "Insufficient gas. Make sure you have enough SUI";
      } else {
        errorMessage += error.message || String(error);
      }

      setTxOutcome({ status: "failure", message: errorMessage });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    const tokenData = tokens.find((t) => t.symbol === fromToken);
    const rawBalance = actualBalances[fromToken] || 0n;

    if (fromToken === "SUI") {
      const actualSuiBalance = Number(rawBalance) / 1e9;
      const maxAmount = Math.max(0, actualSuiBalance - GAS_BUDGET / 1e9);
      setFromAmount(maxAmount.toFixed(6));
    } else {
      const actualBalance =
        Number(rawBalance) / Math.pow(10, tokenData.decimals);
      setFromAmount(actualBalance.toFixed(6));
    }
  };

  const isMaxAmountEntered = () => {
    if (fromToken !== "SUI" || !fromAmount) return false;

    const actualSuiBalance = Number(actualBalances.SUI || 0n) / 1e9;
    const actualMaxAmount = Math.max(0, actualSuiBalance - GAS_BUDGET / 1e9);
    const actualMaxFormatted = actualMaxAmount.toFixed(6);

    return fromAmount === actualMaxFormatted;
  };

  const handleCloseTxOverlay = async () => {
    setTxOutcome(null);
    if (currentAccount) {
      await fetchBalances();
    }
  };

  // --- Render ---

  return (
    <div className="relative bg-white shadow-md mx-auto p-6 rounded-lg w-full h-full">
      <div className="m-auto w-[fit-content]">
        <h2 className="mb-4 font-bold text-xl text-center">Swap Tokens</h2>
        <p className="mb-4 text-gray-500 text-sm text-center">
          Exchange your tokens instantly with the best rates
        </p>

        {showConnectBanner && !currentAccount && (
          <div
            className="relative bg-yellow-100 mb-4 px-4 py-3 border border-yellow-400 rounded text-yellow-700"
            role="alert"
          >
            <span className="block sm:inline">
              Please connect your wallet to start swapping.
            </span>
            <span className="top-0 right-0 bottom-0 absolute px-4 py-3">
              <svg
                onClick={() => setShowConnectBanner(false)}
                className="fill-current w-6 h-6 text-yellow-500 cursor-pointer"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.854l-2.651 2.65a1.2 1.2 0 1 1-1.697-1.697l2.65-2.651-2.65-2.651a1.2 1.2 0 1 1 1.697-1.697l2.651 2.65 2.651-2.65a1.2 1.2 0 0 1 1.697 1.697l-2.65 2.651 2.65 2.651a1.2 1.2 0 0 1 0 1.697z" />
              </svg>
            </span>
          </div>
        )}

        <div className="space-y-4 p-4 rounded-md ring-2 ring-gray-500">
          <div>
            <label className="block font-medium text-gray-700 text-sm">
              From
            </label>
            <div className="flex gap-2 mt-1">
              <TokenSelect value={fromToken} onChange={setFromToken} />
              <input
                type="text"
                className="px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-3/4 text-right appearance-none"
                value={fromAmount}
                onChange={handleFromAmountChange}
                placeholder="0.00"
                disabled={isSwapping}
              />
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-gray-500 text-xs">
                Balance: {balances[fromToken] || "0.00"}
              </p>
              <button
                className="disabled:opacity-50 font-semibold text-indigo-600 hover:text-indigo-800 text-sm"
                onClick={handleMaxClick}
                disabled={isSwapping}
              >
                MAX
              </button>
            </div>
            {fromToken === "SUI" && isMaxAmountEntered() && (
              <p className="mt-2 text-gray-500 text-xs">
                ~{(GAS_BUDGET / 1e9).toFixed(2)} SUI is reserved to cover gas
                fees
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="rounded-full"
              onClick={handleFlip}
              disabled={isSwapping}
            >
              <img src={swap_swap} alt="swap coins" className="h-16" />
            </button>
          </div>

          <div>
            <label className="block font-medium text-gray-700 text-sm">
              To{" "}
              {isFetchingRoute && (
                <span className="text-gray-400 text-xs">(Calculating...)</span>
              )}
              {routeError && (
                <span className="ml-2 text-red-500 text-xs">
                  ({routeError})
                </span>
              )}
            </label>
            <div className="flex gap-2 mt-1">
              <TokenSelect value={toToken} onChange={setToToken} />
              <input
                type="text"
                className="px-3 py-2 border focus:border-indigo-500 rounded-md focus:ring-indigo-500 w-3/4 text-right"
                value={toAmount}
                readOnly
                placeholder="0.00"
              />
            </div>
            <p className="mt-1 text-gray-500 text-xs">
              Balance: {balances[toToken] || "0.00"}
            </p>
          </div>

          <button
            className="bg-[#00076C] hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-md w-full text-white disabled:cursor-not-allowed"
            onClick={handleSwap}
            disabled={
              isSwapping ||
              !currentAccount ||
              !fromAmount ||
              isFetchingRoute ||
              routeError !== "" ||
              parseFloat(fromAmount) <= 0
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

      <TxOverlay outcome={txOutcome} onClose={handleCloseTxOverlay} />
    </div>
  );
}
