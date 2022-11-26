export const APIResponse = (status, message, data) => {
  return { status, message, data: data?.length > 0 ? data : [data] };
};
