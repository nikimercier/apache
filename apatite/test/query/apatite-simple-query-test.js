﻿'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteSimpleQueryTest', function () {
    it('Simple Query Validity', function () {
        var apatite = util.apatite;
        class User {
            constructor() {
                this.oid = 0;
                this.id = '';
                this.name = '';
            }
        }

        var table = apatite.newTable('USERS');
        var modelDescriptor = apatite.newModelDescriptor(User, table);
        
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('ID', apatite.dialect.newVarCharType(15));
        modelDescriptor.newSimpleMapping('id', column);
        
        column = table.addNewColumn('NAME', apatite.dialect.newVarCharType(100));
        modelDescriptor.newSimpleMapping('name', column);
        
        class InvalidModel {

        }
        
        util.newSession(function (err, session) {

            var qry = apatite.newQuery(InvalidModel);
            session.execute(qry, function (err) {
                expect(err.message).to.equal('Descriptor for model: InvalidModel not found.');
            });

            // test with promise
            qry = apatite.newQuery(InvalidModel);
            var promise = session.execute(qry);
            promise.catch(function (err) {
                expect(err.message).to.equal('Descriptor for model: InvalidModel not found.');
            });

            (function () {
                apatite.newQuery();
            }).should.Throw('A valid model is required for query.');

            var query = apatite.newQuery(User);
            query.setSession(null);
            query.execute(function(err, result){
                expect(err.message).to.equal('There is no session associated with the query. Use execute on session.');
            });

            // test with promise
            query = apatite.newQuery(User);
            query.setSession(null);
            promise = query.execute();
            promise.catch(function (err) {
                expect(err.message).to.equal('There is no session associated with the query. Use execute on session.');
            });

            

            query = apatite.newQuery(User);
            query.setSession(session);
            var sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1');

            query = apatite.newQuery(User).attr('name').eq('test');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            var sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('test');


            query = apatite.newQuery(User);
            query.attr('name').eq('test').and.attr('id').eq('tom');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? AND T1.ID = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('test');
            expect(sqlStatement.bindings[1].variableValue).to.equal('tom');


            query = apatite.newQuery(User);
            query.attr('name').eq('test').or.attr('id').eq('tom');
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? OR T1.ID = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('test');
            expect(sqlStatement.bindings[1].variableValue).to.equal('tom');

            query = apatite.newQuery(User);
            query.enclose.attr('name').eq('tom').or.attr('name').eq('jerry');
            query.and.enclose.attr('id').eq('x').or.attr('id').eq('y');

            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID", T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1 WHERE ( T1.NAME = ? OR T1.NAME = ? ) AND ( T1.ID = ? OR T1.ID = ? )');
            expect(sqlStatement.bindings[0].variableValue).to.equal('tom');
            expect(sqlStatement.bindings[1].variableValue).to.equal('jerry');
            expect(sqlStatement.bindings[2].variableValue).to.equal('x');
            expect(sqlStatement.bindings[3].variableValue).to.equal('y');

            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('names');

            (function () {
                sqlBuilder.buildSQLStatement();
            }).should.Throw('Mapping for attribute: names not found in model: User.');


            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1');

            query = apatite.newQuery(User);
            query.setSession(session);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttrs(['id', 'name']);

            expect(sqlBuilder.buildSQLStatement().sqlString).to.equal('SELECT T1.ID AS "T1.ID", T1.NAME AS "T1.NAME" FROM USERS T1');

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').eq('test').and.attr('oid').eq(1);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? AND T1.OID = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal('test');
            expect(sqlStatement.bindings[1].variableValue).to.equal(1);

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').isNULL();
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME IS NULL');
            expect(sqlStatement.bindings.length).to.equal(0);

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').isNOTNULL();
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME IS NOT NULL');
            expect(sqlStatement.bindings.length).to.equal(0);

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('name').eq('test').and.attr('oid').in([25, 102]);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('name');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.NAME AS "T1.NAME" FROM USERS T1 WHERE T1.NAME = ? AND T1.OID IN (?,?)');
            expect(sqlStatement.bindings[0].variableValue).to.equal('test');
            expect(sqlStatement.bindings[1].variableValue).to.equal(25);
            expect(sqlStatement.bindings[2].variableValue).to.equal(102);

            query = apatite.newQuery(User);
            query.setSession(session);
            query.attr('oid').eq(25).or.attr('oid').eq(102);
            sqlBuilder = apatite.dialect.getSelectSQLBuilder(query);
            query.fetchAttr('oid');

            sqlStatement = sqlBuilder.buildSQLStatement();
            expect(sqlStatement.sqlString).to.equal('SELECT T1.OID AS "T1.OID" FROM USERS T1 WHERE T1.OID = ? OR T1.OID = ?');
            expect(sqlStatement.bindings[0].variableValue).to.equal(25);
            expect(sqlStatement.bindings[1].variableValue).to.equal(102);
        });
    });
    it('Function Query Validity', function () {
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchCountAs('countOfPets');
            query.execute(function (err, petsCount) {
                expect(petsCount[0].countOfPets).to.equal(4);
            })

            query = util.newQueryForBook(session);
            query.fetchSumAs('numberOfPages', 'sumOfPages');
            query.execute(function (err, result) {
                expect(result[0].sumOfPages).to.equal(330);
            })

            query = util.newQueryForBook(session);
            query.fetchMaxAs('numberOfPages', 'maxOfPages');
            query.execute(function (err, result) {
                expect(result[0].maxOfPages).to.equal(150);
            })

            query = util.newQueryForBook(session);
            query.fetchMinAs('numberOfPages', 'minOfPages');
            query.execute(function (err, result) {
                expect(result[0].minOfPages).to.equal(60);
            })

            query = util.newQueryForBook(session);
            query.fetchAvgAs('numberOfPages', 'avgOfPages');
            query.execute(function (err, result) {
                expect(result[0].avgOfPages).to.equal(110);
            })

            query = util.newQueryForBook(session);
            query.fetchDistinctAs('numberOfPages', 'distinctPages');
            query.execute(function (err, result) {
                expect(result[0].distinctPages).to.equal(150);
            })
        });

        // tests with promise for direct query execution
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchCountAs('countOfPets');
            var promise = query.execute();
            promise.then(function (petsCount) {
                expect(petsCount[0].countOfPets).to.equal(4);
            });

            query = util.newQueryForEmployee(session);
            query.attr('department.oid').eq(3);
            query.orderBy('name');
            promise = query.execute();
            promise.catch(function (sqlErr) {
                expect(sqlErr.message).to.equal('Select statement failed.');
            });
        });

        // tests with promise for query execution over session
        util.newSession(function (err, session) {
            var query = util.newQueryForPet(session);
            query.fetchCountAs('countOfPets');
            var promise = session.execute(query);
            promise.then(function (petsCount) {
                expect(petsCount[0].countOfPets).to.equal(4);
            });

            query = util.newQueryForEmployee(session);
            query.attr('department.oid').eq(3);
            query.orderBy('name');
            promise = session.execute(query);
            promise.catch(function (sqlErr) {
                expect(sqlErr.message).to.equal('Select statement failed.');
            });
        });
    })
})