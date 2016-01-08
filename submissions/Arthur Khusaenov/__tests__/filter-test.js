jest.dontMock('../filter');
var filter = require('../filter');

describe('filter', function() {
    it('No arguments', function() {
        expect(filter({}, [])).toEqual({});
    });

    it('No rules', function() {
        expect(filter({
            msg1: {from: 'boss@work.com', to: 'jack@work.com'}
        }, [])).toEqual({
            msg1: []
        });
    });

    it('No messages', function() {
        expect(filter({}, [
            {from: '*@work.com', action: 'tag work'}
        ])).toEqual({});
    });

    it('Rule has `from` and `to` without specific symbols', function() {
        expect(filter({
            msg1: {from: 'boss@work.com', to: 'jack@work.com'}
        }, [
            {from: 'boss@work.com', to: 'jack@work.com', action: 'tag from-boss'},
            {from: 'boss@work.com', to: 'jack@work.com', action: 'forward to jack@elsewhere.com'}
        ])).toEqual({
            msg1: ['tag from-boss', 'forward to jack@elsewhere.com']
        });
    });

    it('Rule has `from` and `to` and specific symbol `*`', function() {
        expect(filter({
            msg1: {from: 'boss@work.com', to: 'jack@work.com'},
            msg2: {from: 'boss-work@elsewhere.com',to: 'jack@work.com'},
            msg3: {from: 'boss.work@elsewhere.com', to: 'jack@work.com'},
            msg4: {from: 'abcbossxyz.work@elsewhere.com', to: 'jack@work.com'},
            msg5: {from: 'abcbossxyz.work@abcelsewherexyz.com', to: 'jack@work.com'},
            msg6: {from: 'noreply@spam.com', to: 'jill@work.com'},
            msg7: {from: 'jack@work.com', to: 'jill@example.org'}
        }, [
            {from: '*@work.com', to: 'jack@work.com', action: 'tag work1'},
            {from: '*@work.*', to: 'jack@work.com', action: 'tag work2'},
            {from: '*@*.*', to: 'jack@work.com', action: 'tag work3'},
            {from: '*.*@*.com', to: 'jack@work.com', action: 'tag work4'},
            {from: 'abc*xyz.*@*.com', to: 'jack@work.com', action: 'tag work5'},
            {from: '*@spam.com', to: '*@work.com', action: 'tag spam'},
            {from: 'jack@work.com', to: '*@*.*', action: 'folder jack'}
        ])).toEqual({
            msg1: ['tag work1', 'tag work2', 'tag work3'],
            msg2: ['tag work3'],
            msg3: ['tag work3', 'tag work4'],
            msg4: ['tag work3', 'tag work4', 'tag work5'],
            msg5: ['tag work3', 'tag work4', 'tag work5'],
            msg6: ['tag spam'],
            msg7: ['folder jack']
        });
    });

    it('Rule has `from` and `to` and both specific symbols', function() {
        expect(filter({
            msg1: {from: 'noreply@spam.com', to: 'jill@work.com'},
            msg2: {from: 'noreply@spam.com.uk', to: 'jill@work.com'}
        }, [
            {from: 'noreply@spam.???', to: '*@work.com', action: 'tag spam1'},
            {from: 'noreply@*.???', to: '*@?ork.com', action: 'tag spam2'}
        ])).toEqual({
            msg1: ['tag spam1', 'tag spam2'],
            msg2: []
        });
    });

    it('Rule hasn\'t `to` property and  has both specific symbols', function() {
        expect(filter({
            msg1: {from: 'noreply@spam.com', to: 'jill@work.com'},
            msg2: {from: 'boss@work.com', to: 'jack@example.com'}
        }, [
            {from: 'noreply@*.???', action: 'tag spam'},
            {from: '*@work.com', action: 'tag work'}
        ])).toEqual({
            msg1: ['tag spam'],
            msg2: ['tag work']
        });
    });

    it('Rule hasn\'t `from`', function() {
        expect(filter({
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'}
        }, [
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ])).toEqual({
            msg1: ['forward to jill@elsewhere.com'],
            msg2: ['forward to jill@elsewhere.com']
        });
    });

    it('Rule hasn\'t `to`', function() {
        expect(filter({
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        }, [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ])).toEqual({
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        });
    });

    it('Rule hasn\'t `from` and `to`', function() {
        expect(filter({
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'jill@example.org', to: 'jack@example.com'}
        }, [
            {action: 'forward to boss@work.com'}
        ])).toEqual({
            msg1: ['forward to boss@work.com'],
            msg2: ['forward to boss@work.com']
        });
    });

});
