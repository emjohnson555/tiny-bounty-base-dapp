import type { Address } from "viem";

export const MAX_TASK_LENGTH = 54;
export const MAX_REWARD_LENGTH = 32;
export const MAX_DEADLINE_LENGTH = 28;
export const MAX_CATEGORY_LENGTH = 26;
export const MAX_NOTE_LENGTH = 180;

export const tinyBountyAbi = [
  {
    type: "event",
    name: "BountyPosted",
    inputs: [
      { name: "bountyId", type: "uint256", indexed: true },
      { name: "maker", type: "address", indexed: true },
      { name: "task", type: "string", indexed: false },
      { name: "rewardNote", type: "string", indexed: false },
      { name: "deadline", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "postBounty",
    stateMutability: "nonpayable",
    inputs: [
      { name: "task", type: "string" },
      { name: "rewardNote", type: "string" },
      { name: "deadline", type: "string" },
      { name: "category", type: "string" },
      { name: "note", type: "string" },
    ],
    outputs: [{ name: "bountyId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getBounty",
    stateMutability: "view",
    inputs: [{ name: "bountyId", type: "uint256" }],
    outputs: [
      { name: "maker", type: "address" },
      { name: "task", type: "string" },
      { name: "rewardNote", type: "string" },
      { name: "deadline", type: "string" },
      { name: "category", type: "string" },
      { name: "note", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextBountyId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredTinyBountyContractAddress =
  process.env.NEXT_PUBLIC_TINY_BOUNTY_CONTRACT_ADDRESS?.trim();

export const tinyBountyContractAddress = isAddressLike(configuredTinyBountyContractAddress)
  ? (configuredTinyBountyContractAddress as Address)
  : undefined;
