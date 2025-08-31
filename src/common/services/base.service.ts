import { PrismaService } from '../../app/prisma/prisma.service';

export abstract class BaseService<T, CreateDto, UpdateDto> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract create(data: CreateDto): Promise<T>;
  abstract findAll(): Promise<T[]>;
  abstract findOne(id: number): Promise<T | null>;
  abstract update(id: number, data: UpdateDto): Promise<T>;
  abstract delete(id: number): Promise<void>;

  protected async exists(id: number, tableName: string): Promise<boolean> {
    const result = await (this.prisma as any)[tableName].findUnique({
      where: { id },
      select: { id: true },
    });
    return !!result;
  }

  protected createPaginationQuery(
    page: number = 1,
    limit: number = 10,
    search?: string,
    searchFields?: string[],
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    let where = {};
    if (search && searchFields && searchFields.length > 0) {
      where = {
        OR: searchFields.map((field) => ({
          [field]: {
            contains: search,
            mode: 'insensitive',
          },
        })),
      };
    }

    return { skip, take, where };
  }
}
