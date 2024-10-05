// Organization Model (organizations/models/organization.model.ts)
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'organizations' })
export class Organization extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  address: string;

  @Column({
    type: DataType.STRING,
  })
  contactInfo: string;
}
