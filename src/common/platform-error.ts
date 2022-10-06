export const getErrorPayloadToLog = (error: any) => {
  return { message: error.message, stack: error.stack };
};
