export const APIResponse = (status, message, data = []) => {
  return { status, message, data: Array.isArray(data) ? data : [data] };
};
