// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
pragma abicoder v2;

// swap imports
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// BASE TOKEN; USDT - usdtToken
// TRADE TOKENL: ERC20 - tokenAmount

contract SleepSwapV3 is Ownable {
    using SafeCast for int256;
    using SafeMath for uint256;

    //manager: execute trx
    address public manager;

    address public usdtAddress;
    address public tokenAddress;
    uint256 public usdtBalance;
    uint256 public tokenBalance;

    struct Position {
        address user;
        uint256 usdtDeposit; // usdt amount user added initially
        uint256 usdtAmount; // current usdt balance
        uint256 tokenAmount;
        uint256 depositedAt;
    }

    struct Order {
        address user;
        uint256 price;
        uint256 amount;
        bool isBuy;
        bool open;
        bool executed;
    }

    uint256 public ordersCount = 0;

    // mappings
    mapping(uint256 => Order) public orders;
    mapping(address => Position) public positions;

    // swap initializations
    ISwapRouter public immutable swapRouter;
    // For this example, we will set the pool fee to 0.3%.
    uint24 public constant poolFee = 3000;

    // init contract
    constructor(
        address _usdtAddress,
        address _tokenAddress,
        ISwapRouter _swapRouter
    ) {
        usdtAddress = _usdtAddress;
        tokenAddress = _tokenAddress;
        swapRouter = _swapRouter;
    }

    function addManager(address _manager) public onlyOwner {
        manager = _manager;
    }

    // _isBuy: swapFrom , swapTo
    function swapTokenFromUsdt(
        uint256 _amountIn
    ) public returns (uint256 amountOut) {
        // msg.sender must approve this contract

        address _fromToken = usdtAddress;
        address _toToken = tokenAddress;

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(
            usdtAddress,
            msg.sender,
            address(this),
            _amountIn
        );

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(_fromToken, address(swapRouter), _amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _fromToken,
                tokenOut: _toToken,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to exactInputSingle executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    function swapUsdtFromToken(
        uint256 _amountIn
    ) public returns (uint256 amountOut) {
        // msg.sender must approve this contract

        address _fromToken = tokenAddress;
        address _toToken = usdtAddress;

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(
            usdtAddress,
            msg.sender,
            address(this),
            _amountIn
        );

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(_fromToken, address(swapRouter), _amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _fromToken,
                tokenOut: _toToken,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to exactInputSingle executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    // price price = 0.1;
    // 1000 usdt, +> 500usdt 5000 pbr -> grid size
    function stake(
        uint256[] memory _buyPrices,
        uint256[] memory _sellPrices,
        uint256 _amount
    ) public {
        uint256 usdtForBuy = _amount.div(2);
        uint256 tokensForSell = swapTokenFromUsdt(_amount.div(2));
        uint256 singleOrderTokenAmountForSell = tokensForSell.div(
            _sellPrices.length
        );
        uint256 singleOrderUsdtAmountForBuy = usdtForBuy.div(_buyPrices.length);

        for (uint256 i = 0; i < _sellPrices.length; i++) {
            Order memory newOrder = Order({
                user: msg.sender,
                price: _sellPrices[i],
                amount: singleOrderTokenAmountForSell,
                isBuy: false,
                open: true,
                executed: false
            });

            orders[ordersCount++] = newOrder;
        }

        for (uint256 i = 0; i < _buyPrices.length; i++) {
            Order memory newOrder = Order({
                user: msg.sender,
                price: _buyPrices[i],
                amount: singleOrderUsdtAmountForBuy,
                isBuy: true,
                open: true,
                executed: false
            });

            orders[ordersCount++] = newOrder;
        }

        Position memory newPosition = Position({
            user: msg.sender,
            usdtDeposit: _amount + positions[msg.sender].usdtDeposit,
            usdtAmount: _amount.div(2) + positions[msg.sender].usdtAmount,
            tokenAmount: tokensForSell + positions[msg.sender].tokenAmount,
            depositedAt: block.timestamp
        });
        positions[msg.sender] = newPosition;

        //updating contract balances
        usdtBalance += usdtForBuy;
        tokenBalance += tokensForSell;
    }
}
