type AnyObject = Record<string, any>;

const isObject = (item: unknown): item is AnyObject => {
  return typeof item === "object" && item !== null && !Array.isArray(item);
};

export const deepMerge = <T extends AnyObject, U extends AnyObject>(args: {
  obj1: T;
  obj2: U;
}): T & U => {
  const { obj1, obj2 } = args;

  const mergedObject = { ...obj1 } as T & U;

  Object.keys(obj2).forEach((key) => {
    if (isObject(obj2[key]) && isObject(obj1[key])) {
      // Recursively merge nested objects
      // @ts-expect-error - TypeScript cannot infer the type of mergedObject[key]
      mergedObject[key] = deepMerge({
        obj1: obj1[key],
        obj2: obj2[key],
      });
    } else {
      // @ts-expect-error - TypeScript cannot infer the type of mergedObject[key]
      mergedObject[key] = obj2[key];
    }
  });

  return mergedObject;
};
