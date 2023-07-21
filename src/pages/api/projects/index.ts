import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import db from "@/core/db";
import { createZipFolder } from "@/core/utils/assets";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import s3Client from "@/core/clients/s3";
import replicateClient from "@/core/clients/replicate";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  //   if (!session?.user) {
  //     return res.status(401).json({ message: "Not Authenticated" });
  //   }

  if (req.method === "POST") {
    const urls = req.body.urls as string[];
    const studioName = req.body.studioName as string;
    const instanceClass = req.body.instanceClass as string;

    const project = await db.project.create({
      data: {
        imageUrls: urls,
        name: studioName,
        userId: "clk26d51p0000vngv48pnwjgx",
        modelStatus: "not_created",
        instanceClass: instanceClass || "person",
        instanceName: process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN!,
        credits: Number(process.env.NEXT_PUBLIC_STUDIO_SHOT_AMOUNT) || 50,
      },
    });

    const buffer = await createZipFolder(urls, project);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_UPLOAD_BUCKET!,
        Key: `${project.id}.zip`,
        Body: buffer,
      })
    );

    return res.json({ project });
  }

  if (req.method === "GET") {
    const projects = await db.project.findMany({
      where: { userId: "clk26d51p0000vngv48pnwjgx" },
      include: { shots: { take: 10, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    for (const project of projects) {
      if (project?.replicateModelId && project?.modelStatus !== "succeeded") {
        const { data } = await replicateClient.get(
          `/v1/trainings/${project.replicateModelId}`
        );

        await db.project.update({
          where: { id: project.id },
          data: { modelVersionId: data.version, modelStatus: data?.status },
        });
      }
    }

    return res.json(projects);
  }
};

export default handler;