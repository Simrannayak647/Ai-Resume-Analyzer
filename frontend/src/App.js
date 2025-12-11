import React from "react";
import UploadResume from "./components/UploadResume";
import TestTailwind from './components/TestTailwind';

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>AI Resume Analyzer 🚀</h1>
      <p>Upload your resume to get insights & ATS optimization suggestions.</p>
      <UploadResume />
      <TestTailwind />;
    </div>
  );
}

export default App;
