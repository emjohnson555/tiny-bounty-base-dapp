// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TinyBounty {
    uint256 public nextBountyId = 1;

    struct Bounty {
        address maker;
        string task;
        string rewardNote;
        string deadline;
        string category;
        string note;
        uint256 createdAt;
    }

    mapping(uint256 => Bounty) private bounties;

    event BountyPosted(
        uint256 indexed bountyId,
        address indexed maker,
        string task,
        string rewardNote,
        string deadline
    );

    function postBounty(
        string calldata task,
        string calldata rewardNote,
        string calldata deadline,
        string calldata category,
        string calldata note
    ) external returns (uint256 bountyId) {
        require(bytes(task).length > 0 && bytes(task).length <= 54, "Invalid task");
        require(bytes(rewardNote).length > 0 && bytes(rewardNote).length <= 32, "Invalid reward");
        require(bytes(deadline).length > 0 && bytes(deadline).length <= 28, "Invalid deadline");
        require(bytes(category).length > 0 && bytes(category).length <= 26, "Invalid category");
        require(bytes(note).length > 0 && bytes(note).length <= 180, "Invalid note");

        bountyId = nextBountyId++;
        bounties[bountyId] = Bounty({
            maker: msg.sender,
            task: task,
            rewardNote: rewardNote,
            deadline: deadline,
            category: category,
            note: note,
            createdAt: block.timestamp
        });

        emit BountyPosted(bountyId, msg.sender, task, rewardNote, deadline);
    }

    function getBounty(
        uint256 bountyId
    )
        external
        view
        returns (
            address maker,
            string memory task,
            string memory rewardNote,
            string memory deadline,
            string memory category,
            string memory note,
            uint256 createdAt
        )
    {
        Bounty storage entry = bounties[bountyId];
        return (
            entry.maker,
            entry.task,
            entry.rewardNote,
            entry.deadline,
            entry.category,
            entry.note,
            entry.createdAt
        );
    }
}
