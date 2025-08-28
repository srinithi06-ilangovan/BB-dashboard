import { useState } from 'react'
import './App.css'
import ExcelUploader from './components/ExcelUploader'
import TabbedComponent from './components/TabbedComponent';
import Login from './components/Login';


function App() {

  const [fileSelected, setFileSelected] = useState(false); // State to track file selection

  return (
    <div className='container'>
      <h3>Live Nation - Agile Status Report Automation</h3>

      <>
        <ExcelUploader setFileSelected={setFileSelected} fileSelected={fileSelected} />
        <TabbedComponent fileSelected={fileSelected} />
      </>
      <Login />

    </div>
  )
}

export default App