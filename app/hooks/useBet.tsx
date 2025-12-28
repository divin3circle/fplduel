import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client, hederaTestnet } from "@/config/client.thirdweb";
import { toast } from "sonner";
import { contractAbi } from "@/config/contract.config";

export function useBet(contractAddress: string) {
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
    error,
    isSuccess,
  } = useSendTransaction();
  const contract = getContract({
    address: contractAddress,
    chain: hederaTestnet,
    client,
    abi: contractAbi,
  });
  const onClick = ({ outcome, value }: { outcome: number; value: number }) => {
    const valueInWei = BigInt(Math.floor(value * 1e18));

    const transaction = prepareContractCall({
      contract,
      method: "bet",
      params: [outcome as 0 | 1 | 2],
      value: valueInWei,
    });
    sendTx(transaction);
  };
  if (error) {
    toast.error(`Bet failed: ${error.message}`);
  }
  if (isSuccess) {
    toast.success("Bet placed successfully!");
    toast.info(`Hash: ${transactionResult.transactionHash}.`);
  }
  return { onClick, isPending };
}
export function useClaim(contractAddress: string) {
  const {
    mutate: sendTx,
    data: transactionResult,
    isPending,
    error,
    isSuccess,
  } = useSendTransaction();
  const contract = getContract({
    address: contractAddress,
    chain: hederaTestnet,
    client,
    abi: contractAbi,
  });
  const onClick = () => {
    const transaction = prepareContractCall({
      contract,
      method: "claim",
      params: [],
      value: BigInt(0),
    });
    sendTx(transaction);
  };
  if (error) {
    toast.error(`Claim failed: ${error.message}`);
  }
  if (isSuccess) {
    toast.success("Claimed successfully!");
    toast.info(`Hash: ${transactionResult.transactionHash}.`);
  }
  return { onClick, isPending };
}
