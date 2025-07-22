import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // snow 테마 CSS

const QuillEditor = ({ value, onChange, placeholder, readOnly = false }) => {
  const editorRef = useRef(null);
  const quillInstanceRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // 기존 툴바/에디터 DOM이 남아있지 않도록 비워줌
      editorRef.current.innerHTML = '';
      // 이전에 생성된 Quill 인스턴스가 있다면 중복 생성을 방지합니다.
      if (quillInstanceRef.current) return;

      quillInstanceRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["clean"],
          ],
        },
        placeholder,
        readOnly,
      });

      const quill = quillInstanceRef.current;

      // 초기값이 있다면 에디터에 설정합니다.
      if (value) {
        quill.root.innerHTML = value;
      }
      // 사용자가 내용을 변경했을 때의 이벤트 핸들러
      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          onChange(quill.root.innerHTML);
        }
      });
    }

    // 컴포넌트가 사라질 때 Quill 인스턴스를 정리하는 로직
    return () => {
      if (quillInstanceRef.current) {
        quillInstanceRef.current.off('text-change');
        quillInstanceRef.current = null;
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (quill && value !== quill.root.innerHTML) {
      const hasFocus = quill.hasFocus();
      if (!hasFocus) {
         quill.root.innerHTML = value || '';
      }
    }
  }, [value]);

  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (quill) {
      quill.enable(!readOnly);
    }
  }, [readOnly]);

  return <div ref={editorRef} style={{ minHeight: "300px" }} />;
};

export default QuillEditor;