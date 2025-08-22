/**
 * markdown-rendersafe
 * Fix broken markdown during streaming to ensure proper rendering
 */

export { validateMarkdown } from "./markdown-validator";
export { validateMarkdown as default } from "./markdown-validator";

// Re-export with semantic names
export { validateMarkdown as markdownRendersafe } from "./markdown-validator";
export { validateMarkdown as fixMarkdown } from "./markdown-validator";