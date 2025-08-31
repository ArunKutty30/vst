import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

// const CONTRACT_ADDRESS = '0x41faf83A090afB5Aa320a77A190b37590C22f090';
// const USDT_ADDRESS = '0x7dae6c2c073a9d49C87c3BBA7511730186aA9e0C';
// const VST_ADDRESS = '0x80F75C11d3b126EDBeB1Cd2f7F21Ca86c74d1C66';

// const CONTRACT_ADDRESS = "0x1881f959A534297eB12b614Db315e22944090025";
// const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
// const VST_ADDRESS = "0x2d29eE736f71861F3789802a213565279Ff29Ba3";

const CONTRACT_ADDRESS = "0x861CEF74a2409FAb403762a4c2Ae21E0A616B4f1";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const VST_ADDRESS = "0x342484BAc755a8149E0a74503f8576C32a7aBC49";

const BSC_TESTNET = {
  chainId: "0x61",
  chainName: "BSC Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
  blockExplorerUrls: ["https://testnet.bscscan.com/"],
};

const BSC_MAINNET = {
  chainId: "0x38",
  chainName: "BSC Mainnet",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

const CONTRACT_ABI = [
  "function buyPrice() view returns (uint256)",
  "function sellPrice() view returns (uint256)",
  "function buyFee() view returns (uint256)",
  "function sellFee() view returns (uint256)",
  "function maxDailySwap() view returns (uint256)",
  "function minSwap() view returns (uint256)",
  "function buy(uint256 usdtAmount) external",
  "function sell(uint256 tokenAmount) external",
  "function balanceOf(address user) view returns (uint256)",
];

const ERC20_ABI = [
  "function balanceOf(address user) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

export const useWeb3Contract = () => {
  const [isTestnet, setIsTestnet] = useState(true);
  const [buyPrice, setBuyPrice] = useState("0");
  const [sellPrice, setSellPrice] = useState("0");
  const [buyFee, setBuyFee] = useState("0");
  const [sellFee, setSellFee] = useState("0");
  const [loading, setLoading] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [VSTBalance, setVSTBalance] = useState("0");
  const [maxDailySwap, setMaxDailySwap] = useState("0");
  const [minSwap, setMinSwap] = useState("0");
  const [walletAddress, setWalletAddress] = useState("");

  const switchNetwork = async (testnet: boolean) => {
    if (!window.ethereum) return;

    const network = BSC_MAINNET;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      });
      setIsTestnet(testnet);
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [network],
          });
          setIsTestnet(testnet);
        } catch (addError) {
          console.error("Failed to add network:", addError);
          toast.error("Failed to add network");
        }
      } else {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network");
      }
    }
  };

  const fetchBalances = async (userAddress: string) => {
    if (!window.ethereum || !userAddress) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const usdtContract = new ethers.Contract(
        USDT_ADDRESS,
        ERC20_ABI,
        provider
      );
      const gtcContract = new ethers.Contract(VST_ADDRESS, ERC20_ABI, provider);

      const [usdtBalanceWei, gtcBalanceWei] = await Promise.all([
        usdtContract.balanceOf(userAddress),
        gtcContract.balanceOf(userAddress),
      ]);

      setUsdtBalance(ethers.formatEther(usdtBalanceWei));
      setVSTBalance(ethers.formatEther(gtcBalanceWei));
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  };

  const fetchPrices = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const [
        buyPriceWei,
        sellPriceWei,
        buyFeeWei,
        sellFeeWei,
        maxDailySwapWei,
        minSwapWei,
      ] = await Promise.all([
        contract.buyPrice(),
        contract.sellPrice(),
        contract.buyFee(),
        contract.sellFee(),
        contract.maxDailySwap(),
        contract.minSwap(),
      ]);

      setBuyPrice(ethers.formatEther(buyPriceWei));
      setSellPrice(ethers.formatEther(sellPriceWei));
      setBuyFee(ethers.formatEther(buyFeeWei));
      setSellFee(ethers.formatEther(sellFeeWei));
      setMaxDailySwap(ethers.formatEther(maxDailySwapWei).toString());
      console.log("maxdailyswap", maxDailySwapWei);
      setMinSwap(ethers.formatEther(minSwapWei).toString());
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      toast.error("Failed to fetch contract prices");
    }
  };

  const approveToken = async (tokenAddress: string, amount: string) => {
    if (!window.ethereum) return false;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );

      const tx = await tokenContract.approve(
        CONTRACT_ADDRESS,
        ethers.parseEther(amount)
      );

      // Wait for the approval transaction to be confirmed
      const receipt = await tx.wait();

      // Additional verification: check if allowance was actually updated
      const allowance = await tokenContract.allowance(
        await signer.getAddress(),
        CONTRACT_ADDRESS
      );

      if (allowance < ethers.parseEther(amount)) {
        throw new Error("Allowance not updated after approval");
      }

      toast.success("Approval confirmed successfully");
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Token approval failed");
      return false;
    }
  };

  const buyTokens = async (usdtAmount: string) => {
    if (!window.ethereum) return false;

    setLoading(true);
    try {
      // First approve USDT
      const approved = await approveToken(USDT_ADDRESS, usdtAmount);
      if (!approved) {
        setLoading(false);
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.buy(ethers.parseEther(usdtAmount));
      await tx.wait();

      toast.success("Tokens purchased successfully!");
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Buy failed:", error);
      toast.error(`Buy failed: ${error.message || "Transaction failed"}`);
      setLoading(false);
      return false;
    }
  };

  const sellTokens = async (tokenAmount: string) => {
    if (!window.ethereum) return false;

    setLoading(true);
    try {
      // First approve VST tokens
      const approved = await approveToken(VST_ADDRESS, tokenAmount);
      if (!approved) {
        setLoading(false);
        return false;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      console.log("tk amount", ethers.parseEther(tokenAmount));
      const tx = await contract.sell(ethers.parseEther(tokenAmount));
      await tx.wait();

      toast.success("Tokens sold successfully!");
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error("Sell failed:", error);
      toast.error(`Sell failed: ${error.message || "Transaction failed"}`);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [isTestnet]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [walletAddress, isTestnet]);

  return {
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
  };
};
