import i18next from 'i18next';

const Redirect = ({ children }: any) => {
  const urlParams = new URLSearchParams(window.location.search);
  const local = urlParams.get('local');
  if (!local) {
    window.location.href = '?local=zh';
  } else {
    i18next.changeLanguage(local);
    return <>{children}</>;
  }
  return <></>;
};

export default Redirect;
