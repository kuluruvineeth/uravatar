import { Project, Shot } from "@prisma/client";

export type ProjectWithShots = Project & {
  shots: Shot[];
};
