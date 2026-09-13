import {
  RateInput,
  RateTarget,
  RateConversionResult,
  TVMInput,
  TVMResult,
  DiagramInput,
  DiagramResult,
  AmortizationInput,
  AmortizationResult,
  AmortizationRow,
  CashFlowItem
} from '../types';
import {
  formatCOP,
  formatPercent,
  formatNumber,
  getPeriodsInYear,
  getPeriodicityLabel
} from './formatters';

// ==========================================
// MODULE 1: RATE CONVERSION
// ==========================================
export function calculateRateConversion(
  source: RateInput,
  target: RateTarget
): RateConversionResult {
  const steps: RateConversionResult['steps'] = [];
  const m1 = getPeriodsInYear(source.periodicity);
  const m2 = getPeriodsInYear(target.periodicity);
  const rDecimal = source.value / 100;

  // Step 1: Source rate to Periodic Vencida Rate (i_pv1)
  let i_pv1 = 0;
  if (source.type === 'nominal') {
    const i_p_raw = rDecimal / m1;
    if (source.modality === 'anticipada') {
      i_pv1 = i_p_raw / (1 - i_p_raw);
      steps.push({
        title: 'Paso 1: Convertir Tasa Nominal Anticipada a Periódica Vencida',
        description: 'Se divide la tasa nominal entre el número de periodos para obtener la tasa periódica anticipada, y luego se convierte a vencida.',
        formula: 'i_pa = j / m₁ → i_pv = i_pa / (1 - i_pa)',
        values: `j = ${source.value}%, m₁ = ${m1} periodos/año → i_pa = ${(i_p_raw * 100).toFixed(6)}%`,
        result: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}% periódica vencida`
      });
    } else {
      i_pv1 = i_p_raw;
      steps.push({
        title: 'Paso 1: Convertir Tasa Nominal Vencida a Periódica Vencida',
        description: 'Se divide la tasa nominal entre el número de periodos en el año.',
        formula: 'i_pv = j / m₁',
        values: `j = ${source.value}%, m₁ = ${m1}`,
        result: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}% periódica vencida`
      });
    }
  } else {
    // Effective source
    if (source.periodicity === 'anual') {
      if (source.modality === 'anticipada') {
        i_pv1 = rDecimal / (1 - rDecimal);
        steps.push({
          title: 'Paso 1: Convertir Efectiva Anual Anticipada a Vencida',
          description: 'Se transforma la tasa efectiva anual anticipada a vencida mediante la relación i_v = i_a / (1 - i_a).',
          formula: 'i_v = i_a / (1 - i_a)',
          values: `i_a = ${source.value}%`,
          result: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}% efectiva anual vencida`
        });
      } else {
        i_pv1 = rDecimal;
        steps.push({
          title: 'Paso 1: Tasa Efectiva Anual Vencida Ingresada',
          description: 'La tasa de origen ya es una tasa efectiva anual vencida.',
          formula: 'EA = i_ingresada',
          values: `EA = ${source.value}%`,
          result: `EA = ${(i_pv1 * 100).toFixed(6)}%`
        });
      }
    } else {
      // Periodic effective
      if (source.modality === 'anticipada') {
        const i_pv_periodic = rDecimal / (1 - rDecimal);
        i_pv1 = i_pv_periodic;
        steps.push({
          title: 'Paso 1: Convertir Tasa Periódica Efectiva Anticipada a Vencida',
          description: 'Se aplica la fórmula de equivalencia vencida-anticipada.',
          formula: 'i_pv = i_pa / (1 - i_pa)',
          values: `i_pa = ${source.value}%`,
          result: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}% periódica vencida`
        });
      } else {
        i_pv1 = rDecimal;
        steps.push({
          title: 'Paso 1: Tasa Periódica Efectiva Vencida Directa',
          description: 'Se toma la tasa periódica efectiva vencida suministrada.',
          formula: 'i_pv = i_ingresada',
          values: `i_pv1 = ${source.value}%`,
          result: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}%`
        });
      }
    }
  }

  // Step 2: Calculate Effective Annual Rate (EA)
  let ea = 0;
  if (source.type === 'efectiva' && source.periodicity === 'anual' && source.modality === 'vencida') {
    ea = rDecimal;
  } else {
    ea = Math.pow(1 + i_pv1, m1) - 1;
    steps.push({
      title: 'Paso 2: Hallar la Tasa Efectiva Anual (EA)',
      description: 'Se capitaliza la tasa periódica vencida durante los m₁ periodos del año.',
      formula: 'EA = (1 + i_pv)ᵐ¹ - 1',
      values: `i_pv1 = ${(i_pv1 * 100).toFixed(6)}%, m₁ = ${m1}`,
      result: `EA = ${(ea * 100).toFixed(6)}% Efectiva Anual`
    });
  }

  // Step 3: Convert EA to Target Periodic Vencida Rate (i_pv2)
  let i_pv2 = Math.pow(1 + ea, 1 / m2) - 1;
  steps.push({
    title: 'Paso 3: Descapitalizar la Tasa EA a la Periodicidad Destino',
    description: 'Se calcula la tasa periódica equivalencia para m₂ periodos del año.',
    formula: 'i_pv2 = (1 + EA)⁽¹/ᵐ²⁾ - 1',
    values: `EA = ${(ea * 100).toFixed(6)}%, m₂ = ${m2}`,
    result: `i_pv2 = ${(i_pv2 * 100).toFixed(6)}% periódica vencida`
  });

  // Step 4: Convert i_pv2 to Target Modality (if anticipada)
  let i_p_target = i_pv2;
  if (target.modality === 'anticipada') {
    i_p_target = i_pv2 / (1 + i_pv2);
    steps.push({
      title: 'Paso 4: Convertir Tasa Periódica Vencida a Periódica Anticipada Destino',
      description: 'Se aplica la transformación de tasa vencida a anticipada.',
      formula: 'i_pa = i_pv / (1 + i_pv)',
      values: `i_pv2 = ${(i_pv2 * 100).toFixed(6)}%`,
      result: `i_pa2 = ${(i_p_target * 100).toFixed(6)}% periódica anticipada`
    });
  }

  // Step 5: Convert to Target Rate Type (Nominal vs Efectiva)
  let finalRate = 0;
  if (target.type === 'nominal') {
    finalRate = i_p_target * m2 * 100;
    steps.push({
      title: 'Paso 5: Multiplicar por m₂ para Obtener la Tasa Nominal Destino',
      description: 'Se multiplica la tasa periódica por el número de periodos en el año de destino.',
      formula: 'j = i_p × m₂',
      values: `i_p = ${(i_p_target * 100).toFixed(6)}%, m₂ = ${m2}`,
      result: `j_destino = ${finalRate.toFixed(4)}% nominal ${target.periodicity} ${target.modality}`
    });
  } else {
    // Target is Efectiva
    if (target.periodicity === 'anual') {
      finalRate = (target.modality === 'anticipada' ? (ea / (1 + ea)) : ea) * 100;
      steps.push({
        title: 'Paso 5: Obtener Tasa Efectiva Anual Destino',
        description: 'Resultado final expresado como tasa efectiva anual.',
        formula: target.modality === 'anticipada' ? 'EA_a = EA / (1 + EA)' : 'EA = EA',
        values: `EA = ${(ea * 100).toFixed(6)}%`,
        result: `Resultado = ${finalRate.toFixed(4)}% efectiva anual ${target.modality}`
      });
    } else {
      finalRate = i_p_target * 100;
      steps.push({
        title: 'Paso 5: Obtener Tasa Periódica Efectiva Destino',
        description: 'Resultado final expresado como tasa periódica efectiva.',
        formula: 'i_efectiva = i_p',
        values: `i_p = ${(i_p_target * 100).toFixed(6)}%`,
        result: `Resultado = ${finalRate.toFixed(4)}% efectiva ${target.periodicity} ${target.modality}`
      });
    }
  }

  return {
    sourceRate: source,
    targetRate: target,
    calculatedRate: finalRate,
    steps,
    effectiveAnnualRate: ea * 100
  };
}

// ==========================================
// MODULE 2: TIME VALUE OF MONEY (TVM)
// ==========================================
export function calculateTVM(input: TVMInput): TVMResult {
  const steps: TVMResult['steps'] = [];
  const i = input.rate / 100; // Periodic or annual rate decimal
  const n = input.periods;
  let finalValue = 0;
  let label = '';

  switch (input.option) {
    case 'vf': {
      const vp = input.vp || 0;
      const compoundFactor = Math.pow(1 + i, n);
      finalValue = vp * compoundFactor;
      label = 'Valor Futuro (VF)';

      steps.push({
        title: 'Fórmula Aplicada: Valor Futuro',
        description: 'Se determina el valor que tendrá en el futuro un capital actual expuesto a una tasa de interés compuesta.',
        formula: 'VF = VP × (1 + i)ⁿ',
        substitution: `VF = ${formatCOP(vp)} × (1 + ${input.rate}%)^${n}`,
        result: `VF = ${formatCOP(vp)} × ${compoundFactor.toFixed(6)} = ${formatCOP(finalValue)}`
      });
      break;
    }
    case 'vp': {
      const vf = input.vf || 0;
      const discountFactor = Math.pow(1 + i, -n);
      finalValue = vf * discountFactor;
      label = 'Valor Presente (VP)';

      steps.push({
        title: 'Fórmula Aplicada: Valor Presente',
        description: 'Se descuenta una cifra futura al momento cero utilizando la tasa de oportunidad/descuento.',
        formula: 'VP = VF / (1 + i)ⁿ = VF × (1 + i)⁻ⁿ',
        substitution: `VP = ${formatCOP(vf)} / (1 + ${input.rate}%)^${n}`,
        result: `VP = ${formatCOP(vf)} × ${discountFactor.toFixed(6)} = ${formatCOP(finalValue)}`
      });
      break;
    }
    case 'vpn': {
      const iInv = input.initialInvestment || 0;
      const flows = input.cashFlows || [];
      let sumPresentValues = 0;

      let subText = '';
      flows.forEach((flow, idx) => {
        const period = idx + 1;
        const pvFlow = flow / Math.pow(1 + i, period);
        sumPresentValues += pvFlow;
        subText += `Periodo ${period}: ${formatCOP(flow)} / (1+${input.rate}%)^${period} = ${formatCOP(pvFlow)}\n`;
      });

      finalValue = -iInv + sumPresentValues;
      label = 'Valor Presente Neto (VPN)';

      steps.push({
        title: 'Descuento de Flujos de Caja',
        description: 'Se trae cada flujo futuro a valor presente con la tasa de descuento ingresada.',
        formula: 'VP_flujos = ∑ [ FCₜ / (1 + i)ᵗ ]',
        substitution: subText.trim(),
        result: `Suma de VPs = ${formatCOP(sumPresentValues)}`
      });

      steps.push({
        title: 'Cálculo del VPN',
        description: 'Se resta la inversión inicial a la suma de los valores presentes de los flujos.',
        formula: 'VPN = - Inversión_Inicial + Suma_VP_Flujos',
        substitution: `VPN = -${formatCOP(iInv)} + ${formatCOP(sumPresentValues)}`,
        result: `VPN = ${formatCOP(finalValue)}`
      });
      break;
    }
    case 'interes': {
      const vp = input.vp || 0;
      const vf = input.vf || (vp * Math.pow(1 + i, n));
      finalValue = vf - vp;
      label = 'Interés Generado (I)';

      steps.push({
        title: 'Cálculo del Interés Generado',
        description: 'Se halla la diferencia monetaria entre el valor futuro acumulado y el valor presente o capital invertido.',
        formula: 'I = VF - VP',
        substitution: `I = ${formatCOP(vf)} - ${formatCOP(vp)}`,
        result: `I = ${formatCOP(finalValue)}`
      });
      break;
    }
    case 'vp-anualidad': {
      const A = input.annuityPayment || 0;
      const isAnticipada = input.annuityType === 'anticipada';
      const factorBase = (1 - Math.pow(1 + i, -n)) / i;
      const factor = isAnticipada ? factorBase * (1 + i) : factorBase;
      finalValue = A * factor;
      label = `Valor Presente de Anualidad (${isAnticipada ? 'Anticipada' : 'Vencida'})`;

      steps.push({
        title: 'Fórmula de Valor Presente de Anualidad',
        description: `Se calcula la equivalencia en el periodo cero de una serie de ${n} pagos periódicos de ${formatCOP(A)}.`,
        formula: isAnticipada 
          ? 'VPA = A × [ (1 - (1 + i)⁻ⁿ) / i ] × (1 + i)' 
          : 'VPA = A × [ (1 - (1 + i)⁻ⁿ) / i ]',
        substitution: `VPA = ${formatCOP(A)} × [ (1 - (1 + ${input.rate}%)^-${n}) / ${input.rate}% ]${isAnticipada ? ' × (1 + ' + input.rate + '%)' : ''}`,
        result: `VPA = ${formatCOP(A)} × ${factor.toFixed(6)} = ${formatCOP(finalValue)}`
      });
      break;
    }
    case 'vf-anualidad': {
      const A = input.annuityPayment || 0;
      const isAnticipada = input.annuityType === 'anticipada';
      const factorBase = (Math.pow(1 + i, n) - 1) / i;
      const factor = isAnticipada ? factorBase * (1 + i) : factorBase;
      finalValue = A * factor;
      label = `Valor Futuro de Anualidad (${isAnticipada ? 'Anticipada' : 'Vencida'})`;

      steps.push({
        title: 'Fórmula de Valor Futuro de Anualidad',
        description: `Se calcula el monto acumulado al periodo ${n} resultante de ahorros o cuotas periódicas de ${formatCOP(A)}.`,
        formula: isAnticipada 
          ? 'VFA = A × [ ((1 + i)ⁿ - 1) / i ] × (1 + i)' 
          : 'VFA = A × [ ((1 + i)ⁿ - 1) / i ]',
        substitution: `VFA = ${formatCOP(A)} × [ ((1 + ${input.rate}%)^${n} - 1) / ${input.rate}% ]${isAnticipada ? ' × (1 + ' + input.rate + '%)' : ''}`,
        result: `VFA = ${formatCOP(A)} × ${factor.toFixed(6)} = ${formatCOP(finalValue)}`
      });
      break;
    }
  }

  return {
    option: input.option,
    finalValue,
    label,
    steps
  };
}

// ==========================================
// MODULE 3: ECONOMIC DIAGRAM
// ==========================================
export function calculateEconomicDiagram(input: DiagramInput): DiagramResult {
  const steps: DiagramResult['steps'] = [];
  const i = input.rate / 100;
  const n = input.periods;
  const flows: CashFlowItem[] = [];
  let calculatedValue = 0;
  let summaryText = '';

  switch (input.type) {
    case 'vp-vf': {
      const vp = input.principal;
      calculatedValue = vp * Math.pow(1 + i, n);
      summaryText = `Un capital inicial de ${formatCOP(vp)} a una tasa del ${input.rate}% durante ${n} periodos genera un Valor Futuro de ${formatCOP(calculatedValue)}.`;

      flows.push({
        period: 0,
        amount: vp,
        type: 'ingreso',
        label: `VP Inicial: ${formatCOP(vp)}`
      });

      for (let p = 1; p < n; p++) {
        flows.push({
          period: p,
          amount: 0,
          type: 'ingreso',
          label: `Periodo ${p}`
        });
      }

      flows.push({
        period: n,
        amount: calculatedValue,
        type: 'egreso',
        label: `VF Acumulado: ${formatCOP(calculatedValue)}`
      });

      steps.push({
        title: 'Capitalización de Valor Presente a Futuro',
        description: 'Representación de una suma única en t=0 que se desplaza en la línea de tiempo hasta t=n.',
        formula: 'VF = VP × (1 + i)ⁿ',
        substitution: `VF = ${formatCOP(vp)} × (1 + ${input.rate}%)^${n}`,
        result: `VF = ${formatCOP(calculatedValue)}`
      });
      break;
    }

    case 'vf-vp': {
      const vf = input.principal;
      calculatedValue = vf / Math.pow(1 + i, n);
      summaryText = `Un valor futuro de ${formatCOP(vf)} al cabo de ${n} periodos con tasa del ${input.rate}% equivale hoy a un Valor Presente de ${formatCOP(calculatedValue)}.`;

      flows.push({
        period: 0,
        amount: calculatedValue,
        type: 'ingreso',
        label: `VP Requerido: ${formatCOP(calculatedValue)}`
      });

      for (let p = 1; p < n; p++) {
        flows.push({
          period: p,
          amount: 0,
          type: 'ingreso',
          label: `Periodo ${p}`
        });
      }

      flows.push({
        period: n,
        amount: vf,
        type: 'egreso',
        label: `VF Meta: ${formatCOP(vf)}`
      });

      steps.push({
        title: 'Descuento de Valor Futuro a Presente',
        description: 'Se halla la cantidad actual equivalente a una obligación o cobro futuro.',
        formula: 'VP = VF / (1 + i)ⁿ',
        substitution: `VP = ${formatCOP(vf)} / (1 + ${input.rate}%)^${n}`,
        result: `VP = ${formatCOP(calculatedValue)}`
      });
      break;
    }

    case 'flujo-caja': {
      const custom = input.customFlows || [];
      let totalVP = 0;
      custom.forEach(item => {
        flows.push(item);
        const sign = item.type === 'ingreso' ? 1 : -1;
        totalVP += sign * item.amount / Math.pow(1 + i, item.period);
      });
      calculatedValue = totalVP;
      summaryText = `Flujo de caja compuesto por ${flows.length} transacciones. El Valor Presente Neto equivalente a la tasa del ${input.rate}% es ${formatCOP(calculatedValue)}.`;

      steps.push({
        title: 'Evaluación del Flujo de Caja',
        description: 'Suma algebraica de los ingresos (+) y egresos (-) actualizados al periodo cero.',
        formula: 'VP_neto = ∑ [ (Ingresosₜ - Egresosₜ) / (1 + i)ᵗ ]',
        substitution: `Evaluado para ${flows.length} periodos con tasa del ${input.rate}%`,
        result: `VP Equivalente = ${formatCOP(calculatedValue)}`
      });
      break;
    }

    case 'prestamo': {
      const principal = input.principal;
      // Fixed payment loan
      const annuity = principal * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      calculatedValue = annuity;
      summaryText = `Préstamo concedido por ${formatCOP(principal)}. Se repaga en ${n} cuotas periódicas fijas de ${formatCOP(annuity)} a la tasa del ${input.rate}%.`;

      // Period 0: Inflow of cash
      flows.push({
        period: 0,
        amount: principal,
        type: 'ingreso',
        label: `Desembolso Préstamo: ${formatCOP(principal)}`
      });

      // Periods 1..n: Outflows of fixed installments
      for (let p = 1; p <= n; p++) {
        flows.push({
          period: p,
          amount: annuity,
          type: 'egreso',
          label: `Cuota ${p}: ${formatCOP(annuity)}`
        });
      }

      steps.push({
        title: 'Cálculo de la Cuota Periódica del Préstamo',
        description: 'Se determina el pago uniforme que amortiza el capital recibido en el periodo 0.',
        formula: 'A = P × [ i(1 + i)ⁿ / ((1 + i)ⁿ - 1) ]',
        substitution: `A = ${formatCOP(principal)} × [ ${input.rate}% × (1 + ${input.rate}%)^${n} / ((1 + ${input.rate}%)^${n} - 1) ]`,
        result: `Cuota Periódica = ${formatCOP(annuity)}`
      });
      break;
    }

    case 'inversion': {
      const inv = input.principal;
      const expectedReturn = inv * Math.pow(1 + i, n);
      calculatedValue = expectedReturn;
      summaryText = `Inversión inicial (salida de caja) de ${formatCOP(inv)}. Al periodo ${n}, el retorno esperado con rentabilidad del ${input.rate}% es ${formatCOP(expectedReturn)}.`;

      flows.push({
        period: 0,
        amount: inv,
        type: 'egreso',
        label: `Inversión Inicial: ${formatCOP(inv)}`
      });

      for (let p = 1; p < n; p++) {
        flows.push({
          period: p,
          amount: 0,
          type: 'ingreso',
          label: `Periodo ${p}`
        });
      }

      flows.push({
        period: n,
        amount: expectedReturn,
        type: 'ingreso',
        label: `Retorno + Capital: ${formatCOP(expectedReturn)}`
      });

      steps.push({
        title: 'Valorización de la Inversión',
        description: 'Flujo de salida en t=0 y retorno de inversión en t=n.',
        formula: 'VF_retorno = Inversión × (1 + i)ⁿ',
        substitution: `VF = ${formatCOP(inv)} × (1 + ${input.rate}%)^${n}`,
        result: `Retorno Total = ${formatCOP(expectedReturn)}`
      });
      break;
    }

    case 'anualidad': {
      const A = input.annuityAmount || input.principal;
      const factorVP = (1 - Math.pow(1 + i, -n)) / i;
      const vpAnnuity = A * factorVP;
      calculatedValue = vpAnnuity;
      summaryText = `Serie uniforme de ${n} pagos de ${formatCOP(A)}. Su Valor Presente equivalente al ${input.rate}% es ${formatCOP(vpAnnuity)}.`;

      flows.push({
        period: 0,
        amount: vpAnnuity,
        type: 'ingreso',
        label: `VP Anualidad: ${formatCOP(vpAnnuity)}`
      });

      for (let p = 1; p <= n; p++) {
        flows.push({
          period: p,
          amount: A,
          type: 'egreso',
          label: `Anualidad ${p}: ${formatCOP(A)}`
        });
      }

      steps.push({
        title: 'Equivalencia de Anualidad',
        description: 'Serie de pagos iguales periódicos distribuidos a lo largo del horizonte de tiempo.',
        formula: 'VP = A × [ (1 - (1 + i)⁻ⁿ) / i ]',
        substitution: `VP = ${formatCOP(A)} × [ (1 - (1 + ${input.rate}%)^-${n}) / ${input.rate}% ]`,
        result: `VP Anualidad = ${formatCOP(vpAnnuity)}`
      });
      break;
    }
  }

  return {
    type: input.type,
    summaryText,
    calculatedMainValue: calculatedValue,
    flows,
    steps
  };
}

// ==========================================
// MODULE 4: AMORTIZATION TABLE
// ==========================================
export function calculateAmortization(input: AmortizationInput): AmortizationResult {
  const steps: AmortizationResult['steps'] = [];

  // Monthly interest rate calculation
  const monthlyRate = input.rateUnit === 'anual'
    ? (input.rateValue / 100) / 12
    : (input.rateValue / 100);

  // Total periods in months
  const totalPeriodsMonths = input.periodUnit === 'anos'
    ? input.periodValue * 12
    : input.periodValue;

  const P = input.loanAmount;
  const S = input.monthlyInsurance || 0;
  const startDateObj = input.startDate ? new Date(input.startDate) : new Date();

  // Helper date adder
  const addMonths = (baseDate: Date, monthsToAdd: number): string => {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + monthsToAdd);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const rows: AmortizationRow[] = [];

  // Step 1: Input conversion explanation
  steps.push({
    title: 'Paso 1: Homogeneización de Tasa y Tiempo',
    description: 'Se convierten la tasa de interés y el plazo a periodicidad mensual.',
    formula: input.rateUnit === 'anual' ? 'i_mensual = i_anual / 12' : 'i_mensual = i_ingresada',
    substitution: `Tasa: ${input.rateValue}% ${input.rateUnit} → i_mensual = ${(monthlyRate * 100).toFixed(4)}% | Plazo: ${input.periodValue} ${input.periodUnit} → ${totalPeriodsMonths} meses`,
    result: `i = ${(monthlyRate * 100).toFixed(4)}% mensual | n = ${totalPeriodsMonths} meses`
  });

  // System Specific Formula & Calculation
  let totalPaid = 0;
  let totalInterest = 0;
  let totalCapital = 0;
  let totalInsurance = 0;

  if (input.system === 'frances') {
    // French System: Fixed Quota (Cuota Fija)
    const factor = Math.pow(1 + monthlyRate, totalPeriodsMonths);
    const fixedQuota = P * (monthlyRate * factor) / (factor - 1);

    steps.push({
      title: 'Paso 2: Cálculo de la Cuota Fija (Sistema Francés)',
      description: 'Se determina la cuota constante mediante la fórmula de valor presente de una anualidad.',
      formula: 'A = P × [ i(1 + i)ⁿ / ((1 + i)ⁿ - 1) ]',
      substitution: `A = ${formatCOP(P)} × [ ${(monthlyRate * 100).toFixed(4)}% × (1 + ${(monthlyRate * 100).toFixed(4)}%)^${totalPeriodsMonths} / ((1 + ${(monthlyRate * 100).toFixed(4)}%)^${totalPeriodsMonths} - 1) ]`,
      result: `Cuota Base Fija = ${formatCOP(fixedQuota)}`
    });

    let currentBalance = P;

    // Period 0
    rows.push({
      period: 0,
      date: addMonths(startDateObj, 0),
      initialBalance: P,
      quota: 0,
      interest: 0,
      capital: 0,
      accumulatedInterest: 0,
      insurance: 0,
      totalPayment: 0,
      endingBalance: P
    });

    let accInterest = 0;

    for (let k = 1; k <= totalPeriodsMonths; k++) {
      const initialBalance = currentBalance;
      const interestPayment = initialBalance * monthlyRate;
      let capitalPayment = fixedQuota - interestPayment;

      // Adjust last period rounding
      if (k === totalPeriodsMonths || capitalPayment > currentBalance) {
        capitalPayment = currentBalance;
      }

      const quota = capitalPayment + interestPayment;
      accInterest += interestPayment;
      const endingBalance = Math.max(0, initialBalance - capitalPayment);

      const totalPayment = quota + S;

      totalPaid += totalPayment;
      totalInterest += interestPayment;
      totalCapital += capitalPayment;
      totalInsurance += S;

      rows.push({
        period: k,
        date: addMonths(startDateObj, k),
        initialBalance,
        quota,
        interest: interestPayment,
        capital: capitalPayment,
        accumulatedInterest: accInterest,
        insurance: S,
        totalPayment,
        endingBalance
      });

      currentBalance = endingBalance;
    }
  } else {
    // German System: Decreasing Quota / Constant Capital Amortization
    const constantCapital = P / totalPeriodsMonths;

    steps.push({
      title: 'Paso 2: Abono Constante a Capital (Sistema Alemán)',
      description: 'El capital del préstamo se divide en partes iguales entre los n periodos. La cuota disminuye periodo a periodo a medida que bajan los intereses.',
      formula: 'K = P / n',
      substitution: `K = ${formatCOP(P)} / ${totalPeriodsMonths}`,
      result: `Capital por Periodo = ${formatCOP(constantCapital)}`
    });

    let currentBalance = P;

    // Period 0
    rows.push({
      period: 0,
      date: addMonths(startDateObj, 0),
      initialBalance: P,
      quota: 0,
      interest: 0,
      capital: 0,
      accumulatedInterest: 0,
      insurance: 0,
      totalPayment: 0,
      endingBalance: P
    });

    let accInterest = 0;

    for (let k = 1; k <= totalPeriodsMonths; k++) {
      const initialBalance = currentBalance;
      const interestPayment = initialBalance * monthlyRate;
      let capitalPayment = constantCapital;

      if (k === totalPeriodsMonths || capitalPayment > currentBalance) {
        capitalPayment = currentBalance;
      }

      const quota = capitalPayment + interestPayment;
      accInterest += interestPayment;
      const endingBalance = Math.max(0, initialBalance - capitalPayment);

      const totalPayment = quota + S;

      totalPaid += totalPayment;
      totalInterest += interestPayment;
      totalCapital += capitalPayment;
      totalInsurance += S;

      rows.push({
        period: k,
        date: addMonths(startDateObj, k),
        initialBalance,
        quota,
        interest: interestPayment,
        capital: capitalPayment,
        accumulatedInterest: accInterest,
        insurance: S,
        totalPayment,
        endingBalance
      });

      currentBalance = endingBalance;
    }
  }

  return {
    input,
    monthlyRate,
    totalPeriodsMonths,
    rows,
    totals: {
      totalPaid,
      totalInterest,
      totalCapital,
      totalInsurance
    },
    steps
  };
}
