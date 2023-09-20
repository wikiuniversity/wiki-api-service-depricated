"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    login: {
        "description": "auth login",
        type: String
    },
    password: {
        "description": "auth password",
        type: String
    },
    email: {
        "description": "auth password",
        type: String
    },
    organizationId: {
        "description": "Id of related organization",
        type: String
    },
    firstName: {
        "description": "First name",
        type: String
    },
    lastName: {
        "description": "Last name",
        type: String
    },
    nickname: {
        "description": "nickname",
        type: String
    },
    about: {
        "description": "Short about description, optional",
        type: String,
        "maxLength": "100"
    },
    city: {
        "description": "Living city, validated",
        type: String
    },
    role: {
        "description": "User role",
        type: String,
        enum: [
            "user",
            "pending",
            "admin",
            "super",
            "baned"
        ]
    },
    photo: {
        "description": "Path to photo, optional",
        type: String
    },
    registered: {
        "description": "Datetime of registration",
        type: Date
    },
    bookmarks: {
        "description": "Saved favourite documents id",
        type: [String]
    },
    faculty: {
        "description": "Optional field for students",
        type: String
    },
    birthday: {
        type: String
    },
    sex: {
        type: String,
        enum: [
            "male",
            "female"
        ]
    },
    documents: {
        type: [String]
    }
};
//# sourceMappingURL=userSchema.js.map