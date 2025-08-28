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
    VSTBalance,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="logo" className="w-12 h-14 sm:w-16 sm:h-15" />
          </div>

          {/* Dashboard Title - Center */}
          <div className="hidden md:flex flex-1 justify-center">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Dashboard
            </h1>
          </div>

          {/* Search and Wallet - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
              <Input
                placeholder="Search here..."
                className="pl-10 w-64 bg-card border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>

            {walletAddress && (
              <div className="flex items-center gap-2 bg-green-900/20 border border-green-700 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>

          {/* Mobile - Dashboard Title and Wallet */}
          <div className="flex md:hidden items-center gap-2 flex-1 justify-between">
            <h1 className="text-lg font-bold text-foreground ml-2">
              Dashboard
            </h1>
            {walletAddress && (
              <div className="flex items-center gap-1 bg-green-900/20 border border-green-700 px-2 py-1 rounded-lg">
                <Wallet className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-300">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3 px-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-4 h-4" />
            <Input
              placeholder="Search here..."
              className="pl-10 w-full bg-card border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trading Section */}
          <div className="lg:col-span-2">
            <Card className="mb-6 overflow-hidden border-2 border-blue-400 bg-card">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                      Buy & Sell 100+ VST Instantly
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                      VST (Valobit settlement Token) is a decentralized BEP20
                      token deployed on Binance Smart Chain. Launched with a
                      supply of 10 billion tokens, circulating supply of 2
                      Billion tokens, it enables minting and burning for
                      sustainable supply control. VST is ideal for DeFi
                      projects, staking, and ecosystem rewards, supporting
                      secure transfers, approvals, and ownership management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        size="lg"
                        onClick={() => setActiveTab("BUY")}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 gradient-button"
                      >
                        Buy VST <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => setActiveTab("SELL")}
                        className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 gradient-button"
                      >
                        Sell VST <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center lg:justify-end lg:flex-shrink-0">
                    <div className="w-48 h-36 sm:w-56 sm:h-40 lg:w-64 lg:h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl flex items-center justify-center">
                      <div className="text-4xl sm:text-5xl lg:text-6xl">📊</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Overview */}
            <Card className="bg-card">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    WALLET OVERVIEW
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Live balance fetched from blockchain in real-time
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">
                        ₮
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {parseFloat(usdtBalance).toFixed(4)} USDT
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total USDT Balance
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        Used for token purchases and transactions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-lg">
                        G
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {parseFloat(VSTBalance).toFixed(4)} VST
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total VST Balance
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        VST tokens available for trading
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  About VST Token
                </h3>
                <p className="text-muted-foreground mb-4">
                  VST (Valobit settlement Token)is a decentralized utility token
                  built on the BNB Smart Chain. Initially launched with a fixed
                  supply of 10 billion tokens, it supports dynamic minting and
                  burning controlled by the owner.
                </p>
                <p className="text-muted-foreground">
                  VST is designed to power sustainable projects and reward
                  ecosystems. It features full BEP20 compatibility, live
                  transfer tracking, and wallet ownership transparency.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Buy/Sell Toggle */}
            <Card className="bg-card">
              <CardContent className="p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-black">
                    <TabsTrigger
                      value="BUY"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white bg-black text-white hover:bg-gray-800"
                    >
                      BUY
                    </TabsTrigger>
                    <TabsTrigger
                      value="SELL"
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      SELL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="BUY" className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button size="sm" className="gradient-button">
                        BUY ORDER
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Price (${buyPrice} USDT per VST)
                      </label>
                      <Input
                        value={buyPrice}
                        readOnly
                        className="w-full bg-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Charges (${buyFee} USDT)
                      </label>
                      <Input
                        value={buyFee}
                        readOnly
                        className="w-full bg-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
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
                      <div className="text-sm text-muted-foreground bg-blue-900/20 p-3 rounded">
                        You will receive:{" "}
                        <span className="font-medium">
                          {calculateBuyTokens(buyAmount)} VST
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full py-3 mt-6 gradient-button"
                      onClick={handleBuy}
                      disabled={loading || !walletAddress}
                    >
                      {loading ? "Processing..." : "BUY VST"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="SELL" className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <Button size="sm" className="gradient-button">
                        SELL ORDER
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Price (${sellPrice} USDT per VST)
                      </label>
                      <Input
                        value={sellPrice}
                        readOnly
                        className="w-full bg-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Charges (${sellFee} USDT)
                      </label>
                      <Input
                        value={sellFee}
                        readOnly
                        className="w-full bg-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        VST Amount
                      </label>
                      <Input
                        type="number"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        placeholder="Enter VST amount"
                        className="w-full"
                      />
                    </div>

                    {sellAmount && (
                      <div className="text-sm text-muted-foreground bg-green-900/20 p-3 rounded">
                        You will receive:{" "}
                        <span className="font-medium">
                          {calculateSellUsdt(sellAmount)} USDT
                        </span>
                      </div>
                    )}

                    <Button
                      className="w-full py-3 mt-6 gradient-button"
                      onClick={handleSell}
                      disabled={loading || !walletAddress}
                    >
                      {loading ? "Processing..." : "SELL VST"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Order Book */}
            {/* <Card className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Rules:
                  </h3>
                  <span className="text-sm text-muted-foreground">(VST/USDT)</span>
                </div>

                <Tabs defaultValue="open" className="w-full">
                  <TabsContent value="open">
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      Maximum Buy Amount:{" "}
                      {maxDailySwap
                        ? parseFloat(maxDailySwap).toLocaleString()
                        : 0}{" "}
                      VST <br />
                      Maximum Sell Amount:{" "}
                      {minSwap ? parseFloat(minSwap).toLocaleString() : 0} VST
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card> */}

            {/* Market Chart */}
            {/* <Card className="bg-card mt-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    VST Market
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
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
