"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: {
        description: "Name of article, book, etc",
        type: String
    },
    theme: {
        description: "Application area of document",
        type: String
    },
    subtheme: {
        description: "Clarification of area to usability",
        type: String
    },
    author: {
        description: "Authority description, optional",
        type: String
    },
    sourceId: {
        description: "Organization reference to source",
        type: Number
    },
    rate: {
        description: "Rating of the document, must be 0 to 5",
        type: Number
    },
    votedNum: {
        description: "How many votes to recalculate rating",
        type: Number
    },
    content: {
        description: "Path to .md file",
        type: String
    },
    tags: {
        description: "10 keywords, related to material of document",
        type: [String],
    },
    created: {
        description: "Datetime of uploading",
        type: Date
    },
    relevant: {
        description: "Similar content docs",
        type: [String] // TODO: may be not String
    }
};
//# sourceMappingURL=documentSchema.js.map