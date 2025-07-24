import * as XLSX from 'xlsx';
import { useState } from 'react';

const ExcelUploader = ({ onDataParsed }) => {
  const [file, setFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; // FileList 객체에서 첫 번째 파일 추출 (여러 파일 로드 불가)
    setFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'array' }); // 파일 타입을 array로 읽어옴
      const sheetName = workbook.SheetNames[0]; // 이 코드는 엑셀 파일을 읽어서 workbook 객체로 만듭니다.
      const sheet = workbook.Sheets[sheetName]; // 시트 객체 추출
      const json = XLSX.utils.sheet_to_json(sheet); // 시트 데이터를 JSON 형식으로 변환
      onDataParsed(json); // 변환된 데이터를 상위 컴포넌트에 전달
    };
    reader.readAsArrayBuffer(file); // 파일 타입이 ArrayBuffer로 변환되어 저장
  };

  return (
    <>
      <input type='file' accept='.xlsx, .xls' onChange={handleFileUpload} />
      {file && <div>파일 업로드 완료</div>}
    </>
  );
};
export default ExcelUploader;
