import { assert, expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

export const shouldStartUserTrade = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#user start trade`, async function () {
    // no need to test this
    // it(`should revert if user did not approved before trade`, async function () {
    //   const usdtAmount: BigNumber = BigNumber.from(100000000); // 100usdt
    //   const gridCount = 4;
    //   const percentChange = 5;
    //   await expect(
    //     this.sleepSwap
    //       .connect(this.signers.alice)
    //       .startYieldSwap(
    //         this.mocks.mockUsdt.address,
    //         usdtAmount,
    //         gridCount,
    //         percentChange
    //       )
    //   ).to.be.reverted;
    // });

    it(`should  start user trade and emit correct event`, async function () {
      // init pool reserve

      // const poolEth = await this.sleepSwap.totalEthInPool();
      // const totalUsdtInPool = await this.sleepSwap.totalUsdtInPool();
      // console.log("total pool eth ", { poolEth, totalUsdtInPool });
      const usdtAmount: BigNumber = BigNumber.from(100000000); // 100usdt
      const gridCount = 4;
      const percentChange = 5;

      await expect(
        this.sleepSwap
          .connect(this.signers.alice)
          .startYieldSwap(
            this.mocks.mockUsdt.address,
            usdtAmount,
            gridCount,
            percentChange
          )
      ).to.emit(this.sleepSwap, "StartYieldSwap");
    });
  });
};
