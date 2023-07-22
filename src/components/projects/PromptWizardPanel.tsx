import useProjectContext from "@/hooks/use-project-context";
import { Button, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FaMagic } from "react-icons/fa";

const PromptWizardPanel = ({ onClose }: { onClose: () => void }) => {
  const { promptInputRef, updatePromptWizardCredits, promptWizardCredits } =
    useProjectContext();

  const [keyword, setKeyword] = useState<string>("");

  return (
    <VStack
      as="form"
      maxWidth="30rem"
      alignItems="flex-start"
      flexDirection="column"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (keyword) {
        }
      }}
    >
      <Text mb={2}>
        Enter a <b>topic or concept</b> and our AI will generate a good prompt
        example based on it:
      </Text>
      <Input
        autoFocus
        placeholder="Cowboy, Pirate, Zombie...."
        value={keyword}
        onChange={(e) => setKeyword(e.currentTarget.value)}
      />
      <Button
        disabled={promptWizardCredits === 0}
        variant="brand"
        rightIcon={<FaMagic />}
        isLoading={false}
        type="submit"
      >
        Generate
      </Button>
    </VStack>
  );
};

export default PromptWizardPanel;
