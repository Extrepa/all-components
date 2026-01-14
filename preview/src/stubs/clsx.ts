export default function clsx(...values: Array<string | number | boolean | null | undefined>) {
  return values.filter(Boolean).join(' ');
}
