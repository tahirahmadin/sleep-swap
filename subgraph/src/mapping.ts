import { BigInt } from "@graphprotocol/graph-ts";
import {
  YeildSwap,
  DepositReserve,
  OwnershipTransferred,
  RunOrder,
  StartYieldSwap,
  WithdrawReserves,
  WithdrawUserFunds,
} from "../generated/YeildSwap/YeildSwap";
import { UserActivity, PoolData } from "../generated/schema";

export function handleDepositReserve(event: DepositReserve): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = PoolData.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (entity == null) {
    entity = new PoolData(event.transaction.from.toHex());

    // Entity fields can be set using simple assignments
    // entity.count = PoolData.fromI32(0);
  }

  // BigInt and BigDecimal math are supported
  entity.totalEth = event.params.ethAmount;

  // Entity fields can be set based on event parameters
  entity.totalToken = event.params.tokenAmount;

  // Entities can be written to the store with `.save()`
  entity.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.interval(...)
  // - contract.lastTimeStamp(...)
  // - contract.manager(...)
  // - contract.orderPrices(...)
  // - contract.orderQue(...)
  // - contract.orderQuePointer(...)
  // - contract.orderTypes(...)
  // - contract.owner(...)
  // - contract.runningIndexUpdate(...)
  // - contract.runningOrders(...)
  // - contract.skippedRunns(...)
  // - contract.stakers(...)
  // - contract.totalEthInPool(...)
  // - contract.totalFee(...)
  // - contract.totalUsdtInPool(...)
  // - contract.users(...)
  // - contract.getPriceUsd(...)
  // - contract.convertUsdtToEth(...)
  // - contract.convertEthToUsdt(...)
  // - contract.getPoolInfo(...)
  // - contract.getUserInfo(...)
  // - contract.getUserOrderStatus(...)
  // - contract.ethTotalBalance(...)
  // - contract.usdtBalance(...)
  // - contract.checkUpkeep(...)
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleRunOrder(event: RunOrder): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let userActivity = UserActivity.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (userActivity == null) {
    userActivity = new UserActivity(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  userActivity.type = event.params.orderType;
  userActivity.atPrice = event.params.ethPirce;
  userActivity.userAddress = event.params.user;
  userActivity.tokenAmount =
    event.params.orderType == "buy"
      ? event.params.fromAmount
      : event.params.toAmount;
  userActivity.ethAmount =
    event.params.orderType == "sell"
      ? event.params.fromAmount
      : event.params.toAmount;
  userActivity.timestamp = event.block.timestamp;
  userActivity.blockNumber = event.block.number;

  // Entities can be written to the store with `.save()`
  userActivity.save();
}

export function handleStartYieldSwap(event: StartYieldSwap): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let userActivity = UserActivity.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (userActivity == null) {
    userActivity = new UserActivity(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  userActivity.type = "deposit";
  userActivity.atPrice = event.params.ethPrice;
  userActivity.userAddress = event.params.userAddress;
  userActivity.tokenAmount = event.params.tokenAmount;
  userActivity.ethAmount = BigInt.fromI32(0);
  userActivity.timestamp = event.block.timestamp;
  userActivity.blockNumber = event.block.number;

  // Entities can be written to the store with `.save()`
  userActivity.save();
}

export function handleWithdrawReserves(event: WithdrawReserves): void {}

export function handleWithdrawUserFunds(event: WithdrawUserFunds): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let userActivity = UserActivity.load(event.transaction.from.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (userActivity == null) {
    userActivity = new UserActivity(event.transaction.from.toHex());
  }

  // Entity fields can be set based on event parameters
  userActivity.type = "withdraw";
  userActivity.atPrice = event.params.ethPrice;
  userActivity.userAddress = event.params.user;
  userActivity.tokenAmount = event.params.userUsdt;
  userActivity.ethAmount = BigInt.fromI32(0);
  userActivity.timestamp = event.block.timestamp;
  userActivity.blockNumber = event.block.number;

  // Entities can be written to the store with `.save()`
  userActivity.save();
}
