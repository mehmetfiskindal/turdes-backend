// AidRequest Model (aid-requests/models/aid-request.model.ts)
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'aid_requests' })
export class AidRequest extends Model {
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
