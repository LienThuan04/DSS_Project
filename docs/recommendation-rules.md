# DSS Recommendation Rules Engine Documentation

## Overview

The **Recommendation Rules Engine** is a critical component of the Telecom Customer Churn Decision Support System. It evaluates customer characteristics and churn probability to generate actionable retention recommendations with priority levels.

**Design Principle**: Deterministic, rule-based system that combines quantitative (churn probability) and qualitative (customer attributes) signals to guide support team actions.

---

## Architecture

### Component Layer
```
Input: RecommendationInput {
  churnProbability: number,     // 0-1 (from ML model)
  tenure: number,               // months
  monthlyCharges: number,       // dollars
  contract: string,             // Month-to-month | One year | Two year
  paymentMethod: string,        // Electronic check | Mailed check | Bank transfer | Credit card
  internetService: string,      // DSL | Fiber optic | No
  onlineSecurityService: bool,  // has add-on
  techSupportService: bool      // has add-on
}
         ↓
  [Recommendation Service]
  (Hierarchical Rule Evaluation)
         ↓
Output: RecommendationOutput {
  recommendation: string,       // Action text (50-200 chars)
  priority: enum,               // LOW | NORMAL | HIGH | URGENT
  reasonCodes: string[]         // Codes for tracking/analytics
}
```

### Priority Levels

| Priority | Urgency | Response Time | Audience |
|----------|---------|---------------|----------|
| **URGENT** | Immediate | < 24 hours | Leadership + Field Team |
| **HIGH** | Important | < 48-72 hours | Field Team |
| **NORMAL** | Standard | < 1 week | Customer Service |
| **LOW** | Informational | < 2 weeks | Analytics/Long-term |

---

## Rules (Ordered by Priority)

### Rule 1: URGENT - Critical New Customer ⚠️
**Condition**: Churn > 85% AND Tenure < 6 months

**Rationale**: Customers new to service (< 6 months) with extremely high churn signal require immediate intervention. High churn early in lifecycle often indicates product-market fit issues or onboarding gaps.

**Recommendation**: *"Immediate intervention required! Customer new to service and at critical churn risk. Offer welcome-back discount, dedicated account manager, free premium service upgrade."*

**Actions**:
- Assign dedicated account manager
- Offer free trial of premium services (90 days)
- Provide onboarding call with setup support
- Waive one month's service charge

**Reason Codes**: `CRITICAL_NEW_CUSTOMER`, `EXTREME_CHURN_RISK`

**Example**:
```javascript
{
  churnProbability: 0.90,     // Very high
  tenure: 3,                   // 3 months (< 6)
  monthlyCharges: 75
  // → URGENT priority
}
```

---

### Rule 2: URGENT - High Churn + Month-to-Month Contract ⚠️
**Condition**: Churn > 75% AND Contract = "Month-to-month"

**Rationale**: Month-to-month contracts provide no commitment barrier. Customers showing high churn probability with flexible terms are flight risks. Contract commitment is powerful retention lever.

**Recommendation**: *"Month-to-month customer at high risk! Recommend contract upgrade to 1-2 year plan. Offer loyalty discount (10-20%), add bundle services, or provide bill credit."*

**Actions**:
- Offer 1-year commitment with 15% discount
- Bundle additional services at promo pricing
- Provide bill credit for year contract signing
- Highlight multi-year customer success stories

**Reason Codes**: `HIGH_CHURN_MONTH_TO_MONTH`, `CONTRACT_UPGRADE_OPPORTUNITY`

**Example**:
```javascript
{
  churnProbability: 0.80,     // High
  contract: "Month-to-month", // Flexible
  tenure: 24
  // → URGENT priority
}
```

---

### Rule 3: HIGH - High-Value Customer At Risk 💰
**Condition**: Churn > 70% AND Monthly Charges > $100

**Rationale**: Customers with high monthly bills represent significant revenue. Losing them has material business impact. Price is often a churn factor for high-spend segments.

**Recommendation**: *"High-value customer experiencing churn risk. Bill is elevated ($X/month). Review pricing, offer bundle discount, consolidate services, provide loyalty benefit."*

**Actions**:
- Offer 10-15% volume discount for longer commitment
- Consolidate overlapping services to reduce bill
- Provide service review call (optimization analysis)
- Create VIP customer success program

**Reason Codes**: `HIGH_CHURN_HIGH_VALUE`, `PRICE_SENSITIVITY`

**Example**:
```javascript
{
  churnProbability: 0.72,
  monthlyCharges: 120,        // > $100
  tenure: 18
  // → HIGH priority
}
```

---

### Rule 4: HIGH - Electronic Check Payment 📋
**Condition**: Churn > 70% AND Payment Method = "Electronic check"

**Rationale**: Electronic check is older, less convenient payment method. Customers using this in 2024 may represent older demographics or those encountering friction. Churn + payment method friction = compounding issue.

**Recommendation**: *"Customer uses less convenient payment method and shows churn risk. Recommend automatic bank transfer setup, offer incentive (waive one month for switching)."*

**Actions**:
- Switch to automatic bank transfer (simpler billing)
- Offer one month free service credit for autopay setup
- Reduce billing friction through dashboard simplification
- Quarterly billing option (reduce touch frequency)

**Reason Codes**: `HIGH_CHURN_CHECK_PAYMENT`, `PAYMENT_METHOD_INTERVENTION`

**Example**:
```javascript
{
  churnProbability: 0.75,
  paymentMethod: "Electronic check", // Less convenient
  // → HIGH priority
}
```

---

### Rule 5: HIGH - Early Tenure Churn 📈
**Condition**: Churn > 60% AND 0 < Tenure < 12 months

**Rationale**: Customers in first year show churn risk signals. This represents onboarding/product quality issues. Early intervention prevents permanent loss.

**Recommendation**: *"Relatively new customer (tenure < 12 months) showing churn signals. Prioritize onboarding experience, feature education, check satisfaction, offer setup support."*

**Actions**:
- Schedule customer success call (feature walkthrough)
- Provide personalized onboarding video series
- Offer free tech support for first 90 days (extended)
- Create achievement/milestone tracking for service adoption

**Reason Codes**: `EARLY_TENURE_CHURN`, `CUSTOMER_SUCCESS_INTERVENTION`

**Example**:
```javascript
{
  churnProbability: 0.65,
  tenure: 6,                  // 6 months (between 0-12)
  // → HIGH priority
}
```

---

### Rule 6: HIGH - No Add-on Services 🎁
**Condition**: Churn > 65% AND Online Security = false AND Tech Support = false

**Rationale**: Customers with base service only + churn signal lack service stickiness. Add-on services increase switching costs and perceived value.

**Recommendation**: *"Customer lacks protection/support services and shows churn risk. Bundle offer: Online Security + Tech Support (promotional pricing first 6 months)."*

**Actions**:
- Bundle Online Security + Tech Support at promotional price
- First 6 months at 50% discount (then normal pricing)
- Emphasize protection + peace-of-mind messaging
- Highlight integration with existing service

**Reason Codes**: `HIGH_CHURN_NO_ADDONS`, `UPSELL_OPPORTUNITY`

**Example**:
```javascript
{
  churnProbability: 0.68,
  onlineSecurityService: false,
  techSupportService: false,
  // → HIGH priority
}
```

---

### Rule 7: NORMAL - Month-to-Month Moderate Risk 📊
**Condition**: 50% < Churn ≤ 75% AND Contract = "Month-to-month"

**Rationale**: Moderate churn with flexibility requires attention but not emergency response. Standard retention playbook applies.

**Recommendation**: *"Moderate churn risk on month-to-month contract. Suggest contract commitment with discount (5-10%), value-add services, or loyalty points."*

**Actions**:
- Offer standard loyalty discount (5-10% for 1-year contract)
- Loyalty points program enrollment
- Annual billing discount (auto-pay setup)
- Bundle recommendation based on usage analysis

**Reason Codes**: `MODERATE_CHURN_MTM_CONTRACT`

---

### Rule 8: NORMAL - General Moderate Churn 📊
**Condition**: 50% < Churn ≤ 70%

**Rationale**: Customers showing moderate churn signals need engagement but not emergency response. Standard retention campaigns apply.

**Recommendation**: *"Customer shows moderate churn risk. Implement retention program: satisfaction survey, service review call, loyalty discount, exclusive offers."*

**Actions**:
- Send satisfaction survey (NPS measurement)
- Schedule service review call with agent
- Offer standard loyalty discount (5% for commitment)
- Enroll in loyalty/rewards program
- Provide exclusive new-feature early access

**Reason Codes**: `MODERATE_CHURN_RISK`

---

### Rule 9: LOW - Monitor Month-to-Month 👁️
**Condition**: Churn ≤ 50% AND Contract = "Month-to-month"

**Rationale**: Low churn risk is good, but month-to-month contracts indicate lack of commitment. Gentle nudge to longer-term may increase lifetime value.

**Recommendation**: *"Low churn risk but flexible contract. Consider gentle upsell to longer term (One year+) with minimal discount for commitment. Monitor quarterly."*

**Actions**:
- Quarterly business review (proactive check-in)
- Gentle upsell email to longer-term contract (2-3% discount)
- Highlight customer loyalty milestones
- Standard customer service (no special intervention)

**Reason Codes**: `LOW_CHURN_MTM_MONITOR`

---

### Rule 10: LOW - Low Churn Satisfied 😊
**Condition**: Churn ≤ 50%

**Rationale**: Customer appears satisfied with low churn risk. Focus on retention through standard service + loyalty benefits.

**Recommendation**: *"Low churn risk. Customer appears satisfied. Maintain standard customer service, periodic satisfaction checks, exclusive loyal-customer benefits."*

**Actions**:
- Standard customer service operations
- Periodic (annual) satisfaction survey
- Exclusive loyal-customer benefits program
- VIP tier recognition (if applicable)
- Referral incentive program

**Reason Codes**: `LOW_CHURN_SATISFIED`

---

## Supplementary Functions

### Risk Level Calculation

Helper function standardizes churn probability to 3-level risk scale:

```typescript
getRiskLevel(churnProbability: number): 'LOW' | 'MEDIUM' | 'HIGH'
```

| Range | Level |
|-------|-------|
| 0.00 - 0.33 | LOW |
| 0.33 - 0.67 | MEDIUM |
| 0.67 - 1.00 | HIGH |

**Used By**:
- DSS API response field `risk_level`
- Frontend UI color coding (green/yellow/red)
- Analytics dashboards
- Batch scoring reports

---

## Implementation Details

### Service Integration (Backend)

**File**: `backend-nestjs/src/common/services/recommendation.service.ts`

**Class**: `RecommendationService` (injectable)

**Methods**:
1. `getRecommendation(input: RecommendationInput): RecommendationOutput`
   - Main entry point
   - Evaluates rules in order (1-10)
   - Returns first matching rule

2. `getRiskLevel(churnProbability: number): string`
   - Deterministic mapping
   - Used in predictions API response

3. `getRulesSummary(): string`
   - Returns human-readable rule descriptions
   - Used in documentation/training

### Testing Coverage

**File**: `backend-nestjs/src/common/services/recommendation.service.spec.ts`

**Test Suites**:
- Rule 1-10: Individual rule triggering
- Edge cases: Boundary values, minimal input
- Priority ordering: Ensures first matching rule wins
- Risk level function: Boundary testing
- Summary function: Content validation

**Coverage Goal**: ≥ 95% line coverage

---

## Data Flow Example

### Scenario: High-Value At-Risk Customer

```
1. ML Model Prediction:
   Input: [tenure=18, MonthlyCharges=125, Contract="One year", ...]
   Output: churnProbability = 0.72

2. Backend Prediction Service:
   Input: customer + churnProbability
   Calls RecommendationService.getRecommendation({
     churnProbability: 0.72,
     monthlyCharges: 125,
     contract: "One year",
     tenure: 18
   })

3. Rule Evaluation:
   Rule 1: 0.72 > 0.85? NO → Continue
   Rule 2: 0.72 > 0.75? NO → Continue
   Rule 3: 0.72 > 0.70 && 125 > 100? YES → MATCH!

4. Output:
   {
     recommendation: "High-value customer experiencing churn risk...",
     priority: "HIGH",
     reasonCodes: ["HIGH_CHURN_HIGH_VALUE", "PRICE_SENSITIVITY"]
   }

5. DSS API Response:
   {
     customerId: "abc123",
     churnProbability: 0.72,
     riskLevel: "HIGH",
     recommendation: "High-value customer...",
     priority: "HIGH",
     topFactors: [...],
     ...
   }

6. Frontend Display:
   [🔴 HIGH] $125/mo customer showing churn risk
   Recommendation: Offer bundle discount, service review
```

---

## Maintenance & Evolution

### Rule Modification Process

1. **Data Analysis**: Review churn patterns from prediction history
2. **Business Input**: Consult retention/sales teams for feedback
3. **Rule Validation**: Test against historical scenarios (backtesting)
4. **Unit Test Updates**: Add test cases for new/modified rules
5. **Documentation**: Update this file with changes
6. **Deployment**: Deploy updated service with version bump

### Success Metrics

Track effectiveness by monitoring:
- **Conversion Rate**: % of HIGH/URGENT recommendations that lead to retention actions
- **Win Rate**: % of recommendations where customer does NOT churn after intervention
- **Speed**: Time from prediction → intervention action
- **ROI**: Lifetime value retained vs. intervention cost

### Monitoring & Alerts

Configure alerts for:
- **High Volume URGENT**: > 10% of daily recommendations URGENT (quality issue)
- **Zero Matches**: Recommendations not matching any rule (logic gap)
- **Stale Service**: Recommendation service latency > 500ms

---

## Appendix: Rule Decision Tree

```
START: Evaluate Recommendation

Rule 1: Churn > 85% AND Tenure < 6mo?
  └─ YES → URGENT (Critical New) → STOP
  
Rule 2: Churn > 75% AND Month-to-Month?
  └─ YES → URGENT (MTM High Risk) → STOP
  
Rule 3: Churn > 70% AND Monthly > $100?
  └─ YES → HIGH (High-Value At Risk) → STOP
  
Rule 4: Churn > 70% AND ECheck?
  └─ YES → HIGH (Payment Friction) → STOP
  
Rule 5: Churn > 60% AND 0 < Tenure < 12mo?
  └─ YES → HIGH (Early Tenure) → STOP
  
Rule 6: Churn > 65% AND No Addons?
  └─ YES → HIGH (Upsell Opportunity) → STOP
  
Rule 7: 50% < Churn ≤ 75% AND Month-to-Month?
  └─ YES → NORMAL (MTM Moderate) → STOP
  
Rule 8: 50% < Churn ≤ 70%?
  └─ YES → NORMAL (General Moderate) → STOP
  
Rule 9: Churn ≤ 50% AND Month-to-Month?
  └─ YES → LOW (Monitor MTM) → STOP
  
Rule 10: Churn ≤ 50%?
  └─ YES → LOW (Satisfied) → STOP
  
DEFAULT (unreachable):
  └─ LOW (Default) → STOP
```

---

## References

- Decision Support System Architecture: `/docs/DSS_Architecture.md`
- ML Model Evaluation: `/ml-python/evaluation_results/`
- Predictions Schema: `/backend-nestjs/src/predictions/schemas/prediction.schema.ts`
- ML Service Integration: `/backend-nestjs/src/common/services/ml.service.ts`

---

**Last Updated**: Generated Sept 2024
**Version**: 1.0
**Owner**: DSS Development Team
