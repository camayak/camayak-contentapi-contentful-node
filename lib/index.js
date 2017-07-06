"use strict";

const contentful = require('contentful-management');

class Integration {
    constructor (options) {
        this.api_key = options.api_key;
        this.story_type_id = options.story_type_id;
    }
    // Publish an assignment
    publish(content, cb) {
        cb(null, {});
    }
    // Update an existing assignment
    update(content, cb) {
        // Create a contentful client
        client = contentful.CreateClient({
            accessToken: this.api_key
        })
        cb(error, {
            published_id: published_id, 
            published_url: published_url
        })
    }
    // Retract (unpublish) a published assignment
    retract(content, cb) {
        // Create a contentful client
        client = contentful.CreateClient({
            accessToken: this.api_key
        })
        cb(error, {
            published_id: published_id, 
            published_url: published_url
        })
    }
}

module.exports = Integration;
