import React, { useState, useEffect } from "react";
import {
  Search,
  ArrowRight,
  Wallet,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useWeb3Contract } from "@/hooks/useWeb3Contract";
import logo from "@/assets/logo.png";

const Index = () => {
  const [activeTab, setActiveTab] = useState("BUY");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  const {
    isTestnet,
    buyPrice,
    sellPrice,
    buyFee,
    sellFee,
    loading,
    usdtBalance,
    dgtekBalance,
    maxDailySwap,
    minSwap,
    walletAddress,
    setWalletAddress,
    switchNetwork,
    fetchPrices,
    fetchBalances,
    buyTokens,
    sellTokens,
  } = useWeb3Contract();

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        fetchPrices();
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      if (error.code !== 4001) {
        toast.error("Failed to connect wallet. Please try again.");
      }
    }
  };

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const success = await buyTokens(buyAmount);
    if (success) {
      setBuyAmount("");
      fetchPrices();
      fetchBalances(walletAddress);
    }
  };

  const handleSell = async () => {
    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const success = await sellTokens(sellAmount);
    if (success) {
      setSellAmount("");
      fetchPrices();
      fetchBalances(walletAddress);
    }
  };

  const calculateBuyTokens = (usdtAmount: string) => {
    if (!usdtAmount || !buyPrice) return "0";
    const netAmount = parseFloat(usdtAmount) - parseFloat(buyFee);
    if (netAmount <= 0) return "0";
    return (netAmount / parseFloat(buyPrice)).toFixed(4);
  };

  const calculateSellUsdt = (tokenAmount: string) => {
    if (!tokenAmount || !sellPrice) return "0";
    const usdtAmount = parseFloat(tokenAmount) * parseFloat(sellPrice);
    const netAmount = usdtAmount - parseFloat(sellFee);
    return Math.max(0, netAmount).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="logo" className="w-12 h-14 sm:w-16 sm:h-15" />
          </div>

          {/* Dashboard Title - Center */}
          <div className="hidden md:flex flex-1 justify-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>

          {/* Search and Wallet - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search here..."
                className="pl-10 w-64 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {walletAddress && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* Mobile - Dashboard Title and Wallet */}
          <div className="flex md:hidden items-center gap-2 flex-1 justify-between">
            <h1 className="text-lg font-bold text-gray-900 ml-2">Dashboard</h1>
            {walletAddress && (
              <div className="flex items-center gap-1 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                <Wallet className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3 px-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search here..."
              className="pl-10 w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trading Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 overflow-hidden border-2 border-blue-500 bg-blue-50">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                      Buy & Sell 100+ DGTEK Instantly
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
                      DGTEK (DGTEK) is a decentralized BEP20 token deployed on
                      Binance Smart Chain. Launched with a supply of 10 billion
                      tokens, circulating supply of 2 Billion tokens, it enables
                      minting and burning for sustainable supply control. DGTEK
                      is ideal for DeFi projects, staking, and ecosystem
                      rewards, supporting secure transfers, approvals, and
                      ownership management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        size="lg"
                        onClick={() => setActiveTab("BUY")}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      >
                        Buy DGTEK <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => setActiveTab("SELL")}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                      >
                        Sell DGTEK <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end lg:flex-shrink-0">
                    <div className="w-48 h-36 sm:w-56 sm:h-40 lg:w-64 lg:h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                      <div className="text-4xl sm:text-5xl lg:text-6xl">📊</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Overview */}
            <Card className="bg-blue-50">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    WALLET OVERVIEW
                  </h3>
                  <p className="text-sm text-gray-500">
                    Live balance fetched from blockchain in real-time
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        ₮
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {parseFloat(usdtBalance).toFixed(4)} USDT
                      </div>
                      <div className="text-sm text-gray-500">
                        Total USDT Balance
                      </div>
                      <div className="text-xs text-gray-400">
                        Used for token purchases and transactions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">
                        G
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {parseFloat(dgtekBalance).toFixed(4)} DGTEK
                      </div>
                      <div className="text-sm text-gray-500">
                        Total DGTEK Balance
                      </div>
                      <div className="text-xs text-gray-400">
                        DGTEK tokens available for trading
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About DGTEK Token
                </h3>
                <p className="text-gray-600 mb-4">
                  DGTEK (DGTEK) is a decentralized utility token built on the
                  BNB Smart Chain. Initially launched with a fixed supply of 10
                  billion tokens, it supports dynamic minting and burning
                  controlled by the owner.
                </p>
                <p className="text-gray-600">
                  DGTEK is designed to power sustainable projects and reward
                  ecosystems. It features full BEP20 compatibility, live
                  transfer tracking, and wallet ownership transparency.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Buy/Sell Toggle */}
            <Card className="bg-blue-50">
              <CardContent className="p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="BUY"
                      className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    >
                      BUY
                    </TabsTrigger>
                    <TabsTrigger value="SELL">SELL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="BUY" className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button size="sm">BUY ORDER</Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (${buyPrice} USDT per DGTEK)
                      </label>
                      <Input
                        value={buyPrice}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charges (${buyFee} USDT)
                      </label>
                      <Input
                        value={buyFee}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        USDT Amount
                      </label>
                      <Input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="Enter USDT amount"
                        className="w-full"
                      />
                    </div>

                    {buyAmount && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        You will receive:{" "}
                        <span className="font-medium">
                          {calculateBuyTokens(buyAmount)} DGTEK
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full py-3 mt-6"
                      onClick={handleBuy}
                      disabled={loading || !walletAddress}
                    >
                      {loading ? "Processing..." : "BUY DGTEK"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="SELL" className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button size="sm">SELL ORDER</Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (${sellPrice} USDT per DGTEK)
                      </label>
                      <Input
                        value={sellPrice}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Charges (${sellFee} USDT)
                      </label>
                      <Input
                        value={sellFee}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DGTEK Amount
                      </label>
                      <Input
                        type="number"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        placeholder="Enter DGTEK amount"
                        className="w-full"
                      />
                    </div>

                    {sellAmount && (
                      <div className="text-sm text-gray-600 bg-green-50 p-3 rounded">
                        You will receive:{" "}
                        <span className="font-medium">
                          {calculateSellUsdt(sellAmount)} USDT
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full py-3 mt-6"
                      onClick={handleSell}
                      disabled={loading || !walletAddress}
                    >
                      {loading ? "Processing..." : "SELL DGTEK"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Book */}
            {/* <Card className="bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Rules:
                  </h3>
                  <span className="text-sm text-gray-500">(DGTEK/USDT)</span>
                </div>

                <Tabs defaultValue="open" className="w-full">
                  <TabsContent value="open">
                    <div className="text-center text-gray-500 py-8 text-sm">
                      Maximum Buy Amount:{" "}
                      {maxDailySwap
                        ? parseFloat(maxDailySwap).toLocaleString()
                        : 0}{" "}
                      DGTEK <br />
                      Maximum Sell Amount:{" "}
                      {minSwap ? parseFloat(minSwap).toLocaleString() : 0} DGTEK
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card> */}

            {/* Market Chart */}
            <Card className="bg-blue-50 mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    DGTEK Market
                  </h3>
                  <a
                    href="https://coinmarketcap.com/currencies/labrador"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View on CoinMarketCap
                  </a>
                </div>

                <div className="space-y-4">
                  {/* Price Display */}
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          DGTEK TOKEN (USDG)
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          $4.93
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">
                          24h Change
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          +0.06%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        24h Volume
                      </div>
                      <div className="font-semibold text-gray-900">$191.8K</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                      <div className="text-xs text-gray-600 mb-1">
                        Market Cap
                      </div>
                      <div className="font-semibold text-gray-900">$9.86B</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
