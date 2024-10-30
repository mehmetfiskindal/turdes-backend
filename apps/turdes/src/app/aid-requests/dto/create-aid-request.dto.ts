export class CreateAidRequestDto {
  userId: number;

  organizationId: number | null;

  type: string;

  description: string;

  status?: string;
}
