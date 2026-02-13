import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Funds } from './funds.entity';

@Entity()
@Index(['fund', 'name'], { unique: true })
export class Holdings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('decimal', { precision: 10, scale: 5, nullable: true })
  weighting: number;

  @ManyToOne(() => Funds, (fund) => fund.holdings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund: Funds;
}
