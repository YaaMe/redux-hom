import { expect } from 'chai';
import filter from 'middlewareFilter';

describe('test default filter', function() {
    beforeEach(function() {
        this.testMiddleware = store => next => action => next(action);
        this.service = {
            id: 'test',
            middleware: this.testMiddleware
        };
    });

    it('should filter default action', function() {
        const action = {
            type: 'TEST_ACTION',
            $test: {}
        };

        expect(filter(action, this.service)).to.be.equal(this.testMiddleware);
    });

    it('should return undefined', function() {
        const action = {
            type: 'TEST_SKIP_ACTION'
        };

        expect(filter(action, this.service)).to.be.undefined;
    });

    it('match should work', function() {
        const newMatch = (action, id) => new RegExp(`:${id}$`).test(action.type);
        const action = {
            type: 'ACTION:test'
        };
        const actionSkip = {
            type: 'ACTION:skip'
        };
        const oldAction = {
            type: 'TEST_ACTION',
            $test: {}
        };

        expect(filter(action, {...this.service, match: newMatch}))
            .to.be.equal(this.testMiddleware);
        expect(filter(actionSkip, {...this.service, match: newMatch})).to.be.undefined;
        expect(filter(oldAction, {...this.service, match: newMatch})).to.be.undefined;
    });
});
