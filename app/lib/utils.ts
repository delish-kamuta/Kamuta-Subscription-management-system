import clsx from "clsx"
import { twMerge } from "tailwind-merge"

// Small helper used across UI components to merge className values
// Uses `clsx` for flexible conditional class joining and
// `twMerge` to dedupe/resolve Tailwind class conflicts.
export function cn(...inputs: Array<unknown>) {
  return twMerge(clsx(...(inputs as any)))
}

export default cn
