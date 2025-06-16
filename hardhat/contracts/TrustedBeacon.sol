// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustedBeacon {
    event ImpressionLogged(
        address indexed reporter,
        string slotId,
        string campaignId,
        string creativeId,
        string pageUrl,
        uint256 viewportShare,
        uint256 timeInView,
        bool userInteraction,
        uint256 clickCount,
        uint256 hoverDuration,
        uint256 timestamp,
        bytes32 hash
    );

    function logImpression(
        string calldata slotId,
        string calldata campaignId,
        string calldata creativeId,
        string calldata pageUrl,
        uint256 viewportShare,
        uint256 timeInView,
        bool userInteraction,
        uint256 clickCount,
        uint256 hoverDuration,
        uint256 timestamp,
        bytes32 hash
    ) external {
        emit ImpressionLogged(
            msg.sender,
            slotId,
            campaignId,
            creativeId,
            pageUrl,
            viewportShare,
            timeInView,
            userInteraction,
            clickCount,
            hoverDuration,
            timestamp,
            hash
        );
    }
}
