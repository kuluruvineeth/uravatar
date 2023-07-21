import { Project, Shot } from "@prisma/client";

export type ProjectWithShots = Project & {
  shots: Shot[];
};

export interface IStudioPageProps {
  project: ProjectWithShots & { _count: { shots: number } };
  hasImageInputAvailable: boolean;
}
