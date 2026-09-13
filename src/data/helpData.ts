import { HelpTopic } from '../types';

export const helpTopics: Record<string, HelpTopic> = {
  'rate-conversion': {
    id: 'rate-conversion',
    title: 'Conversión de Tasas de Interés',
    definition: 'Proceso financiero para transformar una tasa de interés dada (nominal o efectiva, vencida o anticipada) con una periodicidad específica en su equivalente matemáticamente exacto en otra periodicidad o modalidad.',
    requirements: [
      'Identificar si la tasa de origen es Nominal (divisible) o Efectiva (compuesta).',
      'Definir la periodicidad de pago (diaria, mensual, trimestral, semestral o anual).',
      'Determinar la modalidad de cobro (vencida al final del periodo o anticipada al inicio del periodo).',
      'Especificar los parámetros requeridos para la tasa de destino.'
    ],
    example: {
      scenario: 'Convertir una tasa del 24% Nominal Anual Mes Vencido (NAMV) a una Tasa Efectiva Anual (EA).',
      inputs: {
        'Número de la tasa': '24',
        'Tipo origen': 'Nominal',
        'Periodicidad origen': 'Mensual',
        'Modalidad origen': 'Vencida',
        'Tipo destino': 'Efectiva',
        'Periodicidad destino': 'Anual',
        'Modalidad destino': 'Vencida'
      },
      expectedOutcome: 'Paso 1: i_mensual = 24% / 12 = 2% mensual vencida. Paso 2: EA = (1 + 0,02)¹² - 1 = 26,8242% EA.'
    }
  },

  'tvm': {
    id: 'tvm',
    title: 'Valor del Dinero en el Tiempo (TVM)',
    definition: 'Principio contable y financiero según el cual el dinero disponible en el presente vale más que la misma suma en el futuro debido a su capacidad de generar rendimientos (tasa de interés) e inflación.',
    requirements: [
      'Seleccionar la variable que se desea calcular (VP, VF, VPN, Interés, Anualidades).',
      'Ingresar la tasa de interés periódica equivalente en porcentaje.',
      'Definir el número exacto de periodos de la transacción.',
      'Para VPN: Proporcionar la inversión inicial y la serie de flujos netos proyectados.'
    ],
    example: {
      scenario: 'Calcular el Valor Futuro acumulado de un capital inicial de $5.000.000 COP ahorrado durante 24 meses al 1,5% mensual.',
      inputs: {
        'Cálculo seleccionado': 'Valor Futuro (VF)',
        'Capital Inicial (VP)': '$5.000.000 COP',
        'Tasa de Interés': '1,5% mensual',
        'Número de periodos': '24 meses'
      },
      expectedOutcome: 'VF = $5.000.000 × (1 + 0,015)²⁴ = $7.147.514,06 COP. Interés generado: $2.147.514,06 COP.'
    }
  },

  'economic-diagram': {
    id: 'economic-diagram',
    title: 'Diagramas Económicos y Líneas de Tiempo',
    definition: 'Herramienta gráfica que representa los ingresos (entradas de caja con flechas hacia arriba) y egresos (salidas de caja con flechas hacia abajo) situados a lo largo de un eje horizontal que simboliza el tiempo.',
    requirements: [
      'Seleccionar la estructura de flujo (Préstamo, Inversión, Anualidad, etc.).',
      'Ingresar el monto principal o base en el periodo inicial (t = 0).',
      'Especificar la tasa de oportunidad o costo de capital.',
      'Definir el número de periodos (t = 1, 2, ..., n).'
    ],
    example: {
      scenario: 'Visualización de un préstamo de $10.000.000 COP pagadero en 12 cuotas mensuales con tasa del 2% mensual.',
      inputs: {
        'Tipo de Diagrama': 'Préstamo',
        'Monto Principal': '$10.000.000 COP',
        'Tasa de Interés': '2% mensual',
        'Número de Periodos': '12 meses'
      },
      expectedOutcome: 'Eje horizontal de 0 a 12. Flecha superior verde en t=0 por +$10.000.000 COP. Flechas inferiores rojas en t=1..12 por cada cuota calculada de -$945.595,97 COP.'
    }
  },

  'amortization': {
    id: 'amortization',
    title: 'Tablas de Amortización de Créditos',
    definition: 'Informe detallado período a período que muestra cómo se paga una deuda mediante abonos al capital de interés, saldo pendiente, cargos por seguro y monto total por cuota.',
    requirements: [
      'Elegir el sistema de amortización: Francés (Cuota Fija) o Alemán (Cuota Decreciente con abono constante a capital).',
      'Ingresar el monto total del crédito solicitado.',
      'Especificar la tasa de interés (Anual o Mensual).',
      'Indicar el plazo del crédito (Meses o Años con calendario comercial de 360 días).',
      'Monto opcional de seguro mensual.',
      'Fecha oficial de desembolso del préstamo.'
    ],
    example: {
      scenario: 'Amortización de un préstamo de $12.000.000 COP a 6 meses con tasa anual del 24% y seguro mensual de $10.000 COP bajo el Sistema Francés.',
      inputs: {
        'Sistema': 'Cuota fija (Sistema francés)',
        'Monto': '$12.000.000 COP',
        'Tasa': '24% Tasa anual',
        'Plazo': '6 Meses',
        'Seguro mensual': '$10.000 COP',
        'Fecha': '2026-08-05'
      },
      expectedOutcome: 'Tasa mensual = 24%/12 = 2%. Cuota fija base = $2.141.603,24 COP. Pago total mensual con seguro = $2.151.603,24 COP. Saldo al periodo 6 = $0,00 COP.'
    }
  }
};
