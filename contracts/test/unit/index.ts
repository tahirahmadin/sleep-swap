import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { waffle } from "hardhat";
import { unitSleepSwapFixture } from "../shared/fixtures";
import { Mocks, Signers } from "../shared/types";
import { shouldDeposit } from "./SleepSwap/SleepSwapReserveDeposit.spec";
import { shouldStartUserTrade } from "./SleepSwap/SleepSwapStartTrade.spec";
// import { shouldDeposit } from "./SleepSwap/SleepSwapStartTrade.spec";

describe(`Unit tests`, async () => {
  before(async function () {
    const wallets = waffle.provider.getWallets();

    this.signers = {} as Signers;
    this.signers.deployer = wallets[0];
    this.signers.alice = wallets[1];
    this.signers.bob = wallets[2];

    this.loadFixture = waffle.createFixtureLoader(wallets);
  });

  describe(`SleepSwap deposit reserve`, async () => {
    beforeEach(async function () {
      const { sleepSwap, mockUsdt } = await this.loadFixture(
        unitSleepSwapFixture
      );

      this.sleepSwap = sleepSwap;

      this.mocks = {} as Mocks;
      this.mocks.mockUsdt = mockUsdt;
    });

    shouldDeposit();
  });

  describe(`SleepSwap startTrade`, async () => {
    beforeEach(async function () {
      const { sleepSwap, mockUsdt } = await this.loadFixture(
        unitSleepSwapFixture
      );

      this.sleepSwap = sleepSwap;

      this.mocks = {} as Mocks;
      this.mocks.mockUsdt = mockUsdt;

      console.log("usdt contarct ", mockUsdt.address);
      // deposit resrves in pool to test user trades for each test case
      const usdtAmount: BigNumber = BigNumber.from(10000000000); // 10K usdt
      const etherAmount = parseEther("1"); // 1 ether

      await this.sleepSwap
        .connect(this.signers.deployer)
        .depositReserve(this.mocks.mockUsdt.address, usdtAmount, {
          from: this.signers.deployer.address,
          value: etherAmount,
        });
    });

    shouldStartUserTrade();
  });
});
