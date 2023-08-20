import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import Index from './pages';

const App = () => {
  dayjs.extend(duration);
  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);
  return <Index />;
};

export default App;
