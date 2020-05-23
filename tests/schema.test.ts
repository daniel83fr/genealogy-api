import { GraphQLInterfaceType } from 'graphql';
import schema from '../src/api/schema';

describe('schema', () => {
  it('test', async () => {
    expect(schema.getDirectives().length).toEqual(3);
  });
});
