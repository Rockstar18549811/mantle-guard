// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuditLogger {
    struct AuditRecord {
        address auditor;
        bytes32 codeHash;
        uint256 score;
        uint256 timestamp;
    }

    AuditRecord[] public audits;

    event AuditLogged(
        address indexed auditor,
        bytes32 codeHash,
        uint256 score,
        uint256 timestamp
    );

    function logAudit(bytes32 codeHash, uint256 score) public {
        AuditRecord memory record = AuditRecord({
            auditor: msg.sender,
            codeHash: codeHash,
            score: score,
            timestamp: block.timestamp
        });

        audits.push(record);

        emit AuditLogged(msg.sender, codeHash, score, block.timestamp);
    }

    function getAuditCount() public view returns (uint256) {
        return audits.length;
    }

    function getAudit(uint256 index) public view returns (
        address auditor,
        bytes32 codeHash,
        uint256 score,
        uint256 timestamp
    ) {
        AuditRecord memory record = audits[index];
        return (record.auditor, record.codeHash, record.score, record.timestamp);
    }
}