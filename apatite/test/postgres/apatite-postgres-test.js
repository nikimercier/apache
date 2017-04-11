'use strict';

describe('ApatitePostgresTest', function () {
    var ApatitePostgresTestUtil = require('./apatite-postgres-test-util');
    var util = new ApatitePostgresTestUtil();
    if (util.existsModule()) {
        var helper = require('../apatite-dialect-test-helper.js');
        var session = null;
        before(function (done) {
            helper.setUp(done, util, function (sess) { session = sess; });
        });

        after(function (done) {
            helper.tearDown(done, util, session);
            doPoolTest();
        });

        it('Postgres Validity', function (done) {
            helper.testFunction(done, session, util);
        });
    }
})

function doPoolTest() {
    describe('ApatitePostgresPoolTest', function () {
        var ApatitePostgresTestUtil = require('./apatite-postgres-test-util');
        var util = new ApatitePostgresTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
                doPoolErrorTest(); //It seems promise rejection has not been handled properly in pg module
            });

            it('Postgres Connection Pool Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })
}

function doPoolErrorTest() {
    describe('ApatitePostgresPoolErrorTest', function () {
        var ApatitePostgresTestUtil = require('./apatite-postgres-test-util');
        var util = new ApatitePostgresTestUtil();
        if (util.existsModule()) {
            var helper = require('../apatite-dialect-pool-error-test-helper.js');
            var session = null;
            before(function (done) {
                helper.setUp(done, util, function (sess) { session = sess; });
            });

            after(function (done) {
                helper.tearDown(done, util, session);
            });

            it('Postgres Connection Pool Error Validity', function (done) {
                helper.testFunction(done, session, util);
            });
        }
    })
}