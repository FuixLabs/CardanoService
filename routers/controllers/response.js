const Resolve = (message) => {
  try {
    const result = message.toUpperCase().split(" ").join("_");
    return result;
  } catch (error) {
    return message;
  }
};

export const Response = (response, error) => {
  if (response) {
    return {
      code: 0,
      message: "SUCCESS",
      data: response
    }
  } else {
    return {
      code: 1, 
      message: Resolve(error.message) || Resolve(error.reason)  || Resolve(error.err_message) || Resolve(error.error_message)
        || ((typeof error === "string" && error.search("/") === -1) ? Resolve(error) : error),
      data: error.data || null,
    }
  }
};