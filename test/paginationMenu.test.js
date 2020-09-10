import React from 'react';
import PaginationMenu from '../client/components/PaginationMenu';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <PaginationMenu 
        numMatches={100} 
        onPageChange={Function}
      />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
