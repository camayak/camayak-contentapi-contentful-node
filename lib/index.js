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
        // Maps the Camayak content API field to your custom fields you set up in Contentful.
        //
        // In the form:
        //
        //      ContentfulField: {
        //          'en-US': content.CamayakField
        //      }
        //
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
        // Publish the entry - was created in Draft
        .then((entry) => entry.publish())
        // Respond to the webhook with the published_id and published_at values.
        // Returning published_id is required to be able to retract or update.
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        // Catch any errors
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
        // Get the entry based on the published_id value passed to the webhook during publish
        .then((space) => space.getEntry(content.published_id))
        // Update the fields in the entry object and commit it to Contentful
        .then((entry) => {
            let fields = this.map_camayak_to_contentful(content);
            for (let field in fields) {
                entry.fields[field] = fields[field]
            }
            return entry.update();
        })
        // Publish the entry with the new changes.
        .then((entry) => entry.publish())
        // Respond to the webhook with the published_id and published_at values.
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        // Catch any errors
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
        // Get the entry based on the published_id value passed to the webhook during publish
        .then((space) => space.getEntry(content.published_id))
        // Unpublish the entry
        .then((entry) => entry.unpublish())
        // Respond to the webhook with the published_id and published_at values.
        .then((entry) => {
            return cb(null, {
                published_id: entry.sys.id,
                published_at: entry.sys.firstPublishedAt
            })
        })
        // Catch any errors
        .catch((error) => {
            return cb(error, {})
        })
    }
}

module.exports = Integration;
