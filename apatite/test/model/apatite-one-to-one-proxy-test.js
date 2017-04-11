'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteOneToOneProxyTest', function () {
    it('One To One Proxy Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var employee = employees[0];
                expect(employee.department).to.not.equal(null);
                var changesToDo = function (changesDone) {
                    employee.department = null;
                    changesDone('some error so rollback occurs and depart is not null again');
                };

                var onSaved = function (err) {
                    expect(employee.department).to.not.equal(null);
                };

                session.doChangesAndSave(changesToDo, onSaved);
                expect(employee.department.valueFetched).to.equal(false);
                employee.department.getValue(function (err, dept) {
                    expect(employee.department.valueFetched).to.equal(true);
                    var changesToDo = function (changesDone) {
                        employee.department = null;
                        changesDone('some error so rollback occurs and depart is not null again');
                    };

                    var onSaved = function (err) {
                        expect(employee.department).to.not.equal(null);
                        expect(employee.department.valueFetched).to.equal(true);
                    };
                    session.doChangesAndSave(changesToDo, onSaved);
                })
            });
        });

        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {

                employees[2].department.getValue(function (err, dept) {
                    expect(err.message).to.equal('Select statement failed.');
                });

            });
        });


        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var department = employees[0].department;
                expect(department.toJSON()).to.equal('ApatiteOneToOneProxy: value not fetched yet.');
                employees[0].department.getValue(function (err, dept) {
                    expect(department.toJSON()).to.not.equal('ApatiteOneToOneProxy: value not fetched yet.');
                });
            });
        });


        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var proxy = employees[0].department;
                expect(proxy.valueFetched).to.equal(false);
                var promise = proxy.getValue();
                promise.then(function (department) {
                    expect(proxy.valueFetched).to.equal(true);
                    promise = proxy.getValue(); // a resolved promise should be returned
                    promise.then(function (dept){
                        expect(proxy.valueFetched).to.equal(true);
                    });
                }, function (err) {
                    expect(err).to.not.exist;
                })
            });
        });


        util.newSession(function (err, session) {
            var query = util.newQueryForEmployee(session);
            session.execute(query, function (err, employees) {
                var proxy = employees[2].department;
                expect(proxy.valueFetched).to.equal(false);
                var promise = proxy.getValue();
                promise.then(function (department) {
                    //should never reach here...
                    expect(false).to.equal(true);
                }, function (err) {
                    expect(err.message).to.equal('Select statement failed.');
                })
            });
        });
    });
})