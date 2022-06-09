import { Fixture, MockContract } from "ethereum-waffle";
import { ContractFactory, Wallet } from "ethers";
import { ethers } from "hardhat";
import { SleepSwap } from "../../typechain";
import { deployMockUsdt } from "./mocks";

type UnitLendingFixtureType = {
  sleepSwap: SleepSwap;
  mockUsdt: MockContract;
};

export const unitSleepSwapFixture: Fixture<UnitLendingFixtureType> = async (
  signers: Wallet[]
) => {
  const deployer: Wallet = signers[0];

  const sleepSwapFactory: ContractFactory = await ethers.getContractFactory(
    `SleepSwap`
  );

  const sleepSwap: SleepSwap = (await sleepSwapFactory
    .connect(deployer)
    .deploy()) as SleepSwap;

  await sleepSwap.deployed();

  console.log("yeild swap deployed ", sleepSwap.address);

  const mockUsdt = await deployMockUsdt(deployer);

  return { sleepSwap, mockUsdt };
};
