# API Documentation - Customer Churn DSS

Complete REST API reference for the Customer Churn Decision Support System.

---

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, no API key authentication is required. In production, add Bearer token authentication.

---

## Health Check

### GET /health

Check API health status.

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-03-10T10:30:00Z"
}
```

---

## Customers

### GET /customers

List all customers with pagination.

**Query Parameters**:
- `page` (integer, default: 1) — Page number
- `limit` (integer, default: 20) — Records per page
- `search` (string, optional) — Search by customer ID, gender, or internet service

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerID": "7590-VHVEG",
      "gender": "Male",
      "tenure": 1,
      "MonthlyCharges": 29.85,
      "TotalCharges": 29.85,
      "Contract": "Month-to-month",
      "InternetService": "DSL",
      "PaymentMethod": "Electronic check",
      "Churn": "No",
      ... (14 other fields)
    }
  ],
  "total": 7043,
  "page": 1,
  "limit": 20
}
```

---

### GET /customers/:id

Get a specific customer by MongoDB object ID.

**Parameters**:
- `id` (string, required) — MongoDB object ID

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customerID": "7590-VHVEG",
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 1,
  ... (full customer object)
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Customer with ID ... not found"
}
```

---

### GET /customers/by-id/:customerId

Get a specific customer by Telco customer ID.

**Parameters**:
- `customerId` (string, required) — Telco customer ID (e.g., "7590-VHVEG")

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customerID": "7590-VHVEG",
  ... (full customer object)
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Customer with customerID ... not found"
}
```

---

### GET /customers/stats

Get customer statistics overview.

**Response** (200 OK):
```json
{
  "totalCustomers": 7043,
  "churned": 1869,
  "retained": 5174,
  "churnRate": "26.54%"
}
```

---

### GET /customers/stats/segments

Get churn rates segmented by customer attributes.

**Response** (200 OK):
```json
{
  "byContract": [
    {
      "name": "Month-to-month",
      "total": 3875,
      "churned": 1655,
      "churnRate": 42.71
    },
    {
      "name": "One year",
      "total": 1473,
      "churned": 166,
      "churnRate": 11.27
    },
    {
      "name": "Two year",
      "total": 1695,
      "churned": 48,
      "churnRate": 2.83
    }
  ],
  "byInternetService": [
    {
      "name": "DSL",
      "total": 2421,
      "churned": 459,
      "churnRate": 18.96
    },
    {
      "name": "Fiber optic",
      "total": 3096,
      "churned": 1297,
      "churnRate": 41.89
    },
    {
      "name": "No",
      "total": 1526,
      "churned": 113,
      "churnRate": 7.40
    }
  ],
  "byPaymentMethod": [
    {
      "name": "Bank transfer (automatic)",
      "total": 1846,
      "churned": 354,
      "churnRate": 19.18
    },
    {
      "name": "Credit card (automatic)",
      "total": 1522,
      "churned": 292,
      "churnRate": 19.19
    },
    {
      "name": "Electronic check",
      "total": 1869,
      "churned": 845,
      "churnRate": 45.21
    },
    {
      "name": "Mailed check",
      "total": 1806,
      "churned": 378,
      "churnRate": 20.93
    }
  ]
}
```

---

### POST /customers

Create a new customer.

**Request Body**:
```json
{
  "customerID": "NEW-123456",
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 12,
  "PhoneService": "Yes",
  "MultipleLines": "Yes",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "Yes",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "One year",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Credit card (automatic)",
  "MonthlyCharges": 75.50,
  "TotalCharges": 900.00,
  "Churn": "No"
}
```

**Response** (201 Created):
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "customerID": "NEW-123456",
  ... (full created customer object)
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Customer with ID ... already exists",
  "error": "Bad Request"
}
```

---

### POST /customers/import

Import customers from CSV file.

**Request**:
- Content-Type: `multipart/form-data`
- File parameter: `file` (CSV file)

**CSV Format**:
```csv
customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,...,Churn
7590-VHVEG,Male,0,No,No,1,No,...,No
5575-GNVDE,Male,0,No,No,34,Yes,...,No
...
```

**Response** (200 OK):
```json
{
  "imported": 500,
  "errors": [],
  "validationErrors": [
    {
      "row": 15,
      "customer": "INVALID-001",
      "errors": [
        {
          "field": "Contract",
          "error": "Invalid value \"invalid-contract\". Allowed: Month-to-month, One year, Two year"
        },
        {
          "field": "tenure",
          "error": "Expected integer, got \"abc\""
        }
      ]
    }
  ]
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": "Error processing CSV: CSV must contain at least a header and one data row"
}
```

---

## Predictions

### GET /predictions

List all predictions with optional filtering.

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `riskLevel` (string, optional) — Filter by: `LOW`, `MEDIUM`, `HIGH`

**Response** (200 OK):
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "customerId": "7590-VHVEG",
      "churnProbability": 0.82,
      "riskLevel": "HIGH",
      "recommendation": "Contact customer immediately regarding service quality",
      "priority": "URGENT",
      "topFactors": [
        {
          "feature": "Contract",
          "value": "Month-to-month",
          "impact": 0.25
        },
        {
          "feature": "InternetService",
          "value": "Fiber optic",
          "impact": 0.22
        }
      ],
      "status": "success",
      "createdAt": "2026-03-10T10:30:00Z"
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 20
}
```

---

### GET /predictions/:id

Get a specific prediction.

**Parameters**:
- `id` (string, required) — Prediction MongoDB object ID

**Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "customerId": "7590-VHVEG",
  "churnProbability": 0.82,
  "riskLevel": "HIGH",
  "recommendation": "Contact customer immediately regarding service quality",
  "priority": "URGENT",
  "reasonCodes": [
    "HIGH_CHURN_PROBABILITY",
    "SHORT_TENURE",
    "NO_ONLINE_SECURITY"
  ],
  "topFactors": [
    {
      "feature": "Contract",
      "value": "Month-to-month",
      "impact": 0.25
    },
    {
      "feature": "InternetService",
      "value": "Fiber optic",
      "impact": 0.22
    },
    {
      "feature": "MonthlyCharges",
      "value": 100.50,
      "impact": 0.18
    },
    {
      "feature": "tenure",
      "value": 1,
      "impact": 0.15
    },
    {
      "feature": "OnlineSecurity",
      "value": "No",
      "impact": 0.12
    }
  ],
  "inputSnapshot": { ... },
  "status": "success",
  "modelVersion": "1.0.0",
  "createdAt": "2026-03-10T10:30:00Z",
  "expiresAt": "2026-06-08T10:30:00Z"
}
```

---

### POST /predictions

Make a prediction from raw customer attributes.

**Request Body**:
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 1,
  "PhoneService": "No",
  "MultipleLines": "No phone service",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "No",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 65.10,
  "TotalCharges": 65.10
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "prediction": {
    "_id": "507f1f77bcf86cd799439021",
    "churnProbability": 0.78,
    "riskLevel": "HIGH",
    "recommendation": "Review service quality and offer retention incentive",
    "priority": "HIGH",
    "topFactors": [ ... ],
    "status": "success",
    "createdAt": "2026-03-10T10:35:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing required field: Contract",
  "details": [
    {
      "field": "Contract",
      "error": "Field is required"
    }
  ]
}
```

---

### POST /predictions/customer/:customerId

Make a prediction for an existing customer.

**Parameters**:
- `customerId` (string, required) — Telco customer ID

**Request Body**: Empty (loads customer from database)

**Response** (201 Created):
```json
{
  "success": true,
  "prediction": {
    "_id": "507f1f77bcf86cd799439022",
    "customerId": "7590-VHVEG",
    "churnProbability": 0.82,
    "riskLevel": "HIGH",
    "recommendation": "Contact customer immediately regarding service quality",
    "priority": "URGENT",
    "topFactors": [ ... ],
    "status": "success",
    "createdAt": "2026-03-10T10:40:00Z"
  }
}
```

---

### POST /predictions/what-if

Compare predictions for a scenario.

**Request Body**:
```json
{
  "customerId": "7590-VHVEG",
  "changes": {
    "Contract": "Two year",
    "MonthlyCharges": 75.50
  },
  "scenarioName": "Upgrade to 2-year contract"
}
```

**OR** (provide base customer directly):
```json
{
  "baseCustomer": {
    "gender": "Male",
    "tenure": 1,
    "Contract": "Month-to-month",
    ...
  },
  "changes": {
    "Contract": "Two year"
  },
  "scenarioName": "Change contract type"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "comparison": {
    "scenarioName": "Upgrade to 2-year contract",
    "base": {
      "churnProbability": 0.82,
      "riskLevel": "HIGH",
      "recommendation": "Contact customer immediately...",
      "priority": "URGENT"
    },
    "scenario": {
      "churnProbability": 0.15,
      "riskLevel": "LOW",
      "recommendation": "Standard retention messaging sufficient",
      "priority": "NORMAL"
    },
    "delta": {
      "probabilityChange": -0.67,
      "probabilityChangePercent": -81.71,
      "riskLevelChange": "HIGH → LOW",
      "priorityChange": "URGENT → NORMAL",
      "summary": "Probability decreased from 82% to 15% (-67%). Risk level improved from HIGH to LOW. Priority reduced from URGENT to NORMAL."
    },
    "inputSnapshot": { ... }
  }
}
```

---

### GET /predictions/stats

Get prediction statistics aggregate.

**Response** (200 OK):
```json
{
  "totalPredictions": 1234,
  "highRisk": 312,
  "mediumRisk": 456,
  "lowRisk": 466,
  "failedPredictions": 0
}
```

---

## Error Handling

All error responses follow this format:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Description of validation error",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

### 503 Service Unavailable (ML API down)
```json
{
  "statusCode": 503,
  "message": "ML API is unavailable",
  "error": "Service Unavailable"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production:
- Recommendation: 100 requests per minute per client IP
- Batch imports: 10 requests per minute

---

## Best Practices

1. **Pagination**: For `/customers` and `/predictions`, always use pagination with reasonable limits (20-100 records)
2. **Error Handling**: Check `success` field in responses and handle error messages
3. **Caching**: Consider caching `/customers/stats` and `/customers/stats/segments` responses (5 min TTL)
4. **Monitoring**: Track prediction accuracy over time by comparing predictions to actual churned customers
5. **Feedback Loop**: Use actual churn outcomes to retrain models periodically

---

## Integration Examples

### JavaScript/TypeScript (Axios)
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Predict for customer
async function predictForCustomer(customerId: string) {
  try {
    const response = await axios.post(
      `${API_URL}/predictions/customer/${customerId}`
    );
    console.log(response.data.prediction);
  } catch (error) {
    console.error('Prediction failed:', error.response.data);
  }
}

// What-if simulation
async function runWhatIfScenario() {
  try {
    const response = await axios.post(`${API_URL}/predictions/what-if`, {
      customerId: '7590-VHVEG',
      changes: { Contract: 'Two year' },
      scenarioName: 'Upgrade contract'
    });
    console.log(response.data.comparison);
  } catch (error) {
    console.error('What-if failed:', error.response.data);
  }
}
```

### Python (Requests)
```python
import requests

API_URL = 'http://localhost:3001/api'

# Get customer
response = requests.get(f'{API_URL}/customers/by-id/7590-VHVEG')
customer = response.json()

# Get all statistics
stats = requests.get(f'{API_URL}/predictions/stats').json()
print(f"Total predictions: {stats['totalPredictions']}")
print(f"High risk: {stats['highRisk']}")
```

### cURL
```bash
# Get customer list
curl -X GET 'http://localhost:3001/api/customers?page=1&limit=20'

# Predict for customer
curl -X POST 'http://localhost:3001/api/predictions/customer/7590-VHVEG'

# What-if scenario
curl -X POST 'http://localhost:3001/api/predictions/what-if' \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId": "7590-VHVEG",
    "changes": {"Contract": "Two year"}
  }'
```

---

**API Version**: 1.0.0  
**Last Updated**: 2026-03-10  
**Status**: Production Ready
