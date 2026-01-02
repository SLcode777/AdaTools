"use client";

import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import {
  ResizeAlgorithm,
  RESIZE_ALGORITHMS,
} from "@/src/lib/image-resize-utils";

interface AlgorithmSelectorProps {
  value: ResizeAlgorithm;
  onChange: (value: ResizeAlgorithm) => void;
  disabled?: boolean;
}

export function AlgorithmSelector({
  value,
  onChange,
  disabled = false,
}: AlgorithmSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Resize Algorithm</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as ResizeAlgorithm)}
        disabled={disabled}
      >
        {RESIZE_ALGORITHMS.map((algorithm) => (
          <div key={algorithm.id} className="flex items-start space-x-3">
            <RadioGroupItem
              value={algorithm.id}
              id={algorithm.id}
              disabled={disabled}
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor={algorithm.id}
                className="font-medium cursor-pointer"
              >
                {algorithm.name}
              </Label>
              <p className="text-xs text-muted-foreground">
                {algorithm.recommendedUse}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
