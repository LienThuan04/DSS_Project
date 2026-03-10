# Demo Checklist - Customer Churn DSS System

Complete this checklist to successfully demonstrate the Customer Churn Decision Support System.

---

## Pre-Demo Setup (15-20 minutes before demo)

### Environment Verification
- [ ] All 3 services running:
  - Backend on `http://localhost:3001`
  - Frontend on `http://localhost:3000`
  - ML API on `http://localhost:5000`
- [ ] MongoDB running and accessible
- [ ] Check API health: `curl http://localhost:3001/api/health`

### Configuration Check
- [ ] Backend `.env` file configured with:
  - `MONGODB_URL=mongodb://localhost:27017/dss_churn`
  - `ML_API_URL=http://localhost:5000`
  - `PORT=3001`
- [ ] Frontend `.env` file configured with:
  - `REACT_APP_API_URL=http://localhost:3001/api`
- [ ] ML API `.env` file configured if needed

### Data Verification
- [ ] Test data imported to MongoDB:
  - Customer count > 1000
  - Check Customers page loads without errors
- [ ] ML model loaded successfully:
  - Try a test prediction via API or test script
- [ ] No error messages in browser console or server logs

---

## Demo Walkthrough (10-15 minutes)

### Section 1: Navigation & Overview (2 minutes)

**Step 1.1 - Open the Application**
- Open `http://localhost:3000` in Chrome/Firefox
- Point out navigation: Customers, Dashboard, Predictions, What-If Analysis
- Show layout with header and sidebar

**Step 1.2 - System Architecture Overview** (Optional)
- Briefly mention: React frontend → NestJS backend → Python ML API → MongoDB
- Architecture diagram available in `docs/` if needed

---

### Section 2: Customer List & Prediction (3 minutes)

**Step 2.1 - Navigate to Customers**
- Click "Customers" in navigation
- Show customer list with pagination
- Point out key columns: Customer ID, Tenure, Monthly Charges, Contract Type

**Step 2.2 - Select High-Risk Customer**
- Find a customer with:
  - Month-to-month contract (high churn indicator)
  - OR short tenure (< 12 months)
  - Example: Look for customer with tenure = 1-6 months
- Click "Predict" button on that customer row

**Step 2.3 - Show Prediction Result Modal**
The modal should display:
- "Churn Probability: 78%" (or similar, in large red text)
- "Risk Level: HIGH" (color-coded red)
- "Recommendation: Contact customer immediately..."
- "Priority: URGENT" (highlighted)

💡 **Talk Point**: "The system predicts this customer is 78% likely to churn within the next month. Our rules engine recommends URGENT action because of the short tenure + month-to-month contract combination."

**Step 2.4 - Expand Explainability Panel**
- Scroll down in modal to see "Top Factors Influencing This Prediction"
- Show the horizontal bar chart with top 5 factors
- Example factors: Contract (25%), Tenure (22%), MonthlyCharges (18%), InternetService (15%), OnlineSecurity (12%)

💡 **Talk Point**: "The explainability panel shows why the model made this prediction. The biggest factor is the contract type (month-to-month), followed by short tenure. These are the two things that most strongly predict churn for this customer."

---

### Section 3: Dashboard Analytics (3 minutes)

**Step 3.1 - Navigate to Dashboard**
- Click "Dashboard" in navigation
- Show the stats cards at top:
  - Total Customers: XXXX
  - Churn Rate: XX%
  - Total Predictions: XXXX
  - High Risk: XXX

**Step 3.2 - Show Risk Distribution Chart**
- Point out the bar chart showing HIGH/MEDIUM/LOW customer counts
- "This shows our prediction portfolio: how many customers in each risk category"

**Step 3.3 - Show Churn Segmentation Charts** (3-in-1 row)
- **Churn by Contract Type**:
  - Month-to-month: ~42% churn rate (RED)
  - One year: ~11% churn rate (ORANGE)
  - Two year: ~3% churn rate (GREEN)
  - 💡 **Talk Point**: "This clearly shows that contract length is crucial. Month-to-month customers churn at 14x the rate of two-year customers."

- **Churn by Internet Service**:
  - Fiber optic: ~42% (RED)
  - DSL: ~19% (ORANGE)
  - No internet: ~7% (GREEN)
  - 💡 **Talk Point**: "Fiber optic customers experience high churn - possibly service quality issues. This is actionable insight for technical teams."

- **Churn by Payment Method**:
  - Electronic check: ~45% (RED)
  - Others: ~15-20% (ORANGE/GREEN)
  - 💡 **Talk Point**: "Electronic check payment correlates with disengagement. Encouraging automatic payment methods could reduce churn."

---

### Section 4: New Prediction Form (2 minutes)

**Step 4.1 - Navigate to New Prediction**
- Click "Predictions" in sidebar → Select "New Prediction Form" or click navigation
- Show the form with 19 input fields
- Highlight important fields: Contract, InternetService, MonthlyCharges, Tenure, PaymentMethod

**Step 4.2 - Fill in Sample Values**
- Create a hypothetical customer:
  - SeniorCitizen: No
  - Gender: Female
  - Partner: Yes
  - Tenure: 3 months (low value = high risk)
  - MonthlyCharges: $120 (high value)
  - Contract: Month-to-month (high risk)
  - InternetService: Fiber optic (high risk)
  - PaymentMethod: Electronic check (high risk)
  - OnlineSecurity: No

**Step 4.3 - Submit & Show Results**
- Click "Submit" button
- Wait for prediction to load (2-3 seconds)
- Show result card:
  - High churn probability (likely 70%+ due to all risk factors)
  - HIGH or URGENT priority
  - Relevant recommendation

💡 **Talk Point**: "Even without knowing this customer, by answering these 19 questions about their service profile, we can predict churn risk. This enables proactive outreach before they contact us to leave."

---

### Section 5: What-If Simulation (3 minutes)

**Step 5.1 - Navigate to What-If**
- Click "What-If Analysis" or navigate to `/predictions/what-if`
- Show the 2-column interface: Form on left, Results on right

**Step 5.2 - Select a Customer & Show Base Prediction**
- Click customer dropdown, select a customer with high churn probability
- Let system load base prediction
- Point out the gray "Base" card on right showing:
  - Current churn probability: XX%
  - Current risk level: HIGH
  - Current priority: URGENT

**Step 5.3 - Modify Attributes & Compare**
- **Scenario 1: Change Contract Type**
  - In form, change from "Month-to-month" → "Two year"
  - Click "Compare" or "Run Scenario"
  - Show the blue "Scenario" card appearing with:
    - **Churn probability**: Drops to ~15% (from 80%)
    - **Risk level**: Changes from HIGH → LOW (with arrow indicator)
    - **Priority**: Changes from URGENT → NORMAL
  - Show the delta section: "Probability decreased by 65%"

    💡 **Talk Point**: "This is powerful for decision-making. By converting this customer to a 2-year contract, we reduce their churn risk from 80% to 15%. Marketing can use this insight for retention offers."

- **Scenario 2: Add Online Security Service** (if time)
  - Further modify: Add "Online Security: Yes"
  - Show another reduction in churn probability
  - Combine effects of both changes

**Step 5.4 - Show Delta Summary**
- Point out the comparison metrics:
  - Probability delta: ±X.XX
  - Risk level transition: HIGH → LOW (with arrow)
  - Priority transition: URGENT → NORMAL
  - Summary text explaining the impact

---

### Section 6: Dashboard Continued (1 minute, if time permits)

**Step 6.1 - Show Additional Chart Interactions**
- Hover over chart bars to show exact percentages
- Point out color coding (red = high churn, green = low churn)
- "These insights drive business strategy: focus on fiber optic infrastructure, promote long-term contracts, enable automatic payment"

---

## Advanced Demo Points (If Time Permits)

### CSV Import (Batch Prediction)
- Go to Customers page
- Show "Import CSV" button
- Explain: "You can bulk import customer lists and the system validates all data"
- (Optional: Show error reporting if validation fails)

### Explainability in Detail
- From any prediction, open explainability panel
- Explain normalized importance scores (0-100%)
- "Each bar shows how much that factor contributes to the prediction"
- "This transparency helps explain recommendations to stakeholders"

### Mobile Responsiveness
- Resize browser window to tablet/mobile size
- Show that dashboard and forms remain functional
- Point out responsive grid: charts stack on small screens

---

## Troubleshooting & Common Issues

### Issue: Prediction Takes >10 seconds
- **Cause**: ML API not running or slow startup
- **Fix**: Restart ML API, check `python ml-python/predict_api.py`
- **Prevention**: Start ML API first before starting backend

### Issue: Charts Show No Data
- **Cause**: Predictions haven't been made yet or MongoDB connection issue
- **Fix**: Make a few predictions first, or check MongoDB connection
- **Fallback**: Use test data: `npm run seed:data` (if seed script exists)

### Issue: Prediction Modal Doesn't Load
- **Cause**: Likely ML API unreachable or validation error
- **Fix**: Check browser console for error message
- **Restart**: Backend: `npm run start`, ML API: `python predict_api.py`

### Issue: What-If Simulation Doesn't Work
- **Cause**: Customer list not loading (API issue)
- **Fix**: Check that `/customers` endpoint works: `curl http://localhost:3001/api/customers`
- **Alternative**: Pre-select a customer ID if dropdown fails

### Issue: Dashboard Charts Empty
- **Cause**: Prediction history is empty (no predictions made yet)
- **Fix**: Make 5-10 predictions first from Customers page or Predictions form
- **Time**: Give system 30 seconds to aggregate predictions

---

## Estimated Timing

| Section | Time | Flexible? |
|---------|------|-----------|
| Pre-Demo Setup | 15-20 min | No (critical) |
| Section 1: Overview | 2 min | Yes (-1 min) |
| Section 2: Prediction | 3 min | Yes (-1 min) |
| Section 3: Dashboard | 3 min | Yes (-1 min) |
| Section 4: New Form | 2 min | Yes (-1 min) |
| Section 5: What-If | 3 min | Yes (-1 min) |
| **Total** | **13-16 min** | **Can compress to 10 min** |

---

## Demo Talking Points

### Why This System Matters
- "Customer churn costs companies millions. Even 5% reduction saves $500K+."
- "Knowing which customers to contact proactively is much cheaper than losing them."

### Key Features to Emphasize
1. **Prediction**: "80%+ accuracy on churn prediction using machine learning"
2. **Actionability**: "Not just probability - specific recommendations for retention teams"
3. **Explainability**: "We show WHY the model predicts churn, not just black-box numbers"
4. **Scenario Planning**: "What-if lets teams plan retention strategies before executing"
5. **Analytics**: "Dashboard shows company-wide patterns, not just individual predictions"

### Business Impact
- **Retention Teams**: "Get a prioritized list of customers to contact, with talking points"
- **Management**: "Understand churn drivers at segment level (contract type, service type, etc.)"
- **Marketing**: "Data on which retention offers work best (see what-if scenario effects)"
- **Technical Teams**: "Identify service quality issues (e.g., fiber optic churn rate)"

---

## Post-Demo Checklist

- [ ] Thank audience and ask for feedback/questions
- [ ] Share GitHub repo link if applicable
- [ ] Offer to run additional scenarios if asked
- [ ] Note any bugs or feature requests mentioned
- [ ] Collect contact information if user wants to discuss further

---

**Last Updated**: 2026-03-10  
**Demo Duration**: 10-15 minutes  
**Setup Time**: 15-20 minutes  
