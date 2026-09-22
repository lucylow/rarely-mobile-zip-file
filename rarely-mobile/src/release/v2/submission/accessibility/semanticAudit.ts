export type AccessibilityNode = { id: string; role: 'button'|'link'|'header'|'text'|'image'|'input'; label?: string; hint?: string; hidden?: boolean };
export function auditNodes(nodes: AccessibilityNode[]): string[] {
  const errors: string[] = [];
  for (const node of nodes) {
    if (node.hidden) continue;
    if ((node.role === 'button' || node.role === 'link' || node.role === 'input') && !node.label?.trim()) errors.push(`label:${node.id}`);
    if (node.role === 'image' && !node.label?.trim() && node.hint !== 'decorative') errors.push(`image-alt:${node.id}`);
  }
  return errors;
}
export function uniqueLabels(nodes: AccessibilityNode[]): boolean { const labels = nodes.filter((n) => !n.hidden && n.label).map((n) => n.label!.toLowerCase()); return new Set(labels).size === labels.length; }
