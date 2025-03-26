import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Signup_page from './pages/Signup_Page';
import SignUp from './components/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signup" element={<Signup_page />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;