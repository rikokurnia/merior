const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { ethers } = require("ethers");
require("dotenv").config({ path: path.join(__dirname, "../.env.deploy") });

// Choose RPC: Base Sepolia (default) or Ethereum Sepolia
const RPC_URL = process.env.RPC_URL || "https://sepolia.base.org"; 
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  console.error("Error: DEPLOYER_PRIVATE_KEY not found in .env.deploy");
  process.exit(1);
}

async function main() {
  console.log("Connecting to network via RPC:", RPC_URL);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("Error: Deployer balance is 0. Please fund the wallet first.");
    process.exit(1);
  }

  // Paths
  const srcDir = path.join(__dirname, "../contracts/src");
  const mockUsdcPath = path.join(srcDir, "MockUSDC.sol");
  const triageQueuePath = path.join(srcDir, "TriageQueue.sol");

  const mockUsdcSource = fs.readFileSync(mockUsdcPath, "utf8");
  const triageQueueSource = fs.readFileSync(triageQueuePath, "utf8");

  console.log("Compiling contracts...");

  // Compile helper
  function compile(fileName, contractContent) {
    const input = {
      language: "Solidity",
      sources: {
        [fileName]: {
          content: contractContent,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
      },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (output.errors) {
      output.errors.forEach((err) => {
        if (err.severity === "error") {
          console.error("Compilation Error:", err.message);
          process.exit(1);
        } else {
          console.warn("Compilation Warning:", err.message);
        }
      });
    }

    const keys = Object.keys(output.contracts[fileName]);
    const contractName = keys.find(k => k !== "IERC20") || keys[0];
    const contract = output.contracts[fileName][contractName];
    return {
      abi: contract.abi,
      bytecode: contract.evm.bytecode.object,
      name: contractName,
    };
  }

  const mockUsdcBuild = compile("MockUSDC.sol", mockUsdcSource);
  const triageQueueBuild = compile("TriageQueue.sol", triageQueueSource);

  console.log("Compilation complete!");

  // Deploy MockUSDC
  console.log("Deploying MockUSDC...");
  const MockUSDCFactory = new ethers.ContractFactory(mockUsdcBuild.abi, mockUsdcBuild.bytecode, wallet);
  const mockUSDC = await MockUSDCFactory.deploy();
  await mockUSDC.waitForDeployment();
  const mockUsdcAddress = await mockUSDC.getAddress();
  console.log(`MockUSDC deployed to: ${mockUsdcAddress}`);

  // Deploy TriageQueue
  console.log("Deploying TriageQueue...");
  const TriageQueueFactory = new ethers.ContractFactory(triageQueueBuild.abi, triageQueueBuild.bytecode, wallet);
  // Using deployer address as oracle attester for now
  const oracleAttester = wallet.address; 
  const triageQueue = await TriageQueueFactory.deploy(mockUsdcAddress, oracleAttester);
  await triageQueue.waitForDeployment();
  const triageQueueAddress = await triageQueue.getAddress();
  console.log(`TriageQueue deployed to: ${triageQueueAddress}`);

  // Transfer MockUSDC rewards pool to TriageQueue
  console.log("Seeding TriageQueue with 1,000,000 mock USDC...");
  const decimals = 6;
  const seedAmount = 1000000n * 10n ** BigInt(decimals);
  const tx = await mockUSDC.transfer(triageQueueAddress, seedAmount);
  await tx.wait();
  console.log("Seeded successfully!");

  console.log("\n====================================");
  console.log("Deployment Summary:");
  console.log("RPC:", RPC_URL);
  console.log("MockUSDC:", mockUsdcAddress);
  console.log("TriageQueue:", triageQueueAddress);
  console.log("====================================\n");

  // Write outputs to helper config file
  const configContent = `// Deployed contract config
export const TRIAGE_QUEUE_ADDRESS = "${triageQueueAddress}";
export const MOCK_USDC_ADDRESS = "${mockUsdcAddress}";
`;
  fs.writeFileSync(path.join(__dirname, "../lib/contract-config.ts"), configContent);
  console.log("Updated lib/contract-config.ts with addresses");
}

main().catch((err) => {
  console.error("Deployment script failed:", err);
  process.exit(1);
});
