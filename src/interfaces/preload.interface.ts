export interface FundsApiResponse {
  data?: {
    quote?: {
      name?: string;
      marketCode?: string;
      lastPrice?: number;
      lastPriceDate?: string;
      ongoingCharge?: number;
      sectorName?: string;
      currency?: string;
    };

    profile?: {
      objective?: string;
    };

    ratings?: {
      analystRating?: number;
      SRRI?: number;
      analystRatingLabel?: string;
    };

    documents?: {
      title?: string;
      url?: string;
      type?: string;
    }[];

    portfolio?: {
      top10Holdings?: {
        name?: string;
        weighting?: number;
      }[];

      asset?: {
        label?: string;
        value?: number;
      }[];
    };
  };
}
