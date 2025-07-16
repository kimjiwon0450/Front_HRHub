import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // snow 테마 CSS

const QuillEditor = ({ value, onChange, placeholder, readOnly = false }) => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // Quill 인스턴스 초기화
      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            // ["link", "image"], // 링크 및 이미지 첨부 기능 제거
            [{ align: [] }],
            ["clean"], // 서식 제거 기능 복구
          ],
        },
        placeholder,
        readOnly,
      });

      const quill = quillInstanceRef.current;

      // 초기값 설정
      if (value) {
        // value가 HTML 문자열일 경우, Quill이 이해할 수 있는 Delta 형식으로 변환해야 할 수 있으나,
        // 많은 경우 clipboard.convert API나 innerHTML을 통해 직접 설정이 가능합니다.
        // 여기서는 간단하게 quill의 innerHTML을 직접 조작하는 방식을 사용합니다.
        quill.root.innerHTML = value;
      }
      
      // text-change 이벤트 핸들러
      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          // 사용자에 의한 변경일 때만 onChange 콜백 호출
          // getSemanticHTML() 또는 root.innerHTML을 사용하여 HTML 컨텐츠를 가져옵니다.
          onChange(quill.root.innerHTML);
        }
      });
    }

    // 컴포넌트 언마운트 시 Quill 인스턴스 정리
    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current = null;
      }
    };
  }, [readOnly, placeholder]); // readOnly, placeholder 변경 시 에디터 다시 생성

  // 외부에서 전달된 value가 변경되었을 때 에디터 내용을 업데이트
  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (quill && value !== quill.root.innerHTML) {
        // 사용자가 입력 중일 때는 외부 변경을 반영하지 않도록 하여
        // 커서가 맨 앞으로 이동하는 문제를 방지합니다.
        const hasFocus = quill.hasFocus();
        if (!hasFocus) {
             quill.root.innerHTML = value;
        }
    }
  }, [value]);

  return <div ref={editorRef} style={{ minHeight: "300px" }} />;
};

export default QuillEditor; 