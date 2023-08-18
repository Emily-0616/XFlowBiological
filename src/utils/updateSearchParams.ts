export const updateSearchParams = (params: { [key: string]: string; }) => {
  const searchParams = new URLSearchParams();
  for (const i in params) {
    if (Object.prototype.hasOwnProperty.call(params, i)) {
      searchParams.set(i, params[i]);
    }
  }
  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
};