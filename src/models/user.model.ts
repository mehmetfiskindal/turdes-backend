// User Model (models/user.model.ts)
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'Users', timestamps: true })
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'Id',
    primaryKey: true,
  })
  id: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'Name',
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    field: 'Email',
  })
  email: string;

  @Column({
    type: DataType.STRING,
    field: 'Phone',
  })
  phone: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'PasswordHash',
  })
  passwordHash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'Role',
  })
  role: string;
  @Column({
    type: DataType.STRING,
    field: 'RefreshToken',
  })
  refreshToken: string;
}
