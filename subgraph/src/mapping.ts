import { BigInt } from "@graphprotocol/graph-ts";
import {
  CancelOrder,
  OrderCreated,
  OrderExecuted,
  Staked,
  Withdraw,
} from "../generated/SleepSwapV3/SleepSwapV3";
import {
  Deposit,
  Order,
  OrderCancellation,
  OrderExecution,
  Position,
  Withdrawal,
} from "../generated/schema";

export function handleStaked(event: Staked): void {
  // create new deposit records
  let entity = new Deposit(event.transaction.hash.toHex());

  // BigInt and BigDecimal math are supported
  entity.user = event.params.user;
  entity.amount = event.params.amount;
  entity.usdtForBuy = event.params.usdtForBuy;
  entity.tokensForSell = event.params.tokensForSell;
  entity.save();

  // create new position or update existing position

  let positionEntity = Position.load(event.params.user.toHex());

  if (!positionEntity) {
    positionEntity = new Position(event.params.user.toHex());
  }

  positionEntity.user = event.params.user;
  positionEntity.usdtDeposit = positionEntity.usdtDeposit.plus(
    event.params.amount
  );
  positionEntity.usdtAmount = positionEntity.usdtAmount.plus(
    event.params.usdtForBuy
  );
  positionEntity.tokenAmount = positionEntity.tokenAmount.plus(
    event.params.tokensForSell
  );
  positionEntity.save();
}

export function handleOrderCreated(event: OrderCreated): void {
  // create new deposit records
  let orderEntiry = new Order(event.params.orderId.toHex());

  // BigInt and BigDecimal math are supported
  orderEntiry.user = event.params.user;
  orderEntiry.price = event.params.price;
  orderEntiry.amount = event.params.amount;
  orderEntiry.isBuy = event.params.isBuy;
  orderEntiry.open = event.params.open;
  orderEntiry.executed = event.params.executed;
  orderEntiry.save();
}

export function handleOrderExecuted(event: OrderExecuted): void {
  // create new deposit records
  let executedOrder = new OrderExecution(event.params.orderId.toHex());

  // BigInt and BigDecimal math are supported
  executedOrder.user = event.params.user;
  executedOrder.price = event.params.price;
  executedOrder.amount = event.params.amount;
  executedOrder.isBuy = event.params.isBuy;
  executedOrder.recieved = event.params.recieved;

  let createdOrder = Order.load(event.params.orderId.toHex());

  executedOrder.save();
  if (createdOrder == null) {
    return;
  }

  createdOrder.open = false;
  createdOrder.executed = true;
  createdOrder.save();

  // position update:
}

export function handleCancelOrder(event: CancelOrder): void {
  // create new deposit records
  let cancellation = new OrderCancellation(event.params.orderId.toHex());

  // BigInt and BigDecimal math are supported
  cancellation.user = event.params.user;
  cancellation.orderId = event.params.orderId;
  cancellation.isBuy = event.params.isBuy;
  cancellation.save();

  let createdOrder = Order.load(event.params.orderId.toHex());

  if (createdOrder == null) {
    return;
  }

  createdOrder.open = false;
  createdOrder.executed = false;
  createdOrder.save();
}

export function handleWithdraw(event: Withdraw): void {
  // create new deposit records
  let withdraw = new Withdrawal(event.transaction.hash.toHex());

  // BigInt and BigDecimal math are supported
  withdraw.user = event.params.user;
  withdraw.usdtAmount = event.params.usdtAmount;
  withdraw.tokenAmount = event.params.tokenAmount;
  withdraw.save();

  //update userposition
  let userPosition = Position.load(event.params.user.toHex());

  if (userPosition == null) {
    return;
  }

  userPosition.usdtDeposit = userPosition.usdtDeposit.minus(
    event.params.usdtAmount
  );
  userPosition.tokenAmount = userPosition.usdtAmount.minus(
    event.params.tokenAmount
  );
  userPosition.usdtDeposit = BigInt.fromI32(0);
  userPosition.save();
}
