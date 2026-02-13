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
@Index(['fund', 'url'], { unique: true })
export class Documents {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, length: 30 })
  type: string;

  @Column({ length: 255 })
  url: string;

  @ManyToOne(() => Funds, (fund) => fund.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund: Funds;
}
