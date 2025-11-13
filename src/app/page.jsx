"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contract_data/GetSet.json";
import contractAddress from "../contract_data/GetSet-address.json";

export default function Page() {
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);
  const [copied, setCopied] = useState(false);

  // Initialize Provider, Signer, and Contract
  const initializeEthers = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(contractAddress.address, contractABI.abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      const accounts = await _provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error initializing ethers:", error);
    }
  };

  // Set value in contract
  const setContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await contract.set(BigInt(value)); // Convert string to BigInt
      await tx.wait(); // Wait for transaction confirmation
      alert("Value set successfully!");
    } catch (error) {
      console.error("Error setting value:", error);
    }
  };

  // Get value from contract
  const getContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      // Check if contract exists at the address
      const code = await provider.getCode(contractAddress.address);
      if (code === "0x") {
        alert("No contract found at this address. Please deploy the contract first or check your network!");
        return;
      }
      
      const result = await contract.get();
      setRetrievedValue(result.toString());
    } catch (error) {
      console.error("Error getting value:", error);
      alert("Error getting value: " + error.message);
    }
  };

  // Deposit funds to the contract
  const depositFunds = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await signer.sendTransaction({
        to: contractAddress.address,
        value: ethers.parseEther(depositAmount), // Convert to wei
      });
      await tx.wait();
      alert(`Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  // Get user balance
  const getUserBalance = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const balance = await contract.getBalance(account);
      setUserBalance(ethers.formatEther(balance)); // Convert from wei to ETH
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      initializeEthers();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-black border-b border-gray-800 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-4 gap-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-gray-300">
                <span className="text-black font-bold text-2xl">GS</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Blockchain Contract</h1>
            </div>
            
            {account ? (
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border-2 border-gray-300 shadow-sm">
                  <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse"></div>
                  <span className="text-black text-xs md:text-sm font-mono break-all">
                    {account}
                  </span>
                </div>
                <button
                  onClick={copyAddress}
                  className="px-4 py-2.5 bg-white hover:bg-gray-100 text-black rounded-xl border-2 border-gray-300 transition-all duration-200 hover:scale-105 flex items-center space-x-2 shadow-sm"
                  title="Copy address"
                >
                  {copied ? (
                    <>
                      <span className="text-black">✓</span>
                      <span className="text-sm font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span className="text-sm font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button 
                onClick={initializeEthers} 
                className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-2 border-gray-300"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Set & Get Value Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-black hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-black">Value Storage</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Enter Value
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter a number"
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={setContractValue} 
                  className="flex-1 px-5 py-3.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Set Value
                </button>
                <button 
                  onClick={getContractValue} 
                  className="flex-1 px-5 py-3.5 bg-white hover:bg-gray-100 text-black font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-black"
                >
                  Get Value
                </button>
              </div>

              {retrievedValue !== null && (
                <div className="mt-4 p-5 bg-black rounded-xl border-2 border-gray-800 animate-fade-in">
                  <p className="text-sm text-white font-semibold mb-1">Stored Value:</p>
                  <p className="text-4xl font-bold text-white">{retrievedValue}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deposit Funds Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-black hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">💰</span>
              </div>
              <h2 className="text-2xl font-bold text-black">Deposit Funds</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                />
              </div>
              
              <button 
                onClick={depositFunds} 
                className="w-full px-5 py-3.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Deposit ETH
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-100 md:col-span-2 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-xl">�</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Balance</h2>
              </div>
              
              <button 
                onClick={getUserBalance} 
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Refresh Balance
              </button>
            </div>

            {userBalance !== null ? (
              <div className="p-6 bg-black rounded-xl border-2 border-gray-800">
                <p className="text-sm text-white font-semibold mb-2">Contract Balance:</p>
                <p className="text-5xl font-bold text-white">{userBalance} ETH</p>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-xl border-2 border-black">
                <p className="text-black text-center font-medium">Click "Refresh Balance" to view your balance</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
