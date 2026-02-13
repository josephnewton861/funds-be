import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Funds } from './funds.entity';

@Entity({ name: 'portfolio_assets' })
@Index(['fund', 'label'], { unique: true })
export class PortfolioAssets {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  label: string;

  @Column('decimal', { precision: 10, scale: 5 })
  value: number;

  @ManyToOne(() => Funds, (fund) => fund.portfolioAssets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fundId' })
  fund: Funds;
}
