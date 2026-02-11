import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Fund } from './fund.entity';

@Entity()
export class Holding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 5 })
  weighting: number;

  @ManyToOne(() => Fund, (fund) => fund.Holdings, { onDelete: 'CASCADE' })
  fund: Fund;
}
