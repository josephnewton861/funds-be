import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Fund } from './fund.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // e.g., Factsheet, KIID, Prospectus

  @Column()
  url: string;

  @ManyToOne(() => Fund, (fund) => fund.documents, { onDelete: 'CASCADE' })
  fund: Fund;
}
