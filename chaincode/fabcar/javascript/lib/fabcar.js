/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class FabCar extends Contract {
    async initLedger(ctx) {
        console.info("============= START : Initialize Ledger ===========");
        const properties = [
            {
                address: "477 Monroe Avenue",
                city: "Palma Sola",
                property_size: "1",
                owner_name: "Rodrick",
                property_type: "Private property",
            },
            {
                address: "4512 Daylene Drive",
                city: "Westland",
                property_size: "2",
                owner_name: "Mr. Dorthy Brekke",
                property_type: "Corporeal property",
            },
            {
                address: "2063 Godfrey Street",
                city: "Warren",
                property_size: "3",
                owner_name: "Travon Goldner",
                property_type: "Apartment",
            },
            {
                address: "1012 Douglas Dairy Road",
                city: "Gate City",
                property_size: "4",
                owner_name: "Ollie Kling",
                property_type: "Residential",
            },
            {
                address: "2103 Oak Ridge Drive",
                city: "St Thomas",
                property_size: "5",
                owner_name: "Dr. Asa Streich",
                property_type: "Commercial",
            },
        ];

        for (let i = 0; i < properties.length; i++) {
            properties[i].docType = "property";
            await ctx.stub.putState(
                "P" + i,
                Buffer.from(JSON.stringify(properties[i]))
            );
            console.info("Added <--> ", properties[i]);
        }
        console.info("============= END : Initialize Ledger ===========");
    }

    async queryProperty(ctx, identifier) {
        if (!identifier) {
            throw new Error("Identifier is required");
        }

        let queryResult;

        // Check if the identifier is a propertyNumber (key)
        if (/^P\d+$/.test(identifier)) {
            queryResult = await ctx.stub.getState(identifier);
        } else {
            // query by city name
            queryResult = await this.queryByCity(ctx, identifier);
        }

        return queryResult.toString();
    }

    async queryByCity(ctx, city) {
        const startKey = "";
        const endKey = "";
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(
            startKey,
            endKey
        )) {
            const strValue = Buffer.from(value).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.city === city) {
                allResults.push({ Key: key, Record: record });
            }
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async createProperty(
        ctx,
        propertyNumber,
        address,
        city,
        property_size,
        owner_name,
        property_type
    ) {
        console.info("============= START : Create Car ===========");

        const property = {
            property_size,
            docType: "property",
            address,
            city,
            owner_name,
            property_type,
        };

        await ctx.stub.putState(
            propertyNumber,
            Buffer.from(JSON.stringify(property))
        );
        console.info("============= END : Create Car ===========");
    }

    async queryAllProperties(ctx) {
        const startKey = "";
        const endKey = "";
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(
            startKey,
            endKey
        )) {
            const strValue = Buffer.from(value).toString("utf8");
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeAll(
        ctx,
        propertyNumber,
        address,
        city,
        property_size,
        owner_name,
        property_type
    ) {
        console.info("============= START : changeCarOwner ===========");

        const propertyAsBytes = await ctx.stub.getState(propertyNumber); // get the car from chaincode state
        if (!propertyAsBytes || propertyAsBytes.length === 0) {
            throw new Error(`${propertyNumber} does not exist`);
        }
        const property = JSON.parse(propertyAsBytes.toString());
        if (address !== "") {
            property.address = address;
        }
        if (city !== "") {
            property.city = city;
        }
        if (property_size !== "") {
            property.property_size = property_size;
        }
        if (owner_name !== "") {
            property.owner_name = owner_name;
        }
        if (property_type !== "") {
            property.property_type = property_type;
        }

        await ctx.stub.putState(
            propertyNumber,
            Buffer.from(JSON.stringify(property))
        );
        console.info("============= END : changeCarOwner ===========");
    }

    async getPropertyHistory(ctx, propertyID) {
        const historyIterator = await ctx.stub.getHistoryForKey(propertyID);
        const allHistory = [];

        while (true) {
            const history = await historyIterator.next();

            if (history.done) {
                await historyIterator.close();
                break;
            }

            const historicalRecord = {
                txId: history.value.txId,
                timestamp: history.value.timestamp.seconds.low,
                value: history.value.value.toString("utf8"),
            };

            allHistory.unshift(historicalRecord);
        }

        // if (allHistory.length === 0) {
        //     throw new Error(`No history found for ${propertyNumber}`);
        // }

        console.log(allHistory);
        return JSON.stringify(allHistory);
    }
}

module.exports = FabCar;
