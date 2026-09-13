export type ModuleType = 'home' | 'rate-conversion' | 'tvm' | 'economic-diagram' | 'amortization';

export interface CompanyInfo {
  companyName: string;
  nit: string;
  address: string;
  processType: string;
}

// Module 1: Rate Conversion
export type RateType = 'nominal' | 'efectiva';
export type RatePeriodicity = 'diaria' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
export type RateModality = 'vencida' | 'anticipada';

export interface RateInput {
  value: number;
  type: RateType;
  periodicity: RatePeriodicity;
  modality: RateModality;
}

export interface RateTarget {
  type: RateType;
  periodicity: RatePeriodicity;
  modality: RateModality;
}

export interface RateConversionResult {
  sourceRate: RateInput;
  targetRate: RateTarget;
  calculatedRate: number; // percentage value, e.g. 24.50
  steps: {
    title: string;
    description: string;
    formula: string;
    values: string;
    result: string;
  }[];
  effectiveAnnualRate: number;
}

// Module 2: TVM
export type TVMOption = 'vf' | 'vp' | 'vpn' | 'interes' | 'vp-anualidad' | 'vf-anualidad';

export interface TVMInput {
  option: TVMOption;
  vp?: number;
  vf?: number;
  rate: number; // annual or periodic %
  periods: number;
  ratePeriodicity: RatePeriodicity;
  annuityPayment?: number;
  annuityType?: 'vencida' | 'anticipada';
  initialInvestment?: number;
  cashFlows?: number[];
}

export interface TVMResult {
  option: TVMOption;
  finalValue: number;
  label: string;
  steps: {
    title: string;
    description: string;
    formula: string;
    substitution: string;
    result: string;
  }[];
}

// Module 3: Economic Diagram
export type DiagramType = 
  | 'vp-vf' 
  | 'vf-vp' 
  | 'flujo-caja' 
  | 'prestamo' 
  | 'inversion' 
  | 'anualidad';

export interface CashFlowItem {
  period: number;
  amount: number;
  type: 'ingreso' | 'egreso';
  label: string;
}

export interface DiagramInput {
  type: DiagramType;
  principal: number;
  rate: number; // % periodic or annual
  ratePeriodicity: RatePeriodicity;
  periods: number;
  annuityAmount?: number;
  customFlows?: CashFlowItem[];
}

export interface DiagramResult {
  type: DiagramType;
  summaryText: string;
  calculatedMainValue: number;
  flows: CashFlowItem[];
  steps: {
    title: string;
    description: string;
    formula: string;
    substitution: string;
    result: string;
  }[];
}

// Module 4: Amortization
export type AmortizationSystem = 'frances' | 'aleman';
export type RateUnit = 'anual' | 'mensual';
export type PeriodUnit = 'meses' | 'anos';

export interface AmortizationInput {
  system: AmortizationSystem;
  loanAmount: number;
  rateValue: number;
  rateUnit: RateUnit;
  periodValue: number;
  periodUnit: PeriodUnit;
  monthlyInsurance: number;
  startDate: string;
}

export interface AmortizationRow {
  period: number;
  date: string;
  initialBalance: number;
  quota: number;
  interest: number;
  capital: number;
  accumulatedInterest: number;
  insurance: number;
  totalPayment: number; // Capital + seguro or Cuota + seguro
  endingBalance: number;
}

export interface AmortizationResult {
  input: AmortizationInput;
  monthlyRate: number;
  totalPeriodsMonths: number;
  rows: AmortizationRow[];
  totals: {
    totalPaid: number;
    totalInterest: number;
    totalCapital: number;
    totalInsurance: number;
  };
  steps: {
    title: string;
    description: string;
    formula: string;
    substitution: string;
    result: string;
  }[];
}

// Help Modal Info
export interface HelpTopic {
  id: string;
  title: string;
  definition: string;
  requirements: string[];
  example: {
    scenario: string;
    inputs: Record<string, string>;
    expectedOutcome: string;
  };
}
