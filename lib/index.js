"use strict";

const contentful = require('contentful-management');

class Integration {
    constructor (options) {
        this.token = options.token;
        this.space_id = options.space_id;
        this.story_type_id = options.story_type_id;
    }
    // Maps Camayak fields to Contentful Fields
    map_camayak_to_contentful(content) {
        return {
            headline: {
                'en-US': content.heading
            },
            subheadline: {
                'en-US': content.subheading
            },
            teaser: {
                'en-US': content.teaser
            },
            body: {
                'en-US': content.content
            }
        }
    }
    // Publish an assignment
    publish(content, cb) {
        // Create a Contentful client
        var client = contentful.createClient({
            accessToken: this.token
        });
        // Get the Contentful space
        client.getSpace(this.space_id)
        .then( (space) => space.createEntry('story', {
            fields: this.map_camayak_to_contentful(content)
        }))
        .then((entry) => entry.publish())
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        .catch((error) => {
            return cb(error, {})
        })
    }
    // Update an existing assignment
    update(content, cb) {
        // Create a Contentful client
        var client = contentful.createClient({
            accessToken: this.token
        });
        // Get the Contentful space
        client.getSpace(this.space_id)
        .then((space) => space.getEntry(content.published_id))
        .then((entry) => {
            let fields = this.map_camayak_to_contentful(content);
            for (let field in fields) {
                entry.fields[field] = fields[field]
            }
            return entry.update();
        })
        .then((entry) => entry.publish())
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        .catch((error) => {
            return cb(error, {});
        })
    }
    // Retract (unpublish) a published assignment
    retract(content, cb) {
        // Create a Contentful client
        var client = contentful.createClient({
            accessToken: this.token
        });
        // Get the Contentful space
        client.getSpace(this.space_id)
        .then((space) => space.getEntry(content.published_id))
        .then((entry) => entry.unpublish())
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        .catch((error) => {
            return cb(error, {})
        })
    }
}

module.exports = Integration;
