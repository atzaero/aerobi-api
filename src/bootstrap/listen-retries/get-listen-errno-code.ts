export function getListenErrnoCode(err: unknown): string | undefined {
  if (
    typeof err !== 'object' ||
    err === null ||
    !('code' in err) ||
    typeof (err as NodeJS.ErrnoException).code !== 'string'
  ) {
    return undefined;
  }
  return (err as NodeJS.ErrnoException).code;
}
