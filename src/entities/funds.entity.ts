import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Documents } from './documents.entity';
import { PortfolioAssets } from './portfolioAssets.entity';
import { Holdings } from './holdings.entity';
import { Check } from 'typeorm';

@Check(`"analystRating" BETWEEN 0 AND 10`)
@Check(`"srri" BETWEEN 1 AND 7`)
@Entity()
@Index(['marketCode'], { unique: true })
export class Funds {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 75, unique: true })
  name: string;

  @Column({ length: 30 })
  marketCode: string;

  @Column('decimal', {
    precision: 12,
    scale: 4,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  lastPrice: number | null;

  @Column({ type: 'date', nullable: true })
  lastPriceDate: Date | null;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  ongoingCharge: number;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  sectorName: string | null;

  @Column({ length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  objective: string | null;

  @Column({ type: 'int', nullable: true })
  analystRating: number | null;

  @Column({ type: 'int', nullable: true })
  srri: number | null;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  analystRatingLabel: string | null;

  @OneToMany(() => Documents, (document) => document.fund, { cascade: true })
  @JoinColumn({ name: 'fundId' })
  documents: Documents[];

  @OneToMany(() => PortfolioAssets, (asset) => asset.fund, { cascade: true })
  @JoinColumn({ name: 'fundId' })
  portfolioAssets: PortfolioAssets[];

  @OneToMany(() => Holdings, (holding) => holding.fund, { cascade: true })
  @JoinColumn({ name: 'fundId' })
  holdings: Holdings[];
}
