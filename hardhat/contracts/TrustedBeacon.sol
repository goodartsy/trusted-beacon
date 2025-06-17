// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustedBeacon {
    // Struct to bundle impression data
    struct Impression {
        string slotId;
        string campaignId;
        string creativeId;
        string pageUrl;
        uint256 viewportShare;
        uint256 timeInView;
        bool userInteraction;
        uint256 clickCount;
        uint256 hoverDuration;
        uint256 timestamp;
        bytes32 hash;
    }

    // Event emitting the structured impression data
    event ImpressionLogged(
        address indexed reporter,
        Impression data
    );

    // Log an impression by passing the Impression struct
    function logImpression(Impression calldata data) external {
        emit ImpressionLogged(msg.sender, data);
    }
}
