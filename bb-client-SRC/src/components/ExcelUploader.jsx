import React, { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { useDispatch, useSelector } from "react-redux";
import { setExcelData } from "../redux/excelSlice";
import { setFileData } from "../redux/fileSlice";
import { setTicketData } from "../redux/ticketSlice";
//import { generatePDF } from "../utils/pdfGenerator";
import { generateJPEG } from "../utils/jpegGenerator";
import { setDodData } from "../redux/dodSlice";
import { setSheetName } from "../redux/sheetNameSlice";


const ExcelUploader = ({ setFileSelected, fileSelected }) => {
  const dispatch = useDispatch();
  const excelData = useSelector((state) => state.excel?.data);
  const ticketData = useSelector((state) => state.ticket.data);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [xlFile, setXlFile] = useState(null);
  const [numSheets, setNumSheets] = useState(0); // New state to store number of sheets

  const [currentSheetName, setCurrentSheetName] = useState('');

 


  // readerLoad is memoized to prevent unnecessary re-creations.
  // It now directly uses xlFile and sheetIndex from the component's state.
  const readerLoad = useCallback(() => {
    if (!xlFile) {
      // console.log("No file to read.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Update the number of sheets available
        setNumSheets(workbook.SheetNames.length);

        // Ensure sheetIndex is within valid bounds
        const actualSheetIndex = Math.max(
          0,
          Math.min(sheetIndex, workbook.SheetNames.length - 1)
        );

        if (sheetIndex !== actualSheetIndex) {
            // If sheetIndex was out of bounds, update it to the valid one
            // This might trigger a re-render and re-run of useEffect, which is desired
            setSheetIndex(actualSheetIndex);
            return; // Exit here and let the next useEffect run handle it
        }

        const sheetName = workbook.SheetNames[actualSheetIndex];
	dispatch(setSheetName(sheetName));
	setCurrentSheetName(sheetName);
  	dispatch(setFileData(sheetName));

        if (!sheetName) {
          console.warn(
            `Sheet at index ${actualSheetIndex} not found. Workbook has ${workbook.SheetNames.length} sheets.`
          );
          // Optionally, inform the user or handle this state.
          dispatch(setExcelData([])); // Clear data if no sheet found
          dispatch(setTicketData([]));
          return;
        }

        console.log(workbook, "workbook");
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        console.log(jsonData);
        dispatch(setExcelData(jsonData));
        dispatch(setTicketData(jsonData));
	
        if (sheetName === 'TktStatusCode') {
	
          const totalDoDStory = jsonData
            .filter((info) => info?.["DoD Flag"] === "DoD").reduce((acc, dod) => {
              const dodStatus = dod["Status"]
              if (!acc[dodStatus]) acc[dodStatus] = [];    //need to make global state
              acc[dodStatus].push(dodStatus);
              return acc;
            }, []);
          dispatch(setDodData(totalDoDStory));
        }

      } catch (error) {
        console.error("Error processing Excel file:", error);
        // Provide user feedback (e.g., a toast notification)
        dispatch(setExcelData([])); // Clear data on error
        dispatch(setTicketData([]));
      }
    };

    reader.readAsBinaryString(xlFile);
  }, [xlFile, sheetIndex, dispatch]); // Dependencies for useCallback

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setXlFile(file);
    console.log(file, "file");
   // dispatch(setFileData(file));
    setFileSelected(!!file); // Inform parent about file selection
    setSheetIndex(1); // Reset sheet index when a new file is uploaded
    //setSheetIndex(3);
  };

  const handlePreviousSheet = () => {
    if ((parseInt(sheetIndex)-2) > 0){
    	setSheetIndex((prevIndex) => Math.max(0, prevIndex - 1));
    }
  };
const regexSheetName = /^25-[^-]+-W\d{2}-\d{2}$/;

  const handleNextSheet = () => {
	if ((parseInt(numSheets)-2) > parseInt(sheetIndex) ){
		//if((sheetName. 'TktStatusCode') 
		//. ^25-[^A-Z]-Kanban+-W\d{2}-\d{2}
	    	setSheetIndex((prevIndex) => Math.min(numSheets - 1, prevIndex + 1));
	}else{
		setSheetIndex(3);
	}

  };

  useEffect(() => {
    if (xlFile) {
      readerLoad(); // Call readerLoad directly without parameters
    }
    
  }, [sheetIndex, xlFile, readerLoad]); // Dependencies for useEffect

  return (
    <div className="inp-file">
      <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
      {/* <button className="download-btn" disabled={!fileSelected} onClick={() => generateJPEG(excelData, ticketData)}>
                 Download
             </button> */}
      {xlFile && numSheets > 1 && ( // Only show buttons if a file is selected and there's more than one sheet
        <>
          <button onClick={handlePreviousSheet} disabled={sheetIndex === 0}>
            {"<<"}
	
          </button>

<p>{currentSheetName}</p>
 
          <button onClick={handleNextSheet} disabled={sheetIndex === numSheets - 1}>
            {">>"}
          </button>
        </>
      )}
    </div>
  );
};

export default ExcelUploader;