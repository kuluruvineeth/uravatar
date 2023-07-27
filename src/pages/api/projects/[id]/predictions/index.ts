import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import db from "@/core/db";
import replicateClient from "@/core/clients/replicate";
import { replacePromptToken } from "@/core/utils/predictions";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prompt = req.body.prompt as string;
  const seed = req.body.seed as number;
  const image = req.body.image as string;

  const projectId = req.query.id as string;
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: session.userId },
  });

  if (project.credits < 1) {
    return res.status(400).json({ message: "No credit" });
  }

  const { data } = await replicateClient.post(
    `https://api.replicate.com/v1/predictions`,
    {
      input: {
        prompt: replacePromptToken(prompt, project),
        negative_prompt: process.env.REPLICATE_NEGATIVE_PROMPT,
        ...(image && { image }),
        ...(seed && { seed }),
      },
      version: project.modelVersionId,
    }
  );

  const shot = await db.shot.create({
    data: {
      prompt,
      replicateId: data.id,
      status: "starting",
      projectId: project.id,
    },
  });

  await db.project.update({
    where: { id: project.id },
    data: {
      credits: project.credits - 1,
    },
  });

  return res.json({ shot });
};

export default handler;
