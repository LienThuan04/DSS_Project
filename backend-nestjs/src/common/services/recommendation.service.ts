import { Injectable, Logger } from '@nestjs/common';

export interface RecommendationInput {
  churnProbability: number; // 0-1
  tenure?: number; // months
  monthlyCharges?: number; // dollars
  contract?: string; // Month-to-month, One year, Two year
  paymentMethod?: string; // Electronic check, Mailed check, Bank transfer, Credit card
  internetService?: string; // DSL, Fiber optic, No
  onlineSecurityService?: boolean;
  techSupportService?: boolean;
}

export interface RecommendationOutput {
  recommendation: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  reasonCodes: string[];
}

/**
 * Recommendation Rules Engine for Telecom Customer Churn DSS
 *
 * Rules evaluate customer data and churn probability to provide
 * actionable business recommendations with priority levels.
 *
 * Rules Priority Logic:
 * - URGENT: Immediate intervention required (high churn + unfavorable conditions)
 * - HIGH: Important opportunity for retention (moderate-high churn + risk factors)
 * - NORMAL: Standard retention actions (moderate churn)
 * - LOW: Monitor, minimal intervention needed (low churn)
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  /**
   * Generate recommendation based on churn probability and customer features
   */
  getRecommendation(input: RecommendationInput): RecommendationOutput {
    const reasonCodes: string[] = [];
    let priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';
    let recommendation = '';

    // RULE 1: Critical Risk - Very High Churn Probability + Tenure < 6 months
    if (input.churnProbability > 0.85 && input.tenure !== undefined && input.tenure < 6) {
      priority = 'URGENT';
      recommendation =
        'Immediate intervention required! Customer new to service and at critical churn risk. ' +
        'Offer welcome-back discount, dedicated account manager, free premium service upgrade.';
      reasonCodes.push('CRITICAL_NEW_CUSTOMER');
      reasonCodes.push('EXTREME_CHURN_RISK');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 2: High Churn + Month-to-Month Contract
    if (input.churnProbability > 0.75 && input.contract === 'Month-to-month') {
      priority = 'URGENT';
      recommendation =
        'Month-to-month customer at high risk! Recommend contract upgrade to 1-2 year plan. ' +
        'Offer loyalty discount (10-20%), add bundle services, or provide bill credit.';
      reasonCodes.push('HIGH_CHURN_MONTH_TO_MONTH');
      reasonCodes.push('CONTRACT_UPGRADE_OPPORTUNITY');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 3: Very High Monthly Charges + High Churn Probability
    if (
      input.churnProbability > 0.70 &&
      input.monthlyCharges !== undefined &&
      input.monthlyCharges > 100
    ) {
      priority = 'HIGH';
      recommendation =
        'High-value customer experiencing churn risk. Bill is elevated (>' +
        input.monthlyCharges.toFixed(2) +
        '/month). ' +
        'Review pricing, offer bundle discount, consolidate services, provide loyalty benefit.';
      reasonCodes.push('HIGH_CHURN_HIGH_VALUE');
      reasonCodes.push('PRICE_SENSITIVITY');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 4: Electronic Check Payment Method + High Churn
    if (input.churnProbability > 0.70 && input.paymentMethod === 'Electronic check') {
      priority = 'HIGH';
      recommendation =
        'Customer uses less convenient payment method and shows churn risk. ' +
        'Recommend automatic bank transfer setup, offer incentive (waive one month for switching).';
      reasonCodes.push('HIGH_CHURN_CHECK_PAYMENT');
      reasonCodes.push('PAYMENT_METHOD_INTERVENTION');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 5: Low Tenure + Moderate-High Churn
    if (
      input.churnProbability > 0.60 &&
      input.tenure !== undefined &&
      input.tenure < 12 &&
      input.tenure > 0
    ) {
      priority = 'HIGH';
      recommendation =
        'Relatively new customer (tenure < 12 months) showing churn signals. ' +
        'Prioritize onboarding experience, feature education, check satisfaction, offer setup support.';
      reasonCodes.push('EARLY_TENURE_CHURN');
      reasonCodes.push('CUSTOMER_SUCCESS_INTERVENTION');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 6: Lacking Add-on Services + High Churn
    if (
      input.churnProbability > 0.65 &&
      !input.onlineSecurityService &&
      !input.techSupportService
    ) {
      priority = 'HIGH';
      recommendation =
        'Customer lacks protection/support services and shows churn risk. ' +
        'Bundle offer: Online Security + Tech Support (promotional pricing first 6 months).';
      reasonCodes.push('HIGH_CHURN_NO_ADDONS');
      reasonCodes.push('UPSELL_OPPORTUNITY');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 7: Moderate Churn with Month-to-Month (Standard Intervention)
    if (input.churnProbability > 0.50 && input.contract === 'Month-to-month') {
      priority = 'NORMAL';
      recommendation =
        'Moderate churn risk on month-to-month contract. ' +
        'Suggest contract commitment with discount (5-10%), value-add services, or loyalty points.';
      reasonCodes.push('MODERATE_CHURN_MTM_CONTRACT');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 8: Moderate Churn - General
    if (input.churnProbability > 0.50 && input.churnProbability <= 0.70) {
      priority = 'NORMAL';
      recommendation =
        'Customer shows moderate churn risk. Implement retention program: ' +
        'satisfaction survey, service review call, loyalty discount, exclusive offers.';
      reasonCodes.push('MODERATE_CHURN_RISK');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 9: Low Churn but Month-to-Month (Monitor)
    if (input.churnProbability <= 0.50 && input.contract === 'Month-to-month') {
      priority = 'LOW';
      recommendation =
        'Low churn risk but flexible contract. Consider gentle upsell to longer term ' +
        '(One year+) with minimal discount for commitment. Monitor quarterly.';
      reasonCodes.push('LOW_CHURN_MTM_MONITOR');
      return { recommendation, priority, reasonCodes };
    }

    // RULE 10: Low Churn - Low Priority (Satisfied Customer)
    if (input.churnProbability <= 0.50) {
      priority = 'LOW';
      recommendation =
        'Low churn risk. Customer appears satisfied. ' +
        'Maintain standard customer service, periodic satisfaction checks, exclusive loyal-customer benefits.';
      reasonCodes.push('LOW_CHURN_SATISFIED');
      return { recommendation, priority, reasonCodes };
    }

    // Fallback (should not reach here)
    recommendation = 'Standard retention approach. Monitor and engage regularly.';
    reasonCodes.push('DEFAULT_RULE');
    return { recommendation, priority, reasonCodes };
  }

  /**
   * Calculate risk level from churn probability
   * Used consistently across system
   */
  getRiskLevel(churnProbability: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (churnProbability < 0.33) return 'LOW';
    if (churnProbability < 0.67) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Rule summary for documentation
   */
  getRulesSummary(): string {
    return `
Recommendation Rules Engine - Rule Summary
===========================================

RULE 1: URGENT - Critical New Customer (Churn > 85% AND Tenure < 6 months)
  Action: Immediate welcome support, account manager, premium upgrade

RULE 2: URGENT - Month-to-Month High Risk (Churn > 75% AND Month-to-month)
  Action: Contract upgrade incentive, loyalty discount, bundle services

RULE 3: HIGH - High-Value Customer At Risk (Churn > 70% AND Monthly > $100)
  Action: Price review, bundle discount, service consolidation

RULE 4: HIGH - Electronic Check Payment (Churn > 70% AND Electronic check)
  Action: Payment method upgrade incentive, auto-transfer setup

RULE 5: HIGH - Early Tenure Churn (Churn > 60% AND 0 < Tenure < 12 months)
  Action: Onboarding support, feature education, satisfaction check

RULE 6: HIGH - No Add-on Services (Churn > 65% AND No Security/Tech Support)
  Action: Security + Tech Support bundle offer

RULE 7: NORMAL - Moderate Risk Month-to-Month (Churn > 50% AND Month-to-month)
  Action: Contract incentive, loyalty points, value-add services

RULE 8: NORMAL - General Moderate Risk (50% < Churn ≤ 70%)
  Action: Retention program, satisfaction survey, exclusive offers

RULE 9: LOW - Monitor Month-to-Month (Churn ≤ 50% AND Month-to-month)
  Action: Gentle upsell to longer term contract, quarterly monitoring

RULE 10: LOW - Low Risk Satisfied (Churn ≤ 50%)
  Action: Maintain service, periodic checks, loyalty benefits
    `;
  }
}
