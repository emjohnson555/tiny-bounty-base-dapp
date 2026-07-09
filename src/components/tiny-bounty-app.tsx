"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  Search,
  StickyNote,
  Ticket,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_CATEGORY_LENGTH,
  MAX_DEADLINE_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_REWARD_LENGTH,
  MAX_TASK_LENGTH,
  tinyBountyAbi,
  tinyBountyContractAddress,
} from "@/lib/tiny-bounty";

const PRESETS = [
  {
    task: "Write 3 sharp taglines for a Base app",
    rewardNote: "tip after pick",
    deadline: "today",
    category: "copy",
    note: "Need three short options that feel crisp inside mobile UI. No generic startup slogans.",
  },
  {
    task: "Trim one landing hero to a cleaner layout",
    rewardNote: "feedback swap",
    deadline: "48 hours",
    category: "design",
    note: "Looking for a quick cleanup pass on spacing, hierarchy, and CTA placement for one screen.",
  },
  {
    task: "Check wallet connect flow on Android",
    rewardNote: "small USDC later",
    deadline: "this week",
    category: "qa",
    note: "Need one person to test connect, sign, and return state inside Base App and send notes.",
  },
] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid task")) return "Task needs 1 to 54 characters.";
  if (error.message.includes("Invalid reward")) return "Reward note needs 1 to 32 characters.";
  if (error.message.includes("Invalid deadline")) return "Deadline needs 1 to 28 characters.";
  if (error.message.includes("Invalid category")) return "Category needs 1 to 26 characters.";
  if (error.message.includes("Invalid note")) return "Note needs 1 to 180 characters.";
  return error.message;
}

function BountyCard({
  task,
  rewardNote,
  deadline,
  category,
  note,
  maker,
  createdAt,
}: {
  task: string;
  rewardNote: string;
  deadline: string;
  category: string;
  note: string;
  maker?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="bounty-stage">
      <div className="paper-sheet sheet-a" aria-hidden="true" />
      <div className="paper-sheet sheet-b" aria-hidden="true" />
      <div className="pin-dot pin-left" aria-hidden="true" />
      <div className="pin-dot pin-right" aria-hidden="true" />

      <header className="bounty-head">
        <div>
          <p className="eyebrow">Tiny Bounty</p>
          <h2>{task || "Untitled task"}</h2>
        </div>
        <div className="bounty-stamp">
          <Ticket />
        </div>
      </header>

      <section className="bounty-meta">
        <div>
          <span>Reward note</span>
          <strong>{rewardNote || "--"}</strong>
        </div>
        <div>
          <span>Deadline</span>
          <strong>{deadline || "--"}</strong>
        </div>
        <div>
          <span>Category</span>
          <strong>{category || "--"}</strong>
        </div>
      </section>

      <section className="note-box">
        <span>Request note</span>
        <p>{note || "Post a small task request on Base."}</p>
      </section>

      <footer className="bounty-foot">
        <div>
          <Wallet />
          <span>{shortAddress(maker)}</span>
        </div>
        <div>
          <BadgeCheck />
          <span>{formatDate(createdAt)}</span>
        </div>
      </footer>
    </article>
  );
}

export function TinyBountyApp() {
  const [bountyIdInput, setBountyIdInput] = useState("1");
  const [task, setTask] = useState<string>(PRESETS[0].task);
  const [rewardNote, setRewardNote] = useState<string>(PRESETS[0].rewardNote);
  const [deadline, setDeadline] = useState<string>(PRESETS[0].deadline);
  const [category, setCategory] = useState<string>(PRESETS[0].category);
  const [note, setNote] = useState<string>(PRESETS[0].note);
  const [message, setMessage] = useState("Post a tiny task bounty on Base.");
  const [lastAction, setLastAction] = useState<"post" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedBountyId = BigInt(Math.max(1, Number(bountyIdInput || "1")));

  const bountyQuery = useReadContract({
    abi: tinyBountyAbi,
    address: tinyBountyContractAddress,
    functionName: "getBounty",
    args: [parsedBountyId],
    query: { enabled: Boolean(tinyBountyContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: tinyBountyAbi,
    address: tinyBountyContractAddress,
    functionName: "nextBountyId",
    query: { enabled: Boolean(tinyBountyContractAddress), refetchInterval: 12000 },
  });

  const tuple = bountyQuery.data as
    | readonly [Address, string, string, string, string, string, bigint]
    | undefined;

  const liveBounty = useMemo(
    () =>
      tuple
        ? {
            maker: tuple[0],
            task: tuple[1],
            rewardNote: tuple[2],
            deadline: tuple[3],
            category: tuple[4],
            note: tuple[5],
            createdAt: tuple[6],
          }
        : undefined,
    [tuple],
  );

  const totalBounties = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    task.trim().length > 0 &&
    task.trim().length <= MAX_TASK_LENGTH &&
    rewardNote.trim().length > 0 &&
    rewardNote.trim().length <= MAX_REWARD_LENGTH &&
    deadline.trim().length > 0 &&
    deadline.trim().length <= MAX_DEADLINE_LENGTH &&
    category.trim().length > 0 &&
    category.trim().length <= MAX_CATEGORY_LENGTH &&
    note.trim().length > 0 &&
    note.trim().length <= MAX_NOTE_LENGTH;

  const postBlocker = !tinyBountyContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_TINY_BOUNTY_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill task, reward note, deadline, category, and note."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "post") return;
    void totalQuery.refetch();
    void bountyQuery.refetch();
    const logs = parseEventLogs({ abi: tinyBountyAbi, logs: receipt.logs, eventName: "BountyPosted" });
    const bountyId = logs[0]?.args.bountyId;
    window.setTimeout(() => {
      if (bountyId) setBountyIdInput(bountyId.toString());
      setMessage(bountyId ? `Bounty #${bountyId.toString()} posted on Base.` : "Bounty posted on Base.");
    }, 0);
  }, [lastAction, receipt, totalQuery, bountyQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Post the bounty when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function postBounty() {
    const contractAddress = tinyBountyContractAddress;
    if (postBlocker) {
      setMessage(postBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("post");
      setMessage("Confirm the bounty in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: tinyBountyAbi,
        functionName: "postBounty",
        args: [task.trim(), rewardNote.trim(), deadline.trim(), category.trim(), note.trim()],
        chainId: base.id,
      });
      setMessage("Bounty sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  function applyPreset(index: number) {
    const preset = PRESETS[index];
    setTask(preset.task);
    setRewardNote(preset.rewardNote);
    setDeadline(preset.deadline);
    setCategory(preset.category);
    setNote(preset.note);
  }

  return (
    <main className="min-h-screen bg-[#f4efe7] text-[#27211c]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[390px_minmax(0,1fr)] lg:px-6">
        <aside className="bounty-dock">
          <header className="dock-head">
            <div>
              <p className="eyebrow">Tiny Bounty</p>
              <h1>Post one small task.</h1>
            </div>
            <div className="dock-badge">
              <BriefcaseBusiness aria-hidden="true" />
            </div>
          </header>

          <section className="mini-stats">
            <div>
              <span>Bounties</span>
              <strong>{totalBounties}</strong>
            </div>
            <div>
              <span>Chain</span>
              <strong>Base</strong>
            </div>
          </section>

          <section className="bounty-form">
            <div className="form-title">
              <StickyNote aria-hidden="true" />
              <h2>New bounty</h2>
            </div>
            <div className="preset-row">
              {PRESETS.map((preset, index) => (
                <button key={preset.task} onClick={() => applyPreset(index)}>
                  {index + 1}
                </button>
              ))}
            </div>
            <label>
              <span>Task</span>
              <input value={task} onChange={(event) => setTask(event.target.value)} maxLength={MAX_TASK_LENGTH} />
            </label>
            <label>
              <span>Reward note</span>
              <input value={rewardNote} onChange={(event) => setRewardNote(event.target.value)} maxLength={MAX_REWARD_LENGTH} />
            </label>
            <label>
              <span>Deadline</span>
              <input value={deadline} onChange={(event) => setDeadline(event.target.value)} maxLength={MAX_DEADLINE_LENGTH} />
            </label>
            <label>
              <span>Category</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={MAX_CATEGORY_LENGTH} />
            </label>
            <label>
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={MAX_NOTE_LENGTH} rows={4} />
            </label>
          </section>

          <section className="action-stack">
            {isConnected && chainId !== base.id ? (
              <button className="primary warn" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button className="primary" disabled={writing || confirming} onClick={postBounty}>
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                Post on Base
              </button>
            )}
            {isConnected ? (
              <button className="secondary" onClick={disconnectWallet}>
                {shortAddress(address)}
              </button>
            ) : (
              <button className="secondary" disabled={!selectedConnector || connecting} onClick={connectWallet}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="status">{message}</p>
            {hash ? (
              <a className="tx-link" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">
                View transaction on BaseScan
              </a>
            ) : null}
          </section>
        </aside>

        <section className="view-stack">
          <BountyCard
            task={liveBounty?.task || task}
            rewardNote={liveBounty?.rewardNote || rewardNote}
            deadline={liveBounty?.deadline || deadline}
            category={liveBounty?.category || category}
            note={liveBounty?.note || note}
            maker={liveBounty?.maker}
            createdAt={liveBounty?.createdAt}
          />

          <div className="lower-grid">
            <section className="load-panel">
              <div>
                <Search aria-hidden="true" />
                <h2>Load bounty</h2>
              </div>
              <label>
                <span>Bounty ID</span>
                <input value={bountyIdInput} onChange={(event) => setBountyIdInput(event.target.value.replace(/\D/g, ""))} />
              </label>
            </section>

            <section className="about-panel">
              <p className="eyebrow">What it does</p>
              <p>
                Tiny Bounty posts a compact task request with task, reward note, deadline, category, note, wallet, and timestamp on Base.
              </p>
              <div>
                <span><BriefcaseBusiness aria-hidden="true" /> Task</span>
                <span><CalendarDays aria-hidden="true" /> Deadline</span>
                <span><BadgeCheck aria-hidden="true" /> On Base</span>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
