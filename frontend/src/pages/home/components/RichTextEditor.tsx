import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "blockquote",
  "link",
];

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <div className="overflow-hidden rounded-[28px] bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-950/5">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder="Capture your thoughts, tasks, and ideas..."
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
