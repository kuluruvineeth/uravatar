import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { IoIosFlash } from "react-icons/io";
import { useQuery } from "react-query";

const BuyShotButton = ({
  credits,
  onPaymentSuccess,
}: {
  credits: number;
  onPaymentSuccess: (credits: number, promptWizardCredits: number) => void;
}) => {
  const { push, query } = useRouter();
  const [waitingPayment, setWaitingPayment] = useState(false);

  const { isLoading } = useQuery(
    "check-shot-payment",
    () =>
      axios.get(`/api/checkout/check/${query.ppi}/${query.session_id}/shot`),
    {
      cacheTime: 0,
      refetchInterval: 4,
      retry: 0,
      enabled: waitingPayment,
      onSuccess: (response) => {
        const { credits, promptWizardCredits } = response.data;
        onPaymentSuccess(credits, promptWizardCredits);
      },
      onSettled: () => {
        setWaitingPayment(false);
      },
    }
  );

  useEffect(() => {
    setWaitingPayment(query.ppi === query.id);
  }, [query]);

  const handleShotPayment = (quantity: number) => {
    push(`/api/checkout/shots?quantity=${quantity}&&ppi=${query.id}`);
  };

  return (
    <Menu>
      <MenuButton
        rightIcon={<BsChevronDown />}
        isLoading={false}
        size="xs"
        shadow="none"
        variant="brand"
        as={Button}
      >
        <HStack spacing={0}>
          <IoIosFlash />
          {credits === 0 ? (
            <Text>Buy more shots</Text>
          ) : (
            <Text>
              {credits} Shot{credits > 1 && "s"} left
            </Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList fontSize="sm">
        <MenuItem
          command="Rs.200"
          onClick={() => {
            handleShotPayment(100);
          }}
        >
          <b>100 Shots</b>
          <Text fontSize="xs">+20 prompt assists</Text>
        </MenuItem>
        <MenuItem
          command="Rs.400"
          onClick={() => {
            handleShotPayment(200);
          }}
        >
          <b>200 Shots</b>
          <Text fontSize="xs">+40 prompt assists</Text>
        </MenuItem>
        <MenuItem
          command="Rs.600"
          onClick={() => {
            handleShotPayment(300);
          }}
        >
          <b>300 Shots</b>
          <Text fontSize="xs">+60 prompt assists</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default BuyShotButton;
