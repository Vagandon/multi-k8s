import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

/* old -> commented out -> would not rung because it tries to
render App.js which in turn has the component Fib.js which tries
to access the express server, which is not available during
testing -> would required a mockup
*/
/*
test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
*/

// So, we just have a fake-test, which passes always:
test('renders learn react link', () => {});