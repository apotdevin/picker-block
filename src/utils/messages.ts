export const parseData = (
  data: string
): { height: string; id: string }[] | [] => {
  try {
    const parsedData = JSON.parse(data);

    if (parsedData?.blocks?.length) {
      return parsedData.blocks.map((b: { height: number; id: string }) => ({
        height: b.height,
        id: b.id,
      }));
    }

    if (parsedData?.block?.id) {
      return [{ height: parsedData.block.height, id: parsedData.block.id }];
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const stringToNumberInRange = (
  str: string,
  min: number,
  max: number
): number => {
  // 1. Create a simple hash from the string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // A common hash-like function: hash * 31 + charCode
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  // 2. Ensure hash is non-negative
  // Math.abs can handle negative values from bitwise ops
  hash = Math.abs(hash);

  // 3. Map the hash into the [min, max] range
  const rangeSize = max - min + 1;
  const numberInRange = (hash % rangeSize) + min;

  return numberInRange;
};
