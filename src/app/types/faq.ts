export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface FaqItemInput {
  question: string;
  answer: string;
  sortOrder?: number;
}
