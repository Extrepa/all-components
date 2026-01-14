const { execSync } = require('child_process');
const fs = require('fs');

const files = execSync("rg --files-with-matches 'lucide-react' -g'*.tsx' -g'*.ts' /Users/extrepa/Projects/all-components", { encoding: 'utf8' })
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const names = new Set();
const importRegex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(importRegex)) {
    const parts = match[1]
      .split(',')
      .map((part) => part.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    for (const part of parts) {
      const cleaned = part.replace(/^type\s+/, '').trim();
      if (!cleaned) continue;
      const name = cleaned.split(/\s+as\s+/i)[0].trim();
      if (name) names.add(name);
    }
  }
}

const sorted = Array.from(names).sort();
const lines = [];
lines.push("import React from 'react';");
lines.push('');
lines.push('type IconProps = React.SVGProps<SVGSVGElement>;');
lines.push('');
lines.push('function Icon({ title, ...props }: IconProps & { title?: string }) {');
lines.push('  return (');
lines.push('    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...props}>');
lines.push('      {title ? <title>{title}</title> : null}');
lines.push('      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />');
lines.push('      <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />');
lines.push('    </svg>');
lines.push('  );');
lines.push('}');
lines.push('');

for (const name of sorted) {
  lines.push(`export const ${name} = (props: IconProps) => <Icon {...props} title="${name}" />;`);
}

fs.writeFileSync('/Users/extrepa/Projects/all-components/preview/src/stubs/lucide-react.tsx', lines.join('\n') + '\n', 'utf8');
