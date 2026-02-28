let counter = 0;

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const counterPart = (counter++).toString(36);
  return `${timestamp}-${randomPart}-${counterPart}`;
}
