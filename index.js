"use strict"

const CamayakContentAPI = require('camayak-contentapi');
const Integration = require('./lib/index');

const api_key       = process.env.CAMAYAK_API_KEY;
const shared_secret = process.env.CAMAYAK_SHARED_SECRET;

// Your Contentful Personal Access Token for the Space you're publishing to.
const contentful_token = process.env.CONTENTFUL_ACCESS_TOKEN;
// The Contentful Space ID you're publishing into
const contentful_space_id = process.env.CONTENTFUL_SPACE_ID;
// The ContentType ID that represents a Camayak Story
const contentful_story_type_id = process.env.CONTENTFUL_STORY_TYPE_ID;

// Create an instance of the Camayak Content API SDK.
// The SDK constists of an HTTP server pre-configured with
// routes for handling Camayak Content API webhook events.

// The SDK receives these events, then invokes one of 3
// handler functions that you pass into the SDK:

// publish - for the initial publish of an approved assignment
// update - for any subsequent publish of the assignment
// retract - for when the assignment is retracted in Camayak

// The handler functions for each of these events is passed a
// "webhook" object, and the content of the assignment.

// In the event of failure, Camayak will retry the webhook.

let camayak = new CamayakContentAPI({
    api_key: api_key,
    shared_secret: shared_secret,
    port: process.env.PORT || 5000,

    publish: function(webhook, content) {
        let handler = new Integration({
            token: contentful_token,
            space_id: contentful_space_id,
            story_type_id: contentful_story_type_id
        });
        handler.publish(content, function(error, response){
            console.log("FOO", error, response)
            if (error) {
                return webhook.fail(error);
            };
            return webhook.succeed({
                published_id: response.published_id,
                published_at: response.published_at,
                published_url: response.published_url
            });
        });
    },

    update: function(webhook, content) {
        // Update new Post wherever using content.published_id
        // 
        let handler = new Integration({
            token: contentful_token,
            space_id: contentful_space_id,
            story_type_id: contentful_story_type_id
        });
        handler.update(content, function(error, response){
            if (error) {
                return webhook.fail(error);
            };
            return webhook.succeed({
                published_id: response.published_id,
                published_at: response.published_at,
                published_url: response.published_url
            });
        });
    },

    retract: function(webhook, content) {
        // Retract Post using content.published_id
        //
        let handler = new Integration({
            token: contentful_token,
            space_id: contentful_space_id,
            story_type_id: contentful_story_type_id
        });
        console.log(handler);
        handler.retract(content, function(error, response){
            if (error) {
                return webhook.fail(error);
            };
            return webhook.succeed({
                published_id: response.published_id,
                published_at: response.published_at,
                published_url: response.published_url
            });
        })
    },

    error: function(error, webhook) {
        // Handle unexpected errors in the Camayak service
        webhook.fail(error);
    }
});

// Start listening for webhooks
camayak.start();
