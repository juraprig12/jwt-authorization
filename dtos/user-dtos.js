module.exports = class UserDto {
    id;
    email;
    isActivated;

    constructor(user) {
        this.id = user.rows[0].id;
        this.email = user.rows[0].email;
        this.isActivated = user.rows[0].isactivated;     
    }
}

// module.exports = class UserDto {
//     id;
//     email;
//     isActivated;

//     constructor(model) {
//         this.id =model.id;
//         this.email = model.email;
//         this.isActivated = model.isActivated;     
//     }
// }