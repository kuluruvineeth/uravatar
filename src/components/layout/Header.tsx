import { Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import Link from "next/link";
import { IoIosFlash } from "react-icons/io";

const Header = () => {
  return (
    <Flex
      width="100%"
      flexDirection="column"
      marginX="auto"
      maxWidth="container.lg"
      px="2"
    >
      <Flex justifyContent="space-between" py={4} as="footer">
        <Flex
          role="group"
          as={Link}
          href="/"
          alignItems="center"
          fontWeight="bold"
          fontSize="2xl"
        >
          <Icon
            transition="200ms all"
            _groupHover={{ color: "brand.500" }}
            as={IoIosFlash}
          />
          <Text display={{ base: "none", sm: "inherit" }}>UrAvatar.</Text>
        </Flex>
        <HStack spacing={1}>
          <Button
            as={Link}
            href="/prompts"
            colorScheme="beige"
            variant="ghost"
            size="sm"
          >
            Prompts
          </Button>
          <Button href="/login" as={Link} variant="brand" size="sm">
            Login
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Header;
