export const TEMPLATE_VAR_REGEX = /{([\w.]+)}/g;
export const TEMPLATE_PARTIAL_REGEX = /{&(\w+)}/g;
export const TEMPLATE_LOOP_REGEX = /{for (\w+) of ([\w.]+)}([\S\s]*){endfor}/g;
