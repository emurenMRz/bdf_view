import React, { useEffect } from 'react';
import './App.css';
import { BDFFile } from './bdf/bdf-file';
import BDFParser from './bdf/bdf-parser';
import { Header } from './Header';
import { FontList } from './FontList';
import { Expoert } from './Export';

function App() {
  const [inFileName, setInFileName] = React.useState(null as unknown as string);
  const [bsdfile, setBDFFile] = React.useState(null as unknown as BDFFile);

  const receiveFiles = (files: FileList | null) => {
    if (files === null) return;
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result;
      if (typeof text !== "string") return;
      setBDFFile(BDFParser(text.split('\n')));
      let fname = files[0].name;
      if (fname.endsWith(".bdf"))
        fname = fname.substring(0, fname.length - 4);
      setInFileName(fname);
    };
    reader.readAsText(files[0]);
  }

  useEffect(() => {
    window.addEventListener('dragover', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.dataTransfer !== null)
        e.dataTransfer.dropEffect = 'copy';
    }, false);

    window.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.dataTransfer !== null) {
        receiveFiles(e.dataTransfer.files);
      }
    }, false);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" className="Select-files" name="files[]" onChange={e => receiveFiles(e.target.files)} />
      </header >
      {
        bsdfile === null
          ? <div className="BDFView">Drop the BDF file.</div>
          : <div className="BDFView">
            <div className="Left-pane">
              <Header
                version={bsdfile.version}
                basicData={bsdfile.basicData}
                properties={bsdfile.properties}
              />
              <Expoert
                inFileName={inFileName}
                bdfFile={bsdfile}
              />
            </div>
            <FontList
              basicData={bsdfile.basicData}
              properties={bsdfile.properties}
              charData={bsdfile.charData}
            />
          </div>
      }
    </div >
  );
}

export default App;
