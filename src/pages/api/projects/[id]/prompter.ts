import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import db from "@/core/db";
import openai from "@/core/clients/openai";

const hanlder = async (req: NextApiRequest, res: NextApiResponse) => {
  const projectId = req.query.id as string;
  const session = await getSession({ req });

  //   if (!session?.user) {
  //     return res.status(401).json({ message: "Not authenticated" });
  //   }

  let project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: "clk26d51p0000vngv48pnwjgx" },
  });

  const keyword = req.body.keyword as string;

  if (project.promptWizardCredits < 1) {
    return res.status(400).json({ success: false, message: "no_credit" });
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      prompt: `${process.env.OPENAI_API_SEED_PROMPT} ${keyword}`,
    });

    const prompt = completion.data.choices?.[0].text!.trim();

    if (prompt) {
      project = await db.project.update({
        where: { id: project.id },
        data: {
          promptWizardCredits: project.promptWizardCredits - 1,
        },
      });
    }

    res.status(200).json({
      prompt,
      promptWizardCredits: project.promptWizardCredits,
    });
  } catch (e) {
    res.status(400).json({ success: false });
  }
};

export default hanlder;