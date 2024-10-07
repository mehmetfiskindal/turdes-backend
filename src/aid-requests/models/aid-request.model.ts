// AidRequest Model (aid-requests/models/aid-request.model.ts)
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Organization } from 'src/organizations/models/organization.model';

@Table({ tableName: 'aid_requests' })
export class AidRequest extends Model {
  @ForeignKey(() => Organization)
  @Column
  organizationId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  status: string;
}
