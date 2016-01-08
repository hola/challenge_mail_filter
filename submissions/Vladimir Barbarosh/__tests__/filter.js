jest.dontMock('../src/filter');

describe('all in one', function () {

    // http://hola.org/challenge_mail_filter
    it('should pass test from hola.org', function () {

        var filter = require('../src/filter'),
            messages,
            rules,
            result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
            msg2: {from: 'noreply@spam.com', to: 'jill@example.org'},
            msg3: {from: 'boss@work.com', to: 'jack@example.com'}
        };

        rules = [
            {from: '*@work.com', action: 'tag work'},
            {from: '*@spam.com', action: 'tag spam'},
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'},
            {to: 'jill@example.org', action: 'forward to jill@elsewhere.com'}
        ];

        result = {
            msg1: ['folder jack', 'forward to jill@elsewhere.com'],
            msg2: ['tag spam', 'forward to jill@elsewhere.com'],
            msg3: ['tag work']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass foobar', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: 'jack@example.com', to: 'jill@example.org', action: 'folder jack'}
        ];

        result = {
            msg1: ['folder jack']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass foo*bar', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: 'jack*@example.com', to: 'jill*@example.org', action: '1'},
            {from: 'ja*@example.com', to: 'ji*@example.org', action: '2'}
        ];

        result = {
            msg1: ['1', '2']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass foobar*', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: 'jack@example.com*', to: 'jill@example.org*', action: '1'},
            {from: 'jack@*', to: 'jill@*', action: '2'}
        ];

        result = {
            msg1: ['1', '2']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass *foobar', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: '*jack@example.com', to: '*jill@example.org', action: '1'},
            {from: '*@example.com', to: '*@example.org', action: '2'}
        ];

        result = {
            msg1: ['1', '2']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass *foobar*', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: '*jack@example.com*', to: '*jill@example.org*', action: '1'}
        ];

        result = {
            msg1: ['1']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass fo?bar', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: 'ja?k@example.com', to: 'j?ll@example.org', action: '1'},
            {from: 'ja??@example.com', to: 'j???@example.org', action: '2'}
        ];

        result = {
            msg1: ['1', '2']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass ?*foobar', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: '?*ack@example.com', to: '*?ill@example.org', action: '1'}
        ];

        result = {
            msg1: ['1']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

    it('should pass foobar?', function () {

        var filter = require('../src/filter'),
            messages, rules, result;

        messages = {
            msg1: {from: 'jack@example.com', to: 'jill@example.org'},
        };

        rules = [
            {from: 'jack@example.co?', to: 'jill@example.or?', action: '1'}
        ];

        result = {
            msg1: ['1']
        };

        expect(filter(messages, rules)).toEqual(result);

    });

});
