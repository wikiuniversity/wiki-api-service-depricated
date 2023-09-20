export default {
    name: {
        "description": "Official name of university",
        type: String
    },
    location: {
        "description": "Validated name of city and state",
        type: String
    },
    isMember: {
        "description": "Is organization already join us",
        type: Boolean
    },
    responsible: {
        "description": "Responsible person of organization, id fk to organization-user entity",
        type: Number
    },
    admins: {
        "description": "List of organizations admins",
        type: [Number]
    },
    admitted: {
        "description": "Datetime of joining our team",
        type: Date
    }
}