/**
 * 格式化请求参数 去掉undefined值
 */
export const formatParams = (params: object): Record<string, any> => {
  if (typeof params !== "object") {
    return {};
  }
  const res = {} as any;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      res[key] = value;
    }
  }
  return res;
};
