# Frontend (React + TypeScript + Tailwind CSS + shadcn/ui)

Modern React frontend for Customer Churn Decision Support System using Tailwind CSS and shadcn/ui for lightweight, accessible UI.

## Project Structure

```
src/
  ├── main.ts                    # Entry point
  ├── App.tsx                    # Main App component with routing
  ├── index.css                  # Tailwind CSS styles
  ├── components/
  │   └── Layout.tsx            # Main layout with sidebar
  ├── pages/
  │   ├── Dashboard.tsx         # Dashboard with charts
  │   ├── Customers.tsx         # Customer list & management
  │   └── Predictions.tsx       # Prediction list & form
  ├── services/
  │   └── api.ts               # API client & endpoints
  └── types/
      └── index.ts             # TypeScript type definitions
```

## Quick Start

### 1. Install Dependencies (with pnpm)

```bash
cd frontend-react
pnpm install
```

### 2. Environment Setup

Create `.env` file (already included):

```
REACT_APP_API_URL=http://localhost:3000
```

### 3. Development Server

```bash
pnpm start
```

Frontend runs on http://localhost:3000 (React dev server, backend on port 3000, so adjust if needed)

### 4. Production Build

```bash
pnpm build
```

Outputs to `build/` directory for deployment.

## Features

### 📊 Dashboard
- Customer statistics (total, churn rate, high-risk count)
- Churn distribution pie chart
- Risk level distribution bar chart
- Real-time metrics from backend

### 👥 Customers Management
- List all customers with pagination
- Search customers by ID, gender, internet service
- Create new customer
- Delete customer
- View customer details (tenure, charges, churn status)

### 🔮 Predictions
- View all predictions with risk levels
- Filter by risk level (HIGH, MEDIUM, LOW)
- Make new prediction with form
- View churn probability with visual progress bar
- Recommendations for each prediction
- Pagination support

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **pnpm** - Package manager (lightweight)

## API Integration

Connects to NestJS backend at `http://localhost:3000`

### Available Endpoints

#### Customers
```
GET    /customers              - List customers
GET    /customers/:id          - Get customer by ID
GET    /customers/by-id/:customerId - Get customer by customerID
GET    /customers/stats        - Get customer statistics
POST   /customers              - Create customer
PUT    /customers/:id          - Update customer
DELETE /customers/:id          - Delete customer
POST   /customers/import       - Bulk import customers
```

#### Predictions
```
GET    /predictions            - List predictions
GET    /predictions/:id        - Get prediction by ID
GET    /predictions/stats      - Get prediction statistics
GET    /predictions/high-risk  - Get high-risk customers
GET    /predictions/medium-risk - Get medium-risk customers
POST   /predictions            - Make new prediction
POST   /predictions/customer/:customerId - Predict for existing customer
DELETE /predictions/:id        - Delete prediction
```

## Styling

### Tailwind CSS Classes Used
- **Layout**: `flex`, `grid`, `space-y`, `gap`
- **Colors**: `text-blue-600`, `bg-red-100`, `border-gray-200`
- **Components**: `card`, `btn-primary`, `input` (custom classes in `index.css`)

### Custom Components
- StatCard - Display metrics
- Risk badge with color coding
- Churn probability progress bar

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3000` | Backend API base URL |

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

### Docker

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

## Performance

- **Lightweight**: Uses pnpm for faster installations
- **Optimized Bundle**: Tree-shaking with Tailwind CSS
- **Code Splitting**: React Router lazy loading ready
- **Fast Refresh**: Hot module reloading in development

## Development Tips

### Format Code
```bash
pnpm format
```

### Check TypeScript Errors
```bash
pnpm tsc --noEmit
```

### Install New Package
```bash
pnpm add package-name
```

## Troubleshooting

**Backend connection failed**
- Ensure backend is running on port 3000: `npm run start:dev` in backend-nestjs
- Check `REACT_APP_API_URL` in .env

**Port 3000 already in use**
- Kill process: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
- Change port in package.json: `"start": "PORT=3001 react-scripts start"`

**Tailwind styles not applied**
- Run `pnpm install` again
- Clear cache: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

## License

MIT
