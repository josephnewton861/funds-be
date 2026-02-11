import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Document } from './document.entity';
import { PortfolioAsset } from './portfolio-asset.entity';
import { Holding } from './holding.entity';

@Entity()
export class Fund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 75 })
  name: string;

  @Column({ length: 50, unique: true })
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
  lastPrice: number;

  @Column({ type: 'date', nullable: true })
  lastPriceDate: string;

  @Column('decimal', {
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  ongoingCharge: number;

  @Column({ length: 255, nullable: true })
  sectorName: string;

  @Column({ length: 10, nullable: true })
  currency: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'int', nullable: true })
  analystRating: number;

  @Column({ length: 50, nullable: true })
  analystRatingLabel: string;

  @Column({ type: 'int', nullable: true })
  srri: number;

  @OneToMany(() => Document, (document) => document.fund, { cascade: true })
  documents: Document[];

  @OneToMany(() => PortfolioAsset, (asset) => asset.fund, { cascade: true })
  portfolioAssets: PortfolioAsset[];

  @OneToMany(() => Holding, (holding) => holding.fund, { cascade: true })
  holdings: Holding[];
}
