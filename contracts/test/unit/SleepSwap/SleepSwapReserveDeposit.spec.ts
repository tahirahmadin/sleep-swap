import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit reserves`, async function () {
    it(`should revert if usdt is not greater than 0`, async function () {
      const usdtAmount = ethers.constants.Zero;
      const etherAmount = parseEther("1");
      await expect(
        this.sleepSwap
          .connect(this.signers.deployer)
          .depositReserve(this.mocks.mockUsdt.address, usdtAmount, {
            from: this.signers.deployer.address,
            value: etherAmount,
          })
      ).to.be.reverted;
    });

    it(`should revert if ether amount is not greater than 0`, async function () {
      const usdtAmount: BigNumber = BigNumber.from(100000000); // 100usdt
      const etherAmount = parseEther("0");

      await expect(
        this.sleepSwap
          .connect(this.signers.deployer)
          .depositReserve(this.mocks.mockUsdt.address, usdtAmount, {
            from: this.signers.deployer.address,
            value: etherAmount,
          })
      ).to.be.reverted;
    });

    it(`should deposit and emit correct events and update correct values to storage variable`, async function () {
      const usdtAmount: BigNumber = BigNumber.from(10000000000); // 10K usdt
      const etherAmount = parseEther("1"); // 1 ether

      await expect(
        this.sleepSwap
          .connect(this.signers.deployer)
          .depositReserve(this.mocks.mockUsdt.address, usdtAmount, {
            from: this.signers.deployer.address,
            value: etherAmount,
          })
      ).to.emit(this.sleepSwap, "DepositReserve");

      const currentEthInPool: BigNumber = await this.sleepSwap.totalEthInPool();
      const currentUSDTInPool: BigNumber =
        await this.sleepSwap.totalUsdtInPool();
      assert(
        currentEthInPool.eq(etherAmount),
        "Should deposit correct eth amount"
      );
      assert(
        currentUSDTInPool.eq(usdtAmount),
        "Should deposit correct usdt amount"
      );
    });

    it(`should revert if withdraw without reserve`, async function () {
      await expect(
        this.sleepSwap
          .connect(this.signers.deployer)
          .withdrawReserve(this.mocks.mockUsdt.address)
      ).to.be.revertedWith(
        "ETH or USDT reserve in pool must be greater than 0."
      );
    });

    // it.only(`should withdraw reserves and emit correct events and update correct values to storage variable`, async function () {
    //   // const usdtAmount: BigNumber = BigNumber.from(10000000000); // 10K usdt
    //   // const etherAmount = parseEther("1"); // 1 ether
    //   // await expect(
    //   //   this.sleepSwap
    //   //     .connect(this.signers.deployer)
    //   //     .depositReserve(this.mocks.mockUsdt.address, usdtAmount, {
    //   //       from: this.signers.deployer.address,
    //   //       value: etherAmount,
    //   //     })
    //   // ).to.emit(this.sleepSwap, "DepositReserve");

    //   // await this.mocks.mockUsdt.approve.returns();
    //   await expect(
    //     this.sleepSwap
    //       .connect(this.signers.deployer)
    //       .withdrawReserve(this.mocks.mockUsdt.address)
    //   ).to.emit(this.sleepSwap, "WithdrawReserves");

    //   const currentEthInPool: BigNumber = await this.sleepSwap.totalEthInPool();
    //   const currentUSDTInPool: BigNumber =
    //     await this.sleepSwap.totalUsdtInPool();
    //   // console.log(usdtAmount);
    //   // console.log(currentUSDTInPool);
    //   assert(currentEthInPool.eq(0), "Should deposit correct eth amount");
    //   assert(currentUSDTInPool.eq(0), "Should deposit correct usdt amount");
    // });
  });
};
