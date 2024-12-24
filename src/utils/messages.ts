export const parseData = (
  data: string
): { height: string; id: string; timestamp: number }[] | [] => {
  try {
    const parsedData = JSON.parse(data);

    if (parsedData?.blocks?.length) {
      return parsedData.blocks.map(
        (b: { height: number; id: string; timestamp: number }) => ({
          height: b.height,
          id: b.id,
          timestamp: Number(b.timestamp),
        })
      );
    }

    if (parsedData?.block?.id) {
      return [
        {
          height: parsedData.block.height,
          id: parsedData.block.id,
          timestamp: Number(parsedData.block.timestamp),
        },
      ];
    }

    return [];
  } catch (error) {
    console.error(error);
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

export const mapString = (
  input: string | null
): { name: string; count: number }[] => {
  if (!input) return [];

  const result: { name: string; count: number }[] = [];

  // 1. Split the string by commas to get each "name:count" pair
  const pairs = input.split(",");

  if (!pairs.length) return [];

  for (const pair of pairs) {
    // 2. Split each pair by ':' to isolate the name and count
    const [name, countStr] = pair.split(":");

    if (!name || !countStr) return [];

    const count = Number(countStr);

    if (isNaN(count)) {
      return [];
    }

    result.push({ name, count });
  }

  return result;
};

export const mapArrayToString = (
  arr: { name: string; count: number }[]
): string => {
  const mapped = arr.map((a) => `${a.name}:${a.count}`);
  return mapped.join(",");
};

export const expandString = (input: string | null): string[] => {
  if (!input) return [];

  const result: string[] = [];

  const pairs = mapString(input);

  if (!pairs.length) return [];

  for (const pair of pairs) {
    for (let i = 0; i < pair.count; i++) {
      result.push(pair.name);
    }
  }

  return result;
};
