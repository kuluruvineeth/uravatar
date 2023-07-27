import { NextApiRequest, NextApiResponse } from "next";
import db from "@/core/db";
import s3Client from "@/core/clients/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const projectId = req.query.id as string;
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const project = await db.project.findFirstOrThrow({
    where: { id: projectId, userId: session.userId },
  });

  if (req.method === "DELETE") {
    const { imageUrls, id } = project;

    for (const imageUrl of imageUrls) {
      const key = imageUrl.split(
        `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/`
      )[1];

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_UPLOAD_BUCKET,
          Key: key,
        })
      );
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_UPLOAD_BUCKET,
        Key: `${project.id}.zip`,
      })
    );

    await db.shot.deleteMany({ where: { projectId: id } });
    await db.project.delete({ where: { id } });

    return res.json({ success: true });
  }
};

export default handler;
