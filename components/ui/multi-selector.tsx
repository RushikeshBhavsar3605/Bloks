"use client";

import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface EmailOption {
  value: string;
  label: string;
  fixed?: boolean;
}

interface EmailSelectorProps {
  onInvite?: (emails: EmailOption[]) => void;
  className?: string;
  badgeClassName?: string;
  disabled?: boolean;
  placeholder?: string;
}

export interface EmailSelectorRef {
  selectedEmails: EmailOption[];
  input: HTMLInputElement;
  clearSelection: () => void;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const EmailSelector = forwardRef<EmailSelectorRef, EmailSelectorProps>(
  (
    {
      onInvite,
      className,
      badgeClassName,
      disabled = false,
      placeholder = "Select frameworks you like...",
    },
    ref
  ) => {
    const [selected, setSelected] = useState<EmailOption[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearSelection = () => {
      setSelected([]);
    };

    useImperativeHandle(
      ref,
      () => ({
        selectedEmails: [...selected],
        input: inputRef.current as HTMLInputElement,
        clearSelection,
      }),
      [selected]
    );

    const showError = (message: string) => {
      setError(message);

      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Auto-hide error after 3 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 3000);
    };

    const addEmail = (email: string) => {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) return false;

      if (isValidEmail(trimmedEmail)) {
        // Check if email already exists
        if (selected.some((option) => option.value === trimmedEmail)) {
          showError(`Email ${trimmedEmail} is already added`);
          return false;
        }

        const newOption = { value: trimmedEmail, label: trimmedEmail };
        setSelected([...selected, newOption]);
        setInputValue("");
        return true;
      } else {
        showError(`"${trimmedEmail}" is not a valid email address`);
        return false;
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.trim()) {
          addEmail(inputValue);
        }
      }
      // Handle Space key
      else if (e.key === " " && inputValue.trim()) {
        const success = addEmail(inputValue);
        if (success) {
          e.preventDefault(); // Prevent space from being added to empty input
        } else {
          e.preventDefault();
          setInputValue(inputValue);
        }
      }
      // Handle Backspace with empty input
      else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        selected.length > 0
      ) {
        const lastSelectOption = selected[selected.length - 1];
        if (!lastSelectOption.fixed) {
          handleUnselect(lastSelectOption);
        }
      }
    };

    const handleUnselect = (option: EmailOption) => {
      const newOptions = selected.filter((s) => s.value !== option.value);
      setSelected(newOptions);
    };

    const handleInviteClick = () => {
      if (onInvite) {
        onInvite(selected);
      }
      clearSelection();
    };

    // Clean up timeout on unmount
    React.useEffect(() => {
      return () => {
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div>
        <div className="flex gap-2">
          <div
            className={cn(
              "flex-1 min-h-10 rounded-md border border-input text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              error && "border-red-500",
              {
                "px-3 py-2": selected.length !== 0,
                "cursor-text": !disabled && selected.length !== 0,
              },
              className
            )}
            onClick={() => {
              if (disabled) return;
              inputRef.current?.focus();
            }}
          >
            <div className="relative flex flex-wrap gap-1">
              {selected.map((option) => (
                <Badge
                  key={option.value}
                  className={cn(
                    "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                    "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.label}
                  <button
                    className={cn(
                      "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      (disabled || option.fixed) && "hidden"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
              <input
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Clear error when user starts typing again
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={selected.length === 0 ? placeholder : ""}
                className={cn(
                  "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                  {
                    "w-full": true,
                    "px-3 py-2": selected.length === 0,
                    "ml-1": selected.length !== 0,
                  }
                )}
              />
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearSelection()}
                  className="absolute right-0 h-6 w-6 p-0"
                >
                  <X />
                </button>
              )}
            </div>
          </div>
          <Button onClick={handleInviteClick} disabled={selected.length === 0}>
            Invite
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="p-2 flex items-center gap-2">
            <div className="flex  items-center">
              <AlertCircle className="h-4 w-4" />
            </div>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);

EmailSelector.displayName = "EmailSelector";
export default EmailSelector;
