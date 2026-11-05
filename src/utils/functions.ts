export function find<T>(array: T[], callback: (args: T) => boolean) {
  const size = array.length;

  for (let i = 0; i < size; i++) {
    if (callback(array[i])) {
      return array[i];
    }
  }

  return undefined;
}
