'use strict';
const debug = require('debug')('@database:user');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Joi = require('joi');

const BCRYPT_SALT_ROUND = 11;

// ============================= $ Schema $ ====================================
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    access_token: {
        type: String
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    signupdate: {
        type: Date,
        required: true
    },
    lastlogindate: {
        type: Date,
        required: true
    }
    // fbtokenid: {
    // 	type: String,
    // 	required: true,
    // 	index: true,
    // 	unique: true
    // },
    // androidregid: {
    // 	type: String,
    // 	// TODO : uncomment after receiving android regID
    // 	required: true,
    // 	index: true,
    // 	unique: true
    // },
}, {
    toJSON: {
        versionKey: false
    }
});

/* Creating a virtual field for user */
UserSchema.virtual('fullname').get(/* @this User */ function () {
    return this.firstname + ' ' + this.lastname;
});

UserSchema.statics.verifyPassword = /* @this User */ function (givenPassword) {
    return bcrypt.compare(givenPassword, this.password);
};

UserSchema.statics.validateFields = function (candidateUserObj) {
    return new Promise((resolve, reject) => {
        Joi.validate(candidateUserObj, UserSchemaValidation, (err,
                                                              value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
};

UserSchema.statics.getSanitizedInput = function (dirtyUserObj) {
    const cleanedUserObject = {
        username: dirtyUserObj.username && dirtyUserObj.username.trim().toLowerCase(),
        email: dirtyUserObj.email && dirtyUserObj.email.trim().toLowerCase(),
        password: dirtyUserObj.password,
        firstname: dirtyUserObj.firstname && dirtyUserObj.firstname.trim(),
        lastname: dirtyUserObj.lastname && dirtyUserObj.lastname.trim()
    };

    for (let key in cleanedUserObject) {
        if (!cleanedUserObject[key]) {
            delete cleanedUserObject[key];
        }
    }

    return cleanedUserObject;
};

/**
 * Should hash the value to be stored in the database.
 *
 * Based on recommendation on:
 *    http://tphangout.com/how-to-encrypt-passwords-or-other-data-before-saving-it-in-mongodb/
 */
UserSchema.pre('save', /* @this User */ function (next) {
    const user = this;
    if (user.isModified('password')) {
        bcrypt.hash(user.password, BCRYPT_SALT_ROUND).then((hash) => {
            user.password = hash;
            next();
        }).catch((err) => {
            next(err);
        });
    } else {
        next();
    }
});

UserSchema.pre('findOneAndUpdate', /* @this Object */ function (next) {
    const tobe = this.getUpdate();
    if (tobe.$set.password !== undefined) {
        bcrypt.hash(tobe.$set.password, BCRYPT_SALT_ROUND).then((hash) => {
            tobe.$set.password = hash;
            next();
        }).catch((err) => {
            next(err);
        });
    } else {
        next();
    }
});

const UserSchemaValidation = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_\W]{3,30}$/).max(30).min(1).required().error(new Error('Invalid Username')),
    password: Joi.string().regex(/^[a-zA-Z0-9\W]{6,30}$/).required().label('Password').error(new Error('Invalid Password')),
    access_token: Joi.string().token().min(30).error(new Error('Invalid Access Token')),
    firstname: Joi.string().error(new Error('Invalid First-name')),
    lastname: Joi.string().error(new Error('Invalid Last-name')),
    email: Joi.string().email().error(new Error('Invalid Email Address')),
    signupdate: Joi.date().timestamp(),
    lastlogindate: Joi.date().timestamp()
});

const User = mongoose.model('User', UserSchema);
User.on('index', function (err) {
    if (err) {
        debug('Error creating index:' + err);
    }
});

module.exports.User = User;
