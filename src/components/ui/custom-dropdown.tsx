import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
}

export function CustomDropdown({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  searchable = false,
  emptyMessage = "No options available",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || ""
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (value === undefined) {
      // Only update internal state if not controlled
      setInternalValue(optionValue);
    }
    onValueChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedOption = options.find(
    (option) => option.value === currentValue
  );

  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !option.disabled
      )
    : options.filter((option) => !option.disabled);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md bg-background",
          "hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "ring-2 ring-ring ring-offset-2",
          triggerClassName
        )}
      >
        <span
          className={cn(
            "truncate",
            currentValue ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        data-dropdown-content
        className={cn(
          "absolute top-full left-0 mt-1 w-full bg-popover border rounded-md shadow-lg z-[60]",
          "transition-all duration-200 ease-out dropdown-transition",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
          contentClassName
        )}
      >
        <div className="py-1">
          {/* Search Input */}
          {searchable && (
            <div className="px-3 py-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground",
                  "transition-colors duration-150 flex items-center justify-between",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  currentValue === option.value &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <span className="truncate">{option.label}</span>
                {currentValue === option.value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
