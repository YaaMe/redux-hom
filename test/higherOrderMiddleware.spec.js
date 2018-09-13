import { expect } from 'chai';
import higherOrderMiddleware from 'higherOrderMiddleware';

describe('test higherOrderMiddleware', function() {
    beforeEach(function() {
        const firstMiddleware = store => next => action => {
            store.dispatch({ type: 'ACTION_FROM_FIRST' });
            return next(action);
        };
        const secondMiddleware = store => next => action => {
            store.dispatch({ type: 'ACTION_FROM_SECOND'});
            return next(action);
        };

        this.services = [{
            id: 'first',
            middleware: firstMiddleware
        }, {
            id: 'second',
            middleware: secondMiddleware
        }];
        this.result = [];
        this.store = {
            dispatch: action => {
                this.result.push(action.type);
                return {};
            }
        };
    });
    afterEach(function() {
        this.result = [];
    });

    it('first middleware', function() {
        const target = higherOrderMiddleware({ services: this.services });
        const action = {
            type: 'TEST_ACTION',
            $first: {}
        };
        target(this.store)(this.store.dispatch)(action);

        expect(this.result).to.be.deep.equal([
            'ACTION_FROM_FIRST',
            'TEST_ACTION'
        ]);
    });

    it('second middleware', function() {
        const target = higherOrderMiddleware({ services: this.services });
        const action = {
            type: 'TEST_ACTION',
            $first: {},
            $second: {}
        };
        target(this.store)(this.store.dispatch)(action);

        expect(this.result).to.be.deep.equal([
            'ACTION_FROM_FIRST',
            'ACTION_FROM_SECOND',
            'TEST_ACTION'
        ]);
    });

    it('nothing', function() {
        const target = higherOrderMiddleware({ services: this.services });
        const action = {
            type: 'TEST_ACTION'
        };
        target(this.store)(this.store.dispatch)(action);

        expect(this.result).to.be.deep.equal(['TEST_ACTION']);
    });

    it('diy match rule', function() {
        const match = (action, id) => new RegExp(`:${id}`).test(action.type);
        const target = higherOrderMiddleware({
            services: this.services.map(s => ({...s, match}))
        });
        const action = {
            type: 'TEST_ACTION:first:second'
        };
        target(this.store)(this.store.dispatch)(action);

        expect(this.result).to.be.deep.equal([
            'ACTION_FROM_FIRST',
            'ACTION_FROM_SECOND',
            'TEST_ACTION:first:second'
        ]);
    });

    it('diy filter should work', function() {
        const filter = (action, {id, middleware}) => {
            if (typeof action[`$${id}`] === 'string') {
                return middleware;
            }
            return undefined;
        };
        const target = higherOrderMiddleware({
            services: this.services,
            filter
        });
        const action = {
            type: 'TEST_ACTION',
            $first: 'pass',
            $second: ['not work']
        };

        target(this.store)(this.store.dispatch)(action);

        expect(this.result).to.be.deep.equal([
            'ACTION_FROM_FIRST',
            'TEST_ACTION'
        ]);
    });
});
