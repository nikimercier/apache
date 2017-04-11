﻿'use strict';

var should = require('chai').should();
var expect = require('chai').expect;

var ApatiteTestUtil = require('../apatite-test-util.js');
var util = new ApatiteTestUtil();

describe('ApatiteOneToOneMappingTest', function () {
    it('One To One Mapping Validity', function () {
        var apatite = util.apatite;
        class Location {
            constructor() {
                this.oid = 0;
                this.id = '';
            }
        }

        var table = apatite.newTable('LOCATION');
        var modelDescriptor = apatite.newModelDescriptor(Location, table);
        
        var column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);

        class Department {
            constructor() {
                this.oid = 0;
                this.location = null;
            }
        }

        table = apatite.newTable('DEPT');
        modelDescriptor = apatite.newModelDescriptor(Department, table);
        
        column = table.addNewColumn('OID', apatite.dialect.newIntegerType(10));
        column.bePrimaryKey();
        modelDescriptor.newSimpleMapping('oid', column);
        
        column = table.addNewColumn('LOCATIONOID', apatite.dialect.newIntegerType(10));
        var locTable = apatite.getOrCreateTable('LOCATION');
        var locColumn = locTable.getColumn('OID');
        
        var locMapping = modelDescriptor.newOneToOneMapping('location', null, [column], [locColumn]);
        expect(locMapping.isSimpleMapping()).to.equal(false);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal('Invalid one-to-one mapping. Model name not defined for attribute: location.')
        });
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Locations', [column], [locColumn]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal('Invalid one-to-one mapping attribute: location. Model: Locations not registered.')
        });
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', column, [locColumn]);
        
        var mappingInfoStr = 'Invalid one-to-one mapping attribute: location in model: Department. ';
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Source columns is expected to be an array of columns.')
        });
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column], locColumn);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Target columns is expected to be an array of columns.')
        });
        
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column, ''], [locColumn]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Source columns size must be same as target columns size.')
        });
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column], [locColumn, '']);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Source columns size must be same as target columns size.')
        });
        
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column, column], [locColumn, locColumn]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Source columns have duplicates.')
        });
        
        var tempColumn = table.addNewColumn('TEMP', apatite.dialect.newIntegerType(10));
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column, tempColumn], [locColumn, locColumn]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'Target columns have duplicates.')
        });
        
        modelDescriptor.deleteMapping('location');
        tempColumn = locTable.addNewColumn('TEMP', apatite.dialect.newIntegerType(10));
        modelDescriptor.newOneToOneMapping('location', 'Location', [tempColumn], [locColumn]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'The source column: TEMP does not belong to table: DEPT.')
        });
        
        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column], [column]);
        
        apatite.newSession(function (err, session) {
            expect(err.message).to.equal(mappingInfoStr + 'The target column: LOCATIONOID does not belong to table: LOCATION.')
        });

        modelDescriptor.deleteMapping('location');
        modelDescriptor.newOneToOneMapping('location', 'Location', [column], [locColumn]);
        column.bePrimaryKey();

        apatite.newSession(function (err, session) {
            expect(err.message).to.equal('One to one columns cannot be defined as part of the primary key for table: DEPT.')
        });

    });
})
