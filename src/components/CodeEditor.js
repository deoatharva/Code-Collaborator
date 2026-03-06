import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ file, setFile }) {
  const [code, setCode] = useState("");

  /* ================= SYNC WHEN TAB CHANGES ================= */

  useEffect(() => {
    if (file) {
      setCode(file.content || "");
    }
  }, [file]);

  /* ================= HANDLE EDIT ================= */

  const handleChange = (value) => {
    const newCode = value || "";
    setCode(newCode);

    // 🔥 Update parent activeFile instantly
    setFile((prev) => ({
      ...prev,
      content: newCode,
    }));
  };

  if (!file) return null;

  return (
    <Editor
      height="90vh"
      theme="vs-dark"
      defaultLanguage="javascript"
      value={code}
      onChange={handleChange}
    />
  );
}