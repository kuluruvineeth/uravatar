import Image from "next/image";
import { Inter } from "next/font/google";
import { Flex } from "@chakra-ui/react";
import Hero from "@/components/home/Hero";
import Slider from "@/components/home/Slider";
import Features from "@/components/home/Features";
import Pricing from "@/components/home/Pricing";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Flex flexDirection="column" marginX="auto" flex="1">
        <Hero />
      </Flex>
      <Slider />
      <Features />
      <Flex px={4} py={10} maxWidth="container.lg" width="100%" marginX="auto">
        <Pricing />
      </Flex>
    </>
  );
}
