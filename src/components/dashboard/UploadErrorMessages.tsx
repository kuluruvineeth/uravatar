import { Box, Text } from "@chakra-ui/react";

const UploadErrorMessages = ({
  messages,
}: {
  messages: string[] | undefined;
}) => {
  return (
    <Box mt={2} color="red.500">
      <Text fontWeight="bold">There are some errors with your images:</Text>
      {messages?.map((errorMessage) => (
        <Box key={errorMessage}>
          {errorMessage
            .replace("10000000 bytes", "10 mo")
            .replace("many files", "many files (max 25)")}
        </Box>
      ))}
    </Box>
  );
};

export default UploadErrorMessages;
