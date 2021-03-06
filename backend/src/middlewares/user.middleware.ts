import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { IUser } from '../interfaces/user.interface';
import { getMessage } from '../utils/message.util';
import { user_rules as rules } from '../utils/yup.util';
import { LooseObject } from '../interfaces/yup.interface';

async function create(req: Request, res: Response, next: NextFunction) {
    const yupObject = yup.object().shape({
        email: rules.email.required(),
        name: rules.name.required(),
        password: rules.password.required(),
    });

    yupObject
        .validate(req.body, { stripUnknown: true })
        .then(() => next())
        .catch((err: any) => {
            return res.jsonBadRequest(
                null,
                getMessage('default.badRequest'),
                err.errors,
            );
        });
}

async function findById(req: Request, res: Response, next: NextFunction) {
    const yupObject = yup.object().shape({
        _id: rules._id.required(),
    });

    yupObject
        .validate(req.query, { stripUnknown: true })
        .then(() => next())
        .catch((err: any) => {
            return res.jsonBadRequest(
                null,
                getMessage('default.badRequest'),
                err.errors,
            );
        });
}

async function update(req: Request, res: Response, next: NextFunction) {
    let obj: LooseObject = {};
    const bodyProps = yup
        .object()
        .shape({ value: rules.user_value.required() });

    Object.keys(req.body).forEach(function (value: string) {
        if (bodyProps.isValidSync(value)) obj[value] = rules[value];
    });

    const yupObject = yup
        .object()
        .shape(obj)
        .test(
            'only-one-field',
            'you must provide only one field apart the _id',
            value => !!(Object.keys(value).length === 2 && value._id),
        );

    yupObject
        .validate(req.body, { stripUnknown: true })
        .then(() => {
            console.log(req.body);
            next();
        })
        .catch((err: any) => {
            return res.jsonBadRequest(
                null,
                getMessage('default.badRequest'),
                err.errors,
            );
        });
}

async function signIn(req: Request, res: Response, next: NextFunction) {
    const [hashType, hash] = req.headers.authorization
        ? req.headers.authorization.split(' ')
        : [''];

    if (hashType !== 'Basic') {
        return res.jsonUnauthorized(null, null, null);
    }

    const [email, password] = Buffer.from(hash, 'base64').toString().split(':');

    const yupObject = yup.object().shape({
        email: rules.email.required(),
        password: rules.password.required(),
    });

    yupObject
        .validate({ email: email, password: password }, { stripUnknown: true })
        .then(() => next())
        .catch((err: any) => {
            return res.jsonBadRequest(
                null,
                getMessage('default.badRequest'),
                err.errors,
            );
        });
}

export default { create, findById, update, signIn };
