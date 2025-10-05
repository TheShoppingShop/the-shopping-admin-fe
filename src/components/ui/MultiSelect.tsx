import React from "react"

type Option = { id: number; name: string }

interface MultiSelectProps {
  options: Option[]
  value: number[]
  onChange: (values: number[]) => void
}

export default function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value))
    onChange(selected)
  }

  return (
    <select
      multiple
      value={value.map(String)}
      onChange={handleChange}
      className="w-full h-40 border rounded p-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  )
}
