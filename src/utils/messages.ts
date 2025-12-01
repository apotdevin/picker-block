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
  str: string, // full 64-char hex Bitcoin block hash
  min: number,
  max: number
): number => {
  // Convert hex string to BigInt (unsigned 256-bit)
  const x = BigInt("0x" + str);

  const rangeSize = BigInt(max - min + 1);

  // Map uniformly into [min, max]
  const n = x % rangeSize;

  return Number(n) + min;
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
