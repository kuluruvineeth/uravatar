import Image from "next/image";
import { Inter } from "next/font/google";
import { Flex } from "@chakra-ui/react";
import Hero from "@/components/home/Hero";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Flex flexDirection="column" marginX="auto" flex="1">
        <Hero />
      </Flex>
    </>
  );
}
