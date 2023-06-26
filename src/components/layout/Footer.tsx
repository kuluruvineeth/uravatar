import { Box, Container, Stack, Text, chakra } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";

const SocialButton = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <chakra.button
      href={href}
      as="a"
      bg="blackAlpha.100"
      rounded="full"
      w={8}
      h={8}
      target="__blank"
      cursor="pointer"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="background 0.3s ease"
      _hover={{
        bg: "blackAlpha.400",
      }}
    >
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  return (
    <Box>
      <Container
        as={Stack}
        maxWidth="container.lg"
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={6}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Text></Text>
        <Stack alignItems="center" direction="row" spacing={4}>
          <Text fontSize="sm">
            <Link href="">Terms and Privacy</Link>
          </Text>
          <Text fontSize="sm">
            <Link href="">FAQ</Link>
          </Text>
          <SocialButton href="https://github.com/kuluruvineeth/uravatar">
            <FaGithub />
          </SocialButton>
          <SocialButton href="https://twitter.com/kuluruvineeth">
            <FaTwitter />
          </SocialButton>
          <SocialButton href="mailto:kuluruvineeth8623@gmail.com">
            <MdAlternateEmail />
          </SocialButton>
          <Text
            display={{ base: "none", sm: "block" }}
            fontSize="lg"
            fontWeight="bold"
          >
            UrAvatar.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
