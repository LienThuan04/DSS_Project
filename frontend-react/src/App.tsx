import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Predictions from './pages/Predictions';
import WhatIfSimulation from './pages/WhatIfSimulation';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/predictions/what-if" element={<WhatIfSimulation />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
