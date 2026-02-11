import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Fund } from './fund.entity';

@Entity()
export class PortfolioAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column('decimal', { precision: 10, scale: 5 })
  value: number;

  @ManyToOne(() => Fund, (fund) => fund.portfolioAssets, {
    onDelete: 'CASCADE',
  })
  fund: Fund;
}
