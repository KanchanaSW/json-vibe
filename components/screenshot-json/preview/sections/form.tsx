import type { FormSection } from "@/types/ui-schema";

export function FormPreview({ section }: { section: FormSection }) {
  return (
    <form className="p-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
      {section.fields.map((field, i) => (
        <div key={i}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <input
            type={field.type || "text"}
            placeholder={field.placeholder || ""}
            disabled
            className="w-full px-3 py-2 rounded border border-white/10 bg-white/5 text-inherit opacity-70 text-sm"
          />
        </div>
      ))}
    </form>
  );
}
