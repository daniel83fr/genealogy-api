import resolver from '../src/api/resolvers'
describe('resolver', function () {
    it('test', async function () {
        expect(resolver.test()).toEqual(true);
    })
})